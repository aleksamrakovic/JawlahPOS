import { Component, OnInit } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { AccountServiceService } from 'src/app/accounts/account-service.service';
import { Item } from 'src/app/entities/entitities';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-acc-tickets-list',
  templateUrl: './acc-tickets-list.component.html',
  styleUrls: ['./acc-tickets-list.component.css']
})
export class AccTicketsListComponent implements OnInit {
  activeTickets = false;
  usedTickets = false;
  accountNo: number;
  accountData: any;
  loading: boolean = true;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1
  };

  constructor(private accService: AccountServiceService, private posService: PosDataServiceService, private router: Router) { }

  ngOnInit() {
    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        this.loading = false;
        this.accountData = data;

        this.accountData.activeTickets.length > 0 ? this.activeTickets = true : this.usedTickets = true
        console.log(this.accountData.activeTickets);
        console.log(this.accountData.usedTickets);
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account']);
      }
    );
  }

  showActiveList() {
    this.activeTickets = true;
    this.usedTickets = false;
  }

  showUsedList() {
    this.activeTickets = false;
    this.usedTickets = true;
  }
}
