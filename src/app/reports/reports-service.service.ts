import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsServiceService {

  constructor(private http: HttpClient) { }

  getWaybillReport() {
    return this.http.get<any>(environment.baseUrl + '/api/report/waybill');
  }

  
  getTransactionReport() {
    return this.http.get<any>(environment.baseUrl + '/api/report/allTransactions');
  }
}
