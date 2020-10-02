import { Component, OnInit } from '@angular/core';
import { ReportsServiceService } from '../reports-service.service';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-waybill',
  templateUrl: './waybill.component.html',
  styleUrls: ['./waybill.component.css']
})
export class WaybillComponent implements OnInit {
  waybill: any;
  currency: any;

  constructor(private reportService: ReportsServiceService, private posService: PosDataServiceService, private router: Router) { }

  ngOnInit() {
    this.posService.getPosData().subscribe((data: any) => {this.currency = data.currencyCode;});

    this.reportService.getWaybillReport().subscribe(
      res => {
        console.log(res);
        this.waybill = res;
      },
      err => {
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/reports']);
      }
    )
  }

}
