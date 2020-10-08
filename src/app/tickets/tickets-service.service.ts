import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PosDataServiceService } from '../_service/pos-data-service.service';

@Injectable({
  providedIn: 'root'
})
export class TicketsServiceService {
  paymentMode = new Subject<any>();
  cart;
  updateCart = new Subject<any>();
  translations = new Map<string, string>();
  phone: any;
  website: any;

  constructor(private http: HttpClient, private posService: PosDataServiceService) {
    //set cart object
    if (this.cart == null && sessionStorage.getItem('cart') != null) {
      this.cart = JSON.parse(sessionStorage.getItem('cart'));
    } else {
      this.cart = {
        items: [],
        total: 0,
        totalCent: 0,
        posId: '',
        currency: '',
        paymentType: 0
      }
    }

    this.posService.getPosData().subscribe(
      (res: any) => {
        this.phone = res.phone;
        this.website = res.websiteUrl;
      }
    )
  }

  setCart(cart) {
    sessionStorage.setItem('cart', JSON.stringify(cart));
    this.cart = cart;
    sessionStorage.setItem('paymentMode', JSON.stringify(false));
    sessionStorage.removeItem('lastActions');
  }

  setCartUpdate(updateCart) {
    this.updateCart.next(updateCart);
  }

  getCartUpdate() {
    return this.updateCart.asObservable();
  }

  setRiderType(type: any) {
    sessionStorage.setItem('riderType', JSON.stringify(type))
  }

  getRiderType() {
    return JSON.parse(sessionStorage.getItem('riderType'));
  }

