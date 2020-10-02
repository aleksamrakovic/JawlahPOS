import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserRoles } from '../../entities/entitities';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';
import { AuthService } from 'src/app/_service/auth.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit {
  loggedUser: any;
  posInfo: any;
  get roleType() { return UserRoles; }

  constructor(private router: Router, private posService: PosDataServiceService, private authService: AuthService) { }

  ngOnInit() {
    this.loggedUser = this.posService.getPosUserSession();
    this.posService.getPosData().subscribe(data => { this.posInfo = data, console.log(data);
     });

    //close modal popup on outside click
    var modal = document.getElementById('userModal');
    window.addEventListener('click', (event) => {
      if (event.target == modal) {
        this.posService.setPopup(false);
      }
    })
  }

  lockUser() {
    this.authService.lock(1).subscribe(
      res => {
        this.posService.setPopup(false);
        sessionStorage.setItem("currentRoute", '/period-pass');
        sessionStorage.setItem('posLocked', JSON.stringify(true));
        this.router.navigate(['/pos/lock'])
      },
      err => {
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    );
  }

  //navigate to cashout/logout page
  logoutUser() {
    if (this.loggedUser.employeeRoleId === this.roleType.Maintenance) {
      sessionStorage.removeItem('posLocked');
      this.authService.logout();
    } else {
      this.router.navigate(['/cash-out']);
    }
    this.posService.setPopup(false);
  }

  //close popup modal
  closePopup() {
    this.posService.setPopup(false);
  }

}
