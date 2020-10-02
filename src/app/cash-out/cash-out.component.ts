import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PosDataServiceService } from '../_service/pos-data-service.service';

@Component({
  selector: 'app-cash-out',
  templateUrl: './cash-out.component.html',
  styleUrls: ['./cash-out.component.css']
})
export class CashOutComponent implements OnInit {
  cashOutAmount: number;
  cashId: number;
  currency;

  form: any;
  submitted: boolean = false;
  pattern = /^\d+(?:\.\d+)?$/;
  loading: boolean = false;

  @ViewChild('cashout', { static: false }) cashout: ElementRef;
  constructor(private http: HttpClient, private router: Router, private posService: PosDataServiceService) {
    this.form = new FormGroup({ cashoutInput: new FormControl('', [Validators.required, Validators.pattern(this.pattern)]) });
  }

  ngOnInit() {
    this.loading = true;
    this.posService.getPosData().subscribe((data: any) => { this.currency = data.currencyCode });
    this.http.post<any>('http://127.0.0.1:3333/openCashdrawer', {}).subscribe(
      res => {
        this.loading = false;
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Cashdrawer is not connected.');
      });
  }

  get f() { return this.form.controls; }

  ngAfterViewInit() {
    this.cashout.nativeElement.focus();
  }

  cashoutConfirm(form) {
    this.submitted = true;
    if (!form.valid) {
      return
    }
    this.loading = true;
    sessionStorage.setItem('cashoutAmount', JSON.stringify(form.value.cashoutInput));

    this.http.post<any>(environment.baseUrl + '/api/device/cashAmount', { amount: form.value.cashoutInput, cashOut: true, id: this.cashId }).subscribe(
      res => {
        this.loading = false;
        this.router.navigate(['/cashout/popup']);
      },
      err => {
        this.loading = false;
        this.form.reset();
        this.posService.setAlertMessage('Error occured, please try again later.');
      });

  }

  cancelCashout() {
    this.router.navigate(['/period-pass'])
  }

}
