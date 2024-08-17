from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import requests
import pandas as pd
from io import StringIO
import datetime
from flask_cors import CORS
from bson.objectid import ObjectId

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

app.config["MONGO_URI"] = "mongodb+srv://test_user:test_password@cluster0.veky3vx.mongodb.net/adcore"
mongo = PyMongo(app)
course_collection = mongo.db.courses

course_collection.create_index("created_at", expireAfterSeconds=600)

def download_and_normalize_data():
    url = "https://api.mockaroo.com/api/501b2790?count=100&key=8683a1c0"
    response = requests.get(url)

    data = pd.read_csv(StringIO(response.text))

    new_data = pd.DataFrame()
    new_data['price'] = pd.to_numeric(data['Price'])

    new_data['university'] = data['University'].str.strip().str.title()
    new_data['city'] = data['City'].str.strip().str.title()
    new_data['country'] = data['Country'].str.strip().str.upper()
    new_data['name'] = data['CourseName'].str.strip().str.title()
    new_data['description'] = data['CourseDescription'].str.strip()
    new_data['start_date'] = pd.to_datetime(data['StartDate'])
    new_data['end_date'] = pd.to_datetime(data['EndDate'])
    new_data['currency'] = data['Currency'].str.strip().str.upper()


    return new_data

def insert_data_into_mongodb(data):
    data['created_at'] = datetime.datetime.utcnow()
    data_dict = data.to_dict('records')
    course_collection.insert_many(data_dict)


def check_and_refresh_data():
    if course_collection.count_documents({}) == 0:
        print("Data expired or not present. Refreshing data...")
        data = download_and_normalize_data()
        insert_data_into_mongodb(data)
        print('Complete')
    else:
        print("Data is present and up-to-date.")

@app.before_first_request
def startup_check():
    check_and_refresh_data()

@app.route('/courses/<course_id>', methods=['GET'])
def get_course_by_id(course_id):
    try:
        course_id_obj = ObjectId(course_id)

        course = course_collection.find_one({"_id": course_id_obj})
        course['_id'] = str(course['_id'])
        return jsonify( course), 200


    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/courses', methods=['GET'])
def get_courses():
    query = request.args.get('query')
    limit = int(request.args.get('limit', 10))
    offset = int(request.args.get('offset', 0))

    options = {
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"university": {"$regex": query, "$options": "i"}},
            {"country": {"$regex": query, "$options": "i"}},
            {"city": {"$regex": query, "$options": "i"}},
            {"currency": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
        ],
    }

    courses = list(course_collection.find(options,{'createdAt': 0}).skip(offset).limit(limit))
    num_courses = course_collection.count_documents(options)

    course_list = []
    for course in courses:
        course['_id'] = str(course['_id'])
        course_list.append(course)

    return jsonify({"count": num_courses, "courses": courses}), 200

@app.route('/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    try:
        course_id_obj = ObjectId(course_id)

        course_data = request.json

        if 'start_date' in course_data:
            course_data['start_date'] = datetime.datetime.fromisoformat(course_data['start_date'].replace('Z', '+00:00'))
        if 'end_date' in course_data:
            course_data['end_date'] = datetime.datetime.fromisoformat(course_data['end_date'].replace('Z', '+00:00'))

        result = course_collection.update_one({"_id": course_id_obj}, {"$set": course_data})

        if result.matched_count == 0:
            return jsonify({"error": "Course not found"}), 404

        return jsonify({"message": "Course updated successfully"}), 200

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/courses', methods=['POST'])
def create_course():
    try:
        course_data = request.json

        required_fields = ['university', 'city', 'country', 'name', 'description', 'start_date', 'end_date', 'price', 'currency']
        for field in required_fields:
            if field not in course_data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        course_data['start_date'] = datetime.datetime.fromisoformat(course_data['start_date'].replace('Z', '+00:00'))
        course_data['end_date'] = datetime.datetime.fromisoformat(course_data['end_date'].replace('Z', '+00:00'))
        course_data['created_at'] = datetime.datetime.utcnow()

        result = course_collection.insert_one(course_data)

        return jsonify({"message": "Course created successfully", "course_id": str(result.inserted_id)}), 201

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/courses/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    try:
        course_id_obj = ObjectId(course_id)

        result = course_collection.delete_one({"_id": course_id_obj})

        if result.deleted_count == 1:
            return jsonify({"message": "Course deleted successfully"}), 200
        else:
            return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    startup_check()
    app.run(debug=True)