import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
// import { DatePickerDirective } from 'ng2-date-picker';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-manage',
  templateUrl: './account-manage.component.html',
  styleUrls: ['./account-manage.component.css']
})
export class AccountManageComponent implements OnInit {
  accountNo: number;
  accountData: any;
  box2: boolean = true; boxEdit2: boolean = false;
  box5: boolean = true; boxEdit5: boolean = false;
  newTitle;
  removePopup;
  photoPopup: boolean = false;
  imgTaken: boolean = false;
  hasImg: boolean = false;
  path = null;
  loading = false;

  //Forms
  form; formSaved;
  submitted: boolean = false;
  identityForm; formSaved4; identityType: any;
  identitySubmitted: boolean = false;

  selectedDocument;
  countries;

  @ViewChild('userImage', { static: false }) userImage: ElementRef;
  @ViewChild('webcamImage', { static: false }) webcamImage: ElementRef;
  deviceMessage;

  cancelReqPopup: boolean = false;
  selectedReq: any;

  //block-unblock
  formBlockAcc: any;
  formUnblockAcc: any
  formBlockSubmitted: boolean = false;
  formUnblockSubmitted: boolean = false;
  blockAccountReasons: any;
  unblockAccountReasons: any;
  blockAccountPopup: boolean = false;
  unblockAccountPopup: boolean = false;

  //patterns
  emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  phonePattern = /^[0-9]*$/;

  constructor(private accService: AccountServiceService, private http: HttpClient, private router: Router, private posService: PosDataServiceService, private location: Location) {
    this.form = new FormGroup({
      accountName: new FormControl('', Validators.required),
      accountCountry: new FormControl('', Validators.required),
      accountAddress: new FormControl('', Validators.required),
    });
    this.identityForm = new FormGroup({
      accessEmail: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
      accountCountryCode: new FormControl('', Validators.required),
      accessPhone: new FormControl('', [Validators.required, Validators.pattern(this.phonePattern)])
    });
    this.formBlockAcc = new FormGroup({ blockAccountReason: new FormControl('', Validators.required) });
    this.formUnblockAcc = new FormGroup({ unblockAccountReason: new FormControl('', Validators.required) });
  }

  ngOnInit() {
    this.loading = true;
    this.accountNo = this.accService.getAccountNo();
    forkJoin([this.accService.getAccountDetails(this.accountNo), this.accService.getBlockAccountReasons(), this.accService.getUnblockAccountReasons()]).subscribe(
      res => {
        this.accountData = res[0];
        if (this.accountData.image) {
          this.path = 'data:image/png;base64,' + this.accountData.image;
          this.hasImg = true;
        }

        this.blockAccountReasons = res[1];
        this.unblockAccountReasons = res[2];

        //order countries
        this.accService.getCountries().subscribe(
          res => {
            this.countries = res;
            for (let i = 0; i < this.countries.length; i++) {
              if (this.countries[i].name === "Oman") {
                var el = this.countries[i];
                this.countries.splice(i, 1);
                this.countries.unshift(el);
              } else if (this.countries[i].name === "United Arab Emirates") {
                var el = this.countries[i];
                this.countries.splice(i, 1);
                this.countries.unshift(el);
              }
            }
          }
        );

        this.loading = false;
        //scroll to requests if hash
        if (this.location.path(true) == '/account/manage#verificationRequests') {
          setTimeout(() => {
            document.querySelector('#verificationRequests').scrollIntoView();
          },400)
        }

      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account'])
      });


  }

  get f() { return this.form.controls; }
  get f2() { return this.identityForm.controls; }
  get f3() { return this.formBlockAcc.controls; }
  get f4() { return this.formUnblockAcc.controls; }

  //block-unblock account actions
  showBlockAccountPopup() {
    this.blockAccountPopup = true;
  }

  hideBlockAccountPopup() {
    this.formBlockSubmitted = false;
    this.blockAccountPopup = false;
    this.formBlockAcc.reset();
  }

