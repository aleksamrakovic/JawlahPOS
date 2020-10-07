import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { CheckoutMode } from '../checkout.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Cart, DeviceCounter } from 'src/app/entities/entitities';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';
import { PrintServiceService } from 'src/app/_service/print-service.service';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.css']
})
export class CashComponent implements OnInit {
  routeSaved: any;
  amountToPay: any;
  amountToPaySecondCurrency: any;
  amountToReturn: any;
  ele: any;
  opt: any;
  cart: Cart;
  loggedUser: any;
  posInfo: any;
  receipt;
  currency: any;
  secondCurrency: any;
  currencyRate: any;
  currencyDecimal: any;
  alertMessage: any;
  ticketAlert = false;
  ticketAlertMsg: any;
  totalAmount: any;
  translations: any;
  selectedLang: any;

  printFinish: boolean = false;

  reprintItems = [];

  form;
  @ViewChild('cashInput', { static: false }) cashInput: ElementRef;
  printerConnected = false;
  loading = false;

  get deviceId() { return DeviceCounter; }
  printCounter = this.deviceId.printer;

  constructor(private ticketService: TicketsServiceService, private posService: PosDataServiceService, private router: Router, private http: HttpClient, private printService: PrintServiceService, private translate: TranslateService) {
    this.form = new FormGroup({ cashInput: new FormControl('', Validators.required) })
  }

