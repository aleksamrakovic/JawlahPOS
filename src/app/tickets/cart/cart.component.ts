import { Component, OnInit } from '@angular/core';
import { TicketsServiceService } from '../tickets-service.service';
import { Router } from '@angular/router';
import { Cart, Item, DeviceCounter } from 'src/app/entities/entitities';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PrintServiceService } from 'src/app/_service/print-service.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart;
  paymentConfirmed: boolean = false;
  timeout: any;
  lastActions: boolean = false;
  ticketId: number;
  showSecondCurrency: boolean;
  currency: any;
  currencyRate: any;
  currencyDecimal: any;
  secondCurrency: any;
  loggedUser: any;
  posInfo: any;
  translations: any;
  loading: boolean = false;
  showCardTransaction: boolean = false;

  form: any;
  cancelConfirmed: boolean = false;
  reprintConfirmed: boolean = false;
  deviceMessage: any;

  get deviceId() { return DeviceCounter; }
  printCounter = this.deviceId.printer;

  selectedLang;

  constructor(public ticketService: TicketsServiceService, public router: Router, private posService: PosDataServiceService, private http: HttpClient, private translate: TranslateService, private printService: PrintServiceService) {
    this.form = new FormGroup({ transNo: new FormControl('', Validators.required) })

    window.addEventListener('click', (e) => {
      if (this.lastActions) {
        var button = document.getElementsByClassName('lastActionBtn');
        if (e.target != button[0] && e.target != button[1]) {
          this.lastActions = false;
          sessionStorage.removeItem('lastActions');
          sessionStorage.removeItem('ticketId');
          this.ticketService.displayMessage("");
        }
      }
    })
  }

  ngOnInit() {
    //get lang
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.selectedLang = event.lang;
    });

    this.translations = new Map<string, string>();
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.posInfo = data;
        this.showSecondCurrency = data.showSecondCurrency;
        this.currency = data.currencyCode;
        this.secondCurrency = data.secondCurrencyCode;
        this.currencyDecimal = data.currencyDecimal;
        this.currencyRate = data.currencyRate;
      });
    //get ticket id for cancel ticket/reprint
    this.ticketId = this.ticketService.getTicketId();
    this.loggedUser = this.posService.getPosUserSession();

    this.cart = this.ticketService.cart;
    if (this.cart.items.length != 0) {
      this.lastActions = false;
      this.paymentConfirmed = false;
      sessionStorage.setItem('paymentMode', JSON.stringify(false));
      clearTimeout(this.timeout);
      sessionStorage.removeItem('lastActions');
    }

    //payment confirmation and last actions
    this.paymentConfirmed = JSON.parse(sessionStorage.getItem('paymentMode'));
    if (this.paymentConfirmed == true) {
      this.cart.items = [];
      this.cart.total = 0;
      this.cart.totalCent = 0;
      this.ticketService.setCart(this.cart);
      this.lastActions = true;
      sessionStorage.setItem('lastActions', JSON.stringify(true));
      this.timeout = setTimeout(() => {
        this.finish();
      }, 5000);
    }
    if (JSON.parse(sessionStorage.getItem('lastActions'))) {
      this.lastActions = true;
    }

    this.ticketService.getTranslation().subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        this.translations.set(res[i].item, res[i].translation);
      }
    });

  }

  //delete city ticket
  deleteCartItem(item: Item, i: number) {
    if (item.riderType.isGroup && item.numberOfPassengers) {
      this.cart.total -= item.numberOfPassengers * item.cityTicket.price * item.quantity;
      this.cart.totalCent -= item.numberOfPassengers * item.cityTicket.priceCent * item.quantity;
      item.quantity = 0;
      item.numberOfPassengers = 2;
      this.cart.items.splice(i, 1);
      this.ticketService.setCart(this.cart);
      this.ticketService.setCartUpdate('cart updated');
    } else {
      this.cart.total -= item.cityTicket.price * item.quantity;
      this.cart.totalCent -= item.cityTicket.priceCent * item.quantity;
      item.quantity = 0;
      this.cart.items.splice(i, 1);
      this.ticketService.setCart(this.cart);
      this.ticketService.setCartUpdate('cart updated');
    }
  }

  //delete intercity
  deleteCartItemIntercity(item: Item, j: number) {
    //reverse array because of index
    for (var i = this.cart.items.length - 1; i >= 0; i--) {
      var element = this.cart.items[i];
      var el = item;

      if (element.productBaggage != null && element.productBaggage.id == el.intercityTicket.id) {
        this.cart.total -= element.productBaggage.price * element.quantity;
        this.cart.totalCent -= element.productBaggage.priceCent * element.quantity;
        element.quantity = 0;
        this.cart.items.splice(i, 1);
      } else if (element.productBaggageReturn != null && element.productBaggageReturn.id == el.intercityTicket.id) {
        this.cart.total -= element.productBaggageReturn.price * element.quantity;
        this.cart.totalCent -= element.productBaggageReturn.priceCent * element.quantity;
        element.quantity = 0;
        this.cart.items.splice(i, 1);
      }
    }

    if (this.cart.items.filter(el => el.intercityTicket != null && el.intercityTicket.id === item.intercityTicket.id).length > 0) {
      if (!item.intercityTicket.isReturn) {
        this.cart.total -= item.intercityTicket.price * item.quantity * item.numberOfPassengers;
        this.cart.totalCent -= (item.intercityTicket.price * 1000) * item.quantity * item.numberOfPassengers;
      } else {
        this.cart.total -= item.intercityTicket.priceReturn * item.quantity * item.numberOfPassengers;
        this.cart.totalCent -= (item.intercityTicket.priceReturn * 1000) * item.quantity * item.numberOfPassengers;
      }
      item.quantity = 0;
      this.cart.items.splice(j, 1);
    }

    if (item.riderType.isGroup) {
      item.numberOfPassengers = 2;
    } else {
      item.numberOfPassengers = 1;
    }


    this.ticketService.setCart(this.cart);
    this.ticketService.setCartUpdate('cart updated');
  }

  deleteLuggage(item: Item, i: number) {
    this.cart.total -= item.productBaggage.price * item.quantity;
    this.cart.totalCent -= item.productBaggage.priceCent * item.quantity;
    item.quantity = 0;
    this.cart.items.splice(i, 1);
    this.ticketService.setCart(this.cart);
    this.ticketService.setCartUpdate('cart updated');
  }

  //delete city period ticket
  deleteProductPeriod(item: Item, i: number) {
    this.cart.total -= item.productPeriod.price * item.quantity;
    this.cart.totalCent -= item.productPeriod.priceCent * item.quantity;
    item.quantity = 0;
    this.cart.items.splice(i, 1);
    this.ticketService.setCart(this.cart);
    this.ticketService.setCartUpdate('cart updated');
  }

  //delete penalty item
  deletePenaltyItem(item, i) {
    item.quantity = 0;
    item.penalty.status = 'Open';
    this.cart.items.splice(i, 1);
    this.cart.total -= item.penalty.value;
    this.ticketService.setCart(this.cart);
    this.ticketService.setCartUpdate('cart updated');
  }

  //delete account item
  deleteTopUpItem(item, i) {
    item.quantity = 0;
    this.cart.items.splice(i, 1);
    this.cart.total -= item.topupAccount.value;
    this.ticketService.setCart(this.cart);
    this.ticketService.setCartUpdate('cart updated');
  }

  //delete whole cart
  deleteCart() {
    for (let i = 0; i < this.cart.items.length; i++) {
      this.cart.items[i].quantity = 0;

      if (this.cart.items[i].penalty != null) {
        this.cart.items[i].penalty.status = 'Open';
      }

      if (this.cart.items[i].cityTicket != null && this.cart.items[i].riderType.isGroup) {
        this.cart.items[i].numberOfPassengers = 2;
      }
      else if (this.cart.items[i].intercityTicket != null) {
        if (this.cart.items[i].riderType.isGroup) {
          this.cart.items[i].numberOfPassengers = 2;
        } else {
          this.cart.items[i].numberOfPassengers = 1;
        }
      }
      else {
        this.cart.items[i].numberOfPassengers = 1;
      }
    }
    this.cart.items = [];
    this.cart.total = 0;
    this.cart.totalCent = 0;
    this.ticketService.setCart(this.cart);
    this.ticketService.setCartUpdate('cart updated');
  }

  finish() {
    this.paymentConfirmed = false;
    sessionStorage.setItem('paymentMode', JSON.stringify(false));
  }

  cancelTicket() {
    var cartReprint = this.ticketService.getReprintCart();
    if (cartReprint.paymentType == 2) {
      this.showCardTransaction = true;
    } else {
      this.hotlistTicket("");
    }
  }

  submitForm(form) {
    this.hotlistTicket(form.value.transNo);
  }

  hotlistTicket(transNo) {
    this.loading = true;
    this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(
      res => {
        if (res[2].status == 'connected') {
          this.ticketService.hotlistTicket(this.ticketId, false, transNo).subscribe(
            res => {
              console.log(res);
              var cartReprint = this.ticketService.getReprintCart();
              var firstPart = this.ticketService.firstPartText(res);
              var secondPart = this.printCancelation(cartReprint, this.translations);
              var lastPart = this.ticketService.lastPartText(this.loggedUser.id, this.posInfo.location, res.ticketValid, this.translations, '', res.ticketId)
              var text = firstPart + secondPart;

              this.ticketService.printTicket(text, '', lastPart).subscribe(
                res => {
                  this.lastActions = false;
                  this.showCardTransaction = false;
                  sessionStorage.removeItem('reprintItems');
                  sessionStorage.removeItem('lastActions');
                  sessionStorage.removeItem('reprintCart');
                  sessionStorage.removeItem('ticketId');
                  this.ticketService.displayMessage("");
                  this.loading = false;
                  this.cancelConfirmed = true;
                  setTimeout(() => {
                    this.cancelConfirmed = false;
                  }, 5000)
                });
            }
          );
        } else {
          this.loading = false;
          this.deviceMessage = 'Printer is not connected to device.';
          this.posService.setAlertMessage(this.deviceMessage);
        }
      },
      err => {
        this.loading = false;
        this.deviceMessage = 'No connection to peripheral devices.';
        this.posService.setAlertMessage(this.deviceMessage);
      }
    );
  }

  printAgain() {
    this.loading = true;
    var cart = this.ticketService.getReprintItems();
    if (cart.length > 0) {
      this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(
        res => {
          if (res[2].status == 'connected') {
            this.checkReprint(cart);
          } else {
            this.loading = false;
            this.deviceMessage = 'Printer is not connected.';
            this.posService.setAlertMessage(this.deviceMessage);
          }
        },
        err => {
          this.loading = false;
          this.deviceMessage = 'No connection to peripheral devices.';
          this.posService.setAlertMessage(this.deviceMessage);
        }
      );
    } else {
      sessionStorage.removeItem('ticketId');
      sessionStorage.removeItem('lastActions');
      sessionStorage.removeItem('reprintCart');
      sessionStorage.removeItem('reprintItems');
      this.ticketService.displayMessage("");
      this.lastActions = false;
      this.loading = false;
      this.deviceMessage = 'No purchases available for reprint';
      this.posService.setAlertMessage(this.deviceMessage);
    }
  }

  async checkReprint(cart) {
    for (var element of cart) {
      console.log(element);


      //set route name for printing
      var route;
      if (element.item.cityTicket != null) {
        route = element.item.cityTicket.route;
      } else if (element.item.intercityTicket != null) {
        route = 'Intercity';
      } else if (element.item.productBaggage != null) {
        route = 'Intercity';
      } else if (element.item.productBaggageReturn != null) {
        route = 'Intercity';
      } else if (element.item.productPeriod != null) {
        route = 'Period pass'
      } else {
        route = '';
      }



      if (element.item.intercityTicket != null && element.item.intercityTicket.isReturn) {

        for (let k = 0; k < 2; k++) {
          var firstPart = this.ticketService.firstPartText(element.res);
          //send index k to intercityPrint method
          var secondPart = this.secondPartText(element.item, k);
          var lastPart = this.ticketService.lastPartText(this.loggedUser.id, this.posInfo.location, element.res.ticketValid, this.translations, route, element.res.ticketId);
          var totalText = firstPart + secondPart;

          await new Promise(finishPrint => {
            this.ticketService.printTicket(totalText, element.res.qrCodes[k], lastPart).subscribe(
              res => {

                setTimeout(() => {
                  console.log('gotovo intercity');
                  this.ticketService.updateDeviceCounter(this.printCounter);
                  finishPrint();
                }, 3000);

              }
            )
          });
        }
        console.log('gotova oba intercity');

      } else {

        var firstPart = this.ticketService.firstPartText(element.res);
        var secondPart = this.secondPartText(element.item, 0);
        var lastPart = this.ticketService.lastPartText(this.loggedUser.id, this.posInfo.location, element.res.ticketValid, this.translations, route, element.res.ticketId);
        var totalText = firstPart + secondPart;

        await new Promise(finishPrint => {
          this.ticketService.printTicket(totalText, element.res.qrCodes[0], lastPart).subscribe(
            res => {

              setTimeout(() => {
                console.log('gotovo stampanje');
                this.ticketService.updateDeviceCounter(this.printCounter);
                finishPrint();
              }, 3000);

            }
          )
        });
      }
    }
    console.log('kraj');
    sessionStorage.removeItem('ticketId');
    sessionStorage.removeItem('lastActions');
    sessionStorage.removeItem('reprintCart');
    sessionStorage.removeItem('reprintItems');
    this.ticketService.displayMessage("");
    this.lastActions = false;
    this.loading = false;
    this.reprintConfirmed = true;
    setTimeout(() => {
      this.reprintConfirmed = false;
    }, 5000)
  }

  secondPartText(item, k) {
    if (item.cityTicket != null) {
      return this.printService.printCityTicket(item);
    }
    else if (item.productPeriod != null) {
      return this.printService.printPeriodTicket(item);
    }
    else if (item.intercityTicket != null) {
      return this.printService.printIntercity(item, k);
    }
    else if (item.productBaggage != null) {
      return this.printService.printLuggage(item)
    }
    else if (item.productBaggageReturn != null) {
      return this.printService.printLuggageReturn(item)
    }
  }

  printCancelation(cartReprint, translations) {
    var curr = this.currency;
    var text = '';
    var underline = "_";
    var str = ' ';

    var paymentMethod = cartReprint.paymentType == 1 ? 'Cash' : 'Card';
    var titleEn = 'Ticket Cancellation Receipt';
    var titleAr = translations.get(titleEn);
    if (!titleAr) {
      text += `${this.addSpace(`${titleEn}`, 48)}\n\n`;
    } else {
      if (titleEn.length > 24 || titleAr.length > 24) {
        text += `${this.addSpace(`${titleEn}`, 48)}\n`;
        text += `${this.addSpace(`${titleAr}`, 48)}\n\n`;
      } else {
        text += `${this.addSpace(`${titleEn}${titleAr}`, 48)}\n\n`;
      }
    }


    for (let i = 0; i < cartReprint.items.length; i++) {
      var ele = cartReprint.items[i];

      //normal product
      if (ele.accountNo == null) {
        //city ticket
        if (ele.cityTicket != null) {
          text += this.printService.addCityReceipt(ele);
        }

        else if (ele.intercityTicket != null) {
          text += this.printService.addIntercityReceipt(ele);
        }

        //luggage ticket
        else if (ele.productBaggage != null) {
          text += this.printService.addLuggageReceipt(ele);
        }

        //luggage return ticket
        else if (ele.productBaggageReturn != null) {
          text += this.printService.addLuggageReturnReceipt(ele);
        }

        //penalty ticket
        else if (ele.penalty != null) {
          text += this.printService.addPenaltyReceipt(ele);
        }

        //product period ticket
        else if (ele.productPeriod != null) {
          text += this.printService.addProductPeriodReceipt(ele);
        }

        text += `${underline.repeat(48)}\n\n`;
      }

      //account product
      else if (ele.accountNo != null) {
        let custTitle = 'Customer details';
        let custTitleAr = this.translations.get(custTitle);
        let accNoEn = 'Account no';
        let accNoAr = this.translations.get('Account no');
        let accNoVal = ele.accountNo;

        if (!custTitleAr || !accNoAr) {
          text +=
            `${this.addSpace(`${custTitle}`, 48)}\n` +
            `${this.addSpace(`${accNoEn}`, 24)}` + `${this.addSpace2(`${accNoVal}`, 24)}\n\n`
        } else {
          text += `${this.addSpace(`${custTitle}${custTitleAr}`, 48)}\n`;
          if (accNoEn.length > 16 || accNoAr.length > 16 || accNoVal.length > 16) {
            text +=
              `${this.addSpace(`${accNoEn}`, 24)}` + `${this.addSpace2(`${accNoVal}`, 24)}\n` +
              `${this.addSpace(`${accNoAr}${str.repeat((24 - accNoAr.length) + (24 - accNoVal.length))}${accNoVal}`, 48)}\n\n`;
          } else {
            text +=
              `${this.addSpace(`${accNoEn}${accNoAr}${str.repeat((16 - accNoAr.length) + (16 - accNoVal.length) / 2)}${accNoVal}`, 48)}\n\n`;
          }

        }

        //topup
        if (ele.topupAccount != null) {
          text += this.printService.addTopupReceipt(ele);
        }

        //city
        else if (ele.cityTicket != null) {
          text += this.printService.addCityReceipt(ele);
        }

        //intercity
        else if (ele.intercityTicket != null) {
          text += this.printService.addIntercityReceipt(ele);
        }

        //luggage ticket
        else if (ele.productBaggage != null) {
          text += this.printService.addLuggageReceipt(ele);
        }

        //luggage return ticket
        else if (ele.productBaggageReturn != null) {
          text += this.printService.addLuggageReturnReceipt(ele);
        }

        //penalty
        else if (ele.penalty != null) {
          text += this.printService.addPenaltyReceipt(ele);
        }

        //product period ticket
        else if (ele.productPeriod != null) {
          text += this.printService.addProductPeriodReceipt(ele);
        }

        text += `${underline.repeat(48)}\n\n`;
      }
    }

    //calculation
    let totalEn = 'Total amount';
    let totalAr = translations.get('Total amount');
    let totalCart = cartReprint.total.toFixed(this.currencyDecimal);
    let totalVal = this.formatArabicNum(totalCart);
    if (!totalAr) {
      text += `\x1b\x45\x01${this.addSpace(`${totalEn}`, 24)}` + `${this.addSpace2(`${totalCart} ${curr}`, 24)}\n\n\x1b\x45\x00`;
    } else {
      if (totalEn.length > 16 || totalAr.length > 16 || totalVal.length > 10) {
        text += `\x1b\x45\x01${this.addSpace(`${totalEn}`, 24)}` + `${this.addSpace2(`${totalCart} ${curr}`, 24)}\x1b\x45\x00`;
        text += `\x1b\x45\x01${this.addSpace(`${str.repeat(2)}${totalVal}${curr}${totalAr}`, 48)}\n\n\x1b\x45\x00`;
      } else {
        text += `\x1b\x45\x01${this.addSpace(`${totalEn}${str.repeat(2)}${totalVal}${str.repeat((16 - totalEn.length) + (14 - (totalVal.length + curr.length)) / 2)}${curr}${totalAr}`, 48)}\n\n\x1b\x45\x00`;
      }
    }

    let refEn = 'Refund method';
    let refAr = translations.get(refEn);
    let methodEn = paymentMethod;
    let methodAr = translations.get(methodEn);

    if (!refAr || !methodAr) {
      text += `${this.addSpace(`${refEn}`, 24)}` + `${this.addSpace2(`${methodEn}`, 24)}\n\n`;
    } else {
      text += `${this.addSpace(`${refEn}${refAr}`, 48)}\n` +
        `${this.addSpace(`${methodEn}${methodAr}`, 48)}\n\n`;
    }

    return text;
  }

  formatArabicNum(num) {
    var arPrice = num.split('.');
    var newPrice;
    arPrice.length < 2 ? newPrice = arPrice[0] : newPrice = arPrice[1] + '.' + arPrice[0];
    return newPrice;
  }

  //add space after
  addSpace(string = '', validLength = 0) {
    if (string.length < validLength) {
      var spaces = validLength - string.length;
      for (var i = 1; i <= spaces; i++) {
        string = string + ' ';
      }
    } else {
      return string
    }
    return string;
  }

  //add space before
  addSpace2(string = '', validLength = 0) {
    if (string.length < validLength) {
      var spaces = validLength - string.length;
      for (var i = 1; i <= spaces; i++) {
        string = ' ' + string;
      }
    } else {
      return string
    }
    return string;
  }

  //add space both side
  addSpace3(string = '', validLength = 0) {
    if (string.length < validLength) {
      var spaces = Math.floor((validLength - string.length) / 2);
      for (var i = 1; i <= spaces; i++) {
        string = ' ' + string + ' ';
      }
    } else {
      return string
    }
    return string;
  }

}
