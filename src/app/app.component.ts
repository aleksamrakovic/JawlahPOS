import { Component } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { PosDataServiceService } from './_service/pos-data-service.service';
import { AuthService } from './_service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MyApp';
  hubConnection: signalR.HubConnection;
  idleTime: any;
  timeout: any;

  constructor(public authService: AuthService, private router: Router, private posService: PosDataServiceService, private translate: TranslateService) {
    //create lang array, and set default language
    this.translate.addLangs(['en', 'ar'])
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.startConnection();
    this.getPosInfo();
    this.posService.getSettingsChange().subscribe(data => {
      if (data) {
        console.log(data);
        this.getPosInfo();
      }
    });
  }

  getPosInfo() {
    this.posService.getPosData().subscribe(
      (res: any) => {
        console.log(res.autoLockMinutes);

        // commented for test purpose only
        this.idleTime = Number(res.autoLockMinutes) * 60000;
        // this.idleTime = Number(res.autoLockMinutes) * 6000000;

        this.resetTimer(this.idleTime);
        this.idleLogout(this.idleTime);
      }
    );
  }

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.baseUrl + '/notify',
        {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
          //  logger:signalR.LogLevel.Trace
        }
      )
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => {
        console.log('Error while starting connection: ' + err)
        this.posService.setAlertMessage('No connection to backend service.');
      })

    this.hubConnection.on('Send', (receivedMessage: string) => {
      const text = `${receivedMessage}`;
      console.log(text);
      if (text == 'Block') {
        sessionStorage.removeItem('posLocked');
        if (this.authService.isAuthenticated) {
          this.authService.logout();
        }
        sessionStorage.setItem('blockedDevice', JSON.stringify(true));
        this.router.navigate(['/pos/blocked']);

      } else if (text == 'Unblock') {
        this.authService.logout();
        sessionStorage.removeItem('blockedDevice');
        this.router.navigate(['/login']);

      } else if (text == 'logout') {
        if (this.authService.isAuthenticated) {
          this.authService.logout();
        }
      } else if (text == 'location') {
        this.posService.setSettingsChange(true);
      }
    });
  }

  idleLogout(idleTime) {
    window.onload = () => this.resetTimer(idleTime);
    window.onmousemove = () => this.resetTimer(idleTime);
    window.onmouseup = () => this.resetTimer(idleTime); // when release mouse button
    window.onmousedown = () => this.resetTimer(idleTime);  // catches touchscreen presses as well
    window.ontouchstart = () => this.resetTimer(idleTime); // catches touchscreen swipes as well
    window.ontouchmove = () => this.resetTimer(idleTime);  //when finger is dragged across the screen
    window.onclick = () => this.resetTimer(idleTime);
    window.oncontextmenu = () => this.resetTimer(idleTime); // right click
    window.onkeypress = () => this.resetTimer(idleTime);
  }

  resetTimer(idleTime) {
    // console.log(idleTime);

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      lockFunction();
    }, idleTime)


    var lockFunction = () => {

      var locked = JSON.parse(sessionStorage.getItem('posLocked'));
      if (this.authService.isAuthenticated && !locked) {
        console.log('locked');
        this.authService.lock(0).subscribe(
          res => {
            if (this.router.url != '/checkout') {
              sessionStorage.setItem("currentRoute", this.router.url);
            } else {
              sessionStorage.setItem("currentRoute", '/tickets');
            }
            sessionStorage.setItem('posLocked', JSON.stringify(true));
            this.router.navigate(['/pos/lock']);
          },
          err => {
            this.posService.setAlertMessage('Error occured, please try again later');
          }
        );
      }
    }
  }

}
