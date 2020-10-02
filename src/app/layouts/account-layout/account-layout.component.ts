import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from 'src/app/accounts/account-service.service';

@Component({
  selector: 'app-account-layout',
  templateUrl: './account-layout.component.html',
  styleUrls: ['./account-layout.component.css']
})
export class AccountLayoutComponent implements OnInit {
  accountNo: any;
  accountData: any;
  path: any;
  hasImg: boolean = false;

  constructor(private accService: AccountServiceService) { }

  ngOnInit() {
    this.accountNo = this.accService.getAccountNo();

    //get data using session or using api if no data
    var x = this.accService.getAccountStorage();
    if (!x) {
      this.accService.getAccount().subscribe(
        data => {
          this.accountData = data;
          if (this.accountData.image) {
            this.path = 'data:image/png;base64,' + this.accountData.image;
            this.hasImg = true;
          } else {
            this.hasImg = false;
          }
        }
      );
    } else {
      this.accountData = x;
      if (this.accountData.image) {
        this.path = 'data:image/png;base64,' + this.accountData.image;
        this.hasImg = true;
      } else {
        this.hasImg = false;
      }
    }
  }

}
