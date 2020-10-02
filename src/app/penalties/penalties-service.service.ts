import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PenaltiesServiceService {

  constructor(private http: HttpClient) { }

  //set penalty ref number for detail page
  setPenaltyRef(ref: any) {
    sessionStorage.setItem('penaltyRef', JSON.stringify(ref));
  }

  getPenaltyRef() {
    return JSON.parse(sessionStorage.getItem('penaltyRef'));
  }

  //call api for penalty details
  getPenaltyDetails(ref: any) {
    return this.http.get<any>(environment.baseUrl + '/api/penalty/details?refNumber='+ ref);
  }
}
