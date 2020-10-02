import { Component, OnInit } from '@angular/core';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { Cart, RiderType, Item } from 'src/app/entities/entitities';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-period-city',
  templateUrl: './period-city.component.html',
  styleUrls: ['./period-city.component.css']
})
export class PeriodCityComponent implements OnInit {
  items = [];
  cart: Cart;
  cityId: number;
  riderType: RiderType;
  routeInfo: any;
  showSecondCurrency: any;
  currency;
  currencyRate: any;
  secondCurrency: any;

  constructor(private ticketService: TicketsServiceService, private posService: PosDataServiceService) {}

  ngOnInit() {
    //currency data
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.showSecondCurrency = data.showSecondCurrency;
        this.currency = data.currencyCode;
        this.secondCurrency = data.secondCurrencyCode;
        this.currencyRate = data.currencyRate;
      });
    this.cart = this.ticketService.cart;

    //get route/rider info
    this.routeInfo = this.ticketService.getRiderType();
    this.riderType = this.routeInfo.rider;

    //get selected ticket
    var product = JSON.parse(sessionStorage.getItem('product'));

    //create ticket for sell
    this.items.push({
      accountId: null,
      accountNo: null,
      riderType: this.riderType,
      cityTicket: null,
      intercityTicket: null,
      productPeriod: product,
      topupAccount: null,
      penalty: null,
      quantity: 0,
      productBaggage: null,
      productBaggageReturn: null,
      routeId: this.routeInfo.city.externalId,
      numberOfPassengers: 1,
    });

    //see which one is in cart already
    var cartItems = this.cart.items.filter(el => el.productPeriod != null);
    for (let cartItem of cartItems) {
      var index = this.items.findIndex(x => x.productPeriod.id === cartItem.productPeriod.id);
      this.items[index] = cartItem;
    }
  }

  addToCart(item: Item) {
    if (this.cart.items.filter(el => el.productPeriod != null && el.productPeriod.id === item.productPeriod.id).length > 0) {
      item.quantity++;
    } else {
      item.quantity++;
      this.cart.items.push(item);
    }
    this.cart.total += item.productPeriod.price;
    this.cart.totalCent += item.productPeriod.priceCent;
    this.ticketService.setCart(this.cart);
  }

  removeFromCart(item: Item) {
    if (this.cart.items.filter(el => el.productPeriod != null && el.productPeriod.id === item.productPeriod.id).length > 0) {
      if (item.quantity > 1) {
        item.quantity--;
        this.cart.total -= item.productPeriod.price;
        this.cart.totalCent -= item.productPeriod.priceCent;
      } else if (item.quantity == 1) {
        item.quantity = 0;
        var index = this.cart.items.indexOf(item);
        if (index > -1) {
          this.cart.total -= item.productPeriod.price;
          this.cart.totalCent -= item.productPeriod.priceCent;
          this.cart.items.splice(index, 1);
        }
      }
    }
    this.ticketService.setCart(this.cart);
  }

}
