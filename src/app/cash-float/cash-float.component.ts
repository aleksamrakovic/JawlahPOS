import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PosDataServiceService } from '../_service/pos-data-service.service';

@Component({
  selector: 'app-cash-float',
  templateUrl: './cash-float.component.html',
  styleUrls: ['./cash-float.component.css']
})
export class CashFloatComponent implements OnInit {
  currency;
  loading = false;

  form: any;
  submitted: boolean = false;
  pattern = /^\d+(?:\.\d+)?$/;

  @ViewChild('cashfloat', { static: false }) cashfloat: ElementRef;
  constructor(private posService: PosDataServiceService, private router: Router, private http: HttpClient) {
    this.form = new FormGroup({ cashfloatInput: new FormControl('', [Validators.required, Validators.pattern(this.pattern)]) });
  }

  ngOnInit() {
    this.loading = true;
    this.posService.getPosData().subscribe((data: any) => { this.currency = data.currencyCode; });
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
    this.cashfloat.nativeElement.focus();
  }

  cashfloatConfirm(form) {
    this.submitted = true;
    if (!form.valid) {
      return
    }
    this.loading = true;
    this.http.post<any>(environment.baseUrl + '/api/device/cashAmount', { amount: Number(form.value.cashfloatInput) }).subscribe(
      res => {
        this.loading = false;
        sessionStorage.setItem('cashDrawerAmount', JSON.stringify(Number(form.value.cashfloatInput)));
        this.router.navigate(['/period-pass']);
      },
      err => {
        this.loading = false;
        this.posService.setAlertMessage('Error occured, please try again later.');
      });
  }
}
