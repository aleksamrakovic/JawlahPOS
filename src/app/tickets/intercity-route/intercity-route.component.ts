import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketsServiceService } from '../tickets-service.service';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-intercity-route',
  templateUrl: './intercity-route.component.html',
  styleUrls: ['./intercity-route.component.css']
})
export class IntercityRouteComponent implements OnInit {
  routeList: any[] = [];
  riderInfo: any;
  loading: boolean = true;

  selectedLang: any;

  constructor(private router: Router, private ticketService: TicketsServiceService, private posService: PosDataServiceService, private translate: TranslateService) { }

  ngOnInit() {
    //get lang
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.selectedLang = event.lang;
    });
    //get rider info
    this.riderInfo = this.ticketService.getRiderType();

    if (!this.riderInfo) {
      this.router.navigate(['/tickets'])
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
        this.router.navigate(['/tickets']);
        this.posService.setAlertMessage('Error occured, please try again later.');
      });
  }

  selectRoute(route: any): void {
    this.ticketService.setRouteInfo(route);
    this.router.navigate(['/intercity-ticket']);
  }

  scrollTop(): void {
    document.getElementById('route-list').scrollTop = 0;
  }

  scrollBottom(): void {
    var bottom = document.getElementById('scrollBot').offsetTop;
    document.getElementById('route-list').scrollTop = bottom;
  }
}
