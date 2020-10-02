import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { UserRoles } from 'src/app/entities/entitities';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  loggedUser: any;
  userRole: any;
  userRoleId;
  get roleType() { return UserRoles; }
  online;
  headerTitles: any;
  hasPeriodPass: boolean = false;
  hasTickets: boolean = false;

  constructor(private translate: TranslateService,public router: Router, private posService: PosDataServiceService) { }

  ngOnInit() {
    this.translate.getTranslation(this.translate.getDefaultLang()).subscribe(
      translations => {
        this.headerTitles = translations.header;
    });
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.headerTitles = event.translations.header
    });

    //see internet status
    this.createOnline().subscribe(isOnline => {
      isOnline ? this.online = true : this.online = false;
    });

    this.loggedUser = this.posService.getPosUserSession();
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.hasPeriodPass = data.hasPeriodPass;
        this.hasTickets = data.displayTicketModule;
      });

    //get roles and check roles with employee
    this.userRole = this.loggedUser.employeeRoleName;
    this.userRoleId = this.loggedUser.employeeRoleId;
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
