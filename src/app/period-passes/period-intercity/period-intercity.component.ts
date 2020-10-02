import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-period-intercity',
  templateUrl: './period-intercity.component.html',
  styleUrls: ['./period-intercity.component.css']
})
export class PeriodIntercityComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit() {

  }

  goBack() {
    this.location.back();
  }

}
