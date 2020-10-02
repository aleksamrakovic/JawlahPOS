import { Component, OnInit } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { TicketsServiceService } from '../tickets/tickets-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-period-passes',
  templateUrl: './period-passes.component.html',
  styleUrls: ['./period-passes.component.css']
})
export class PeriodPassesComponent implements OnInit {
  ticketType = 'period-city';
  routeTypes: any[] = [];
  riders: any[] = [];
  defaultRoute: any;
  loading: boolean = false;
  ticketRoute: any;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 6,
    currentPage: 1
  };

  constructor(private ticketService: TicketsServiceService, private router: Router) { }

  ngOnInit() {
    sessionStorage.setItem('checkoutRoute', JSON.stringify('/period-pass'));
    //get routes type for period pass
    this.ticketService.getRouteTypeList(0).subscribe(routes => {
      this.routeTypes = routes;
      console.log(routes);

      if (this.routeTypes.length > 0) {
        this.defaultRoute = this.routeTypes[0];
        this.ticketService.getRidersList(this.defaultRoute.externalId, 1).subscribe(
          riders => {
            this.loading = false;
            this.riders = riders,
            console.log(riders)
          },
          err => {
            this.loading = false;
            this.riders = [];
          });
      }
      //check next page regarding ticket type
      !this.defaultRoute.isIntercity ? this.ticketRoute = 'city' : this.ticketRoute = 'intercity-route';
    },
      err => {
        this.loading = false;
      });
  }

  selectRouteType(route: any) {
    this.loading = true;
    this.defaultRoute = route;
    console.log(this.defaultRoute);
    this.ticketService.getRidersList(this.defaultRoute.externalId, 1).subscribe(
      riders => {
        this.riders = riders;
        this.loading = false;
      },
      err => {
        this.riders = [];
        this.loading = false;
      });
    // !this.defaultRoute.isIntercity ? this.ticketRoute = 'city' : this.ticketRoute = 'intercity-route';
  }

  selectRider(rider: any) {
    this.ticketService.setRiderType({city: this.defaultRoute, rider: rider});
    this.router.navigate(['/period-products'])
  }

  // //select rider and route
  // selectRider(rider: any) {
  //   if (rider) {
  //     this.ticketService.setRiderType({ city: this.defaultRoute, rider: rider });
  //     this.router.navigate([this.ticketRoute]);
  //   } else {
  //     this.ticketService.setRiderType({ city: this.defaultRoute, rider: null });
  //     this.router.navigate(['/luggage']);
  //   }
  // }

}
