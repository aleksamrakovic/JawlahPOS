import { Component, OnInit } from '@angular/core';
import { ReportsServiceService } from '../reports-service.service';
import { PaginationInstance } from 'ngx-pagination';
import { Router } from '@angular/router';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-detail-report',
  templateUrl: './detail-report.component.html',
  styleUrls: ['./detail-report.component.css']
})
export class DetailReportComponent implements OnInit {
  detailsReport: any[] = [];

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 6,
    currentPage: 1,
  };

  constructor(private reportServ: ReportsServiceService, private posService: PosDataServiceService, private router:Router) { }

  ngOnInit() {
    this.reportServ.getTransactionReport().subscribe(
      res => {
        console.log(res);
        this.detailsReport = res;
      },
      err => {
        this.posService.setAlertMessage('Error occured, please try again later.');
        this.router.navigate(['/reports']);
      });
  }

}
