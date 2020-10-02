import { Component, OnInit, ElementRef, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';
import { AuthService } from 'src/app/_service/auth.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {
  loggedUser: any = {};
  submitted: boolean = false;
  passwordSubmitted: boolean = false;
  newPassword: any;
  errorInfo: any;
  form;
  form2;
  currentStep = 1;
  oldPassword;
  loading: boolean = false;
  passwordInvalid;

  @ViewChild('newPasswordInput', { static: false }) newPasswordInput: ElementRef;
  @ViewChildren('newPasswordRepeatInput') newPasswordRepeatInput: QueryList<ElementRef>;

  constructor(private fb: FormBuilder, private location: Location, private authService: AuthService, private router: Router, private posService: PosDataServiceService) {
    this.form = this.fb.group({
      password: ['', Validators.required]
    });

    this.form2 = this.fb.group({
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    //get logged user info
    this.loggedUser = this.posService.getPosUserSession();
    this.oldPassword = JSON.parse(sessionStorage.getItem('password'));
  }

  ngAfterViewInit() {
    this.newPasswordInput.nativeElement.focus();

    //set focus on input when is visible
    this.newPasswordRepeatInput.changes.subscribe((list: QueryList<ElementRef>) => {
      if (list.length > 0) {
        list.first.nativeElement.focus();
      }
    });
  }

  goPrevStep() {
    if (this.currentStep > 1) {
      this.form.reset();
      this.form2.reset();
      this.currentStep--;
    } else {
      this.location.back()
    }
  }

  selectPassword(formData: any) {
    this.passwordSubmitted = true;
    if (this.form.invalid) {
      return
    }
    if (isNaN(formData.password)) {
      this.errorInfo = 'Password must be a 4 digit number'
      return
    } else if (formData.password.length < 4) {
      this.errorInfo = 'Password is too short'
      return
    } else if (formData.password.length > 4) {
      this.errorInfo = 'Password is too long'
      return
    } else {
      this.newPassword = formData.password;
      this.currentStep++;
      this.errorInfo = null;
    }
  }


  changePass(formData: any) {
    //call api
    this.submitted = true;
    if (this.form.invalid) {
      return
    }
    this.loading = true;

    if (this.newPassword === formData.password) {
      this.authService.changePass({ password: this.oldPassword, newPassword: formData.password })
        .subscribe(res => {
          this.loading = false;
          sessionStorage.removeItem('password');
          this.router.navigate(['/period-pass'])
        },
          errorRes => {
            this.loading = false;
            this.errorInfo = errorRes.error;
            console.log(errorRes.error);

          });
    } else if (this.newPassword !== formData.password && formData.password != '') {
      this.errorInfo = 'Passwords do not match. Try again';
      this.loading = false;
    }
  }
}
