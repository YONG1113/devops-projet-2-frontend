import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Student } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { StudentComponent } from './student.component';

describe('StudentComponent', () => {
  let component: StudentComponent;
  let fixture: ComponentFixture<StudentComponent>;
  let studentService: {
    findAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const student: Student = {
    id: 1,
    studentNumber: 'STU-2026-000001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  beforeEach(async () => {
    studentService = {
      findAll: jest.fn().mockReturnValue(of([])),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [StudentComponent],
      providers: [{
        provide: StudentService,
        useValue: studentService
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students', () => {
    studentService.findAll.mockReturnValue(of([student]));

    component.loadStudents();

    expect(component.students).toEqual([student]);
    expect(component.loading).toBe(false);
  });

  it('should display an error when loading students fails', () => {
    studentService.findAll.mockReturnValue(throwError(() => new Error('error')));

    component.loadStudents();

    expect(component.errorMessage).toBe('Unable to load students');
    expect(component.loading).toBe(false);
  });

  it('should select a student', () => {
    component.selectStudent(student);

    expect(component.selectedStudent).toBe(student);
    expect(component.mode).toBeNull();
  });

  it('should prepare the form to create a student', () => {
    component.selectedStudent = student;
    component.startCreate();

    expect(component.selectedStudent).toBeNull();
    expect(component.mode).toBe('create');
    expect(component.studentForm.value).toEqual({
      firstName: null, lastName: null, email: null
    });
  });

  it('should prepare the form to edit a student', () => {
    component.selectedStudent = student;

    component.startEdit();

    expect(component.mode).toBe('edit');
    expect(component.studentForm.value).toEqual({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    });
  });

  it('should not save an invalid form', () => {
    component.startCreate();

    component.save();

    expect(component.submitted).toBe(true);
    expect(studentService.create).not.toHaveBeenCalled();
  });

  it('should create a student', () => {
    studentService.create.mockReturnValue(of(student));
    component.startCreate();
    component.studentForm.setValue({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    });

    component.save();

    expect(studentService.create).toHaveBeenCalledWith({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    });
    expect(component.selectedStudent).toEqual(student);
    expect(component.mode).toBeNull();
  });

  it('should update a student', () => {
    studentService.update.mockReturnValue(of(student));
    component.selectedStudent = student;
    component.startEdit();

    component.save();

    expect(studentService.update).toHaveBeenCalledWith(1, {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    });
  });

  it('should cancel the form', () => {
    component.startCreate();
    component.errorMessage = 'error';

    component.cancelForm();

    expect(component.mode).toBeNull();
    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should delete a student after confirmation', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    studentService.delete.mockReturnValue(of(undefined));
    component.selectedStudent = student;

    component.deleteStudent(student);

    expect(studentService.delete).toHaveBeenCalledWith(1);
    expect(component.selectedStudent).toBeNull();
  });
});
