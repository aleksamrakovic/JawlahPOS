import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserRoles } from '../entities/entitities';
import { PosDataServiceService } from '../_service/pos-data-service.service';

@Injectable({
  providedIn: 'root'
})
export class CashFloatGuardService implements CanActivate {
  path: ActivatedRouteSnapshot[];
  route: ActivatedRouteSnapshot;
  get roleType() { return UserRoles }
  loggedUser;

  constructor(private router: Router, private posService: PosDataServiceService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.loggedUser = this.posService.getPosUserSession();

    //maintenance doesn't required cashin
    if (this.loggedUser.employeeRoleId == this.roleType.Maintenance) {
      return true
    }
    else if (sessionStorage.getItem('cashDrawerAmount')) {
      return true
    } else {
      //not entered, redirect to cash float
      this.router.navigate(['/cash-float']);
      return false
    }
  }

}