  blockAccount(form) {
    this.formBlockSubmitted = true;
    if (!form.valid) {
      return
    } else {
      this.loading = true;
      this.accService.blockAccount(this.accountData, form.value.blockAccountReason).subscribe(
        res => {
          if (res) {
            this.loading = false;
            this.accountData.blocked = true;
            this.accService.saveAccount(this.accountData);
            this.blockAccountPopup = false;
            this.formBlockSubmitted = false;
            this.formBlockAcc.reset();
            this.router.navigate(['/account']);
          } else {
            this.loading = false;
            this.formBlockAcc.reset();
            this.deviceMessage = 'Error occured, please try again later';
            this.posService.setAlertMessage(this.deviceMessage);
          }
        },
        err => {
          this.loading = false;
          this.deviceMessage = 'Error occured, please try again later';
          this.posService.setAlertMessage(this.deviceMessage);
        });
    }
  }

  //unblock actions
  showUnblockAccountPopup() {
    this.unblockAccountPopup = true;
  }

  hideUnblockAccountPopup() {
    this.unblockAccountPopup = false;
    this.formUnblockSubmitted = false;
    this.formUnblockAcc.reset();
  }

  unblockAccount(form) {
    this.formUnblockSubmitted = true;
    if (!form.valid) {
      return
    } else {
      this.loading = true;
      this.accService.unblockAccount(this.accountData, form.value.unblockAccountReason).subscribe(
        res => {
          if (res) {
            this.loading = false;
            this.accountData.blocked = false;
            this.accService.saveAccount(this.accountData);
            this.formUnblockSubmitted = false;
            this.unblockAccountPopup = false;
            this.formUnblockAcc.reset();
            this.router.navigate(['/account']);
          } else {
            this.loading = false;
            this.formUnblockAcc.reset();
            this.deviceMessage = 'Error occured, please try again later';
            this.posService.setAlertMessage(this.deviceMessage);
          }
        },
        err => {
          this.loading = false;
          this.deviceMessage = 'Error occured, please try again later';
          this.posService.setAlertMessage(this.deviceMessage);
        });
    }
  }


  //show account info editable
  editBox2() {
    this.box2 = false;
    this.boxEdit2 = true;
    this.newTitle = this.accountData.title;
    this.form.controls['accountName'].setValue(this.accountData.name);
    this.form.controls['accountAddress'].setValue(this.accountData.address);
    this.form.controls['accountCountry'].setValue(this.accountData.country);
  }

  closeEditBox2() {
    this.form.reset();
    this.box2 = true;
    this.boxEdit2 = false;
  }

  selectTitle(e) {
    this.newTitle = e.target.innerText
  }

  saveForm(form) {
    this.loading = true;
    this.submitted = true;
    if (!form.valid) {
      this.loading = false;
      return
    }
    for (let i = 0; i < this.countries.length; i++) {
      var el = this.countries[i];
      form.value.accountCountry == el.code ? this.accountData.countryFull = el.name : '';
    }
    this.accountData.title = this.newTitle;
    this.accountData.name = form.value.accountName;
    this.accountData.address = form.value.accountAddress;
    this.accountData.country = form.value.accountCountry;
    this.accService.editAccount(this.accountData).subscribe(
      res => {
        this.formSaved = true;
        this.box2 = true;
        this.boxEdit2 = false;
        this.loading = false;
        setTimeout(() => { this.formSaved = false }, 3000);
      },
      err => {
        this.loading = false;
        this.deviceMessage = 'Error occured, please try again later';
        this.posService.setAlertMessage(this.deviceMessage);
      }
    );
  }

  editIdentity() {
    this.box5 = false;
    this.boxEdit5 = true;
    //set default value
    this.identityType = 'Email';
  }

  closeEditIdentity() {
    this.identityForm.reset();
    this.box5 = true;
    this.boxEdit5 = false;
    this.identityType = null;
  }

