import { Component, OnInit } from '@angular/core';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { AccountServiceService } from '../../account-service.service';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-tickets',
  templateUrl: './account-tickets.component.html',
  styleUrls: ['./account-tickets.component.css']
})
export class AccountTicketsComponent implements OnInit {
  ticketRoute = 'account/tickets/city';
  routeTypes: any[] = [];
  riders: any[] = [];
  defaultRoute: any;
  accountData: any;
  accountNo: number;
  loading: boolean = false;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 4,
    currentPage: 1
  };

  selectedLang: any;

  constructor(private ticketService: TicketsServiceService, private router: Router, private accService: AccountServiceService, private posService:PosDataServiceService, private translate: TranslateService) {
  }

  ngOnInit() {
    //get lang
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.selectedLang = event.lang;
    });

    this.loading = true;
    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        this.accountData = data
        //get routes type
        this.ticketService.getRouteTypeList(this.accountData.riderTypeId).subscribe(
          routes => {
            this.routeTypes = routes;

            if (this.routeTypes.length > 0) {
              this.defaultRoute = this.routeTypes[0];
              this.ticketService.getRidersList(this.defaultRoute.externalId, 0, false).subscribe(
                riders => {
                  //should be only rider with same externalId
                  console.log(riders);

                  for (let i = 0; i < riders.length; i++) {
                    if ((riders[i].externalId === this.accountData.riderTypeId) && riders[i].isGroup) {
                      this.riders.push(riders[i]);
                    } else if ((riders[i].externalId === this.accountData.riderTypeId) && this.defaultRoute.isIntercity) {
                      this.riders.push(riders[i]);
                    }
                  }
                },
                err => {
                  this.riders = [];
                  this.loading = false;
                });
              !this.defaultRoute.isIntercity ? this.ticketRoute = 'account/tickets/city' : this.ticketRoute = 'account/tickets/intercity-routes';
            }
            this.loading = false;

          },
          err => {
            this.routeTypes = [];
            this.loading = false;
          });
      },
      err => {
        this.loading = false;
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account']);
      }
    );


  }

  //select route type
  selectRouteType(route: any) {
    this.loading = true;
    this.riders.length = 0;
    this.defaultRoute = route;
    this.ticketService.getRidersList(this.defaultRoute.externalId, 0, false).subscribe(
      riders => {
        for (let i = 0; i < riders.length; i++) {
          if ((riders[i].externalId === this.accountData.riderTypeId) && riders[i].isGroup) {
            this.riders.push(riders[i]);
          } else if ((riders[i].externalId === this.accountData.riderTypeId) && this.defaultRoute.isIntercity) {
            this.riders.push(riders[i]);
          }
        }
        this.loading = false;
      },
      err => {
        this.riders = [];
        this.loading = false;
      });
      !this.defaultRoute.isIntercity ? this.ticketRoute = 'account/tickets/city' : this.ticketRoute = 'account/tickets/intercity-routes';
  }

  //select rider
  selectRider(rider: any) {
    this.ticketService.setRiderType({
      city: this.defaultRoute,
      rider: rider
    })
    this.router.navigate([this.ticketRoute]);
  }
}
