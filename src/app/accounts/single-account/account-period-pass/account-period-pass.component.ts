import { Component, OnInit } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { AccountServiceService } from 'src/app/accounts/account-service.service';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-period-pass',
  templateUrl: './account-period-pass.component.html',
  styleUrls: ['./account-period-pass.component.css']
})
export class AccountPeriodPassComponent implements OnInit {
  routeTypes: any[] = [];
  riders: any[] = [];
  defaultRoute: any;
  accountData: any;
  accountNo: number;
  loading: boolean = false;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 6,
    currentPage: 1
  };

  constructor(private accService: AccountServiceService, private ticketService: TicketsServiceService, private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        this.accountData = data
        //get routes type
        this.ticketService.getRouteTypeList(this.accountData.riderTypeId).subscribe(
          routes => {
            this.routeTypes = routes;
            this.defaultRoute = this.routeTypes[0];
            console.log(routes);

            if (this.routeTypes.length > 0) {
              this.defaultRoute = this.routeTypes[0];
              this.ticketService.getRidersList(this.defaultRoute.externalId).subscribe(
                riders => {
                  for (let i = 0; i < riders.length; i++) {
                    if (riders[i].externalId === this.accountData.riderTypeId) {
                      this.riders.push(riders[i]);
                    }
                  }
                },
                err => {
                  this.loading = false;
                });
            }
            this.loading = false;
          },
          err => {
            this.loading = false;
          });
      }
    );


  }

  //select route for period
  selectRouteType(route: any) {
    this.riders.length = 0;
    this.defaultRoute = route;
    this.ticketService.getRidersList(this.defaultRoute.externalId).subscribe(riders => {
      for (let i = 0; i < riders.length; i++) {
        if (riders[i].externalId === this.accountData.riderTypeId) {
          this.riders.push(riders[i]);
        }
      }
      console.log(this.riders);

    },
    err => {
      this.loading = false;
    });
  }

  //select rider for period pass - za sad ovako
  selectRider(rider: any) {
    console.log(rider);
    this.ticketService.setRiderType({ city: this.defaultRoute, rider: rider });
    this.router.navigate(['/account/tickets/period/products']);
  }

}