  selectIdentity(e) {
    this.identitySubmitted = false;
    this.identityForm.reset();
    this.identityForm.get('accessEmail').setValidators([Validators.required, Validators.pattern(this.emailPattern)]);
    this.identityForm.get('accessPhone').setValidators([Validators.required, Validators.pattern(this.phonePattern)]);
    this.identityForm.get('accountCountryCode').setValidators([Validators.required]);
    this.identityType = e.target.innerHTML;
  }

  saveIdentityForm(identityForm) {
    this.identitySubmitted = true;
    var email = this.identityForm.get('accessEmail');
    var phone = this.identityForm.get('accessPhone');
    var code = this.identityForm.get('accountCountryCode');

    if (this.identityType == 'Email') {
      email.setValidators([Validators.required, Validators.pattern(this.emailPattern)]);
      phone.setValidators(null);
      code.setValidators(null);
      email.updateValueAndValidity();
      code.updateValueAndValidity();
      phone.updateValueAndValidity();
    } else {
      phone.setValidators([Validators.required, Validators.pattern(this.phonePattern)]);
      code.setValidators([Validators.required]);
      email.setValidators(null);
      email.updateValueAndValidity();
      code.updateValueAndValidity();
      phone.updateValueAndValidity();
    }

    if (!identityForm.valid) {
      return
    } else {
      this.loading = true;
      var identityValue;
      this.identityType == 'Email' ? identityValue = identityForm.value.accessEmail : identityValue = identityForm.value.accountCountryCode + identityForm.value.accessPhone;
      console.log(identityValue);

      this.accService.checkAccountIdentity(identityValue).subscribe(
        res => {
          if (res) {
            var type;
            this.identityType == 'Email' ? type = 'EMAIL_ADDRESS' : type = 'PHONE_NUMBER';
            var identity = { type: type, value: identityValue, accountId: this.accountData.id }

            this.accService.addAccountIdentity(identity).subscribe(
              res => {
                if (res) {
                  this.accountData.identities.push({
                    id: res.id, type: res.type, value: res.value, verified: res.verified, version: res.version, accountId: res.accountId
                  });
                  this.identitySubmitted = false;
                  this.identityForm.reset();
                  this.loading = false;
                  this.box5 = true;
                  this.boxEdit5 = false;
                }
              },
              err => {
                this.loading = false;
                this.posService.setAlertMessage('Error occured, please try again later.');
              });
          } else {
            this.identityForm.reset();
            this.loading = false;
            this.deviceMessage = 'This identity is already in use. Please enter a new one';
            this.posService.setAlertMessage(this.deviceMessage);
          }
        },
        err => {
          this.identityForm.reset();
          this.loading = false;
          this.posService.setAlertMessage('Error occured, please try again later.');
        }
      )
    }

  }

  setPrimaryIdentity(identity) {
    this.loading = true;
    this.accService.setPrimaryIdentity(identity).subscribe(
      res => {
        if (res) {
          //set other identities to non primary
          for (let i = 0; i < this.accountData.identities.length; i++) {
            var el = this.accountData.identities[i];
            if (el == identity) {
              el.isPrimary = true;
            } else {
              el.isPrimary = false;
            }
          }
          this.loading = false;

        } else {
          this.loading = false;
          this.deviceMessage = 'Error occured, please try again later';
          this.posService.setAlertMessage(this.deviceMessage);
        }
      },
      err => {
        this.loading = false;
        this.deviceMessage = 'Error occured, please try again later';
        this.posService.setAlertMessage(this.deviceMessage);
      }
    );
  }

  setResetIdentity(identity) {
    this.loading = true;
    console.log(identity);
    this.accService.resetAccessIdentity(identity).subscribe(
      res => {
        if (res) {
          this.loading = false;
          this.deviceMessage = 'Successfully! You will receive an email or sms with more informations in a few minutes.';
          this.posService.setAlertMessage(this.deviceMessage);
        } else {
          this.loading = false;
          this.deviceMessage = 'Error occured, please try again later';
          this.posService.setAlertMessage(this.deviceMessage);
        }
      },
      err => {
        this.loading = false;
        this.deviceMessage = 'Error occured, please try again later';
        this.posService.setAlertMessage(this.deviceMessage);
      }
    )
  }