  //rider id for normal tickets will be 0, for account riderTypeId
  getRouteTypeList(riderId) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/routeTypes?riderId=' + riderId);
  }

  //1 is for non group tickets
  getRidersList(routeId, isGroup = 0, guest = true) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/riders?routeId=' + routeId + '&withoutGroup=' + isGroup + '&guest=' + guest);
  }

  //1 is for non group tickets
  getRidersVerifyList(routeId, isGroup = 0, guest = true) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/ridersVerify?routeId=' + routeId + '&withoutGroup=' + isGroup + '&guest=' + guest);
  }

  getTicketListForCity(cityId: any, riderId: any, accountId: any) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/city?cityId=' + cityId + '&riderId=' + riderId + '&accountId=' + accountId);
  }

  //get luggages
  getLuggages(id: any, riderId = 0) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/luggage?transitType=' + id + '&rider=' + riderId);
  }

  //intercity and intercity express routes
  getIntercityRoutes(id) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/intercityRoutes?id=' + id);
  }

  //set route info for next pageg
  setRouteInfo(route) {
    sessionStorage.setItem('routeInfo', JSON.stringify(route));
  }

  //stations intercity
  getStationListForIntercity(id) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/intercityStops?id=' + id);
  }

  //if not account intercity, account id = 0
  getIntercityTicket(origStop, destStop, riderId, routeId, transitType, accountId = 0) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/intercity?origStop=' + origStop + '&destStop=' + destStop + '&rider=' + riderId + '&routeId=' + routeId + '&transitType=' + transitType + '&accountId=' + accountId);
  }

  setPaymentMode(paymentMode: any) {
    this.paymentMode.next(paymentMode);
  }

  getPaymentMode() {
    return this.paymentMode.asObservable();
  }

  setTicketId(ticketId) {
    sessionStorage.setItem('ticketId', JSON.stringify(ticketId))
  }

  getTicketId() {
    return JSON.parse(sessionStorage.getItem('ticketId'));
  }

  //api call to post cart obj in db before checkout
  checkout(cart: any) {
    return this.http.post<any>(environment.baseUrl + '/api/ticket/checkout', cart);
  }

  checkoutItem(item: any) {
    return this.http.post<any>(environment.baseUrl + '/api/ticket/checkoutItem', item);
  }

  //get,set cart for reprint
  setReprintCart(cart) {
    sessionStorage.setItem('reprintCart', JSON.stringify(cart));
  }

  getReprintCart() {
    return JSON.parse(sessionStorage.getItem('reprintCart'));
  }

  setReprintItems(items) {
    sessionStorage.setItem('reprintItems', JSON.stringify(items));
  }

  getReprintItems() {
    return JSON.parse(sessionStorage.getItem('reprintItems'));
  }

  //api call for Printing tickets
  printTicket(text: any, qrCode: any, text2: any) {
    return this.http.post<any>('http://127.0.0.1:3333/print', { text: text, qrcode: qrCode, text2: text2 });
  }

  //api call for hotlist
  hotlistTicket(ticketId: any, mode: any, transaction) {
    return this.http.post<any>(environment.baseUrl + '/api/ticket/hotlist', { ticket: ticketId, reprint: mode, transactionNo: transaction });
  }

  //api call for customer display message
  displayMessage(text: any) {
    this.http.post<any>('http://127.0.0.1:3333/display', { text: text }).subscribe(
      res => {
      });
  }

  finishCart(paymentMode) {
    console.log("payment " + paymentMode);
    this.cart.items = [];
    this.cart.total = 0;
    this.cart.totalCent = 0;
    this.setCart(this.cart);
    sessionStorage.setItem('paymentMode', paymentMode);
  }

  getTranslation() {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/translations');
  }

  updateDeviceCounter(id) {
    this.http.get<any>(environment.baseUrl + '/api/device/updateCounter?counterId=' + id).subscribe(
      res => {console.log(true)}
    )
  }

  //METHODS FOR PRINTING
  firstPartText(res) {
    var underline = `_`;
    return `${this.addSpace(`${res.issueTime.split(" ")[0]}`, 24)}` +
      `${this.addSpace2(`${this.website}`, 24)}\n` +
      `${this.addSpace(`${res.issueTime.split(" ")[1]}`, 24)}` +
      `${this.addSpace2(`${this.phone}`, 24)}\n` +
      `${underline.repeat(48)}\n\n`;
  }

  lastPartText(loggedUser, location, ticketValid, translations, route, ticketId) {
    var text = '';
    var underline = `_`;
    let locationEn = 'Reservation office';
    let locationAr = translations.get(locationEn);
    let validEn = 'Ticket valid until';
    let validAr = translations.get(validEn);
    let discEn = 'Terms and conditions apply';
    let discAr = translations.get(discEn);

    if (ticketValid != '') {
      var date = ticketValid.split(" ");
      var res1 = date[0].split("/");
      var res2 = date[1].split(":");
      var res3 = res2[2] + ":" + res2[1] + ":" + res1[2];
      var res4 = res2[0] + "/" + res1[1] + "/" + res1[0];
      var dateAr = res3 + " " + res4;
      var ticketDate =
        `${this.addSpace(`${validEn}`, 24)}` +
        `${this.addSpace2(`${ticketValid}`, 24)}\n`;

      var ticketDateAr =
        `${this.addSpace(`${translations.get('Ticket valid until')}`, 24)}` +
        `${this.addSpace2(`${dateAr}`, 24)}\n`;

    } else {
      ticketDateAr = '';
      ticketDate = '';
    }

    //ticket id
    if (ticketId) {
      text += `${this.addSpace3(`${ticketId}`, 48)}\n`;
    }

    text += `${this.addSpace(`IPA ${loggedUser}`, 24)}` +
      `${this.addSpace2(`${route}`, 24)}` +
      `${underline.repeat(48)}\n\n`;

    if (!locationAr || !validAr) {
      text += `${this.addSpace(`${locationEn}`, 24)}` + `${this.addSpace2(`${location}`, 24)}\n` +
      `${ticketDate}` +
      `${underline.repeat(48)}\n\n`;
    } else {
      text +=
      `${this.addSpace(`${locationAr}`, 24)}` + `${this.addSpace2(`محطة روي للحافلات`, 24)}\n` +
      `${ticketDateAr}` +
      `${underline.repeat(48)}\n\n` +
      `${this.addSpace(`${locationEn}`, 24)}` + `${this.addSpace2(`${location}`, 24)}\n` +
      `${ticketDate}` +
      `${underline.repeat(48)}\n\n`;
    }

    //disclaimer
    if (!discAr) {
      text += `${this.addSpace(`${discEn}`, 48)}\n\n`
    } else {
      text += `${this.addSpace(`${discEn}${discAr}`, 48)}\n\n`
    }

    return text;
  }

  //only for demo purpose - sending data for print smartcard
  printSmartcard(id: any) {
    return this.http.post<any>('http://127.0.0.1:3333/printCard', { value: id });
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
