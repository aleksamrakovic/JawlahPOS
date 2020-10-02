import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserRoles } from '../../entities/entitities';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/_service/auth.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  date: Date;
  time = setInterval(() => { this.date = new Date() }, 1000);
  posInfo: any;
  loggedUser: any;
  userPopup: boolean = false;
  socket: SocketIOClient.Socket;
  deviceList;

  //device status default
  cameraConnected = false;
  qrcodeConnected = false;
  printerConnected = false;
  smartcardConnected = false;
  scannerConnected = false;
  online = false;
  languages: any;
  selectedLang;

  cameraId = 4;
  scannerId = 5;
  qrScannerId = 6;
  printerId = 7;
  readerId = 8;
  errorList: any[] = [];

  get roleType() { return UserRoles; }

  constructor(private translate: TranslateService, private http: HttpClient, public auth: AuthService, public router: Router, private posService: PosDataServiceService) {
      // this.socket = io.connect('http://127.0.0.1:3333');
  }

  ngOnInit() {
    this.getPosInfo();
    this.languages = this.translate.getLangs()
    this.selectedLang = this.translate.getDefaultLang();

    //must initiate first time
    //  this.getStatus();

    this.createOnline().subscribe(isOnline => {
      if (isOnline) {
        this.online = true;
      } else {
        this.online = false;
        this.posService.setAlertMessage('No internet connection on device');
        this.router.navigate(['/period-pass']);
      }
    });

    //get logged user info for navbar
    if (this.loggedUser == null) {
      this.posService.getPosUser().subscribe(data => { this.loggedUser = data });
    }

    this.loggedUser = this.posService.getPosUserSession();
    this.posService.getSettingsChange().subscribe(data => { if (data) { this.getPosInfo() } })
    this.posService.getPopup().subscribe(mode => { this.userPopup = mode });

    //  this.getLiveStatus();
  }

  getPosInfo() {
    this.posService.getPosData().subscribe(data => { this.posInfo = data })
  }

  //open user menu popup
  showUserPopup() {
    this.posService.setPopup(true);
  }

  getStatus() {
    this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(res => { });
  }


  getLiveStatus() {
    this.socket.on('devices connected', (devices) => {
      console.log(devices);
      devices[0].status == 'connected' ? this.cameraConnected = true : this.cameraConnected = false;
      devices[1].status == 'connected' ? this.smartcardConnected = true : this.smartcardConnected = false;
      devices[2].status == 'connected' ? this.printerConnected = true : this.printerConnected = false;
      devices[3].status == 'connected' ? this.qrcodeConnected = true : this.qrcodeConnected = false;
      devices[4].status == 'connected' ? this.scannerConnected = true : this.scannerConnected = false;

      for (let i = 0; i < devices.length; i++) {
        var deviceId;
        if (devices[i].device == 'camera') {
          deviceId = this.cameraId;
          var error = { alarmType: deviceId, component: null, status: devices[i].status };
          this.errorList.push(error);
        } else if (devices[i].device == 'receiptprinter') {
          deviceId = this.printerId
          var error = { alarmType: deviceId, component: null, status: devices[i].status };
          this.errorList.push(error);
        } else if (devices[i].device == 'codescanner') {
          deviceId = this.qrScannerId;
          var error = { alarmType: deviceId, component: null, status: devices[i].status };
          this.errorList.push(error);
        } else if (devices[i].device == 'documentscanner') {
          deviceId = this.scannerId;
          var error = { alarmType: deviceId, component: null, status: devices[i].status };
          this.errorList.push(error);
        } else if (devices[i].device == 'cardreader') {
          deviceId = this.readerId;
          var error = { alarmType: deviceId, component: null, status: devices[i].status };
          this.errorList.push(error);
        }
      }
      console.log(this.errorList);

      this.posService.sendDeviceTransactions(this.errorList).subscribe(
        res => {
          this.errorList = [];
        },
        err => {
          this.errorList = [];
        });
    })
  }

  changeLang(lang) {
    console.log(lang);
    if (lang == 'ar') {
      var html = document.getElementsByTagName('html')[0];
      html.setAttribute('dir', 'rtl');
    } else {
      var html = document.getElementsByTagName('html')[0];
      html.setAttribute('dir', 'ltr');
    }

    this.selectedLang = lang;
    this.translate.setDefaultLang(lang);
  }

  createOnline() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

}
