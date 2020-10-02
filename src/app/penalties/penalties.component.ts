import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PenaltiesServiceService } from './penalties-service.service';
import { Router } from '@angular/router';
import { Cart, Item } from '../entities/entitities';
import { TicketsServiceService } from '../tickets/tickets-service.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import ScannerDetector from 'js-scanner-detection';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from '../_service/pos-data-service.service';


@Component({
  selector: 'app-penalties',
  templateUrl: './penalties.component.html',
  styleUrls: ['./penalties.component.css']
})
export class PenaltiesComponent implements OnInit {
  penalties = [];
  cart: Cart;
  items: Item[] = [];
  listOpen = [];
  listAll = [];
  query: string;
  loading: boolean = false;
  currency;
  deviceAlert = false;
  deviceMessage;
  result: [];
  pageTranslate;
  selected: any;

  @ViewChild('penaltyInput', { static: false }) penaltyInput: ElementRef;

  constructor(private translate: TranslateService, private posService: PosDataServiceService, private penService: PenaltiesServiceService, private router: Router, private ticketService: TicketsServiceService, private http: HttpClient) {

  }

  ngOnInit() {
    sessionStorage.setItem('checkoutRoute', JSON.stringify('/penalties'));
    this.translate.getTranslation(this.translate.getDefaultLang()).subscribe(
      translations => {
        this.pageTranslate = translations;
      });
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.pageTranslate = event.translations
    });

    this.cart = this.ticketService.cart;
    this.posService.getPosData().subscribe((data: any) => {this.currency = data.currencyCode;});

    this.getStatus();

    let onComplete = (barcode) => {
      this.loading = true;
      // Do stuff with the barcode
      console.log(barcode)
      this.readBarcode(barcode);
    }

    let options = {
      onComplete: onComplete,
      onError: false, // Callback after detection of a unsuccessful scanning
      onReceive: false, // Callback after receive a char
      timeBeforeScanTest: 100, // Wait duration (ms) after keypress event to check if scanning is finished
      avgTimeByChar: 15, // Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
      minLength: 15, // Minimum length for a scanning
      endChar: [], // Chars to remove and means end of scanning
      stopPropagation: false, // Stop immediate propagation on keypress event
      preventDefault: false // Prevent default action on keypress event
    }
    let scannerDetector = new ScannerDetector(options)
  }

  barcodeOff() {
    let onComplete = (barcode) => {
      this.penaltyInput.nativeElement.value = ''
    }

    let options = {
      onComplete: onComplete,
    }
    let scannerDetector = new ScannerDetector(options)
  }

  barcodeOn() {
    let onComplete = (barcode) => {
      this.loading = true;
      console.log(barcode)
      this.readBarcode(barcode);
    }

    let options = {
      onComplete: onComplete,
    }
    let scannerDetector = new ScannerDetector(options)
  }

  getStatus() {
    this.loading = true;
    this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(
      res => {
        this.loading = false;
        this.deviceMessage = 'QR code scanner is not connected to device. Use input field for penalty search'
        res[3].status == 'connected' ? null : this.posService.setAlertMessage(this.deviceMessage);
      },
      err => {
        this.loading = false;
        this.deviceMessage = 'No connection to peripheral devices.';
        this.posService.setAlertMessage(this.deviceMessage);
      });
  }

  searchPenalty(query) {
    this.loading = true;
    var penalties = [];

    this.http.post<any>(environment.baseUrl + '/api/penalty/search', { value: query }).subscribe(
      res => {
        console.log(res);
        this.result = res;

        this.listAll.length = 0;
        this.listOpen.length = 0;
        for (let element of res) {
          penalties.push({
            accountId: null,
            accountNo: null,
            riderType: null,
            cityTicket: null,
            intercityTicket: null,
            productPeriod: null,
            topupAccount: null,
            penalty: element,
            quantity: 0,
            productBaggage: null,
            productBaggageReturn: null,
            routeId: null,
            numberOfPassengers: 0,
          });
        }

        //match penalties from cart
        var cartItems = this.cart.items.filter(el => el.penalty != null);
        for (let cartItem of cartItems) {
          var index = penalties.findIndex(x => x.penalty.refNumber === cartItem.penalty.refNumber);
          penalties[index] = cartItem;
        }

        //make open/paid list
        for (let i = 0; i < penalties.length; i++) {
          console.log(penalties[i]);

          if (penalties[i].penalty.status.toLowerCase() === 'pending' || penalties[i].penalty.status.toLowerCase() === 'in cart') {
            this.listOpen.push(penalties[i])
          }
          this.listAll.push(penalties[i]);
        }

        //select opet by defaul if there is
        this.listOpen.length > 0 ? this.selected = 'open' : this.selected = 'all';
        var x = {
          source: false,
          value: ''
        }
        if (this.listOpen.length > 0) {
          x.value = 'open'
          this.selectType(x)
        } else {
          x.value = 'all'
          this.selectType(x);
        }

        this.loading = false;
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    );
  }

  readBarcode(value) {
    this.loading = true;
    var penalties = [];
    this.http.post<any>(environment.baseUrl + '/api/penalty/read', { value: value }).subscribe(
      res => {
        this.result = res;

        this.listAll.length = 0;
        this.listOpen.length = 0;
        for (let element of res) {
          penalties.push({
            accountId: null,
            accountNo: null,
            riderType: null,
            cityTicket: null,
            intercityTicket: null,
            productPeriod: null,
            topupAccount: null,
            penalty: element,
            quantity: 0,
            productBaggage: null,
            productBaggageReturn: null,
            routeId: null,
            numberOfPassengers: 0,
          });
        }
        //match penalties from cart
        var cartItems = this.cart.items.filter(el => el.penalty != null);
        for (let cartItem of cartItems) {
          var index = penalties.findIndex(x => x.penalty.refNumber === cartItem.penalty.refNumber);
          penalties[index] = cartItem;
        }

        //make open/paid list
        for (let i = 0; i < penalties.length; i++) {
          if (penalties[i].penalty.status.toLowerCase() === 'pending' || penalties[i].penalty.status.toLowerCase() === 'in cart') {
            this.listOpen.push(penalties[i])
          }
          this.listAll.push(penalties[i]);
        }

        //select by default
        var x = {
          source: false,
          value: ''
        }
        this.listOpen.length > 0 ? this.selected = 'open' : this.selected = 'all';
        if (this.listOpen.length > 0) {
          x.value = 'open'
          this.selectType(x)
        } else {
          x.value = 'all'
          this.selectType(x);
        }

        this.loading = false;
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    )
  }

  //select new option
  selectType(event) {
    event.value === 'all' ? this.penalties = this.listAll : this.penalties = this.listOpen;
  }


  //see penalty details page
  seePenalty(item: any) {
    this.penService.setPenaltyRef(item.penalty.refNumber);
    this.router.navigate(['penalties/details']);
  }

  //add to cart
  addToCart(item: Item) {
    if (this.cart.items.filter(el => el.penalty != null && el.penalty.refNumber === item.penalty.refNumber).length > 0) {
      return
    } else {
      item.quantity = 1;
      item.penalty.status = 'In cart';
      this.cart.items.push(item);
      this.cart.total += item.penalty.value;
    }
    this.ticketService.setCart(this.cart);
  }

}




