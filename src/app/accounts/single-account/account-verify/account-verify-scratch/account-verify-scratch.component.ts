import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountServiceService } from 'src/app/accounts/account-service.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { DatePickerDirective } from 'ng2-date-picker';
import { HttpClient } from '@angular/common/http';

import { scanner } from 'scanner.js';
import { Router } from '@angular/router';
import { DeviceCounter } from 'src/app/entities/entitities';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

declare let scanner;

@Component({
  selector: 'app-account-verify-scratch',
  templateUrl: './account-verify-scratch.component.html',
  styleUrls: ['./account-verify-scratch.component.css']
})
export class AccountVerifyScratchComponent implements OnInit {
  accountNo: number;
  accountData: any;
  path: any;
  hasImg: boolean;
  zoomModal: boolean;
  accountTarget: any;

  selectedDocument: any;

  form: any;
  submitted: boolean = false;
  formStructure: any[] = [];
  documentObj: any;
  documentsCreate: any[] = [];

  documentScann: any;
  loading: boolean = false;
  deviceMessage: any;

  dateToday = new Date();
  minDateAtt = this.dateToday.toJSON().slice(0, 10).split('-').reverse().join('-');
  minDate = this.dateToday.toJSON().slice(0, 10).split('-').reverse().join('/')

  public datePickerConfig = {
    format: "DD/MM/YYYY",
    dayBtnCssClassCallback: (Moment) => 'dayBtn',
    drops: 'down',
    showGoToCurrent: false,
    showMultipleYearsNavigation: true,
    multipleYearsNavigateBy: '10',
    min: this.minDate
  };

  mindate;


  @ViewChild('dateDirectivePicker', { static: false }) datePicker: DatePickerDirective;

  get deviceId() { return DeviceCounter; }
  scannerCounter = this.deviceId.scanner;
  scannerCounterErr = this.deviceId.scannerErr;

  constructor(private http: HttpClient, private accService: AccountServiceService, private location: Location, private router: Router, private ticketService:TicketsServiceService, private posService: PosDataServiceService) {
    this.form = new FormGroup({
      startDate: new FormControl('', Validators.required),
      expireDate: new FormControl('', Validators.required)
    });

    this.mindate = new Date();
  }

  ngOnInit() {
    this.loading = true;
    this.accountTarget = JSON.parse(sessionStorage.getItem('accountTargetType'));

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

        this.accService.getDocumentStructure(this.accountTarget.externalId).subscribe(
          (res: any) => {
            this.formStructure = res;
            console.log(this.formStructure);

            for (let i = 0; i < this.formStructure.length; i++) {
              //kreiranje objekta za form submit
              var document = {
                id: this.formStructure[i].id,
                elements: []
              }

              this.documentsCreate.push(document);
              var el = this.formStructure[i];
              var elem = this.formStructure[i].verificationElements;

              for (let j = 0; j < elem.length; j++) {
                if (elem[j].type == 'IMAGE') {
                  this.form.addControl([elem[j].type + "_" + el.id + "_" + elem[j].id], new FormControl('data:image/png;base64,', [Validators.required, Validators.minLength(35)]));
                } else {
                  this.form.addControl([elem[j].type + "_" + el.id + "_" + elem[j].id], new FormControl('', Validators.required));
                }
              }
            }

          }
        );
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account']);
      }
    );
  }

  get f() { return this.form.controls; }

  selectChange(event) {
    this.submitted = false;
    this.selectedDocument = event.value;

    for (const obj of this.formStructure) {
      if (event.value != obj.id && obj.isPersonal) {
        let elId = obj.id;
        for (const key in this.form.controls) {
          if (key.split('_')[1] == elId) {
            this.form.get(key).value = '';
            this.form.get(key).setValidators(null);
          } else {
            if (key.split('_')[0] == 'IMAGE') {
              this.form.get(key).setValidators([Validators.required, Validators.minLength(35)]);
            } else {
              this.form.get(key).setValidators(Validators.required);
            }
          }
          this.form.get(key).updateValueAndValidity();
        }
        console.log(this.form.controls);
      }
    }
  }


  onKey(event: any) {
    var key = event.key;
    if (key >= 0 && key <= 9 || key == '/' || key == 'Backspace' || key == 'Shift') {
      //enable
    }
    else {
      this.form.controls['startDate'].setValue('');
    }
  }

  onKey2(event: any) {
    var key = event.key;
    if (key >= 0 && key <= 9 || key == '/' || key == 'Backspace' || key == 'Shift') {
      //enable
    }
    else {
      this.form.controls['expireDate'].setValue('');
    }
  }

  submitRequest(form) {
    console.log(form.value);

    this.submitted = true;
    if (!form.valid) {
      return
    }
    this.loading = true;
    this.accountData.targetRiderTypeId = this.accountTarget.externalId;
    this.accountData.startExpirationDate = form.value.startDate;
    this.accountData.expirationDate = form.value.expireDate;

    for (const obj in form.value) {
      let split = obj.split("_");

      let element = { id: split[2], type: split[0], value: form.value[obj] };

      for (let i = 0; i < this.documentsCreate.length; i++) {
        let el = this.documentsCreate[i];
        if (el.id == split[1] && element.value != '' && element.value != 'data:image/png;base64,') {
          el.elements.push(element);
        }
      }

    }

    this.documentsCreate.forEach(el => {
      if (el.elements.length > 0) {
        this.accountData.documentToProveStatus.push(el)
      }
    });

    console.log(this.accountData);

    //api
    this.accService.verifyAccountNew(this.accountData).subscribe(
      res => {
        this.loading = false;
        this.router.navigate(['/account']);
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    )
  }

  scannImage(img, plc, elem, element) {
    this.documentScann = { img, plc, elem, element };
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
      this.documentScann.img.style.display = 'block';
      this.documentScann.plc.style.display = 'none';
      this.form.controls[this.documentScann.elem.type + "_" + this.documentScann.element.id + "_" + this.documentScann.elem.id].setValue(this.documentScann.img.src);
      this.loading = false;
      this.ticketService.updateDeviceCounter(this.scannerCounter);
    }
  }

  zoomScanner(img) {
    this.zoomModal = true;
    if (this.zoomModal) {
      var zoomImg = <HTMLImageElement>document.getElementById("zoomImg");
      zoomImg.src = img.src;
    }
  }

}
