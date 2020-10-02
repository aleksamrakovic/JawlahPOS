import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserRoles } from 'src/app/entities/entitities';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';
import { AuthService } from 'src/app/_service/auth.service';

@Component({
  selector: 'app-user-lock',
  templateUrl: './user-lock.component.html',
  styleUrls: ['./user-lock.component.css']
})
export class UserLockComponent implements OnInit {
  loggedUser: any;
  loading = false;
  get roleType() { return UserRoles; }

  constructor(private router: Router, private posService: PosDataServiceService, private auth: AuthService) { }

  ngOnInit() {
    this.loggedUser = this.posService.getPosUserSession();
  }

  unlockUser() {
    this.router.navigate(['/login/password',1]);
  }

  signDifferentUser() {
    this.loading = true;
    this.auth.logout();
  }

}
