import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {lastValueFrom} from "rxjs";
import {DEFAULT_LIMIT, DEFAULT_OFFSET} from "../../consts";

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private httpClient: HttpClient) { }

  async getById(id: string): Promise<any> {
    return await lastValueFrom(this.httpClient.get(`${environment.api}/courses/${id}`)) as any;
  }

  async list(data: {query: string, limit: number, offset: number} = {query: '', limit: DEFAULT_LIMIT, offset: DEFAULT_OFFSET}): Promise<any> {
    return await lastValueFrom(this.httpClient.get(`${environment.api}/courses`, {
      params: data,
    })) as any[];
  }

  async update(id: string, data: any) {
    return await lastValueFrom(this.httpClient.put(`${environment.api}/courses/${id}`, data));
  }

  async create(data: any) {
    return await lastValueFrom(this.httpClient.post(`${environment.api}/courses`, data));
  }

  async delete(id: string) {
    return await lastValueFrom(this.httpClient.delete(`${environment.api}/courses/${id}`));
  }
}
