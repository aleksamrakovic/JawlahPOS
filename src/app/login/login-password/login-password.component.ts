import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/_service/auth.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-login-password',
  templateUrl: './login-password.component.html',
  styleUrls: ['./login-password.component.css']
})
export class LoginPasswordComponent implements OnInit {
  loginForm;
  loginSubmitted: boolean = false;
  errorInfo: any;
  loggedUser: any;
  username;
  locked;
  loading: boolean = false;
  online: boolean;

  @ViewChild('passwordInput', { static: false }) passwordInput: ElementRef;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private route: ActivatedRoute, private posService: PosDataServiceService) {
    this.loginForm = this.fb.group({password: ['', Validators.required]})
  }

  ngOnInit() {
    this.createOnline().subscribe(isOnline => {
      if (isOnline) {
        this.online = true;
      } else {
        this.online = false;
      }
    });
    //get user info
    this.loggedUser = this.posService.getPosUserSession();
    this.locked = this.route.snapshot.paramMap.get('locked')
  }

  ngAfterViewInit() {
    this.passwordInput.nativeElement.focus();
  }

  goPrevStep() {
    this.router.navigate(['/login/username']);
  }

  login(formData) {
    this.loginSubmitted = true;
    if (this.loginForm.invalid) {
      return
    }
    this.loading = true;

    //if locked
    if (this.locked == 1) {
      this.authService.unlock({ username: this.loggedUser.id, password: formData.password }).subscribe(
        res => {
          this.loading = false;
          sessionStorage.removeItem('posLocked');
          var currentRoute = sessionStorage.getItem("currentRoute");
          if (currentRoute != '/pos/lock' && currentRoute != this.router.url) {
            this.router.navigate([currentRoute]);
          } else {
            this.router.navigate(['/period-pass']);
          }
        },
        errorRes => {
          this.loading = false;
          this.errorInfo = errorRes.error;
        });

    } else {

      this.authService.login({ username: this.loggedUser.id, password: formData.password }).subscribe(
        res => {
          this.loading = false;
          this.authService.authenticate(res.token);

          //if first login redirect to new password
          if (!res.user.firstLogin) {
            this.router.navigate(['/period-pass']);
          } else {
            sessionStorage.setItem('password', JSON.stringify(formData.password));
            this.router.navigate(['/new-password']);
          }
        },
        errorRes => {
          this.loading = false;
          this.errorInfo = errorRes.error;
          console.log(errorRes);

        });
    }
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
