import { Component, OnInit } from '@angular/core';
import { PeriodPassServiceService } from '../period-pass-service.service';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-period-products',
  templateUrl: './period-products.component.html',
  styleUrls: ['./period-products.component.css']
})
export class PeriodProductsComponent implements OnInit {
  routeInfo: any;
  riderType: any;
  productList: any[] = [];

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 6,
    currentPage: 1
  };

  constructor(private periodService: PeriodPassServiceService, private ticketService: TicketsServiceService, private router:Router, private posService: PosDataServiceService) { }

  ngOnInit() {
    //get route / rider info
    this.routeInfo = this.ticketService.getRiderType();
    this.riderType = this.routeInfo.rider;

    //api get products for selected route/rider
    this.periodService.getAllProducts(this.routeInfo.city.externalId, this.riderType.externalId, '').subscribe(
      res => {
        console.log(res);
        this.productList = res;
      },
      err => {
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/period-pass']);
      }
    )
  }

  selectProduct(product: any) {
    var router = 'period-city';
    sessionStorage.setItem('product', JSON.stringify(product));
    this.router.navigate([router]);
  }
}
