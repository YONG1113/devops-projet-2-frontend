import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserService } from '../../core/service/user.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: { login: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    userService = { login: jest.fn() };
    router = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not login when the form is invalid', () => {
    component.onSubmit();
    expect(component.submitted).toBe(true);
    expect(userService.login).not.toHaveBeenCalled();
  });

  it('should store the token and navigate to students after login', () => {
    const token = 'header.payload.signature';
    userService.login.mockReturnValue(of(token));
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    component.loginForm.setValue({ login: 'john', password: 'password' });

    component.onSubmit();

    expect(userService.login).toHaveBeenCalledWith('john', 'password');
    expect(localStorage.getItem('token')).toBe(token);
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should display an error when login fails', () => {
    userService.login.mockReturnValue(throwError(() => new Error('Unauthorized')));
    component.loginForm.setValue({ login: 'john', password: 'wrong-password' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid login or password');
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should reset the form', () => {
    component.submitted = true;
    component.errorMessage = 'error';
    component.loginForm.setValue({ login: 'john', password: 'password' });

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.loginForm.value).toEqual({ login: null, password: null });
  });
});
