import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountServiceService } from 'src/app/accounts/account-service.service';
import { DatePickerDirective } from 'ng2-date-picker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { scanner } from 'scanner.js';
import { Router } from '@angular/router';
import { DeviceCounter } from 'src/app/entities/entitities';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';
declare let scanner;


@Component({
  selector: 'app-account-verify-view',
  templateUrl: './account-verify-view.component.html',
  styleUrls: ['./account-verify-view.component.css']
})
export class AccountVerifyViewComponent implements OnInit {
  accountNo: number;
  accountData: any;
  accountDocuments: any;
  path: any;
  hasImg: boolean;
  zoomModal: boolean;
  loading: boolean = false;
  documentScann: any;
  deviceMessage: any;

  form: any;
  submitted: boolean = false;
  formStructure: any[] = [];
  documentObj: any;
  documentsCreate: any[] = [];

  requestId: any;

  dateToday = new Date();
  minDateAttStart = this.dateToday.toJSON().slice(0,10).split('-').reverse().join('-');
  minDateAttEnd = this.dateToday.toJSON().slice(0,10).split('-').reverse().join('-');
  minDate = this.dateToday.toJSON().slice(0,10).split('-').reverse().join('/')

  datePickerConfig = {
    format: "DD/MM/YYYY",
    dayBtnCssClassCallback: (Moment) => 'dayBtn',
    drops: 'down',
    showGoToCurrent: false,
    showMultipleYearsNavigation: true,
    multipleYearsNavigateBy: '10',
    min: this.minDate
  };
  @ViewChild('dateDirectivePicker', { static: false }) datePicker: DatePickerDirective;

  get deviceId() { return DeviceCounter; }
  scannerCounter = this.deviceId.scanner;
  scannerCounterErr = this.deviceId.scannerErr;

  constructor(private accService: AccountServiceService, private http: HttpClient, private router: Router, private ticketService: TicketsServiceService, private posService: PosDataServiceService) {
    this.form = new FormGroup({
      expireDateFrom: new FormControl('', Validators.required),
      expireDateTo: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.accountNo = this.accService.getAccountNo();
    this.requestId = JSON.parse(sessionStorage.getItem('viewRequest'));

    this.accService.viewVerifyRequest(this.accountNo, this.requestId).subscribe(
      (res: any) => {
        console.log(res);
        this.accountData = res.account;
        this.accountDocuments = res.verificationDocuments;
        this.form.controls['expireDateFrom'].setValue(this.accountData.verificationRequest.concessionStartTimestamp);
        this.form.controls['expireDateTo'].setValue(this.accountData.verificationRequest.concessionExpirationTimestamp);

        this.minDateAttEnd = this.accountData.verificationRequest.concessionStartTimestamp;

        if (this.accountData.image) {
          this.path = 'data:image/png;base64,' + this.accountData.image;
          this.hasImg = true;
        }

        for (let i = 0; i < this.accountDocuments.length; i++) {
          //kreiranje objekta za form submit
          var document = {
            id: this.accountDocuments[i].id,
            elements: []
          }

          this.documentsCreate.push(document);
          var el = this.accountDocuments[i];
          var elem = this.accountDocuments[i].verificationElements;

          for (let j = 0; j < elem.length; j++) {

            if (elem[j].type == 'IMAGE') {
              this.form.addControl([elem[j].type + "_" + el.id + "_" + elem[j].id], new FormControl('data:image/png;base64,'+elem[j].value, [Validators.required, Validators.minLength(35)]));
            } else {
              this.form.addControl([elem[j].type + "_" + el.id + "_" + elem[j].id], new FormControl(elem[j].value, Validators.required));
            }

          }
        }
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account/manage']);
      }
    );
  }

  get f() { return this.form.controls; }

  submitRequest(form) {
    console.log(form.value);

    this.submitted = true;
    if (!form.valid) {
      return
    }
    this.loading = true;


    for (const obj in form.value) {
      let el = obj;
      let split = obj.split("_");
      let element = { id: split[2], type: split[0], value: form.value[obj] };

      for (let i = 0; i < this.documentsCreate.length; i++) {
        let el = this.documentsCreate[i];
        if (el.id == split[1] && element.value != '') {
          el.elements.push(element);
        }
      }
    }

    this.documentsCreate.forEach(el => {
      if (el.elements.length > 0) {
        this.accountData.documentToProveStatus.push(el)
      }
    });

    this.accountData.verificationRequest.concessionStartTimestamp = form.value.expireDateFrom;
    this.accountData.verificationRequest.concessionExpirationTimestamp = form.value.expireDateTo;
    var req = {
      request: this.accountData.verificationRequest,
      personalDocs: this.accountData.personalDocument,
      statusProofDocs: this.accountData.documentToProveStatus
    }

    // //api
    console.log(req);

    this.accService.editVerifyRequest(req).subscribe(
      res => {
        this.loading = false;
        this.router.navigate(['/account/manage']);
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    )
  }

  scannImage(img, elem, element) {
    this.documentScann = { img, elem, element }

    this.loading = true;
    this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(
      res => {
        if (res[4].status == 'connected') {
          scanner.scan(this.displayImagesOnPage, {
            "source_name": "WIA-CanoScan LiDE 300",
            "use_asprise_dialog": false,
            "show_scanner_ui": false,
            "twain_cap_setting": {
              "ICAP_PIXELTYPE": "TWPT_BW", // color scan
              "ICAP_XRESOLUTION": "100", // resolution
              "ICAP_YRESOLUTION": "100",
              "CAP_INDICATORS": false
            },
            "output_settings": [{
              "type": "return-base64",
              "format": "jpg",
              "jpeg_quality": "20"
            }]
          });
        } else {
          this.loading = false;
          this.deviceMessage = 'Scanner is not connected to device.';
          this.posService.setAlertMessage(this.deviceMessage);
        }
      }, errorRes => {
        this.loading = false;
        this.deviceMessage = 'No connection to peripheral devices.';
        this.posService.setAlertMessage(this.deviceMessage);
      })

  }

  displayImagesOnPage = (successful, mesg, response) => {
    if (!successful) { // On error
      this.ticketService.updateDeviceCounter(this.scannerCounterErr);
      return;
    }
    if (successful && mesg != null && mesg.toLowerCase().indexOf('user cancel') >= 0) { // User cancelled.
      this.ticketService.updateDeviceCounter(this.scannerCounterErr);
      return;
    }
    var scannedImages = scanner.getScannedImages(response, true, false); // returns an array of ScannedImage
    for (var i = 0; i < scannedImages.length; i++) {
      var scannedImage = scannedImages[i];
      this.documentScann.img.src = scannedImage.src.replace(/\s/g, "");
      this.form.controls[this.documentScann.elem.type+"_"+this.documentScann.element.id+"_"+this.documentScann.elem.id].setValue(this.documentScann.img.src);
      this.loading = false;
      this.ticketService.updateDeviceCounter(this.scannerCounter);
    }
  }

}
