import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';
import { AuthService } from 'src/app/_service/auth.service';

@Component({
  selector: 'app-cashout-popup',
  templateUrl: './cashout-popup.component.html',
  styleUrls: ['./cashout-popup.component.css']
})
export class CashoutPopupComponent implements OnInit {
  timeout;
  cashoutAmount;
  currency;

  constructor(private posService:PosDataServiceService,private location: Location, private auth: AuthService) { }

  ngOnInit() {
    this.posService.getPosData().subscribe((data: any) => {this.currency = data.currencyCode});
    this.cashoutAmount = JSON.parse(sessionStorage.getItem('cashoutAmount'));

    //timeout 5s before login page
    this.timeout = setTimeout(() => {
      this.auth.logout();
      sessionStorage.removeItem('cashoutAmount');
    }, 5000)
  }

  //go back and count again
  countAgain() {
    sessionStorage.removeItem('cashoutAmount');
    clearTimeout(this.timeout)
    this.location.back();
  }

}
