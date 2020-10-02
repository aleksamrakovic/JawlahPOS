import { Component, OnInit } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { Router } from '@angular/router';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-rider',
  templateUrl: './account-rider.component.html',
  styleUrls: ['./account-rider.component.css']
})
export class AccountRiderComponent implements OnInit {
  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 9,
    currentPage: 1
  };

  riders: any;

  constructor(private router:Router, private ticketService: TicketsServiceService, private posService: PosDataServiceService) { }

  ngOnInit() {
    this.ticketService.getRidersVerifyList(0).subscribe(
      res => {
        console.log(res);
        this.riders = res;
      },
      err => {
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account']);
      }
    )
  }

  selectRider(rider) {
    sessionStorage.setItem( 'accountTargetType' ,JSON.stringify(rider))
    this.router.navigate(['/account/verify/new']);
  }
}
