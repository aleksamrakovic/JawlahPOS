import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DriverCardsServiceService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAllDrivers() {
    return this.http.get<any>(environment.baseUrl + '/api/drivers/getall');
  }

  //block, unblock, assign
  blockDriver(driver) {
    return this.http.post<any>(environment.baseUrl + '/api/drivers/block', driver);
  }

  // unblockDriver(smartcardId) {
  //   return this.http.get<any>(environment.baseUrl + '/api/drivers/unblock?uid=' + smartcardId);
  // }

  assignCard(driver) {
    return this.http.post<any>(environment.baseUrl + '/api/drivers/assign', driver);
  }
}
