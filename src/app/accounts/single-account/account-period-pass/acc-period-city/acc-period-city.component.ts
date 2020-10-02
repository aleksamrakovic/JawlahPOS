import { Component, OnInit } from '@angular/core';
import { Cart, RiderType, Item } from 'src/app/entities/entitities';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { AccountServiceService } from 'src/app/accounts/account-service.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-acc-period-city',
  templateUrl: './acc-period-city.component.html',
  styleUrls: ['./acc-period-city.component.css']
})
export class AccPeriodCityComponent implements OnInit {
  items = [];
  cart: Cart;
  cityId: number;
  riderType: RiderType;
  routeInfo: any;
  showSecondCurr: any;
  currency:any;
  secondCurrency: any;
  currencyRate:any;

  accountNo: number;
  accountData: any;

  constructor(private ticketService: TicketsServiceService, private posService: PosDataServiceService, private accService: AccountServiceService) { }

  ngOnInit() {
    //currency data
    this.posService.getPosData().subscribe((data: any) => {
      this.showSecondCurr = data.showSecondCurrency;
      this.currency = data.currencyCode;
      this.secondCurrency = data.secondCurrencyCode;
      this.currencyRate = data.currencyRate;
    });
    this.cart = this.ticketService.cart;

    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        this.accountData = data
        //get route/rider info
        this.routeInfo = this.ticketService.getRiderType();
        this.riderType = this.routeInfo.rider;
        var product = JSON.parse(sessionStorage.getItem('product'));

        //create ticket for sell
        this.items.push({
          accountId: this.accountData.id,
          accountNo: this.accountData.shortId.toString(),
          riderType: this.riderType,
          cityTicket: null,
          intercityTicket: null,
          productPeriod: product,
          topupAccount: null,
          penalty: null,
          quantity: 0,
          productBaggage: null,
          productBaggageReturn: null,
          numberOfPassengers: 0,
          routeId: this.routeInfo.city.externalId
        });

        //see which one is in cart already
        var cartItems = this.cart.items.filter(el => el.productPeriod != null);
        for (let cartItem of cartItems) {
          var index = this.items.findIndex(x => x.productPeriod.id === cartItem.productPeriod.id);
          this.items[index] = cartItem;
        }
      }
    )
  }

  //add ticket to cart
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

  //remove ticket from cart
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
