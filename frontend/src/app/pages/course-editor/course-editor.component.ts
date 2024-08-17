import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {CourseService} from "../../services/course/course.service";
import {MatCard, MatCardActions, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatButton} from "@angular/material/button";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatIcon} from "@angular/material/icon";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [
    MatCardActions,
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatLabel,
    MatFormField,
    MatInput,
    MatSelect,
    MatButton,
    MatOption,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatDatepicker,
    MatCardTitle,
    MatIcon,
    MatSuffix,
    MatAutocompleteTrigger,
    MatAutocomplete,
    RouterLink
  ],
  templateUrl: './course-editor.component.html',
  styleUrl: './course-editor.component.scss'
})
export class CourseEditorComponent {
  courseForm: FormGroup = new FormGroup({
    university: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    start_date: new FormControl('', Validators.required),
    end_date: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.min(0)]),
    currency: new FormControl('', [Validators.required]),
  });
  editMode: boolean = false;

  constructor(private snackBar: MatSnackBar, private route: ActivatedRoute, private courseService: CourseService) {
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    if (params['id']) {
      this.editMode = true;
      this.courseForm.get('name')?.disable()
      this.courseForm.get('country')?.disable()
      this.courseForm.get('city')?.disable()
      this.courseForm.get('university')?.disable()
      this.loadCourseData(params['id']);
    }
  }

  async onSubmit() {
    if (this.courseForm.valid) {
      try {
        if (this.editMode) {
          const courseId = this.route.snapshot.queryParams['id'];

          await this.courseService.update(courseId, this.courseForm.value)
        } else {
          await this.courseService.create(this.courseForm.value)
        }
        this.snackBar.open('Course saved successfully!', 'Close', {
          duration: 2000,
        });
      } catch (err) {
        console.log(err)
      }
    }
  }

  onCancel(): void {
    this.courseForm.reset();
  }

  async loadCourseData(courseId: string) {
    const courseData = await this.courseService.getById(courseId)
    courseData['start_date'] = new Date(courseData['start_date'])
    courseData['end_date'] = new Date(courseData['end_date'])
    this.courseForm.patchValue(courseData);
  }
}
