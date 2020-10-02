import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-device-block',
  templateUrl: './device-block.component.html',
  styleUrls: ['./device-block.component.css']
})
export class DeviceBlockComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  unblockDevice() {
    this.router.navigate(['/login']);
  }

}
