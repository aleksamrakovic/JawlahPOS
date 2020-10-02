import { Component, OnInit } from '@angular/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  message: string;
  alert:boolean = false;

  constructor(private posService: PosDataServiceService) { }

  ngOnInit() {
    this.posService.getAlertMessage().subscribe(
      res => {
        console.log(res);
        this.alert = true;
        this.message = res;
      }
    )
  }

}
