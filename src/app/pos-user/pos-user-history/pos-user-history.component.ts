import { Component, OnInit } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-pos-user-history',
  templateUrl: './pos-user-history.component.html',
  styleUrls: ['./pos-user-history.component.css']
})
export class PosUserHistoryComponent implements OnInit {
  posInfo;
  historyList;

  //set pagination details
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 5,
    currentPage: 1
  };

  constructor(private posService: PosDataServiceService) { }

  ngOnInit() {
    this.posService.getPosData().subscribe(
      (data: any) => {
        this.posInfo = data;
        this.posService.getSessionHistory(this.posInfo.deviceId).subscribe(data => {this.historyList = data})
      }
    );
  }

}
