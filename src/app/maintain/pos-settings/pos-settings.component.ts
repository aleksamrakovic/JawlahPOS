import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-pos-settings',
  templateUrl: './pos-settings.component.html',
  styleUrls: ['./pos-settings.component.css']
})
export class PosSettingsComponent implements OnInit {
  posSettings: any;
  posInfo: any;
  routeTypes: any = [];
  form;

  constructor(private posService: PosDataServiceService, private router: Router, private ticketService: TicketsServiceService) {
    this.form = new FormGroup({ autoLock: new FormControl('', Validators.required) });
  }

  ngOnInit() {
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.posInfo = data;
        console.log(data);
        if (this.posInfo != null) {
          this.posSettings = {
            showSecondCurrency: this.posInfo.showSecondCurrency,
            routes: this.routeTypes,
            autoLockMinutes: this.posInfo.autoLockMinutes
          }
          this.form.controls['autoLock'].setValue(this.posInfo.autoLockMinutes);
        }
      }
    );
    //get route types
    this.ticketService.getRouteTypeList(0).subscribe(routes => { this.routeTypes = routes });
  }

  withSecond() {
    this.posSettings.showSecondCurrency = true;
  }

  withoutSecond() {
    this.posSettings.showSecondCurrency = false;
  }

  moveUp(i, routes) {
    var current = routes[i];
    current.orderValue--;
    var previous = routes[i - 1];
    previous.orderValue++;

    routes[i] = previous;
    routes[i - 1] = current;
  }

  moveDown(i, routes) {
    var current = routes[i];
    current.orderValue++;

    var next = routes[i + 1];
    next.orderValue--

    routes[i] = next;
    routes[i + 1] = current;
  }

  //save changes in db
  saveSettings(form) {
    var lockTime = form.value.autoLock
    if (lockTime <= this.posInfo.autoLockMaxMinutes && lockTime >= 1) {
      this.posSettings.routes = this.routeTypes;
      this.posSettings.autoLockMinutes = lockTime;
      console.log(this.posSettings);

      this.posService.changeSettings(this.posSettings).subscribe(
        res => {
          this.posService.setSettingsChange(true);
          this.router.navigate(['/maintenance']);
        },
        err => {
          this.posService.setAlertMessage('Error occured, please try again later.');
        });
    } else {
      this.posService.setAlertMessage('Maximum time is ' + this.posInfo.autoLockMaxMinutes + ' minutes');
    }
  }
}
