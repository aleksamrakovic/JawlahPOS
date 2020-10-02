import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeriodPassServiceService {

  constructor(private http: HttpClient) { }

  //call api to get all products for route/rider
  getAllProducts(routeId: any, riderId: any, accountId: any) {
    return this.http.get<any>(environment.baseUrl + '/api/ticket/products?routeId='+routeId+'&riderId='+riderId+'&accountId='+accountId);
  }
}
