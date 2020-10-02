import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { UserRoles } from '../entities/entitities';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  path: ActivatedRouteSnapshot[];
  route: ActivatedRouteSnapshot;
  get roleType() { return UserRoles; }

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    var user = JSON.parse(sessionStorage.getItem('loggedUser'));

    if (route.data.roles && route.data.roles.indexOf(user.employeeRoleId) !== -1) {
      // user role allowed
      
      return true;
    } else {
      if (user.employeeRoleId == this.roleType.Maintenance) {
        this.router.navigate(['/maintenance']);
        return false
      }
      // user role not allowed
      return false;
    }


  }

}
