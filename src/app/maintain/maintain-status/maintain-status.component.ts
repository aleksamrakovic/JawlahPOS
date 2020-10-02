import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-maintain-status',
  templateUrl: './maintain-status.component.html',
  styleUrls: ['./maintain-status.component.css']
})
export class MaintainStatusComponent implements OnInit {
  posInfo;
  socket: SocketIOClient.Socket;
  cameraConnected = false;
  qrcodeConnected = false;
  printerConnected = false;
  smartcardConnected = false;
  scannerConnected = false;

  constructor(private posService: PosDataServiceService, private http: HttpClient) {
     this.socket = io.connect('http://127.0.0.1:3333');
  }

  ngOnInit() {
    this.posService.getPosData().subscribe(data => {this.posInfo = data});
    //must initiate first time
    this.getStatus();

    this.socket.on('devices connected', (devices) => {
      devices[0].status == 'connected' ? this.cameraConnected = true : this.cameraConnected = false;
      devices[1].status == 'connected' ? this.smartcardConnected = true : this.smartcardConnected = false;
      devices[2].status == 'connected' ? this.printerConnected = true : this.printerConnected = false;
      devices[3].status == 'connected' ? this.qrcodeConnected = true : this.qrcodeConnected = false;
      devices[4].status == 'connected' ? this.scannerConnected = true : this.scannerConnected = false;
    });
  }

  getStatus() {
    this.http.post<any>('http://127.0.0.1:3333/status', {}).subscribe(res => {});
  }
}
