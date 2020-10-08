import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { forkJoin } from 'rxjs';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-wasel-details',
  templateUrl: './wasel-details.component.html',
  styleUrls: ['./wasel-details.component.css']
})
export class WaselDetailsComponent implements OnInit {
  accountData: any;
  accountNo: number;
  transactionList: any[] = [];
  currency: any;
  loading: boolean = false;

  topupTransactions: any[] = [];
  selected: string;
  hasTopup: boolean = false;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 4,
    currentPage: 1,
  };

  constructor(private posService: PosDataServiceService, private accService: AccountServiceService, private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.accountNo = this.accService.getAccountNo();

    forkJoin([this.posService.getPosData(), this.accService.getAccountDetails(this.accountNo)]).subscribe(
      (res: any[]) => {
        this.currency = res[0].currencyCode;
        this.accountData = res[1];
        this.selected = this.accountData.purchasesMonths[0];
        this.transactionList = this.accountData.purchases[this.selected].filter(
          el => el.transactionType === 'TOP UP'
        );

        this.loading = false;
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account'])
      }
    );



  }

  selectDate(event) {
    this.transactionList = this.accountData.purchases[event.value].filter(
      el => el.transactionType === 'TOP UP'
    );
  }

  viewTransaction(item) {
    item.account = {
      name: this.accountData.name,
      id: this.accountData.shortId
    }
    sessionStorage.setItem('purchaseTransaction', JSON.stringify(item));
    this.router.navigate(['/account/payments/details'])
  }
}