  showRemovePopup(doc) {
    if (doc.isPrimary) {
      return
    }
    this.selectedDocument = doc;
    this.removePopup = true;
  }

  removeDocument() {
    this.loading = true;
    var index = this.accountData.identities.indexOf(this.selectedDocument);
    if (index > -1) {
      this.accService.removeAccountIdentity(this.selectedDocument).subscribe(
        res => {
          console.log(res);
          if (res) {
            this.accountData.identities.splice(index, 1);
            this.loading = false;
            this.removePopup = false;
          }
        },
        err => {
          this.loading = false;
          this.deviceMessage = 'Error occured, please try again later';
          this.posService.setAlertMessage(this.deviceMessage);
        });
    } else {
      this.loading = false;
      this.removePopup = false;
    }
  }

  showCancelRequestPopup(item) {
    this.selectedReq = item;
    this.cancelReqPopup = true;
  }

  cancelRequest() {
    this.loading = true;
    this.accService.cancelVerifyRequest(this.selectedReq).subscribe(
      res => {
        this.loading = false;
        this.router.navigate(['/account'])
      },
      err => {
        this.loading = false;
        this.deviceMessage = 'Error occured, please try again later';
        this.posService.setAlertMessage(this.deviceMessage);
      }
    )
  }

  viewRequest(item) {
    sessionStorage.setItem('viewRequest', JSON.stringify(item.uid));
    this.router.navigate(['/account/verify/view']);
  }

  renewStatus() {
    var targetAccount = { "id": 0, "name": this.accountData.verificationRequest.targetRider, "externalId": this.accountData.targetRiderTypeId };
    sessionStorage.setItem('accountTargetType', JSON.stringify(targetAccount))
    this.router.navigate(['/account/verify/new']);
  }

  openPhotoPopup() {
    this.photoPopup = true;
    //must set delay because srcObject will be null
    setTimeout(() => { this.openCamera() }, 500);
  }

  closePhotoPopup() {
    this.photoPopup = false;
    this.imgTaken = false;
  }

  savePhoto() {
    this.loading = true;
    var x = { content: this.webcamImage.nativeElement.src, account: this.accountData.id };
    this.http.post<any>(environment.baseUrl + '/api/user/uploadPhoto', x).subscribe(
      res => {
        this.hasImg = true;
        this.path = this.webcamImage.nativeElement.src;
        this.photoPopup = false;
        this.imgTaken = false;
        this.accService.saveAccount(this.accountData);
        this.loading = false;
      },
      err => {
        this.loading = false;
        this.deviceMessage = 'Error occured, please try again later';
        this.posService.setAlertMessage(this.deviceMessage);
      }
    );

  }

  openCamera() {
    var video = <HTMLVideoElement>document.querySelector('#webcam-vid');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) { video.srcObject = stream; })
      .catch((error) => {
        this.photoPopup = false;
        this.deviceMessage = 'Camera is not connected to device';
        this.posService.setAlertMessage(this.deviceMessage);
      });
  };

  takePicture() {
    var video = <HTMLVideoElement>document.querySelector('#webcam-vid');
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    this.webcamImage.nativeElement.src = canvas.toDataURL('image/png', 0.3);
    video.srcObject = null;
    this.webcamImage.nativeElement.style.display = 'block';
    video.style.display = 'none';
    this.imgTaken = true;
  };

  retakePhoto() {
    this.imgTaken = false;
    var video = <HTMLVideoElement>document.querySelector('#webcam-vid');
    this.webcamImage.nativeElement.style.display = 'none';
    video.style.display = 'block';
    this.openCamera();
  }
}
