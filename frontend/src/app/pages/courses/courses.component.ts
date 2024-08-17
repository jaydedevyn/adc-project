import {Component, OnInit} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {ActivatedRoute, Router} from "@angular/router";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {MatFormField} from "@angular/material/form-field";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Subject, takeUntil} from "rxjs";
import {CourseService} from "../../services/course/course.service";
import {DEFAULT_LIMIT, DEFAULT_OFFSET} from "../../consts";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";


@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    MatTable,
    MatCell,
    MatHeaderCell,
    MatColumnDef,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRowDef,
    MatRow,
    DatePipe,
    MatFormField,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
    MatInput,
    MatButton,
    ReactiveFormsModule,
    MatPaginator,
    CurrencyPipe,
    MatTooltip,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {
  displayedColumns: string[] = ['course_name', 'location', 'start_date', 'length', 'price']
  courses: any[] = [];
  query = new FormControl('');
  limit: number = DEFAULT_LIMIT;
  offset: number = DEFAULT_OFFSET;
  unsubscribeAll = new Subject();
  numOfCourses: number = 0;

  constructor(private _route: ActivatedRoute, private courseService: CourseService, private router: Router) {
  }

  ngOnInit() {
    this.listCourses()
    this.watchQuery()
  }

  watchQuery() {
    this.query.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe(() => {
      this.listCourses()
    })
  }

  createCourse() {
    this.router.navigate(['/editor'])

  }

  edit(id: string) {
    this.router.navigate(['/editor'], {queryParams: {id}})
  }

  async delete(id: string) {
    try {
      await this.courseService.delete(id);
      this.listCourses()
    } catch (err) {
      console.log(err)
    }
  }

  async listCourses() {
    try {
      const response  = await this.courseService.list({
        query: this.query.value || '',
        limit: this.limit,
        offset: this.offset
      });

      this.courses = response.courses;
      this.numOfCourses = response.count;
    } catch (err) {
      console.log('Error fetching courses');
    }
  }

  getCourseLength(course: any) {
    const date1 = new Date(course.start_date);  // Example date 1
    const date2 = new Date(course.end_date);  // Example date 2

    const differenceInTime = +date2 - +date1;  // This gives the difference in milliseconds

    return differenceInTime / (1000 * 3600 * 24);
  }

  handlePageChange(ev: PageEvent) {
    this.limit = ev.pageSize;
    this.offset = ev.pageIndex;

    this.listCourses()
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true)
    this.unsubscribeAll.complete()
  }

}