  ngOnInit() {
    //get lang
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.selectedLang = event.lang;
    });

    this.translations = new Map<string, string>();
    this.routeSaved = JSON.parse(sessionStorage.getItem('checkoutRoute'));
    this.loggedUser = this.posService.getPosUserSession();
    this.cart = this.ticketService.cart;

    this.ticketService.getTranslation().subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        this.translations.set(res[i].item, res[i].translation);
      }
    });

    console.log(this.translations)

    this.posService.getPosData().subscribe((data: any) => {
      this.posInfo = data;
      this.currency = data.currencyCode;
      this.secondCurrency = data.secondCurrencyCode;
      this.currencyRate = data.currencyRate;
      this.currencyDecimal = data.currencyDecimal;
      this.amountToPay = Number(this.cart.total.toFixed(this.currencyDecimal));
      this.amountToPaySecondCurrency = this.amountToPay * this.currencyRate;
    });

    this.ticketService.getCartUpdate().subscribe(
      res => {
        if (res) {
          this.cart = this.ticketService.cart;
          this.amountToPay = Number(this.cart.total.toFixed(this.currencyDecimal));
          this.amountToPaySecondCurrency = this.amountToPay * this.currencyRate;
          this.form.controls['cashInput'].setValue('');
          this.amountToReturn = 0;
        }
      }
    )
  }

  ngAfterViewInit() {
    this.cashInput.nativeElement.focus();
  }

  //numpad
  addValue(event: any) {
    var value = this.form.controls['cashInput'].value;
    if (value == null) {
      this.form.controls['cashInput'].setValue('');
    }
    var numpad;
    var eventType = event.type;
    //set event
    if (eventType === 'keyup') {
      numpad = event.key;
      if (numpad === 'Backspace') {
        if (value == null) {
          this.form.controls['cashInput'].setValue('');
        }
      }
    } else {
      numpad = event.target.attributes.value.value;
      if (numpad === 'del') {
        this.form.controls['cashInput'].setValue('');
      } else if (numpad === '.') {
        this.form.controls['cashInput'].setValue(value + numpad);
      } else {
        this.form.controls['cashInput'].setValue(value + numpad);
      }
    }
    //see options
    this.checkAmount()
  }

  checkAmount() {
    this.ele = document.getElementById('selectValue');
    this.opt = this.ele.options[this.ele.selectedIndex].value;
    if (this.opt === this.currency) {
      this.amountToReturn = Number(this.form.controls['cashInput'].value) - Number(this.amountToPay);
    } else {
      this.amountToReturn = Number(this.form.controls['cashInput'].value) - Number(this.amountToPaySecondCurrency);
    }
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
      // this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(
      //   res => {
      //     console.log(res[2]);
      //     if (res[2].status == 'connected' && this.cart.items.length > 0) {
            if (isNaN(form.value.cashInput) == true) {
              this.form.controls['cashInput'].setValue('');
            } else {
              this.opt === this.currency ? this.totalAmount = this.amountToPay : this.totalAmount = this.amountToPaySecondCurrency;

              if (Number(this.form.controls['cashInput'].value) >= Number(this.totalAmount)) {
                this.ticketService.displayMessage(`Amount to return:   ${this.amountToReturn.toFixed(this.currencyDecimal)} ${this.opt}`);
                this.loading = true;
                this.cart.posId = this.posInfo.deviceId;
                this.cart.currency = this.opt;
                this.cart.paymentType = CheckoutMode.Cash;
                delete this.cart.transactionNo;
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
                              //here in res will needed two qr for both ways intercity

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
                                } else if (item.productPeriod != null) {
                                  route = item.productPeriod.route;
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

                                    // await new Promise(finishPrint => {
                                    //   this.ticketService.printTicket(totalText, res.qrCodes[k], lastPart).subscribe(
                                    //     res => {

                                          setTimeout(() => {
                                            console.log('gotovo intercity');
                                            this.ticketService.updateDeviceCounter(this.printCounter);
                                            // finishPrint();
                                          }, 3000);

                                    //     }
                                    //   )
                                    // });
                                  }
                                  resolveCheck();
                                  console.log('gotova oba intercity');

                                } else {

                                  //format text for print
                                  var firstPart = this.ticketService.firstPartText(res);
                                  var secondPart = this.secondPartText(item, 0);
                                  var lastPart = this.ticketService.lastPartText(this.loggedUser.id, this.posInfo.location, res.ticketValid, this.translations, route, res.ticketId);
                                  var totalText = firstPart + secondPart;

                                  // await new Promise(finishPrint => {
                                  //   this.ticketService.printTicket(totalText, res.qrCodes[0], lastPart).subscribe(
                                  //     res => {

                                        setTimeout(() => {
                                          console.log('gotovo stampanje');
                                          this.ticketService.updateDeviceCounter(this.printCounter);
                                          // finishPrint();
                                        }, 3000);

                                  //     }
                                  //   )
                                  // });
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

                    // setTimeout(() => {
                    //   var firstPart = this.ticketService.firstPartText(resCheck);
                    //   var secondPart = this.printTotalReceipt(this.cart);
                    //   var lastPartRec = this.ticketService.lastPartText(this.loggedUser.id, this.posInfo.location, '', this.translations, '', '');
                    //   var totalRec = firstPart + secondPart;
                    //   this.ticketService.printTicket(totalRec, '', lastPartRec).subscribe(
                    //     res => {
                          this.ticketService.finishCart(true);
                          this.loading = false;
                          this.router.navigate([this.routeSaved]);
                          this.ticketService.setReprintItems(this.reprintItems)
                    //     }
                    //   );
                    // }, 2500)

                  });
              } else {
                this.loading = false;
                this.form.controls['cashInput'].setValue('');
              }
            }
        //   } else {
        //     this.loading = false;
        //     this.alertMessage = 'Printer is not connected to device.';
        //     this.posService.setAlertMessage(this.alertMessage);
        //   }
        // }, errorRes => {
        //   this.loading = false;
        //   this.alertMessage = 'No connection to peripheral devices.';
        //   this.posService.setAlertMessage(this.alertMessage);
        // });
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
    var paymentMethod = 'Cash';
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


    //check paid amount translate
    let paidEn = 'Paid Amount';
    //fali prevod za paid amount
    let paidAr = this.translations.get('Total amount');
    let totalPaid = Number(this.form.controls['cashInput'].value).toFixed(this.currencyDecimal);
    let paidVal = this.formatArabicNum(totalPaid);
    if (!paidAr) {
      totalRec += `${this.addSpace(`${paidEn}`, 24)}` + `${this.addSpace2(`${totalPaid} ${curr}`, 24)}\n`;
    } else {
      if (paidEn.length > 16 || paidAr.length > 16 || paidVal.length > 10) {
        totalRec += `${this.addSpace(`${paidEn}`, 24)}` + `${this.addSpace2(`${totalPaid} ${curr}`, 24)}\n`;
        totalRec += `${this.addSpace(`${str.repeat(2)}${paidVal}${curr}${paidAr}`, 48)}\n`;
      } else {
        totalRec += `${this.addSpace(`${paidEn}${str.repeat(2)}${paidVal}${str.repeat((16 - paidEn.length) + (14 - (paidVal.length + curr.length)) / 2)}${curr}${paidAr}`, 48)}\n`;
      }
    }


    //check change amount translate
    let changeEn = 'Change Amount';
    let changeAr = this.translations.get('Change Amount');
    let totalChange = this.amountToReturn.toFixed(this.currencyDecimal);
    let changeVal = this.formatArabicNum(totalChange);
    if (!changeAr) {
      totalRec += `${this.addSpace(`${changeEn}`, 24)}` + `${this.addSpace2(`${totalChange} ${curr}`, 24)}\n`;
    } else {
      if (changeEn.length > 16 || changeAr.length > 16 || changeVal.length > 10) {
        totalRec += `${this.addSpace(`${changeEn}`, 24)}` + `${this.addSpace2(`${totalChange} ${curr}`, 24)}\n`;
        totalRec += `${this.addSpace(`${str.repeat(2)}${changeVal}${curr}${changeAr}`, 48)}\n`;
      } else {
        totalRec += `${this.addSpace(`${changeEn}${str.repeat(2)}${changeVal}${str.repeat((16 - changeEn.length) + (14 - (changeVal.length + curr.length)) / 2)}${curr}${changeAr}`, 48)}\n`;
      }
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

//ESC  "\x1b";
//bold '\x1b\x45\x01'
//left align '\x1b\x61\x00'
//right align '\x1b\x61\x02'
//center align '\x1b\x61\x01'
//underline \x1b\x2d\x01
