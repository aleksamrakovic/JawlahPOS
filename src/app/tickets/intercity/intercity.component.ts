import { Component, OnInit } from '@angular/core';
import { TicketsServiceService } from '../tickets-service.service';
import { Item, Cart, RiderType } from 'src/app/entities/entitities';
import { Router } from '@angular/router';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-intercity',
  templateUrl: './intercity.component.html',
  styleUrls: ['./intercity.component.css']
})

export class IntercityComponent implements OnInit {
  nextStep: boolean = false;
  busStopFrom: any = '';
  busStopTo: any = '';
  stationList: any[] = [];
  items: Item[] = [];
  items2: Item[] = [];
  items3: Item[] = [];
  riderInfo;
  riderType: RiderType;
  cart: Cart;
  routeInfo: any;
  showSecondCurrency: boolean;
  currency;
  currencyRate;
  secondCurrency: any;

  firstIndex: any = null;
  secondIndex: any = null;

  loading: boolean = true;
  public selectedLuggage: any;
  public selectedLuggageReturn: any;

  selectedLang: any;

  firstBaggage: any;
  secondBaggage: any;
  translations;

  constructor(private ticketService: TicketsServiceService, private posService: PosDataServiceService, private router: Router, private translate: TranslateService) { }

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

    //get route info and rider info
    this.routeInfo = JSON.parse(sessionStorage.getItem('routeInfo'));
    this.riderInfo = JSON.parse(sessionStorage.getItem('riderType'));

    if (!this.riderInfo || !this.routeInfo) {
      this.router.navigate(['/intercity-route'])
      this.posService.setAlertMessage('Error occured, please try again later.');
    }

