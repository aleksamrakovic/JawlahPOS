import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { CheckoutMode } from '../checkout.component';
import { HttpClient } from '@angular/common/http';
import { Cart, DeviceCounter } from 'src/app/entities/entitities';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PrintServiceService } from 'src/app/_service/print-service.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  amountToPay: number;
  amountToPaySecondCurrency: number;
  cart: Cart;
  posInfo: any;
  currency: any;
  currencyRate: any;
  currencyDecimal: any;
  deviceMessage: string;
  loading: boolean = false;
  ticketAlert: boolean = false;
  ticketAlertMsg: any;
  routeSaved: any;
  loggedUser: any;
  translations: any;

  form: any;
  reprintItems = [];

  get deviceId() { return DeviceCounter; }
  printCounter = this.deviceId.printer;

  constructor(private http: HttpClient, private router: Router, private ticketService: TicketsServiceService, private posService: PosDataServiceService, private printService: PrintServiceService) {
    this.form = new FormGroup({ transaction: new FormControl('', Validators.required) })
  }

  ngOnInit() {
    this.translations = new Map<string, string>();

    this.routeSaved = JSON.parse(sessionStorage.getItem('checkoutRoute'));
    this.loggedUser = this.posService.getPosUserSession();
    this.posService.getPosData().subscribe((data: any) => {
      this.posInfo = data
      this.currency = data.currencyCode;
      this.currencyRate = data.currencyRate;
      this.currencyDecimal = data.currencyDecimal;
      this.cart = this.ticketService.cart;
      this.amountToPay = Number(this.cart.total.toFixed(this.currencyDecimal));
      this.amountToPaySecondCurrency = this.amountToPay * this.currencyRate;
    });

    this.ticketService.getCartUpdate().subscribe(
      res => {
        if (res) {
          this.cart = this.ticketService.cart;
          this.amountToPay = Number(this.cart.total.toFixed(this.currencyDecimal));
          this.amountToPaySecondCurrency = this.amountToPay * this.currencyRate;
        }
      }
    );

    this.ticketService.getTranslation().subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        this.translations.set(res[i].item, res[i].translation);
      }
    });
  }

  ticketAlertFunction() {
    this.ticketService.finishCart(false);
    this.router.navigate([this.routeSaved]);
  }

  //submit form
  confirm(form) {
    this.reprintItems.length = 0;

    if (this.cart.items.length > 0) {
      this.loading = true;
      this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(
        res => {
          console.log(res[2]);
          if (res[2].status == 'connected' && this.cart.items.length > 0) {
            this.loading = true;
            this.cart.posId = this.posInfo.deviceId;
            this.cart.currency = this.currency;
            this.cart.paymentType = CheckoutMode.Card;
            this.cart.transactionNo = form.value.transaction;
            this.ticketService.setReprintCart(this.cart);

            this.ticketService.checkout(this.cart).subscribe(
              async resCheck => {
                this.ticketService.setTicketId(resCheck.ticketId);
                for (let i = 0; i < this.cart.items.length; i++) {
                  var item = this.cart.items[i];
                  for (let j = 0; j < item.quantity; j++) {
                    await new Promise(resolveCheck => {
                      this.ticketService.checkoutItem(item).subscribe(
                        async res => {
                          console.log(res);

                          if (res.shouldPrint) {

                            var route;
                            //set route name for printing
                            if (item.cityTicket != null) {
                              route = item.cityTicket.route;
                            } else if (item.intercityTicket != null) {
                              route = 'Intercity';
                            } else if (item.productBaggage != null) {
                              route = 'Intercity';
                            } else if (item.productBaggageReturn != null) {
                              route = 'Intercity';
                            } else {
                              route = '';
                            }

                            var element = {
                              "item": item,
                              "res": res
                            }
                            this.reprintItems.push(element);

                            if (item.intercityTicket != null && item.intercityTicket.isReturn) {


                              for (let k = 0; k < 2; k++) {

                                var firstPart = this.ticketService.firstPartText(res);
                                //send index k to intercityPrint method
                                var secondPart = this.secondPartText(item, k);
                                var lastPart = this.ticketService.lastPartText(this.loggedUser.id, this.posInfo.location, res.ticketValid, this.translations, route, res.ticketId);
                                var totalText = firstPart + secondPart;

                                await new Promise(finishPrint => {
                                  this.ticketService.printTicket(totalText, res.qrCodes[k], lastPart).subscribe(
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
                              resolveCheck();
                              console.log('gotova oba intercity');

                            } else {

                              //format text for print
                              var firstPart = this.ticketService.firstPartText(res);
                              var secondPart = this.secondPartText(item, 0);
                              var lastPart = this.ticketService.lastPartText(this.loggedUser.id, this.posInfo.location, res.ticketValid, this.translations, route, res.ticketId);
                              var totalText = firstPart + secondPart;


                              await new Promise(finishPrint => {
                                this.ticketService.printTicket(totalText, res.qrCodes[0], lastPart).subscribe(
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
                            resolveCheck();
                            console.log('gotov checkoutItem');

                          } else {
                            resolveCheck();
                          }
                        },
                        (error) => {
                          this.loading = false;
                          if (error.error.accountBlocked) {
                            this.ticketAlertMsg = `Transaction is not allowed, account ${error.error.accountId} is blocked`;
                          } else {
                            this.ticketAlertMsg = 'Error happened. Please try again!';
                          }
                          this.ticketAlert = true;
                        }
                      );
                      //checkout end
                    });
                    //promise end
                  }
                }//first for end
                console.log('kraj svega, finalni racun');

                setTimeout(() => {
                  var firstPart = this.ticketService.firstPartText(resCheck);
                  var secondPart = this.printTotalReceipt(this.cart);
                  var lastPartRec = this.ticketService.lastPartText(this.loggedUser.id, this.posInfo.location, '', this.translations, '', '');
                  var totalRec = firstPart + secondPart;
                  this.ticketService.printTicket(totalRec, '', lastPartRec).subscribe(
                    res => {
                      this.ticketService.finishCart(true);
                      this.loading = false;
                      this.router.navigate([this.routeSaved]);
                      this.ticketService.setReprintItems(this.reprintItems)
                    }
                  );
                }, 2500);

              });
          } else {
            this.loading = false;
            this.deviceMessage = 'Printer is not connected to device.';
            this.posService.setAlertMessage(this.deviceMessage);
          }
        }, errorRes => {
          this.loading = false;
          this.deviceMessage = 'No connection to peripheral devices.';
          this.posService.setAlertMessage(this.deviceMessage);
        });
    } else {
      return
    }
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

  printTotalReceipt(cart) {
    var curr = this.currency;
    var totalRec = '';
    var underline = `_`;
    var str = ' ';
    var paymentMethod = 'Card';
    let titleEn = 'Sales Receipt';
    let titleAr = this.translations.get(titleEn);

    //title translation check
    if (!titleAr) {
      totalRec += `${this.addSpace(`${titleEn}`, 48)}\n\n`;
    } else {
      totalRec += `${this.addSpace(`${titleEn}${titleAr}`, 48)}\n\n`;
    }

    //list all items from cart
    for (let i = 0; i < cart.items.length; i++) {
      var ele = cart.items[i];

      //normal product
      if (ele.accountNo == null) {

        //city ticket
        if (ele.cityTicket != null) {
          totalRec += this.printService.addCityReceipt(ele);
        }

        //intercity ticket
        else if (ele.intercityTicket != null) {
          totalRec += this.printService.addIntercityReceipt(ele);
        }

        //luggage ticket
        else if (ele.productBaggage != null) {
          totalRec += this.printService.addLuggageReceipt(ele);
        }

        //luggage return ticket
        else if (ele.productBaggageReturn != null) {
          totalRec += this.printService.addLuggageReturnReceipt(ele);
        }

        //penalty ticket
        else if (ele.penalty != null) {
          totalRec += this.printService.addPenaltyReceipt(ele);
        }

        //product period ticket
        else if (ele.productPeriod != null) {
          totalRec += this.printService.addProductPeriodReceipt(ele);
        }

        totalRec += `${underline.repeat(48)}\n\n`;
      }

      //account product
      else if (ele.accountNo != null) {
        let custTitle = 'Customer details';
        let custTitleAr = this.translations.get(custTitle);
        let accNoEn = 'Account no';
        let accNoAr = this.translations.get('Account no');
        let accNoVal = ele.accountNo;

        //customer title
        if (!custTitleAr) {
          totalRec +=
            `${this.addSpace(`${custTitle}`, 48)}\n`;
        } else {
          if (custTitle.length > 24 || custTitleAr.length > 24) {
            totalRec += `${this.addSpace(`${custTitle}`, 48)}\n`;
            totalRec += `${this.addSpace(`${custTitleAr}`, 48)}\n`;
          }
          totalRec += `${this.addSpace(`${custTitle}${custTitleAr}`, 48)}\n`;
        }

        //account part
        if (!accNoAr) {
          totalRec +=
            `${this.addSpace(`${accNoEn}`, 24)}` + `${this.addSpace2(`${accNoVal}`, 24)}\n\n`
        } else {
          if (accNoEn.length > 16 || accNoAr.length > 16 || accNoVal.length > 16) {
            totalRec +=
              `${this.addSpace(`${accNoEn}`, 24)}` + `${this.addSpace2(`${accNoVal}`, 24)}\n` +
              `${this.addSpace(`${accNoAr}${str.repeat((24 - accNoAr.length) + (24 - accNoVal.length))}${accNoVal}`, 48)}\n\n`;
          } else {
            totalRec +=
              `${this.addSpace(`${accNoEn}${accNoAr}${str.repeat((16 - accNoAr.length) + (16 - accNoVal.length) / 2)}${accNoVal}`, 48)}\n\n`;
          }
        }

        //topup
        if (ele.topupAccount != null) {
          totalRec += this.printService.addTopupReceipt(ele);
        }

        //city
        else if (ele.cityTicket != null) {
          totalRec += this.printService.addCityReceipt(ele);
        }

        //intercity ticket
        else if (ele.intercityTicket != null) {
          totalRec += this.printService.addIntercityReceipt(ele);
        }

        //luggage ticket
        else if (ele.productBaggage != null) {
          totalRec += this.printService.addLuggageReceipt(ele);
        }

        //luggage return ticket
        else if (ele.productBaggageReturn != null) {
          totalRec += this.printService.addLuggageReturnReceipt(ele);
        }

        //penalty
        else if (ele.penalty != null) {
          totalRec += this.printService.addPenaltyReceipt(ele);
        }

        //product period ticket
        else if (ele.productPeriod != null) {
          totalRec += this.printService.addProductPeriodReceipt(ele);
        }

        totalRec += `${underline.repeat(48)}\n\n`;
      }
    }

    //calculation part
    let subEn = 'Subtotal';
    let subAr = this.translations.get('Subtotal');
    let totalCart = Number(cart.total).toFixed(this.currencyDecimal)
    let subVal = this.formatArabicNum(totalCart);
    //check title translate
    if (!subAr) {
      totalRec += `\x1b\x45\x01${this.addSpace(`${subEn}`, 24)}` + `${this.addSpace2(`${totalCart} ${curr}`, 24)}\n\n\x1b\x45\x00`;
    } else {
      if (subEn.length > 16 || subAr.length > 16 || subVal.length > 10) {
        totalRec += `\x1b\x45\x01${this.addSpace(`${subEn}`, 24)}` + `${this.addSpace2(`${totalCart} ${curr}`, 24)}\x1b\x45\x00`;
        totalRec += `\x1b\x45\x01${this.addSpace(`${str.repeat(2)}${subVal}${curr}${subAr}`, 48)}\n\n\x1b\x45\x00`;
      } else {
        totalRec += `\x1b\x45\x01${this.addSpace(`${subEn}${str.repeat(2)}${subVal}${str.repeat((16 - subEn.length) + (14 - (subVal.length + curr.length)) / 2)}${curr}${subAr}`, 48)}\n\n\x1b\x45\x00`;
      }
    }

    //check payMethod translate
    let payMetEn = 'Payment method';
    let payMetAr = this.translations.get(payMetEn);
    let methodAr = this.translations.get(paymentMethod);
    if (!payMetAr || !methodAr) {
      totalRec += `${this.addSpace(`${payMetEn}`, 24)}` + `${this.addSpace2(`${paymentMethod}`, 24)}\n\n`;
    } else {
      totalRec += `${this.addSpace(`${payMetEn}${payMetAr}`, 48)}\n` +
        `${this.addSpace(`${paymentMethod}${methodAr}`, 48)}\n\n`;
    }

    return totalRec;
  }

  formatArabicNum(num) {
    var arPrice = num.split(".");
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
