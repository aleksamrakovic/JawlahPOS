import { Component, OnInit } from '@angular/core';
import { TicketsServiceService } from '../tickets-service.service';
import { Item, RiderType, Cart } from 'src/app/entities/entitities';
import { Router } from '@angular/router';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'appcity',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
  items: Item[] = [];
  riderType: RiderType;
  cart: Cart;
  tickets = [];
  routeInfo: any;
  showSecondCurrency;
  currency;
  currencyRate;
  secondCurrency: any;
  currencyAr: any;
  loading: boolean = true;

  languages;
  selectedLang;
  translations;

  constructor(private ticketService: TicketsServiceService, private posService: PosDataServiceService, private router: Router, private translate: TranslateService) {}

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

    //currency data
    this.posService.getPosData().subscribe((data: any) => {
      this.showSecondCurrency = data.showSecondCurrency;
      this.currency = data.currencyCode;
      this.secondCurrency = data.secondCurrencyCode;
      this.currencyRate = data.currencyRate;
    });
    this.cart = this.ticketService.cart;

    //get route info and rider info
    this.routeInfo = this.ticketService.getRiderType();
    this.riderType = this.routeInfo.rider;
    console.log(this.routeInfo);

    //get ticket list for city
    this.ticketService.getTicketListForCity(this.routeInfo.city.externalId, this.riderType.externalId, '').subscribe(
      data => {
        this.loading = false;
        this.tickets = data;
        console.log(data);

        for (let element of this.tickets) {
          this.items.push({
            accountId: null,
            accountNo: null,
            riderType: this.riderType,
            cityTicket: element,
            intercityTicket: null,
            productPeriod: null,
            penalty: null,
            topupAccount: null,
            quantity: 0,
            productBaggage: null,
            productBaggageReturn: null,
            numberOfPassengers: 1,
            routeId: this.routeInfo.city.externalId
          });
        }
        //see which one is in cart already
        var cartItems = this.cart.items.filter(el => el.cityTicket != null);
        for (let cartItem of cartItems) {
          var index = this.items.findIndex(x => x.cityTicket.id === cartItem.cityTicket.id);
          this.items[index] = cartItem;
        }
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/tickets']);
      }
    );
  }

  addToCart(item: Item) {
    if (this.cart.items.filter(el => el.cityTicket != null && el.cityTicket.id === item.cityTicket.id).length > 0) {
      item.quantity++;
    } else {
      item.quantity++;
      this.cart.items.push(item);
    }
    this.cart.total += item.cityTicket.price;
    this.cart.totalCent += item.cityTicket.priceCent;
    this.ticketService.setCart(this.cart);
  }

  removeFromCart(item: Item) {
    if (this.cart.items.filter(el => el.cityTicket != null && el.cityTicket.id === item.cityTicket.id).length > 0) {
      if (item.quantity > 1) {
        item.quantity--;
        this.cart.total -= item.cityTicket.price;
        this.cart.totalCent -= item.cityTicket.priceCent;
      } else if (item.quantity == 1) {
        item.quantity = 0;
        var index = this.cart.items.indexOf(item);
        if (index > -1) {
          this.cart.total -= item.cityTicket.price;
          this.cart.totalCent -= item.cityTicket.priceCent;
          this.cart.items.splice(index, 1);
        }
      }
    }
    this.ticketService.setCart(this.cart);
  }
}