    this.riderType = this.riderInfo.rider;
    this.cart = this.ticketService.cart;
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.showSecondCurrency = data.showSecondCurrency;
        this.currency = data.currencyCode;
        this.secondCurrency = data.secondCurrencyCode;
        this.currencyRate = data.currencyRate;
      }
    );

    //get stations from api regarding routeId
    this.ticketService.getStationListForIntercity(this.routeInfo.routeId).subscribe(
      data => {
        console.log(data);

        this.stationList = data;
        this.loading = false;
      },
      err => {
        this.loading = false;
        this.router.navigate(['/intercity-route'])
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    );
  }

  selectBusStop(item: any, i: any) {
    //disable last station to be first selected
    if (i == this.stationList.length - 1 && !this.busStopFrom) {
      return
    }

    //set index for from/to stations
    var currentIndex = i;
    if (i != this.stationList.length - 1 && !this.busStopFrom) {
      this.firstIndex = i;
    } else if (this.busStopFrom && !this.busStopTo) {
      this.secondIndex = i;
    }

    //add and remove station selected class
    if (this.busStopFrom.id == item.id) {
      this.busStopFrom = "";
      this.firstIndex = null;
      this.secondIndex = null;

      document.getElementsByClassName('intercity-station')[i].classList.remove('station-selected');
      document.getElementsByClassName('intercity-station')[this.stationList.length - 1].classList.add('station-disabled');
    } else {
      if (!this.busStopFrom && !this.busStopTo) {
        this.busStopFrom = item;
        document.getElementsByClassName('intercity-station')[this.stationList.length - 1].classList.remove('station-disabled');
        document.getElementsByClassName('intercity-station')[i].classList.add('station-selected');
      }
      //select station to, only if from is selected
      else if (this.busStopFrom && !this.busStopTo && currentIndex > this.firstIndex) {
        this.busStopTo = item
        this.nextStep = true;
        this.getTickets(this.busStopFrom, this.busStopTo);
        console.log(this.busStopFrom, this.busStopTo);

      }
    }
  }

  resetStation() {
    this.firstIndex = null;
    this.secondIndex = null;
    this.items.length = 0;
    this.items2.length = 0;
    this.items3.length = 0;
    this.nextStep = false;
    this.busStopFrom = '';
    this.busStopTo = '';
    this.firstBaggage = undefined;
    this.secondBaggage = undefined;
    this.selectedLuggage = 'None';
    this.selectedLuggageReturn = 'None';
  }

  //get ticket from api
  getTickets(from: any, to: any) {
    console.log(from, to);
    this.loading = true;
    console.log(this.routeInfo.routeId);


    forkJoin(this.ticketService.getIntercityTicket(from.id, to.id, this.riderType.externalId, this.routeInfo.routeId, this.riderInfo.city.externalId), this.ticketService.getLuggages(this.riderInfo.city.externalId, this.riderType.externalId)).subscribe(
      res => {
        console.log(res);
        this.loading = false;
        var ticket = res[0];
        var luggages = res[1];

        //set ticket intercity
        ticket.price = ticket.price / 1000;
        if (ticket.priceReturn > 0) {
          ticket.priceReturn = ticket.priceReturn / 1000;
        }
        console.log(ticket);
        ticket.routeIntercityId = this.routeInfo.routeId;

        this.items.push({
          accountId: null,
          accountNo: null,
          riderType: this.riderType,
          cityTicket: null,
          intercityTicket: ticket,
          productPeriod: null,
          penalty: null,
          topupAccount: null,
          quantity: 0,
          productBaggage: null,
          productBaggageReturn: null,
          numberOfPassengers: 1,
          routeId: this.riderInfo.city.externalId
        });

        var cartItems = this.cart.items.filter(el => el.intercityTicket != null);
        for (let cartItem of cartItems) {
          var index = this.items.findIndex(x => x.intercityTicket.id === cartItem.intercityTicket.id);
          this.items[index] = cartItem;
        }


        //set luggages
        for (let element of luggages) {
          element.id = this.items[0].intercityTicket.id;
          element.isIntercityTicket = true;

          this.items2.push({
            accountId: null,
            accountNo: null,
            riderType: null,
            cityTicket: null,
            intercityTicket: null,
            productPeriod: null,
            penalty: null,
            topupAccount: null,
            quantity: 0,
            productBaggage: element,
            productBaggageReturn: null,
            numberOfPassengers: 0,
            routeId: this.riderInfo.city.externalId
          });

          this.items3.push({
            accountId: null,
            accountNo: null,
            riderType: null,
            cityTicket: null,
            intercityTicket: null,
            productPeriod: null,
            penalty: null,
            topupAccount: null,
            quantity: 0,
            productBaggage: null,
            productBaggageReturn: element,
            numberOfPassengers: 0,
            routeId: this.riderInfo.city.externalId
          });
        }

        //see if luggage is already selected
        var cartItems = this.cart.items.filter(el => el.productBaggage != null);
        for (let cartItem of cartItems) {
          var index = this.items2.findIndex(x => x.productBaggage.id === cartItem.productBaggage.id);
          if (index > -1) {
            this.items2[index] = cartItem;
            this.firstBaggage = cartItem;
            this.selectedLuggage = cartItem;
          }
        }

        //see if lugggage return is already selected
        var cartItems = this.cart.items.filter(el => el.productBaggageReturn != null);
        for (let cartItem of cartItems) {
          var index = this.items3.findIndex(x => x.productBaggageReturn.id === cartItem.productBaggageReturn.id);
          if (index > -1) {
            this.items3[index] = cartItem;
            this.secondBaggage = cartItem;
            this.selectedLuggageReturn = cartItem;
          }
        }

      },
      err => {
        this.resetStation();
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    );
  }

  addToCart(item: Item) {
    if (this.firstBaggage != undefined) {
      this.firstBaggage.quantity = item.quantity;
    }

    if (this.secondBaggage != undefined) {
      this.secondBaggage.quantity = item.quantity;
    }

    //add cart
    if (this.cart.items.filter(el => el.intercityTicket != null && el.intercityTicket.id === item.intercityTicket.id).length > 0) {
      item.quantity++;
    } else {
      item.quantity++;
      this.cart.items.push(item);
    }

    //calculate
    if (!item.intercityTicket.isReturn) {
      this.cart.total += item.intercityTicket.price;
      this.cart.totalCent += item.intercityTicket.price * 1000;
    } else {
      this.cart.total += item.intercityTicket.priceReturn;
      this.cart.totalCent += item.intercityTicket.priceReturn * 1000;
    }

    //add luggage in cart
    if (this.firstBaggage != undefined) {
      if (this.cart.items.filter(el => el.productBaggage != null && el.productBaggage.id === this.firstBaggage.productBaggage.id).length > 0) {
        this.firstBaggage.quantity++;
      } else {
        this.firstBaggage.quantity++;
        this.cart.items.push(this.firstBaggage);
      }
      this.cart.total += this.firstBaggage.productBaggage.price;
      this.cart.totalCent += this.firstBaggage.productBaggage.priceCent;
    }

    //add luggage return in cart
    if (this.secondBaggage != undefined) {
      if (this.cart.items.filter(el => el.productBaggageReturn != null && el.productBaggageReturn.id === this.secondBaggage.productBaggageReturn.id).length > 0) {
        this.secondBaggage.quantity++;
      } else {
        this.secondBaggage.quantity++;
        this.cart.items.push(this.secondBaggage);
      }
      this.cart.total += this.secondBaggage.productBaggageReturn.price;
      this.cart.totalCent += this.secondBaggage.productBaggageReturn.priceCent;
    }

    this.ticketService.setCart(this.cart);
  }

  removeFromCart(item: Item) {
    if (this.firstBaggage != undefined) {
      this.firstBaggage.quantity = item.quantity;
    }

    if (this.secondBaggage != undefined) {
      this.secondBaggage.quantity = item.quantity;
    }

    if (this.cart.items.filter(el => el.intercityTicket != null && el.intercityTicket.id === item.intercityTicket.id).length > 0) {
      if (item.quantity > 1) {
        item.quantity--;
        if (!item.intercityTicket.isReturn) {
          this.cart.total -= item.intercityTicket.price;
          this.cart.totalCent -= item.intercityTicket.price * 1000;
        } else {
          this.cart.total -= item.intercityTicket.priceReturn;
          this.cart.totalCent -= item.intercityTicket.priceReturn * 1000;
        }

        this.ticketService.setCart(this.cart);
      } else if (item.quantity == 1) {
        item.quantity = 0;
        var index = this.cart.items.indexOf(item);
        if (index > -1) {
          this.cart.items.splice(index, 1);
          if (!item.intercityTicket.isReturn) {
            this.cart.total -= item.intercityTicket.price;
            this.cart.totalCent -= item.intercityTicket.price * 1000;
          } else {
            this.cart.total -= item.intercityTicket.priceReturn;
            this.cart.totalCent -= item.intercityTicket.priceReturn * 1000;
          }
          this.selectedLuggage = 'None';
          this.selectedLuggageReturn = 'None';
          this.ticketService.setCart(this.cart);
        }
      }
    }

    //remove luggage
    if (this.firstBaggage != undefined) {
      if (this.cart.items.filter(el => el.productBaggage != null && el.productBaggage.id === this.firstBaggage.productBaggage.id).length > 0) {
        if (this.firstBaggage.quantity > 1) {
          this.firstBaggage.quantity--;
          this.cart.total -= this.firstBaggage.productBaggage.price;
          this.cart.totalCent -= this.firstBaggage.productBaggage.priceCent;

          this.ticketService.setCart(this.cart);
        } else if (this.firstBaggage.quantity == 1) {
          this.firstBaggage.quantity = 0;
          var index = this.cart.items.indexOf(this.firstBaggage);
          if (index > -1) {
            this.cart.items.splice(index, 1);
            this.cart.total -= this.firstBaggage.productBaggage.price;
            this.cart.totalCent -= this.firstBaggage.productBaggage.priceCent;
            this.firstBaggage = undefined;
            this.selectedLuggage = 'None';
          }
        }
      }
    }

    //remove luggage return
    if (this.secondBaggage != undefined) {
      if (this.cart.items.filter(el => el.productBaggageReturn != null && el.productBaggageReturn.id === this.secondBaggage.productBaggageReturn.id).length > 0) {
        if (this.secondBaggage.quantity > 1) {
          this.secondBaggage.quantity--;
          this.cart.total -= this.secondBaggage.productBaggageReturn.price;
          this.cart.totalCent -= this.secondBaggage.productBaggageReturn.priceCent;

          this.ticketService.setCart(this.cart);
        } else if (this.secondBaggage.quantity == 1) {
          this.secondBaggage.quantity = 0;
          var index = this.cart.items.indexOf(this.secondBaggage);
          if (index > -1) {
            this.cart.items.splice(index, 1);
            this.cart.total -= this.secondBaggage.productBaggageReturn.price;
            this.cart.totalCent -= this.secondBaggage.productBaggageReturn.priceCent;
            this.secondBaggage = undefined;
            this.selectedLuggageReturn = 'None';
          }
        }
      }
    }

    this.ticketService.setCart(this.cart);
  }

  addReturn(item: Item) {
    this.resetConfigurator(item);
    item.intercityTicket.isReturn = true;
    this.ticketService.setCart(this.cart);
  }

  addOneway(item: Item) {
    this.resetConfigurator(item);
    item.intercityTicket.isReturn = false;
    this.ticketService.setCart(this.cart);
  }

  resetConfigurator(item: Item) {
    //first remove item from cart regard calculation
    var index = this.cart.items.indexOf(item);
    if (index > -1) {
      this.cart.items.splice(index, 1);
      if (!item.intercityTicket.isReturn) {
        this.cart.total -= item.intercityTicket.price * item.quantity;
        this.cart.totalCent -= (item.intercityTicket.price * 1000) * item.quantity;
      } else {
        this.cart.total -= item.intercityTicket.priceReturn * item.quantity;
        this.cart.totalCent -= (item.intercityTicket.priceReturn * 1000) * item.quantity;
      }
    }
    item.quantity = 0;

    //deselect selected baggage
    if (this.firstBaggage != undefined) {
      var index = this.cart.items.indexOf(this.firstBaggage);
      if (index > -1) {
        this.cart.items.splice(index, 1);
        this.cart.total -= this.firstBaggage.productBaggage.price * this.firstBaggage.quantity;
        this.cart.totalCent -= this.firstBaggage.productBaggage.priceCent * this.firstBaggage.quantity;
      }
      this.firstBaggage.quantity = 0;
      this.firstBaggage = undefined;
    }


    //deselect selected return baggage
    if (this.secondBaggage != undefined) {
      var index = this.cart.items.indexOf(this.secondBaggage);
      if (index > -1) {
        this.cart.items.splice(index, 1);
        this.cart.total -= this.secondBaggage.productBaggageReturn.price * this.secondBaggage.quantity;
        this.cart.totalCent -= this.secondBaggage.productBaggageReturn.priceCent * this.secondBaggage.quantity;
      }
      this.secondBaggage.quantity = 0;
      this.secondBaggage = undefined;
    }

    this.selectedLuggage = 'None';
    this.selectedLuggageReturn = 'None';
    this.ticketService.setCart(this.cart);
  }


  selectBaggage(event, item) {
    //remove ticket and luggage from cart(if there are) bcs of calculation
    this.deselectedItem(item);
    this.deselectFirstBaggage();
    this.deselectSecondBaggage();
    this.firstBaggage = event.value;
  }

  selectBaggage2(event, item) {
    //remove ticket and luggage from cart(if there are) bcs of calculation
    this.deselectedItem(item);
    this.deselectFirstBaggage();
    this.deselectSecondBaggage();
    this.secondBaggage = event.value;

  }

  deselectedItem(item) {
    var index = this.cart.items.indexOf(item);
    if (index > -1) {
      this.cart.items.splice(index, 1);
      if (!item.intercityTicket.isReturn) {
        this.cart.total -= item.intercityTicket.price * item.quantity;
        this.cart.totalCent -= (item.intercityTicket.price * 1000) * item.quantity;
      } else {
        this.cart.total -= item.intercityTicket.priceReturn * item.quantity;
        this.cart.totalCent -= (item.intercityTicket.priceReturn * 1000) * item.quantity;
      }
    }
    item.quantity = 0;
    this.ticketService.setCart(this.cart);
  }

  deselectFirstBaggage() {
    var index = this.cart.items.indexOf(this.firstBaggage);
    if (index > -1) {
      this.cart.items.splice(index, 1);
      this.cart.total -= this.firstBaggage.productBaggage.price * this.firstBaggage.quantity;
      this.cart.totalCent -= this.firstBaggage.productBaggage.priceCent * this.firstBaggage.quantity;
      this.firstBaggage.quantity = 0;
      this.ticketService.setCart(this.cart);
    }
  }

  deselectSecondBaggage() {
    var index = this.cart.items.indexOf(this.secondBaggage);
    if (index > -1) {
      this.cart.items.splice(index, 1);
      this.cart.total -= this.secondBaggage.productBaggageReturn.price * this.secondBaggage.quantity;
      this.cart.totalCent -= this.secondBaggage.productBaggageReturn.priceCent * this.secondBaggage.quantity;
      this.secondBaggage.quantity = 0;
      this.ticketService.setCart(this.cart);
    }
  }


  //scroll top/bottom
  scrollTop() {
    document.getElementById('myDropdown').scrollTop = 0;
  }

  scrollBottom() {
    var bottom = document.getElementById('scrollBot').offsetTop;
    document.getElementById('myDropdown').scrollTop = bottom;
  }
}



