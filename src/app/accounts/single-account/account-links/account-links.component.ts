import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-links',
  templateUrl: './account-links.component.html',
  styleUrls: ['./account-links.component.css']
})
export class AccountLinksComponent implements OnInit {
  accountNo: any;
  accountData: any;
  linkedPopup: boolean = false;
  loading: boolean = true;
  accountSelected: any;
  removeAccessPopup: boolean = false;
  alert: boolean = false;
  permissions: any[] = [];

  constructor(private accService: AccountServiceService, private posService: PosDataServiceService, private router:Router) { }

  ngOnInit() {
    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(data => {
      this.accountData = data; console.log(data);
      this.loading = false;
    },
    err => {
      this.loading = false;
      this.posService.setAlertMessage('Error occured, please try again later.');
      this.router.navigate(['/account'])
    });

    this.accService.getAccountPermissions().subscribe(res => {this.permissions = res, console.log(res)});
  }

  grantAccess() {
    this.linkedPopup = true;
  }

  hideLinkedPopup() {
    this.linkedPopup = false;
  }

  showRemoveAccess(acc) {
    this.removeAccessPopup = true;
    this.accountSelected = acc;
  }

  removeAccess() {
    this.loading = true;
    var req = {
      linkedAccountId: this.accountSelected.id,
      permission: null,
      accountId: this.accountData.id
    }
    console.log(req);

    this.accService.unlinkAccount(req).subscribe(
      res => {
        if (res) {
          this.accountSelected.statusLink = 'CANCELED';
          this.loading = false;
          this.removeAccessPopup = false;
        } else {
          this.loading = false;
        }
      }, err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    );
  }

}
