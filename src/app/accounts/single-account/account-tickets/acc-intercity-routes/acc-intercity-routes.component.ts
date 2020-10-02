import { Component, OnInit } from '@angular/core';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { Router } from '@angular/router';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-acc-intercity-routes',
  templateUrl: './acc-intercity-routes.component.html',
  styleUrls: ['./acc-intercity-routes.component.css']
})
export class AccIntercityRoutesComponent implements OnInit {
  riderInfo: any;
  routeList: any[] = [];
  loading: boolean = true;

  selectedLang: any;

  constructor(private ticketService: TicketsServiceService, private router: Router, private posService: PosDataServiceService, private translate: TranslateService) { }

  ngOnInit() {
    //get lang
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.selectedLang = event.lang;
    });
    //get rider info
    this.riderInfo = this.ticketService.getRiderType();

    if (!this.riderInfo) {
      this.router.navigate(['/account/tickets'])
      this.posService.setAlertMessage('Error occured, please try again later.');
    }

    // api call for intercity routes or intercity express
    this.ticketService.getIntercityRoutes(this.riderInfo.city.externalId).subscribe(
      routes => {
        this.routeList = routes, console.log(routes);
        this.loading = false;
      },
      err => {
        this.loading = false;
        this.router.navigate(['/account/tickets']);
        this.posService.setAlertMessage('Error occured, please try again later.');
      });
  }

  selectRoute(route: any) {
    this.ticketService.setRouteInfo(route);
    this.router.navigate(['/account/tickets/intercity']);
  }

  scrollTop() {
    document.getElementById('route-list').scrollTop = 0;
  }

  scrollBottom() {
    var bottom = document.getElementById('scrollBot').offsetTop;
    document.getElementById('route-list').scrollTop = bottom;
  }

}
