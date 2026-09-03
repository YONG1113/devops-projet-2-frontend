import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Student } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { MaterialModule } from '../../shared/material.module';

type FormMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  students: Student[] = [];
  selectedStudent: Student | null = null;
  studentForm: FormGroup = new FormGroup({});
  mode: FormMode = null;
  submitted = false;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.loadStudents();
  }

  get form() {
    return this.studentForm.controls;
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = '';
    this.studentService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: students => {
          this.students = students;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Unable to load students';
          this.loading = false;
        }
      });
  }

  selectStudent(student: Student): void {
    this.selectedStudent = student;
    this.mode = null;
    this.submitted = false;
  }

  startCreate(): void {
    this.selectedStudent = null;
    this.mode = 'create';
    this.submitted = false;
    this.errorMessage = '';
    this.studentForm.reset();
  }

  startEdit(): void {
    if (!this.selectedStudent) {
      return;
    }

    this.mode = 'edit';
    this.submitted = false;
    this.errorMessage = '';
    this.studentForm.setValue({
      firstName: this.selectedStudent.firstName,
      lastName: this.selectedStudent.lastName,
      email: this.selectedStudent.email
    });
  }

  save(): void {
    this.submitted = true;
    if (this.studentForm.invalid) {
      return;
    }

    const student: Student = this.studentForm.getRawValue();
    const request = this.mode === 'edit' && this.selectedStudent?.id
      ? this.studentService.update(this.selectedStudent.id, student)
      : this.studentService.create(student);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: savedStudent => {
        this.selectedStudent = savedStudent;
        this.mode = null;
        this.submitted = false;
        this.loadStudents();
      },
      error: () => {
        this.errorMessage = 'Unable to save student';
      }
    });
  }

  cancelForm(): void {
    this.mode = null;
    this.submitted = false;
    this.errorMessage = '';
    this.studentForm.reset();
  }

  deleteStudent(student: Student): void {
    if (!student.id || !confirm(`Delete ${student.firstName} ${student.lastName}?`)) {
      return;
    }

    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.selectedStudent?.id === student.id) {
            this.selectedStudent = null;
            this.mode = null;
          }
          this.loadStudents();
        },
        error: () => {
          this.errorMessage = 'Unable to delete student';
        }
      });
  }
}
