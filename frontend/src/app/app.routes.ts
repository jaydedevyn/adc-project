import {Routes} from '@angular/router';
import {CoursesComponent} from "./pages/courses/courses.component";
import {CourseEditorComponent} from "./pages/course-editor/course-editor.component";


export const routes: Routes = [
  {path: '', component: CoursesComponent},
  {path: 'editor', component: CourseEditorComponent}
];
