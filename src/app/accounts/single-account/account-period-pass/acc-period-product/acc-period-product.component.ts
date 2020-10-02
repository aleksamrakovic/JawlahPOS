import { Component, OnInit } from '@angular/core';
import { PeriodPassServiceService } from 'src/app/period-passes/period-pass-service.service';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { PaginationInstance } from 'ngx-pagination';
import { Router } from '@angular/router';
import { AccountServiceService } from 'src/app/accounts/account-service.service';

@Component({
  selector: 'app-acc-period-product',
  templateUrl: './acc-period-product.component.html',
  styleUrls: ['./acc-period-product.component.css']
})
export class AccPeriodProductComponent implements OnInit {
  routeInfo: any;
  riderType: any;
  productList: any[] = [];
  accountNo: any;
  accountData: any;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 6,
    currentPage: 1
  };

  constructor(private periodService: PeriodPassServiceService, private ticketService: TicketsServiceService, private router: Router, private accService:AccountServiceService) { }

  ngOnInit() {
    this.routeInfo = this.ticketService.getRiderType();
    this.riderType = this.routeInfo.rider;

    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        this.accountData = data
        this.periodService.getAllProducts(this.routeInfo.city.externalId, this.riderType.externalId, this.accountData.id).subscribe(
          res => {
            this.productList = res;
          }
        );
      }
    );
  }

  selectProduct(product: any) {
    // if (this.routeInfo.city.name != 'Airport service') {
    //   var router = 'account/tickets/period/products';
    // }
    sessionStorage.setItem('product', JSON.stringify(product));
    this.router.navigate(['/account/tickets/period/city']);
  }

}
