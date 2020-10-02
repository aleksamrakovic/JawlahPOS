import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-devices',
  templateUrl: './account-devices.component.html',
  styleUrls: ['./account-devices.component.css']
})
export class AccountDevicesComponent implements OnInit {
  blockDevicePopup: boolean = false;
  unblockDevicePopup: boolean = false;
  accountData: any; accountNo: any;
  blockDeviceReasons: any;
  unblockDeviceReasons: any;
  deviceSelected: any;

  form;
  submitted: boolean = false;
  form2;
  submitted2: boolean = false;
  loading: boolean = true;

  constructor(private accService: AccountServiceService, private posService: PosDataServiceService, private router: Router) {
    this.form = new FormGroup({ blockDeviceReason: new FormControl('', Validators.required) });
    this.form2 = new FormGroup({ unblockDeviceReason: new FormControl('', Validators.required) });
  }

  ngOnInit() {
    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(
      data => {
        this.accountData = data;
        //check this device list
        console.log(this.accountData.devices);
        this.loading = false;
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/account'])
      });

    //block-unblock reasons
    this.accService.getBlockDeviceReasons().subscribe(res => { this.blockDeviceReasons = res });
    this.accService.getUnblockDeviceReasons().subscribe(res => { this.unblockDeviceReasons = res });
  }

  get f() { return this.form.controls; }
  get f2() { return this.form2.controls; }


  //open block popup
  showBlockDevicePopup(item: any) {
    this.deviceSelected = item;
    this.blockDevicePopup = true;
  }

  hideBlockDevicePopup() {
    this.form.reset();
    this.submitted = false;
    this.blockDevicePopup = false;
  }

  blockDevice(form) {
    this.submitted = true;
    if (!form.valid) {
      return
    } else {
      this.loading = true;
      this.accService.blockDevice(this.deviceSelected.id, form.value.blockDeviceReason.id).subscribe(
        res => {
          if (res) {
            this.deviceSelected.blocked = true;
            this.deviceSelected.status = 'Blocked';
            this.loading = false;
            this.blockDevicePopup = false;
            this.submitted = false;
            this.form.reset()
          } else {
            this.form.reset();
            this.loading = false;
            this.posService.setAlertMessage('Error occured, please try again later.');
          }
        },
        err => {
          this.loading = false;
          this.posService.setAlertMessage('Error occured, please try again later.');
        });
    }

  }

  //open unblock popup
  showUnblockDevicePopup(item: any) {
    this.deviceSelected = item;
    this.unblockDevicePopup = true;
  }

  hideUnblockDevicePopup() {
    this.form2.reset();
    this.unblockDevicePopup = false;
  }

  unblockDevice(form) {
    this.submitted2 = true;
    if (!form.valid) {
      return
    } else {
      this.loading = true;
      this.accService.unblockDevice(this.deviceSelected.id, form.value.unblockDeviceReason.id).subscribe(
        res => {
          if (res) {
            this.deviceSelected.blocked = false;
            this.deviceSelected.status = 'Active';
            this.loading = false;
            this.unblockDevicePopup = false;
            this.submitted2 = false;
            this.form2.reset()
          } else {
            this.form2.reset();
            this.loading = false;
            this.posService.setAlertMessage('Error occured, please try again later.');
          }

        },
        err => {
          this.loading = false;
          this.posService.setAlertMessage('Error occured, please try again later.');
        });
    }
  }



}
