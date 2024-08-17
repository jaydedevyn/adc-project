import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseEditorComponent } from './course-editor.component';

describe('CourseEditorComponent', () => {
  let component: CourseEditorComponent;
  let fixture: ComponentFixture<CourseEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
