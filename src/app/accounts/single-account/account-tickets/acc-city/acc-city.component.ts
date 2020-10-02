import { Component, OnInit } from '@angular/core';
import { Item, RiderType, Cart } from 'src/app/entities/entitities';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { AccountServiceService } from 'src/app/accounts/account-service.service';
import { Router } from '@angular/router';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-acc-city',
  templateUrl: './acc-city.component.html',
  styleUrls: ['./acc-city.component.css']
})
export class AccCityComponent implements OnInit {
  items: Item[] = [];
  riderType: RiderType;
  cart: Cart;
  tickets = [];
  routeInfo: any;
  showSecondCurrency;
  accountData: any;
  accountNo: number;
  currency: any;
  secondCurrency: any;
  currencyRate;
  loading: boolean = true;

  //must come from distribution
  minGroup = 2;
  maxGroup: number;

  selectedLang: any;
  translations: any;

  constructor(private ticketService: TicketsServiceService, private posService: PosDataServiceService, private accService: AccountServiceService, private router: Router, private translate: TranslateService) { }

  ngOnInit() {
    //get lang
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.selectedLang = event.lang;
    });

    this.translations = new Map<string, string>();
    this.ticketService.getTranslation().subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        this.translations.set(res[i].item, res[i].translation);
      }
    });

    this.loading = true;
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.showSecondCurrency = data.showSecondCurrency;
        this.currency = data.currencyCode;
        this.secondCurrency = data.secondCurrencyCode;
        this.currencyRate = data.currencyRate;
        this.maxGroup = data.maxNoOfPassengers;
      },
      err => {
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account']);
      });

    this.cart = this.ticketService.cart;
    this.routeInfo = this.ticketService.getRiderType();
    this.riderType = this.routeInfo.rider;

    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        this.accountData = data
        this.ticketService.getTicketListForCity(this.routeInfo.city.externalId, this.riderType.externalId, this.accountData.id).subscribe(
          data => {
            this.loading = false;
            this.tickets = data;
            console.log(data);

            for (let element of this.tickets) {
              this.items.push({
                accountId: this.accountData.id,
                accountNo: this.accountData.shortId.toString(),
                riderType: this.riderType,
                cityTicket: element,
                intercityTicket: null,
                productPeriod: null,
                penalty: null,
                topupAccount: null,
                quantity: 0,
                productBaggage: null,
                productBaggageReturn: null,
                numberOfPassengers: this.minGroup,
                routeId: this.routeInfo.city.externalId
              });
            }
            var cartItems = this.cart.items.filter(el => el.cityTicket != null);
            for (let cartItem of cartItems) {
              var index = this.items.findIndex(x => x.cityTicket.id === cartItem.cityTicket.id);
              this.items[index] = cartItem;
            }
          },
          err => {
            this.loading = false;
            this.posService.setAlertMessage('Error occured, please try again later.');
            this.router.navigate(['/account/tickets']);
          }
        );
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account']);
      });

  }


  addPassengers(item: Item) {
    if (item.numberOfPassengers < this.maxGroup) {
      //add passenger, if in cart - first delete item, because of calucation
      var index = this.cart.items.indexOf(item);
      if (index > -1) {
        this.deleteItemFromCart(item, index);
        item.numberOfPassengers++;

        //now add to cart
        this.cart.items.push(item);
        this.cart.total += item.quantity * item.cityTicket.price * item.numberOfPassengers;
        this.cart.totalCent += item.quantity * item.cityTicket.priceCent * item.numberOfPassengers;
        this.ticketService.setCart(this.cart);
      } else {
        item.numberOfPassengers++;
      }
    }
  }

  removePassengers(item, i) {
    if (item.numberOfPassengers > this.minGroup) {
      var index = this.cart.items.indexOf(item);
      if (index > -1) {
        this.deleteItemFromCart(item, index)
        item.numberOfPassengers--;

        //now add to cart
        this.cart.items.push(item);
        this.cart.total += item.quantity * item.cityTicket.price * item.numberOfPassengers;
        this.cart.totalCent += item.quantity * item.cityTicket.priceCent * item.numberOfPassengers;
        this.ticketService.setCart(this.cart);
      } else {
        item.numberOfPassengers--;
      }
    }
  }

  //add ticket to cart
  addToCart(item: Item) {
    if (this.cart.items.filter(el => el.cityTicket != null && el.cityTicket.id === item.cityTicket.id).length > 0) {
      item.quantity++;
    } else {
      item.quantity++;
      this.cart.items.push(item);
    }
    this.cart.total += item.cityTicket.price * item.numberOfPassengers;
    this.cart.totalCent += item.cityTicket.priceCent * item.numberOfPassengers;
    this.ticketService.setCart(this.cart);
  }

  //remove ticket from cart
  removeFromCart(item: Item) {
    if (this.cart.items.filter(el => el.cityTicket != null && el.cityTicket.id === item.cityTicket.id).length > 0) {
      if (item.quantity > 1) {
        item.quantity--;
        this.cart.total -= item.cityTicket.price * item.numberOfPassengers;
        this.cart.totalCent -= item.cityTicket.priceCent * item.numberOfPassengers;
      } else if (item.quantity == 1) {
        item.quantity = 0;
        var index = this.cart.items.indexOf(item);
        if (index > -1) {
          this.cart.total -= item.cityTicket.price * item.numberOfPassengers;
          this.cart.totalCent -= item.cityTicket.priceCent * item.numberOfPassengers;
          this.cart.items.splice(index, 1);
        }
      }
    }
    this.ticketService.setCart(this.cart);
  }

  deleteItemFromCart(item, index) {
    this.cart.total -= item.quantity * item.cityTicket.price * item.numberOfPassengers;
    this.cart.totalCent -= item.quantity * item.cityTicket.priceCent * item.numberOfPassengers;
    this.cart.items.splice(index, 1);
    this.ticketService.setCart(this.cart);
  }
}
