import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosDataServiceService {
  baseUrl = environment.baseUrl;
  posUser = new Subject<any>()
  userPop = new Subject<any>();
  posChanges = new BehaviorSubject<any>(false);
  block = new Subject<any>();
  mode = new Subject<any>();
  alertMessage = new Subject<any>();

  constructor(private http: HttpClient) { }

  //get info about pos
  getPosData() {
    return this.http.get<JSON>(this.baseUrl + '/api/device');
  }

  //save info about logged user
  setPosUser(user) {
    this.posUser.next(user);
    sessionStorage.setItem('loggedUser', JSON.stringify(user));
  }

  getPosUser() {
    return this.posUser.asObservable();
  }

  //see if settings changed for Top nav
  setSettingsChange(data) {
    this.posChanges.next(data);
  }

  getSettingsChange() {
    return this.posChanges.asObservable()
  }

  getPosUserSession() {
    return JSON.parse(sessionStorage.getItem('loggedUser'));
  }

  //show/close user menu popup
  setPopup(mode: any) {
    this.userPop.next(mode);
  }

  getPopup() {
    return this.userPop.asObservable();
  }

  //pos user page
  getAllUsers(deviceId) {
    return this.http.get<JSON>(this.baseUrl + '/api/posUser/getAll?deviceId='+deviceId);
  }

  getTodaySession(deviceId) {
    return this.http.get<JSON>(this.baseUrl + '/api/posUser/getSessionToday?deviceId='+deviceId);
  }

  getSessionHistory(deviceId) {
    return this.http.get<JSON>(this.baseUrl + '/api/posUser/getSessionHistory?deviceId='+deviceId);
  }

  //pos user password
  changePass(data) {
    return this.http.post<any>(this.baseUrl + '/api/posUser/changePass', data)
  }

  //save settings change
  changeSettings(data) {
    return this.http.post<any>(this.baseUrl + '/api/device/updateSettings', data);
  }

  //reboot device 
  rebootDevice() {
    return this.http.get<any>(environment.baseUrl + '/api/device/reboot');
  }

  turnOffDevice() {
    return this.http.get<any>(environment.baseUrl + '/api/device/shutdown');
  }

  sendDeviceTransactions(data) {
    return this.http.post<any>(this.baseUrl + '/api/device/sendError', data);
  }

  setCartUpdate(mode) {
    this.mode.next(mode);
  }

  getCartUpdate() {
    return this.mode.asObservable();
  }

  setAlertMessage(mode) {
    this.alertMessage.next(mode)
  }

  getAlertMessage() {
    return this.alertMessage.asObservable();
  }

}
