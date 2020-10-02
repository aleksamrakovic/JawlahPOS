import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/_service/auth.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-login-username',
  templateUrl: './login-username.component.html',
  styleUrls: ['./login-username.component.css']
})
export class LoginUsernameComponent implements OnInit {
  form: any;
  loggedUser: any;
  username: any;
  submitted: boolean = false;
  posInfo: any;
  errorInfo: any;
  loading: boolean = false;
  online;

  @ViewChild('usernameInput', { static: false }) usernameInput: ElementRef;

  constructor(private authService: AuthService, private fb: FormBuilder, private posService: PosDataServiceService, private router: Router) {
    this.form = this.fb.group({ username: ['', Validators.required] });
  }

  ngOnInit() {
    this.getPosData();
  }

  ngAfterViewInit() {
    this.usernameInput.nativeElement.focus();
  }

  getPosData() {
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.loading = false;
        this.posInfo = data
      });

      this.createOnline().subscribe(isOnline => {
      if (isOnline) {
        this.online = true;
      } else {
        this.online = false;
      }
    });
  }

  getByUsername(formData) {
    // call api
    this.submitted = true;
    if (this.form.invalid) {
      return
    }
    this.loading = true;
    this.username = formData.username;
    this.authService.getByUsername({ username: this.username })
      .subscribe(res => {
        console.log(res);
        this.loading = false;
        this.loggedUser = res;
        //set user for navbar
        this.posService.setPosUser(this.loggedUser);
        this.router.navigate(['login/password', 0]);
      },
        errorRes => {
          this.errorInfo = errorRes.error;
          this.loading = false;
          console.log(errorRes);

          console.log(errorRes.error);
        });
  }

  createOnline() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

}
