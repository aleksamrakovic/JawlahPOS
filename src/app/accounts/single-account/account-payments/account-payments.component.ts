import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { PaginationInstance } from 'ngx-pagination';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-payments',
  templateUrl: './account-payments.component.html',
  styleUrls: ['./account-payments.component.css']
})
export class AccountPaymentsComponent implements OnInit {
  accountData: any;
  accountNo: number;
  transactionList: any[] = [];
  currency: any;
  loading: boolean = false;
  selected: string;
  selectedType: string = 'all';

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 5,
    currentPage: 1,
  };

  constructor(private accService: AccountServiceService, private posService: PosDataServiceService, private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.posService.getPosData().subscribe((data: any) => { this.currency = data.currencyCode });
    this.accountNo = this.accService.getAccountNo();

    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        console.log(data);

        this.accountData = data
        this.selected = this.accountData.purchasesMonths[0];
        this.transactionList = this.accountData.purchases[this.selected];
        this.loading = false;
      },
      err => {
        this.loading = false
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account']);
      });
  }

  selectType(event) {
    this.config.currentPage = 1;
    if (event.value == 'all') {
      this.transactionList = this.accountData.purchases[this.selected]
    } else {
      this.transactionList = this.accountData.purchases[this.selected].filter(
        el => el.transactionType === event.value
      );
    }
  }

  selectDate(event) {
    this.config.currentPage = 1;
    this.selectedType = 'all';
    this.transactionList = this.accountData.purchases[event.value];
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
