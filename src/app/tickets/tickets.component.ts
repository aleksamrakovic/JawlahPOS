import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketsServiceService } from './tickets-service.service';
import { PaginationInstance } from 'ngx-pagination';
import { DefaultLangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css'],
  providers: []
})
export class TicketsComponent implements OnInit {
  ticketRoute: string = 'city';
  routeTypes: any[] = [];
  riders: any[] = [];
  defaultRoute: any;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 6,
    currentPage: 1
  };

  loading: boolean = false;
  selectedLang;

  constructor(private router: Router, private ticketService: TicketsServiceService, private translate: TranslateService) { }

  ngOnInit() {
    //get lang
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.selectedLang = event.lang;
    });

    this.loading = true;
    sessionStorage.setItem('checkoutRoute', JSON.stringify('/tickets'));
    this.ticketService.getRouteTypeList(0).subscribe(
      routes => {
        this.loading = false;
        this.routeTypes = routes;
        console.log(routes);

        if (this.routeTypes.length > 0) {
          this.defaultRoute = this.routeTypes[0];
          
          //call 1 for non group riders
          this.ticketService.getRidersList(this.defaultRoute.externalId, 1).subscribe(
            riders => {
              this.riders = riders; console.log(riders);
              this.loading = false;
            },
            err => {
              this.riders = [];
              this.loading = false;
            });

          //check next page regarding ticket type
          !this.defaultRoute.isIntercity ? this.ticketRoute = 'city' : this.ticketRoute = 'intercity-route';
        }
      },
      err => {
        this.routeTypes = [];
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
    !this.defaultRoute.isIntercity ? this.ticketRoute = 'city' : this.ticketRoute = 'intercity-route';
  }

  //select rider and route
  selectRider(rider: any) {
    if (rider) {
      this.ticketService.setRiderType({ city: this.defaultRoute, rider: rider });
      this.router.navigate([this.ticketRoute]);
    } else {
      this.ticketService.setRiderType({ city: this.defaultRoute, rider: null });
      this.router.navigate(['/luggage']);
    }
  }


}
