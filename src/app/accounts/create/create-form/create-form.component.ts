import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { distinctUntilChanged, startWith, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css']
})
export class CreateFormComponent implements OnInit {
  accountDefault: any;
  newTitle = 'MR';
  photoPopup: any;
  imgTaken;
  countries: any;
  deviceAlert = false;
  deviceMessage;
  loading = false;

  form: FormGroup;
  submitted;
  @ViewChild('userImage', { static: false }) userImage: ElementRef;
  @ViewChild('webcam', { static: false }) webcam: ElementRef;
  imageSrc;
  documentId;
  modalImg;

  emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  phonePattern = /^[0-9]*$/;
  filteredOptions: Observable<any>;

  constructor(private accountService: AccountServiceService, private router: Router, private formBuilder: FormBuilder, private posService: PosDataServiceService) {
    this.form = new FormGroup({
      fakeInput0: new FormControl('', Validators.required),
      accountName: new FormControl('', Validators.required),
      accountAddress: new FormControl('', Validators.required),
      accountCountry: new FormControl('', Validators.required),
      accountCountryCode: new FormControl('', Validators.required),
      accessEmail: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
      accessPhone: new FormControl('', [Validators.required, Validators.pattern(this.phonePattern)]),
    });
  }

  ngOnInit() {
    this.accountService.getDefaultAccount().subscribe(res => {
       this.accountDefault = res
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/accounts']);
    });

    this.accountService.getCountries().subscribe(
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

        // this.filteredOptions = this.form.get('accountCountryCode').valueChanges
        //   .pipe(
        //     startWith(''),
        //     map(value => typeof value === 'string' ? value : value.callingCode),
        //     map(name => name ? this._filter(name) : this.countries.slice())
        //   );
      },
      err => {
        this.posService.setAlertMessage('Couldnt load countries list, please try again later.');
      }
    );



    this.accountAccessValidators();
  }

  // private _filter(name) {
  //   const filterValue = name.toLowerCase();
  //   return this.countries.filter(option => option.callingCode.toLowerCase().indexOf(filterValue) === 0);
  // }

  accountAccessValidators() {
    var email = this.form.get('accessEmail');
    var phone = this.form.get('accessPhone');
    var code = this.form.get('accountCountryCode');
    this.form.get('accessEmail').valueChanges.pipe(distinctUntilChanged()).subscribe(
      email => {
        if (email != null && email != '') {
          phone.setValidators(null);
          code.setValidators(null);
        }
        else {
          phone.setValidators([Validators.required, Validators.pattern(this.phonePattern)]);
          code.setValidators([Validators.required]);
        }
        phone.updateValueAndValidity();
        code.updateValueAndValidity();
      });
    this.form.get('accessPhone').valueChanges.pipe(distinctUntilChanged()).subscribe(
      phone => {
        if (phone != null && phone != '') {
          email.setValidators(null);
          code.setValidators([Validators.required]);
        } else {
          code.setValidators([Validators.required]);
          email.setValidators([Validators.required, Validators.pattern(this.emailPattern)]);
        }
        email.updateValueAndValidity();
        code.updateValueAndValidity();
      });
  }

  get f() { return this.form.controls; }

  //phone input validation
  onPhoneNumber(event: any) {
    var key = event.key;
    if (key >= 0 && key <= 9 || key == "Backspace" || key == 'Shift') {
      //enabled
    } else {
      this.form.controls['accessPhone'].setValue('');
    }
  }

  selectTitle(e) {
    this.newTitle = e.target.innerHTML;
  }

  onSubmit(form) {

    this.submitted = true;
    var account;
    if (!form.valid) {
      return
    } else {
      this.loading = true;
      let phoneVal;
      (form.value.accountCountryCode.length > 0 && form.value.accessPhone.length > 0) ? phoneVal = form.value.accountCountryCode + form.value.accessPhone : phoneVal = null;
      account = {
        id: 0,
        title: this.newTitle,
        name: form.value.accountName,
        type: null,
        riderTypeId: this.accountDefault.externalId,
        status: null,
        email: form.value.accessEmail,
        phone: phoneVal,
        address: form.value.accountAddress,
        country: form.value.accountCountry,
        personalDocument: [],
        documentToProveStatus: [],
        image: form.value.fakeInput0
      }
      console.log(account);

      forkJoin([
        this.accountService.checkAccountByEmail(account.email), this.accountService.checkAccountByPhone(account.phone)
      ]).subscribe(res => {
        this.loading = false;
        if (res[0] && res[1]) {
          this.deviceMessage = 'User with this email and phone already exists.'
          this.posService.setAlertMessage(this.deviceMessage);
          this.form.controls['accessEmail'].setValue('');
          this.form.controls['accessPhone'].setValue('');
        } else if (res[0] && !res[1]) {
          this.deviceMessage = 'User with this email already exists.'
          this.posService.setAlertMessage(this.deviceMessage);
          this.form.controls['accessEmail'].setValue('');
        } else if (!res[0] && res[1]) {
          this.deviceMessage = 'User with this phone already exists.'
          this.posService.setAlertMessage(this.deviceMessage);
          this.form.controls['accessPhone'].setValue('');
        } else if (!res[0] && !res[1]) {
          this.loading = true;
          this.createAccount(account);
        }
      },
      err => {
        this.posService.setAlertMessage('Error occured, please try again later');
      })
    }
  }

  createAccount(account) {
    this.accountService.createAccount(account).subscribe(
      (res: any) => {
        if (res) {
          sessionStorage.removeItem('accountStorage');
          this.loading = false;
          this.accountService.setAccountNo(res.id);
          this.router.navigate(['/account']);
          sessionStorage.setItem('accountCreated', JSON.stringify(true));
        } else {
          this.loading = false;
          this.form.reset();
          this.deviceMessage = 'Error occured, please try again later'
          this.posService.setAlertMessage(this.deviceMessage);
        }
      },
      err => {
        this.loading = false;
        this.deviceMessage = 'Error occured, please try again later'
        this.posService.setAlertMessage(this.deviceMessage);
      }
    )
  }

  openPhotoPopup(id) {
    this.documentId = id;
    this.photoPopup = true;
    //must set delay because srcObject will be null
    setTimeout(() => { this.openCamera() }, 500);
  }

  closePhotoPopup() {
    this.photoPopup = false;
    this.imgTaken = false;
  }

  savePhoto() {
    if (this.documentId == 'user-photo') {
      this.userImage.nativeElement.src = this.imageSrc;
      this.form.controls['fakeInput0'].setValue(this.imageSrc);
    }
    this.photoPopup = false;
    this.imgTaken = false;
  }

  openCamera() {
    var video = <HTMLVideoElement>document.querySelector('#webcam-vid');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch((error) => {
        this.deviceMessage = 'Camera is not connected';
        this.photoPopup = false;
        //show alert popup for errors
        this.posService.setAlertMessage(this.deviceMessage);
      });
  };

  takePicture() {
    var video = <HTMLVideoElement>document.querySelector('#webcam-vid');
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    this.webcam.nativeElement.src = canvas.toDataURL('image/jpg');
    this.imageSrc = canvas.toDataURL('image/jpg', 0.3);

    video.srcObject = null;
    this.webcam.nativeElement.style.display = 'block';
    video.style.display = 'none';
    this.imgTaken = true;
  };

  retakePhoto() {
    this.imgTaken = false;
    var video = <HTMLVideoElement>document.querySelector('#webcam-vid');
    this.webcam.nativeElement.style.display = 'none';
    video.style.display = 'block';
    this.openCamera();
  }

}
