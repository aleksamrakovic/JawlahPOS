import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';
import { forkJoin } from 'rxjs';
import { DeviceCounter } from 'src/app/entities/entitities';
import * as io from 'socket.io-client';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-single-account',
  templateUrl: './single-account.component.html',
  styleUrls: ['./single-account.component.css']
})
export class SingleAccountComponent implements OnInit {
  socket: SocketIOClient.Socket;
  accountData: any;
  blockAccountPopup: boolean = false;
  unblockAccountPopup: boolean = false;
  accountNo: number;
  blockAccountReasons: any;
  unblockAccountReasons: any;
  loading: boolean = true;
  routeSaved: any;
  hasPeriodPass: boolean = false;
  hasTopup: boolean = false;
  hasTickets: boolean = false;

  form;
  submitted: boolean = false;
  form2;
  submitted2: boolean = false;

  accountCreated = false;
  timeout;

  assignCardPopup: boolean = false;
  form3: any;
  submitted3: boolean = false;
  @ViewChildren('smartCardId') smartCardId: QueryList<ElementRef>;

  unassignCardPopup: boolean = false;
  form4: any;
  submitted4: boolean = false;

  get deviceId() { return DeviceCounter; }
  smartcardCounter = this.deviceId.smartcard;

  constructor(private accService: AccountServiceService, private posService: PosDataServiceService, private router: Router, private ticketService: TicketsServiceService, private http: HttpClient) {
    // this.socket = io.connect('http://127.0.0.1:3333');

    this.form = new FormGroup({ blockAccountReason: new FormControl('', Validators.required) });
    this.form2 = new FormGroup({ unblockAccountReason: new FormControl('', Validators.required) });
    this.form3 = new FormGroup({ smartCardId: new FormControl('', Validators.required) });
    this.form4 = new FormGroup({ smartCardId: new FormControl('', Validators.required) });
  }

  ngOnInit() {
    sessionStorage.setItem('checkoutRoute', JSON.stringify('/account'));
    this.accountNo = this.accService.getAccountNo();

    forkJoin([this.posService.getPosData(), this.accService.getAccountDetails(this.accountNo)]).subscribe(
      (res: any[]) => {
        this.hasPeriodPass = res[0].hasPeriodPass;
        this.hasTickets = res[0].displayTicketModule;

        this.accountData = res[1];
        this.accService.saveAccount(this.accountData);
        this.accService.getTopupInfo(this.accountData.riderTypeId).subscribe(
          (res: any) => {
            this.hasTopup = res.exist;
            this.loading = false;
          }
        );
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/accounts']);
      }
    )

    //created acc notification
    var created = JSON.parse(sessionStorage.getItem('accountCreated'));
    if (created) {
      this.accountCreated = true;
      this.timeout = setTimeout(() => {
        this.accountCreated = false;
        sessionStorage.removeItem('accountCreated')
      }, 5000)
    }

    forkJoin([this.accService.getBlockAccountReasons(),this.accService.getUnblockAccountReasons()]).subscribe(
      res => {
        console.log(res);

        this.blockAccountReasons = res[0];
        this.unblockAccountReasons = res[1];
      }, err => {
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    );

    //listen for smartcardID
    // this.socket.on('card connected', (msg, uid) => {
    //   if (this.assignCardPopup) {
    //     this.form3.controls['smartCardId'].setValue(uid);
    //     this.ticketService.updateDeviceCounter(this.smartcardCounter);
    //   }
    //   else if (this.unassignCardPopup) {
    //     this.form4.controls['smartCardId'].setValue(uid);
    //     this.ticketService.updateDeviceCounter(this.smartcardCounter);
    //   }
    // });
  }

  ngAfterViewInit() {
    //set focus on input when is visible
    this.smartCardId.changes.subscribe((list: QueryList<ElementRef>) => {
      if (list.length > 0) {
        list.first.nativeElement.focus();
      }
    });
  }

  getStatus() {
    this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(res => {});
  }

  get f() { return this.form.controls; }
  get f2() { return this.form2.controls; }
  get f3() { return this.form3.controls; }
  get f4() { return this.form4.controls; }


  showBlockAccountPopup() {
    this.blockAccountPopup = true;
  }

  hideBlockAccountPopup() {
    this.submitted = false;
    this.blockAccountPopup = false;
    this.form.reset();
  }

  blockAccount(form) {
    this.submitted = true;
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
            this.submitted = false;
            this.form.reset();
          } else {
            this.loading = false;
            this.form.reset();
          }
        },
        err => {
          this.loading = false;
          this.posService.setAlertMessage('Error occured, please try again later.');
        });
    }
  }

  showUnblockAccountPopup() {
    this.unblockAccountPopup = true;
  }

  hideUnblockAccountPopup() {
    this.unblockAccountPopup = false;
    this.submitted2 = false;
    this.form2.reset();
  }

  unblockAccount(form) {
    this.submitted2 = true;
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
            this.submitted2 = false;
            this.unblockAccountPopup = false;
            this.form2.reset();
          } else {
            this.loading = false;
            this.form2.reset();
          }
        },
        err => {
          this.loading = false;
          this.posService.setAlertMessage('Error occured, please try again later.');
        });
    }
  }

  //methods for assign card for account - DEMO ONLY
  showAssignCardPopup() {
    this.submitted3 = false;
    this.assignCardPopup = true;
  }

  hideAssignCardPopup() {
    this.assignCardPopup = false;
    this.form3.reset();
  }

  assignSmartcard(form) {
    this.submitted3 = true;
    if (!form.valid) {
      return
    }
    this.loading = true;
    let request = { accountId: this.accountData.id, cardId: form.value.smartCardId }
    console.log(request);

    this.accService.assignSmartCard(request).subscribe(
      res => {
        if (res) {
          this.loading = false;
          this.assignCardPopup = false;
        } else {
          this.loading = false;
          this.posService.setAlertMessage('Smartcard Id is invalid or already in use');
          this.form3.reset();
        }
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.form3.reset();
      }
    )
  }

  showUnassignCardPopup() {
    this.submitted4 = false;
    this.unassignCardPopup = true;
  }

  hideUnassignCardPopup() {
    this.unassignCardPopup = false;
    this.form4.reset();
  }

  unassignSmartcard(form) {
    this.submitted4 = true;
    if (!form.valid) {
      return
    }
    this.loading = true;
    var request = { accountId: this.accountData.id, cardId: form.value.smartCardId }

    this.accService.unassignSmartCard(request).subscribe(
      res => {
        if (res) {
          var index = this.accountData.smartCards.findIndex(x => x.uid === request.cardId)
          if (index > -1) {
            this.accountData.smartCards.splice(index, 1)
          } else {
            this.posService.setAlertMessage('This smartcard is not assigned to this account.');
          }
          this.loading = false;
          this.unassignCardPopup = false;
        } else {
          this.loading = false;
          this.form4.reset();
          this.posService.setAlertMessage('Error occured, please try again later.');
        }
      },
      err => {
        this.loading = false;
        this.form4.reset();
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    )
  }

  sendDataforPrint() {
    this.loading = true;
    this.ticketService.printSmartcard(this.accountData.id).subscribe(
      res => {
        console.log(res);
        this.loading = false;
        this.posService.setAlertMessage('Smartcard succesfully printed');
      },
      err => {
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.loading = false;
      }
    )
  }

  scrollToRequests() {
    this.router.navigate(['/account/manage'], {fragment: 'verificationRequests'});
  }

}
