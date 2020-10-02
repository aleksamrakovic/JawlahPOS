import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AccountServiceService } from './account-service.service';
import { Router } from '@angular/router';
import ScannerDetector from 'js-scanner-detection';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { FormGroup, FormControl } from '@angular/forms';
import { PosDataServiceService } from '../_service/pos-data-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})

export class AccountsComponent implements OnInit {
  selectedType: any;
  accountList: any[] = [];
  ridersList: any[] = [];
  loading: boolean = false;
  pageTranslate: any;

  form: any;
  @ViewChild('searchAccountInput', { static: false }) searchAccountInput: ElementRef;

  selectedLang: any;
  searchSubscribe: Subscription;
  searchTimeout: any;

  constructor(private translate: TranslateService, private accService: AccountServiceService, private router: Router, private posService: PosDataServiceService) {
    this.form = new FormGroup({
      search: new FormControl('')
    });
  }

  ngOnInit() {
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.pageTranslate = event.translations;
      this.selectedLang = event.lang;
    });
    this.translate.getTranslation(this.translate.getDefaultLang()).subscribe(
      translations => {
        this.pageTranslate = translations;
    });



    let onComplete = (barcode) => {
      // Do stuff with the barcode
      console.log(barcode)
      this.searchAccount(barcode);
    }
    let options = {
      onComplete: onComplete,
      onError: false, // Callback after detection of a unsuccessful scanning
      onReceive: false, // Callback after receive a char
      timeBeforeScanTest: 100, // Wait duration (ms) after keypress event to check if scanning is finished
      avgTimeByChar: 20, // Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
      minLength: 20, // Minimum length for a scanning
      endChar: [], // Chars to remove and means end of scanning
      stopPropagation: false, // Stop immediate propagation on keypress event
      preventDefault: false // Prevent default action on keypress event
    }
    let scannerDetector = new ScannerDetector(options)
  }

  onSubmit(form) {
    this.searchAccount(form.value);
  }

  searchAccount(input: string) {
    if (input.length > 4) {
      this.loading = false;
      this.accountList = [];

      //unsubscribe from http if request made
      if (this.searchSubscribe != undefined) {
        this.searchSubscribe.unsubscribe();
      }

      clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(() => {
        this.searchAccountInput.nativeElement.disabled = true;
        this.loading = true;

        this.searchSubscribe = this.accService.searchAccountApi(input).subscribe(
          res => {
            this.accountList = res;
            this.loading = false;
            this.searchAccountInput.nativeElement.disabled = false;
            this.searchAccountInput.nativeElement.focus();
          },
          err => {
            this.accountList = [];
            this.loading = false;
            this.posService.setAlertMessage('Error occured, please try again later');
            this.searchAccountInput.nativeElement.disabled = false;
            this.searchAccountInput.nativeElement.focus();
          }
        )
      }, 1000);

    } else {
      this.accountList = [];
    }
  }

  seeAccount(item: any) {
    //delete if there is data in session
    sessionStorage.removeItem('accountNo');
    sessionStorage.removeItem('accountStorage');
    sessionStorage.removeItem('viewRequest');

    this.accService.setAccountNo(item.id);
    this.router.navigate(['/account']);
  }
}
