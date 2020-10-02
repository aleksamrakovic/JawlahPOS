import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TicketsServiceService } from '../tickets/tickets-service.service';
import { PosDataServiceService } from '../_service/pos-data-service.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart;
  mode = CheckoutMode.Cash;
  routeSaved: any;
  currency: any;
  currencyDecimal: any;

  get checkoutMode() { return CheckoutMode; }
  constructor(private ticketService: TicketsServiceService, private location: Location, private posService: PosDataServiceService) { }

  ngOnInit() {
    this.cart = this.ticketService.cart;
    this.routeSaved = JSON.parse(sessionStorage.getItem('checkoutRoute'));

    this.posService.getPosData().subscribe((data: any) => {
      this.currency = data.currencyCode;
      this.currencyDecimal = data.currencyDecimal;
      this.ticketService.displayMessage(`Amount to pay:      ${this.cart.total.toFixed(this.currencyDecimal)}  ${this.currency}`);
    });
  }

  checkoutModeReset() {
    this.location.back();
  }

  //set payment mode
  setMode(mode) {
    this.mode = mode;
  }

}

export enum CheckoutMode {
  Cash = 1,
  Card = 2
}
