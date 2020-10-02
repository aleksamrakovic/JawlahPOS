import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { environment } from 'src/environments/environment';
import { TicketsServiceService } from '../tickets/tickets-service.service';
import { PosDataServiceService } from './pos-data-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  cart;
  translations = new Map<string, string>();
  currency;

  constructor(private http: HttpClient, private router: Router, private ticketService: TicketsServiceService, private posService: PosDataServiceService) {
    this.cart = this.ticketService.cart;
  }

  get isAuthenticated() {
    return !!sessionStorage.getItem('token')
  }

  login(credentials) {
    return this.http.post<any>(environment.baseUrl + '/api/account/login', credentials)
  }

  getByUsername(data) {
    return this.http.post<any>(environment.baseUrl + '/api/account/getByUsername', data)
  }

  changePass(data) {
    return this.http.post<any>(environment.baseUrl + '/api/account/changePass', data)
  }

  authenticate(token) {
    sessionStorage.setItem('token', token);
  }

  logout() {
    this.ticketService.getTranslation().subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        this.translations.set(res[i].item, res[i].translation);
      }
    });
    this.posService.getPosData().subscribe(
      (res: any) => {this.currency = res.currencyCode;}
    );

    this.http.get<any>(environment.baseUrl + '/api/account/logout').subscribe((res: any) => {
      //remove cart
      console.log(res);
      if (res.totalSalesNum > 0) {
        var text = this.printWaybill(res, this.translations, this.currency);
        console.log(this.translations);
        this.ticketService.printTicket(text, '', '').subscribe(res => {});
      }

      //clear the cart and remove token/user info
      this.cart = {items: [], total: 0, totalCent: 0, posId: '', currency: '', paymentType: 0};
      this.ticketService.setCart(this.cart);

      sessionStorage.removeItem('product');
      sessionStorage.removeItem('penaltyRef');
      sessionStorage.removeItem('accountTargetType');
      sessionStorage.removeItem('accountStorage');
      sessionStorage.removeItem('checkoutRoute');
      sessionStorage.removeItem('riderType');
      sessionStorage.removeItem('viewRequest');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('loggedUser');
      sessionStorage.removeItem('cashDrawerAmount');
      sessionStorage.removeItem('accountNo');
      sessionStorage.removeItem('posLocked');
      this.router.navigate(['/login']);
    });
  }

  lock(manually) {
    return this.http.get<any>(environment.baseUrl + '/api/account/lock?manually=' + manually);
  }

  unlock(credentials) {
    return this.http.post<any>(environment.baseUrl + '/api/account/unlock', credentials);
  }

  printWaybill(res, translations, curr) {
    var curr = curr;
    var total = '';
    var underline = `_`;
    var str = ' ';

    total += `${this.addSpace(`${res.shiftDate}`, 48)}\n` +
      `${this.addSpace(`${res.shiftTime}`, 48)}\n` +
      `${underline.repeat(48)}\n\n`;


    var ipaEn = 'IPA';
    var ipaAr = translations.get('IPA');
    var ipaVal = res.employeeIpa;
    if (!ipaAr) {
      total += `${this.addSpace(`${ipaEn}`, 24)}` + `${this.addSpace2(`${ipaVal}`, 24)}\n`;
    } else {
      if (ipaEn.length > 16 || ipaAr.length > 16 || ipaVal.length > 16) {
        total += `${this.addSpace(`${ipaEn}`, 24)}` + `${this.addSpace2(`${ipaVal}`, 24)}\n`;
        total += `${this.addSpace(`${ipaAr}${str.repeat((24 - ipaAr.length) + (24 - ipaVal.length))}${ipaVal}`, 48)}\n`;
      } else {
        total += `${this.addSpace(`${ipaEn}${ipaAr}${str.repeat((16 - ipaAr.length) + (16 - ipaVal.length)/2)}${ipaVal}`, 48)}\n`;
      }
    }


    var empEn = 'Employee Name';
    var empAr = translations.get('Employee Name');
    var empVal = res.employeeName;
    if (!empAr) {
      total += `${this.addSpace(`${empEn}`, 24)}` + `${this.addSpace2(`${empVal}`, 24)}\n`;
    } else {
      if (empEn.length > 16 || empAr.length > 16 || empVal.length > 16) {
        total += `${this.addSpace(`${empEn}`, 24)}` + `${this.addSpace2(`${empVal}`, 24)}\n`;
        total += `${this.addSpace(`${empVal}${empAr}`, 48)}\n`;
      } else {
        total += `${this.addSpace(`${empEn}${str.repeat((16 - empEn.length) + (16 - empVal.length)/2)}${empVal}${empAr}`, 48)}\n`;
      }
    }

    var offEn = 'Reservation office';
    var offAr = translations.get(offEn);
    var offVal = res.posLocation;
    if (!offAr) {
      total += `${this.addSpace(`${offEn}`, 24)}` + `${this.addSpace2(`${offVal}`, 24)}\n\n`;
    } else {
      if (offEn.length > 16 || offAr.length > 16 || offVal.length > 16) {
        total += `${this.addSpace(`${offEn}`, 24)}` + `${this.addSpace2(`${offVal}`, 24)}\n`;
        total += `${this.addSpace(`${offVal}${offAr}`, 48)}\n\n`;
      } else {
        total += `${this.addSpace(`${offEn}${str.repeat((16 - offEn.length) + (16 - offVal.length)/2)}${offVal}${offAr}`, 48)}\n\n`;
      }
    }

    var openBalEn = 'Opening cash balance';
    var openBalAr = translations.get(openBalEn);
    var openBalVal = this.formatArabicNum(res.cashIn);

    if (!openBalAr) {
      total += `${this.addSpace(`${openBalEn}`, 24)}` + `${this.addSpace2(`${res.cashIn} ${curr}`, 24)}\n`;
    } else {
      //check if bigger than 16, for value bigger than 10, regarding currency omr(3)
      if (openBalEn.length > 16 || openBalAr.length > 16 || openBalVal.length > 10) {
        total += `${this.addSpace(`${openBalEn}`, 24)}` + `${this.addSpace2(`${res.cashIn} ${curr}`, 24)}\n`;
        //mora razmak pre broja pa valuta zbog okretanja
        total += `${this.addSpace(`${str.repeat(2)}${openBalVal}${curr}${openBalAr}`, 48)}\n`;
      } else {
        total += `${this.addSpace(`${openBalEn}${str.repeat(2)}${openBalVal}${str.repeat((16 - openBalEn.length) + (14 - (openBalVal.length + curr.length))/2)}${curr}${openBalAr}`, 48)}\n`;
      }
    }

    var totalSalesEn = 'Total sales';
    var totalSalesAr = translations.get('Total sales');
    var totalSalesVal = this.formatArabicNum(res.totalSales);
    if (!totalSalesAr) {
      total += `${this.addSpace(`${totalSalesEn}`, 24)}` + `${this.addSpace2(`${res.totalSales} ${curr}`, 24)}\n`;
    } else {
      if (totalSalesEn.length > 16 || totalSalesAr.length > 16 || totalSalesVal.length > 10) {
        total += `${this.addSpace(`${totalSalesEn}`, 24)}` + `${this.addSpace2(`${res.totalSales} ${curr}`, 24)}\n`;
        total += `${this.addSpace(`${str.repeat(2)}${totalSalesVal}${curr}${totalSalesAr}`, 48)}\n`;
      } else {
        total += `${this.addSpace(`${totalSalesEn}${str.repeat(2)}${totalSalesVal}${str.repeat((16 - totalSalesEn.length) + (14 - (totalSalesVal.length + curr.length))/2)}${curr}${totalSalesAr}`, 48)}\n`;
      }
    }

    var withCashEn = 'With cash';
    var withCashAr = translations.get('With cash');
    var withCashVal = this.formatArabicNum(res.totalSalesCash);
    if (!withCashAr) {
      total += `${this.addSpace(`${withCashEn}`, 24)}` + `${this.addSpace2(`${res.totalSalesCash} ${curr}`, 24)}\n`;
    } else {
      if (withCashEn.length > 16 || withCashAr.length > 16 || withCashVal.length > 10) {
        total += `${this.addSpace(`${withCashEn}`, 24)}` + `${this.addSpace2(`${res.totalSalesCash} ${curr}`, 24)}\n`;
        total += `${this.addSpace(`${str.repeat(2)}${withCashVal}${curr}${withCashAr}`, 48)}\n`;
      } else {
        total += `${this.addSpace(`${withCashEn}${str.repeat(2)}${withCashVal}${str.repeat((16 - withCashEn.length) + (14 - (withCashVal.length + curr.length))/2)}${curr}${withCashAr}`, 48)}\n`;
      }
    }

    var withCardEn = 'With card';
    var withCardAr = translations.get('With card');
    var withCardVal = this.formatArabicNum(res.totalSalesCard);
    if (!withCardAr) {
      total += `${this.addSpace(`${withCardEn}`, 24)}` + `${this.addSpace2(`${res.totalSalesCard} ${curr}`, 24)}\n\n`;
    } else {
      if (withCardEn.length > 16 || withCardAr.length > 16 || withCardVal.length > 10) {
        total += `${this.addSpace(`${withCardEn}`, 24)}` + `${this.addSpace2(`${res.totalSalesCard} ${curr}`, 24)}\n`;
        total += `${this.addSpace(`${str.repeat(2)}${withCardVal}${curr}${withCardAr}`, 48)}\n\n`;
      } else {
        total += `${this.addSpace(`${withCardEn}${str.repeat(2)}${withCardVal}${str.repeat((16 - withCardEn.length) + (14 - (withCardVal.length + curr.length))/2)}${curr}${withCardAr}`, 48)}\n\n`;
      }
    }

    var totalRefundsEn = 'Total refunds';
    var totalRefundsAr = translations.get('Total refunds');
    var totalRefundsVal = this.formatArabicNum(res.totalRefunds);
    if (!totalRefundsAr) {
      total += `${this.addSpace(`${totalRefundsEn}`, 24)}` + `${this.addSpace2(`${res.totalRefunds} ${curr}`, 24)}\n`;
    } else {
      if (totalRefundsEn.length > 16 || totalRefundsAr.length > 16 || totalRefundsVal.length > 10) {
        total += `${this.addSpace(`${totalRefundsEn}`, 24)}` + `${this.addSpace2(`${res.totalRefunds} ${curr}`, 24)}\n`;
        total += `${this.addSpace(`${str.repeat(2)}${totalRefundsVal}${curr}${totalRefundsAr}`, 48)}\n`;
      } else {
        total += `${this.addSpace(`${totalRefundsEn}${str.repeat(2)}${totalRefundsVal}${str.repeat((16 - totalRefundsEn.length) + (14 - (totalRefundsVal.length + curr.length))/2)}${curr}${totalRefundsAr}`, 48)}\n`;
      }
    }

    var withCashRefEn = 'With cash';
    var withCashRefAr = translations.get('With cash');
    var withCashRefVal = this.formatArabicNum(res.totalRefundsCash);
    if (!withCashRefAr) {
      total += `${this.addSpace(`${withCashRefEn}`, 24)}` + `${this.addSpace2(`${res.totalRefundsCash} ${curr}`, 24)}\n`;
    } else {
      if (withCashRefEn.length > 16 || withCashRefAr.length > 16 || withCashRefVal.length > 10) {
        total += `${this.addSpace(`${withCashRefEn}`, 24)}` + `${this.addSpace2(`${res.totalRefundsCash} ${curr}`, 24)}\n`;
        total += `${this.addSpace(`${str.repeat(2)}${withCashRefVal}${curr}${withCashRefAr}`, 48)}\n`;
      } else {
        total += `${this.addSpace(`${withCashRefEn}${str.repeat(2)}${withCashRefVal}${str.repeat((16 - withCashRefEn.length) + (14 - (withCashRefVal.length + curr.length))/2)}${curr}${withCashRefAr}`, 48)}\n`;
      }
    }

    var withCardRefEn = 'With card';
    var withCardRefAr = translations.get('With card');
    var withCardRefVal = this.formatArabicNum(res.totalRefundsCard);
    if (!withCardRefAr) {
      total += `${this.addSpace(`${withCardRefEn}`, 24)}` + `${this.addSpace2(`${res.totalRefundsCard} ${curr}`, 24)}\n`;
    } else {
      if (withCardRefEn.length > 16 || withCardRefAr.length > 16 || withCardRefVal.length > 10) {
        total += `${this.addSpace(`${withCardRefEn}`, 24)}` + `${this.addSpace2(`${res.totalRefundsCard} ${curr}`, 24)}\n`;
        total += `${this.addSpace(`${str.repeat(2)}${withCardRefVal}${curr}${withCardRefAr}`, 48)}\n`;
      } else {
        total += `${this.addSpace(`${withCardRefEn}${str.repeat(2)}${withCardRefVal}${str.repeat((16 - withCardRefEn.length) + (14 - (withCardRefVal.length + curr.length))/2)}${curr}${withCardRefAr}`, 48)}\n`;
      }
    }


    var closeBalEn = 'Closing cash balance';
    var closeBalAr = translations.get(closeBalEn);
    var closeBalVal = this.formatArabicNum(res.cashOut);
    if (!closeBalAr) {
      total += `${this.addSpace(`${closeBalEn}`, 24)}` + `${this.addSpace2(`${res.cashOut} ${curr}`, 24)}\n\n`;
    } else {
      if (closeBalEn.length > 16 || closeBalAr.length > 16 || closeBalVal.length > 10) {
        total += `${this.addSpace(`${closeBalEn}`, 24)}` + `${this.addSpace2(`${res.cashOut} ${curr}`, 24)}\n`;
        total += `${this.addSpace(`${str.repeat(2)}${closeBalVal}${curr}${closeBalAr}`, 48)}\n\n`;
      } else {
        total += `${this.addSpace(`${closeBalEn}${str.repeat(2)}${closeBalVal}${str.repeat((16 - closeBalEn.length) + (14 - (closeBalVal.length + curr.length))/2)}${curr}${closeBalAr}`, 48)}\n\n`;
      }
    }

    var totalNumEn = 'Total sales';
    var totalNumAr = translations.get('Total sales');
    var totalNumVal = String(res.totalSalesNum);
    if (!totalNumAr) {
      total += `${this.addSpace(`${totalNumEn}`, 24)}` + `${this.addSpace2(`${totalNumVal}`, 24)}\n\n`;
    } else {
      if (totalNumEn.length > 16 || totalNumAr.length > 16 || totalNumVal.length > 10) {
        total += `${this.addSpace(`${totalNumEn}`, 24)}` + `${this.addSpace2(`${res.totalSalesNum}`, 24)}\n`;
        total += `${this.addSpace(`${totalNumAr}${str.repeat((24 - totalNumAr.length) + (24 - totalNumVal.length))}${totalNumVal}`, 48)}\n\n`;
      } else {
        total += `${this.addSpace(`${totalNumEn}${totalNumAr}${str.repeat((16 - totalNumAr.length) + (16 - totalNumVal.length)/2)}${totalNumVal}`, 48)}\n\n`;
      }
    }


    for (let i = 0; i < res.items.length; i++) {
      var ele = res.items[i];
      var valueEn = 'Value';
      var valueAr = translations.get(valueEn);
      var valueNumAr = this.formatArabicNum(ele.value.split(" ")[0]);

      if (!valueAr) {
        total +=
        `${this.addSpace(`${ele.name}`, 40)}` + `${this.addSpace2(`${ele.number}`, 8)}\n` +
        `${this.addSpace(`${valueEn}`, 24)}` + `${this.addSpace2(`${ele.value}`, 24)}\n`;
      } else {
        //zbog valute moraju value i curr pre arapskog,
        //posle valueAR ide repeat da odvoji od leve strane jer broj zbog arapskog drugacije gleda stranu
        total +=
        `${this.addSpace(`${ele.name}`, 40)}` + `${this.addSpace2(`${ele.number}`, 8)}\n` +
        `${this.addSpace(`${valueEn}${str.repeat(2)}${valueNumAr}${str.repeat((16 - valueEn.length) + (14 - (valueNumAr.length + curr.length))/2)}${curr}${valueAr}`, 48)}\n`;
      }
    }

    return total;
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
