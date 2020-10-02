import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-acc-payments-details',
  templateUrl: './acc-payments-details.component.html',
  styleUrls: ['./acc-payments-details.component.css']
})
export class AccPaymentsDetailsComponent implements OnInit {
  transaction: any;
  loading: boolean = true;
  currency: any;

  constructor(private posService: PosDataServiceService, private router:Router) { }

  ngOnInit() {
    this.posService.getPosData().subscribe((data: any) => { this.currency = data.currencyCode });
    this.transaction = JSON.parse(sessionStorage.getItem('purchaseTransaction'));
    if (this.transaction) {
      console.log(this.transaction);
      this.loading = false;
    } else {
      this.loading = false;
      this.posService.setAlertMessage('Error occured, please try again later.');
      this.router.navigate(['/account/payments'])
    }
  }

  goBack() {
    this.router.navigate(['/account/payments']);
    sessionStorage.removeItem('purchaseTransaction');
  }

}
