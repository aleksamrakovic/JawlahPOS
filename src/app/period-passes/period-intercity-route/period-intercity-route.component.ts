import { Component, OnInit } from '@angular/core';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-period-intercity-route',
  templateUrl: './period-intercity-route.component.html',
  styleUrls: ['./period-intercity-route.component.css']
})
export class PeriodIntercityRouteComponent implements OnInit {
  riderType: any;
  periodPassesIntercity: any[] = [];

  constructor(private ticketService: TicketsServiceService, private router: Router) { }

  ngOnInit() {
    
  }

}
