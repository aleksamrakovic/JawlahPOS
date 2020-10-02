import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AccountServiceService } from 'src/app/accounts/account-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-link-new-account',
  templateUrl: './link-new-account.component.html',
  styleUrls: ['./link-new-account.component.css']
})
export class LinkNewAccountComponent implements OnInit {
  accountNo: any;
  accountData: any;
  accountList = [];
  loading: boolean = false;
  accountSelected: any;
  permissions: any[] = [];
  selected: any;

  form: any;
  submitted: boolean = false;

  constructor(private http: HttpClient, private accService: AccountServiceService, private posService: PosDataServiceService, private router: Router) {
    this.form = new FormGroup({
      permission: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(data => {this.accountData = data;})
    this.accService.getAccountPermissions().subscribe(res => {
      this.permissions = res
    },
    err => {
      this.posService.setAlertMessage('Link account permissions list is not available, please try again later.');
    });
  }

  get f() { return this.form.controls; }

  searchAccount(input) {
    if (input.length > 3) {
      this.loading = true;
      this.http.post<any>(environment.baseUrl + '/api/user/search', {value : input}).subscribe(
        res => {
          this.loading = false;
          this.accountList = res;
        },
        err => {
          this.posService.setAlertMessage('Error occured, please try again later.');
        }
      );
    } else {
      this.loading = false;
      this.accountList = [];
    }
  }

  selectAccount(account) {
    this.form.reset();
    console.log(account);
    this.accountList = [];
    this.accountSelected = account;


  }

  submit(form) {
    this.submitted = true;
    if (!form.valid) {
      return
    }
    this.loading = true;

    var req = {
      linkedAccountId: this.accountSelected.accountIntegrityId,
      permission: form.value.permission,
      accountId: this.accountData.id
    }

    this.accService.linkAccount(req).subscribe(
      res => {
        console.log(res);
        if (res) {
          this.loading = false;
          this.router.navigate(['/account/links']);
        } else {
          this.form.reset();
          this.loading = false;
        }
      }, err => {
        this.loading = false;
        this.form.reset();
        this.posService.setAlertMessage('Error occured, please try again later.');
      }
    )
  }

}
