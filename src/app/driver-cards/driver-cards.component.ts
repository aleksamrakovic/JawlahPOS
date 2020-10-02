import { Component, OnInit, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { DriverCardsServiceService } from './driver-cards-service.service';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { TicketsServiceService } from '../tickets/tickets-service.service';
import { DeviceCounter } from '../entities/entitities';
import { PosDataServiceService } from '../_service/pos-data-service.service';


@Component({
  selector: 'app-driver-cards',
  templateUrl: './driver-cards.component.html',
  styleUrls: ['./driver-cards.component.css']
})
export class DriverCardsComponent implements OnInit {
  socket: SocketIOClient.Socket;
  loading: boolean = false;
  unassignCardPopup = false;
  assignCardPopup = false;
  replaceCardPopup = false;
  driverSelected;
  driversList: any[] = [];
  smartcardConnected = false;
  pageTranslate: any;

  query;
  form;
  submitted: boolean = false;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 5,
    currentPage: 1
  };

  @ViewChild('searchDriver', { static: false }) searchDriver: ElementRef;
  @ViewChildren('smartCardId') smartCardId: QueryList<ElementRef>;
  alertMessage: any;

  get deviceId() { return DeviceCounter; }
  smartcardCounter = this.deviceId.smartcard;

  constructor(private driverCardService: DriverCardsServiceService, private http: HttpClient, private translate: TranslateService, private ticketService: TicketsServiceService, private posService: PosDataServiceService) {
    this.socket = io.connect('http://127.0.0.1:3333');
    this.form = new FormGroup({ smartCardId: new FormControl('', Validators.required) });
  }

  ngOnInit() {
    this.loading = true;
    //get translates for page
    this.translate.getTranslation(this.translate.getDefaultLang()).subscribe(
      translations => {
        this.pageTranslate = translations;
      });
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.pageTranslate = event.translations
    });

    //get all drivers
    this.driverCardService.getAllDrivers().subscribe(data => {
      this.driversList = data, console.log(data);
      this.loading = false
    },
    err => {
      this.loading = false
      this.alertMessage = 'Error occured, please try again later.';
      this.posService.setAlertMessage(this.alertMessage);
    });

    this.getStatus();

    //listen for smartcardID
    this.socket.on('card connected', (msg, uid) => {
      if (this.assignCardPopup) {
        this.form.controls['smartCardId'].setValue(uid);
        this.ticketService.updateDeviceCounter(this.smartcardCounter);
      }
    });
  }

  get f() { return this.form.controls; }

  ngAfterViewInit() {
    this.searchDriver.nativeElement.focus();

    //set focus on input when is visible
    this.smartCardId.changes.subscribe((list: QueryList<ElementRef>) => {
      if (list.length > 0) {
        list.first.nativeElement.focus();
      }
    });
  }

  getStatus() {
    this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(
      res => {
        if (res[1].status != 'connected') {
          this.alertMessage = 'Smartcard reader is not connected to device';
          this.posService.setAlertMessage(this.alertMessage);
        }
      },
      err => {
        this.alertMessage = 'No connection to peripheral devices.';
        this.posService.setAlertMessage(this.alertMessage);
      }
    );
}

//show unassign popup
unassignPopup(driver: any) {
  this.unassignCardPopup = true;
  this.driverSelected = driver;
}

closeUnassignPopup() {
  this.unassignCardPopup = false;
}

//call api unassign
blockDriverCard() {
  this.loading = true;
  this.driverCardService.blockDriver(this.driverSelected).subscribe(
    res => {
      console.log(res);
      if (res) {
        this.loading = false;
        this.driverSelected.smartCardId = null;
        this.unassignCardPopup = false;
      } else {
        this.loading = false;
        this.alertMessage = 'Error occured, please try again later.';
        this.posService.setAlertMessage(this.alertMessage);
      }
    },
    err => {
      this.loading = false;
      this.alertMessage = 'Error occured, please try again later.';
      this.posService.setAlertMessage(this.alertMessage);
    }
  );
}

//show assign popup
assignPopup(driver: any) {
  this.submitted = false;
  this.driverSelected = driver;
  this.assignCardPopup = true;
}

closeAssignPopup() {
  this.assignCardPopup = false;
  this.form.reset();
}

//set new smartcard
assignSmartcard(form) {
  this.submitted = true;
  if (!form.valid) {
    return
  }
  this.loading = true;

  var driver = JSON.parse(JSON.stringify(this.driverSelected));
  driver.smartCardId = form.value.smartCardId;
  console.log(driver);


  this.driverCardService.assignCard(driver).subscribe(
    res => {
      console.log(res);

      if (!res) {
        this.loading = false;
        this.alertMessage = 'Smartcard Id is invalid or already in use.';
        this.posService.setAlertMessage(this.alertMessage);
        this.form.reset();
      } else {
        this.driverSelected.smartCardId = form.value.smartCardId;
        this.loading = false;
        this.assignCardPopup = false;
        this.form.reset();
      }
    },
    err => {
      this.loading = false;
      this.alertMessage = 'Error occured, please try again later.';
      this.posService.setAlertMessage(this.alertMessage);
    }
  )
}

replacePopup(driver: any) {
  this.replaceCardPopup = true;
  this.driverSelected = driver;
}

closeReplacePopup() {
  this.replaceCardPopup = false;
}

//opet assign after replace
removeCard() {
  this.replaceCardPopup = false;
  this.assignCardPopup = true;
}
}
