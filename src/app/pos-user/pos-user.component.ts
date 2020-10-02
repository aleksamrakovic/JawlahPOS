import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DefaultLangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PosDataServiceService } from '../_service/pos-data-service.service';

@Component({
  selector: 'app-pos-user',
  templateUrl: './pos-user.component.html',
  styleUrls: ['./pos-user.component.css']
})
export class PosUserComponent implements OnInit {
  resetPassPopup = false;
  posUsers: any[];
  posUsersSession: any[];
  userPosSelected: any;
  posInfo: any;
  deviceId: any;
  pageTranslate: any;
  loading: boolean = true;

  constructor(private posService: PosDataServiceService, private translate: TranslateService) { }

  ngOnInit() {
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.posInfo = data;
        this.deviceId = this.posInfo.deviceId;
        this.posService.getAllUsers(this.deviceId).subscribe((data: any) => {
           this.posUsers = data
           console.log(data);

           this.loading = false;
          },
          err => {
            this.loading = false;
            this.posService.setAlertMessage('Error occured, please try again later.');
          });
        this.posService.getTodaySession(this.deviceId).subscribe((data: any) => {
          this.posUsersSession = data
        });
      }
    );

    this.translate.getTranslation(this.translate.getDefaultLang()).subscribe(
      translations => {
        this.pageTranslate = translations;
    });
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.pageTranslate = event.translations
    });
  }

  showRestPassPopup(user) {
    this.userPosSelected = user;
    this.resetPassPopup = true;
  }

  resetPass(form: NgForm) {
    this.loading = true;
    var data = {
      userId: this.userPosSelected.id,
      password: this.userPosSelected.loginPassword,
      newPassword: form.value.password
    }
    this.posService.changePass(data).subscribe(
      res => {
        if (res) {
          this.userPosSelected.locked = false;
          this.userPosSelected.status = 'Active';
          this.resetPassPopup = false;
          this.loading = false;
        } else {
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
