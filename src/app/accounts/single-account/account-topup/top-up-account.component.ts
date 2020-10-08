import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { Item } from 'src/app/entities/entitities';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-top-up-account',
  templateUrl: './top-up-account.component.html',
  styleUrls: ['./top-up-account.component.css']
})
export class TopUpAccountComponent implements OnInit {
  ele: any;
  opt: any;
  newValue: number = 0;
  accountData: any;
  accountNo: number;
  cart: any;
  items: Item[] = [];
  posInfo: any;
  currency: any;
  currencyRate: any;
  currencyDecimal: any;
  secondCurrency: any;
  form;
  @ViewChild('topupInput', { static: false }) topupInput: ElementRef;
  topupMin: any;
  topupMax: any;
  minimumBalance: any;
  maximumBalance: any;
  loading: boolean = true;

  currentBalance: any = 0;
  selectedLang: any;
  translations: any;

  constructor(private posService: PosDataServiceService, private accService: AccountServiceService, private ticketService: TicketsServiceService, private translate: TranslateService) {
    this.form = new FormGroup({ topupInput: new FormControl('', Validators.required) })
  }

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

    this.posService.getPosData().subscribe(
      (data: any) => {
        this.posInfo = data;
        this.currency = data.currencyCode;
        this.secondCurrency = data.secondCurrencyCode;
        this.currencyRate = data.currencyRate;
        this.currencyDecimal = data.currencyDecimal
      });

    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(data => {
      this.accountData = data;
      this.accService.getTopupInfo(this.accountData.riderTypeId).subscribe(
        (res: any) => {
          console.log(res);
          this.topupMin = res.min;
          this.topupMax = res.max;
          this.maximumBalance = res.maxBalance;
          this.loading = false;
        },
        err => {
          this.loading = false;
        }
      );
    });
    this.cart = this.ticketService.cart;
  }

  ngAfterViewInit() {
    this.topupInput.nativeElement.focus();
  }

  //numpad
  addValue(event: any) {
    var value = this.form.controls['topupInput'].value;
    if (value.length > 5) {
      this.form.controls['topupInput'].setValue('');
      this.newValue = 0;
    }
    else {
      if (value == null) {
        this.form.controls['topupInput'].setValue('');
      }
      var numpad;
      var eventType = event.type;

      //set event
      if (eventType === 'keyup') {
        numpad = event.key;
        if (numpad === 'Backspace') {
          if (value == null) {
            this.form.controls['topupInput'].setValue('');
          }
        }
      } else {
        numpad = event.target.attributes.value.value;
        if (numpad === 'del') {
          this.form.controls['topupInput'].setValue('');
        } else if (numpad === '.') {
          this.form.controls['topupInput'].setValue(value + numpad);
        } else {
          this.form.controls['topupInput'].setValue(value + numpad);
        }
      }
      //see options
      this.checkCurrency();
    }
  }

  checkCurrency() {
    this.ele = document.getElementById('selectValue');
    this.opt = this.ele.options[this.ele.selectedIndex].value;
    if (this.opt === this.currency) {
      this.newValue = Number(this.form.controls['topupInput'].value) + Number(this.accountData.credit);
    } else {
      this.newValue = Number(this.form.controls['topupInput'].value) / Number(this.currencyRate) + Number(this.accountData.credit);
    }
  }

  confirm(form) {
    var unos;
    var value = form.value.topupInput;

    if (isNaN(value)) {
      this.form.controls['topupInput'].setValue('');
    } else {
      //form valid, check value
      this.currentBalance = 0;
      for (let i = 0; i < this.cart.items.length; i++) {
        var element = this.cart.items[i];
        if (element.topupAccount != null && element.accountId == this.accountData.id) {
          console.log(true);
          this.currentBalance += element.topupAccount.value;
        }
      }
      console.log(this.currentBalance);

      this.opt == this.currency ? unos = Number(value) : unos = Number(value) / Number(this.currencyRate);

      if ((Number(unos) >= this.topupMin && Number(unos) <= this.topupMax) && (this.currentBalance + Number(unos)) <= (this.maximumBalance - Number(this.accountData.credit)) && Number(this.accountData.credit) < this.maximumBalance) {
        var topup = {
          id: this.accountData.shortId.toString(),
          name: this.accountData.name,
          value: Number(unos),
          riderTypeId: this.accountData.riderTypeId,
          type: this.accountData.type,
          accountNo: this.accountData.id
        }
        var item: Item = {
          accountId: this.accountData.id,
          accountNo: this.accountData.shortId.toString(),
          riderType: null,
          cityTicket: null,
          intercityTicket: null,
          productPeriod: null,
          penalty: null,
          topupAccount: topup,
          quantity: 1,
          productBaggage: null,
          productBaggageReturn: null,
          routeId: null,
          numberOfPassengers: 0
        }
        this.cart.items.push(item);
        this.cart.total += topup.value;
        this.cart.totalCent += topup.value * 1000;
        this.ticketService.setCart(this.cart)
        this.form.controls['topupInput'].setValue('');
        this.newValue = 0;
      } else {
        console.log(false);
        //error message
        if (Number(unos) < this.topupMin && Number(this.accountData.credit) < this.maximumBalance) {
          this.posService.setAlertMessage(`Minimum top-up amount for this rider type is ${this.topupMin} ${this.currency}`);
        }
        else if (Number(unos) > this.topupMax && Number(this.accountData.credit) < this.maximumBalance) {
          this.posService.setAlertMessage(`Maximum top-up amount for this rider type is ${this.topupMax} ${this.currency}`);
        }
        else if ((Number(unos) <= this.topupMax && Number(unos) >= this.topupMin) && (this.currentBalance + Number(unos)) > (this.maximumBalance - Number(this.accountData.credit)) && Number(this.accountData.credit) < this.maximumBalance) {
          var maxCredit = this.maximumBalance - Number(this.accountData.credit);
          var msg;
          if (this.currentBalance > 0) {
            msg = `Currently in cart you have: ${this.currentBalance.toFixed(this.currencyDecimal)} ${this.currency}.`;
          } else {
            msg = '';
          }
          this.posService.setAlertMessage(`Maximum allowed credit amount for this rider type is ${this.maximumBalance.toFixed(this.currencyDecimal)} ${this.currency}. You can top up this account for maximum ${maxCredit.toFixed(this.currencyDecimal)} ${this.currency}. ${msg}`);
        }
        else if (Number(this.accountData.credit) >= this.maximumBalance) {
          this.posService.setAlertMessage(`This account has already reached maximum balance of ${this.maximumBalance.toFixed(this.currencyDecimal)} ${this.currency}`);
        }
        this.form.controls['topupInput'].setValue('');
        this.newValue = 0;
      }

    }
  }


}
