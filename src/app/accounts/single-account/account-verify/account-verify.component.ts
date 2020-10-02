import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePickerDirective } from 'ng2-date-picker';
import { distinctUntilChanged } from 'rxjs/operators';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-verify',
  templateUrl: './account-verify.component.html',
  styleUrls: ['./account-verify.component.css']
})
export class AccountVerifyComponent implements OnInit {
  accountNo: number;
  accountData: any;
  path: any;
  hasImg: boolean = false;
  zoomModal: boolean = false;
  loading: boolean = false;

  form: any;
  submitted: boolean;

  dateToday = new Date();
  minDateAtt = this.dateToday.toJSON().slice(0,10).split('-').reverse().join('-');
  minDate = this.dateToday.toJSON().slice(0,10).split('-').reverse().join('/')

  public datePickerConfig = {
    format: "DD/MM/YYYY",
    dayBtnCssClassCallback: (Moment) => 'dayBtn',
    drops: 'down',
    showGoToCurrent: false,
    showMultipleYearsNavigation: true,
    multipleYearsNavigateBy: '10',
    min: this.minDate
  };
  @ViewChild('dateDirectivePicker', { static: false }) datePicker: DatePickerDirective;

  constructor(private accService: AccountServiceService, private router: Router, private posService: PosDataServiceService) {
    this.form = new FormGroup({
      request: new FormControl('', Validators.required),
      expireDateFrom: new FormControl('', Validators.required),
      expireDateTo: new FormControl('', Validators.required),
      canReapply: new FormControl(false),
      rejectReason: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.loading = true;
    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        console.log(data);
        this.loading = false;

        this.accountData = data;
        if (this.accountData.image) {
          this.path = 'data:image/png;base64,' + this.accountData.image;
          this.hasImg = true;
        }

        for (let i = 0; i < this.accountData.personalDocument.length; i++) {
          this.form.addControl(['docPersDescription-'+i], new FormControl(''))
          this.form.addControl(['docPersNotOk-'+i], new FormControl(false))
        }

        for (let i = 0; i < this.accountData.documentToProveStatus.length; i++) {
          this.form.addControl(['docStatusDescription-'+i], new FormControl(''))
          this.form.addControl(['docStatusNotOk-'+i], new FormControl(false))
        }
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account']);
      }
    );

    this.verifyValidators();
  }

  get f() { return this.form.controls; }


  verifyValidators() {
    var expireDateFrom = this.form.get('expireDateFrom');
    var expireDateTo = this.form.get('expireDateTo');
    var rejectReason = this.form.get('rejectReason');

    this.form.get('request').valueChanges.pipe(distinctUntilChanged()).subscribe(
      request => {
        if (request != '1') {
          expireDateFrom.setValidators(null);
          expireDateTo.setValidators(null);
          rejectReason.setValidators([Validators.required]);

        } else {
          expireDateFrom.setValidators([Validators.required]);
          expireDateTo.setValidators([Validators.required]);
          rejectReason.setValidators(null);
        }
        expireDateFrom.updateValueAndValidity();
        expireDateTo.updateValueAndValidity();
        rejectReason.updateValueAndValidity();
      });
  }

  //check input birtday validation
  onKey(event: any) {
    var key = event.key;
    if (key >= 0 && key <= 9 || key == '/' || key == 'Backspace' || key == 'Shift') {
      //enable
    }
    else {
      this.form.controls['expireDateFrom'].setValue('');
    }
  }

  onKey2(event: any) {
    var key = event.key;
    if (key >= 0 && key <= 9 || key == '/' || key == 'Backspace' || key == 'Shift') {
      //enable
    }
    else {
      this.form.controls['expireDateTo'].setValue('');
    }
  }

  submitRequest(form) {
    this.submitted = true;
    if (!form.valid) {
      return
    }
    this.loading = true;
    var requestOk;
    form.value.request == '1' ? requestOk = true : requestOk = false;
    this.accountData.verificationRequest.isOk = requestOk;

    if (requestOk) {
      this.accountData.verificationRequest.concessionStartTimestamp = form.value.expireDateFrom;
      this.accountData.verificationRequest.concessionExpirationTimestamp = form.value.expireDateTo;
      this.accountData.verificationRequest.description = '';
      this.accountData.verificationRequest.canCorrect = false;
    }
    else {
      for (let i = 0; i < this.accountData.personalDocument.length; i++) {
        var el = this.accountData.personalDocument[i];
        el.notOk = form.value['docPersNotOk-'+ i];
        el.description = form.value['docPersDescription-'+ i];
      }

      for (let i = 0; i < this.accountData.documentToProveStatus.length; i++) {
        var el = this.accountData.documentToProveStatus[i];
        el.notOk = form.value['docStatusNotOk-'+ i];
        el.description = form.value['docStatusDescription-'+ i];
      }

      this.accountData.verificationRequest.concessionStartTimestamp = '';
      this.accountData.verificationRequest.concessionExpirationTimestamp = '';
      this.accountData.verificationRequest.description = form.value.rejectReason;
      this.accountData.verificationRequest.canCorrect = form.value.canReapply;
    }

    var req = {
      request: this.accountData.verificationRequest,
      personalDocs: this.accountData.personalDocument,
      statusProofDocs: this.accountData.documentToProveStatus
    }

    console.log(req);
    this.accService.verifyAccount(req).subscribe(
      res => {
        this.loading = false;
        this.router.navigate(['/account']);
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    );
  }

  zoomScanner(img) {
    this.zoomModal = true;
    if (this.zoomModal) {
      var zoomImg = <HTMLImageElement>document.getElementById("zoomImg");
      zoomImg.src = img.src;
    }
  }

}
