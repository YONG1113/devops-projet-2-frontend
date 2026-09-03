import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Student } from '../models/Student';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;
  let httpTestingController: HttpTestingController;

  const student: Student = {
    id: 1,
    studentNumber: 'STU-2026-000001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(StudentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all students', () => {
    service.findAll().subscribe(students => {
      expect(students).toEqual([student]);
    });

    const request = httpTestingController.expectOne('/api/students');
    expect(request.request.method).toBe('GET');
    request.flush([student]);
  });

  it('should retrieve a student by id', () => {
    service.findById(1).subscribe(result => {
      expect(result).toEqual(student);
    });

    const request = httpTestingController.expectOne('/api/students/1');
    expect(request.request.method).toBe('GET');
    request.flush(student);
  });

  it('should create a student', () => {
    const newStudent: Student = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com'
    };

    service.create(newStudent).subscribe(result => {
      expect(result).toEqual(student);
    });

    const request = httpTestingController.expectOne('/api/students');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(newStudent);
    request.flush(student);
  });

  it('should update a student', () => {
    const updatedStudent: Student = {
      ...student,
      firstName: 'Jane'
    };

    service.update(1, updatedStudent).subscribe(result => {
      expect(result).toEqual(updatedStudent);
    });

    const request = httpTestingController.expectOne('/api/students/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(updatedStudent);
    request.flush(updatedStudent);
  });

  it('should delete a student', () => {
    service.delete(1).subscribe(result => {
      expect(result).toBeNull();
    });

    const request = httpTestingController.expectOne('/api/students/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
