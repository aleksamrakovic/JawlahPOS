import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { PosDataServiceService } from '../_service/pos-data-service.service';

@Component({
  selector: 'app-login',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  posInfo: any;
  loading: boolean = false;
  powerOffPopup: boolean = false;

  constructor(private posService: PosDataServiceService, private router: Router, private appComponent: AppComponent) { }

  ngOnInit() {
    this.loading = true;
    this.getPosData();
    this.posService.getSettingsChange().subscribe(res=> {if (res) {this.getPosData()}});
  }

  getPosData() {
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.loading = false;
        this.posInfo = data, console.log(data)
        // this.appComponent.resetTimer(Number(data.autoLockMinutes) * 60000000);
        // this.appComponent.idleLogout(Number(data.autoLockMinutes) * 60000000);
        this.appComponent.resetTimer(Number(data.autoLockMinutes) * 60000);
        this.appComponent.idleLogout(Number(data.autoLockMinutes) * 60000);

        //show blocked page from api
        if (this.posInfo.blockStatus == 'Block') {
          sessionStorage.removeItem('posLocked');
          sessionStorage.setItem('blockedDevice', JSON.stringify(true));
          this.router.navigate(['/pos/blocked']);
        }
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured while getting data, please try again later.');
      });
  }

  goNextStep() {
    this.loading = true;
    this.router.navigate(['login/username']);
  }

  showTurnOffPopup() {
    this.powerOffPopup = true;
  }

  powerOff() {
    this.loading = true;
    this.posService.turnOffDevice().subscribe(res=> {});
  }

}
