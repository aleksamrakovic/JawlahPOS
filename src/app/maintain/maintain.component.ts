import { Component, OnInit } from '@angular/core';
import { PosDataServiceService } from '../_service/pos-data-service.service';

@Component({
  selector: 'app-maintain',
  templateUrl: './maintain.component.html',
  styleUrls: ['./maintain.component.css']
})
export class MaintainComponent implements OnInit {
  rebootPopup: boolean = false;

  constructor(private posService: PosDataServiceService) { }

  ngOnInit() {

  }

  rebootDevice() {
    this.posService.rebootDevice().subscribe(res => {
      console.log(res)
    },
    err => {
      this.posService.setAlertMessage('Error occured, please try again later.');
    });
  }

}
