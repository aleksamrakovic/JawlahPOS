import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountServiceService {
  account = new Subject<any>();

  constructor(private http: HttpClient) { }

  searchAccountApi(input) {
    return this.http.post<any>(environment.baseUrl + '/api/user/search', { value: input });
  }

  getDefaultAccount() {
    return this.http.get<JSON>(environment.baseUrl + '/api/user/defaultRider');
  }

  saveAccount(data) {
    this.account.next(data)
    sessionStorage.setItem('accountStorage', JSON.stringify(data))
  }

  getAccount() {
    return this.account.asObservable();
  }

  getAccountStorage() {
    return JSON.parse(sessionStorage.getItem('accountStorage'));
  }

  //set account id
  setAccountNo(data: any) {
    sessionStorage.setItem('accountNo', JSON.stringify(data));
  }

  getAccountNo() {
    return JSON.parse(sessionStorage.getItem('accountNo'));
  }

  getAccountDetails(id) {
    return this.http.get<any>(environment.baseUrl + '/api/user/get?id='+id);
  }

  //block account reasons
  getBlockAccountReasons() {
    return this.http.get<JSON>(environment.baseUrl + '/api/user/blockReasons');
  }

  getUnblockAccountReasons() {
    return this.http.get<JSON>(environment.baseUrl + '/api/user/unblockReasons');
  }

  //account block/unblock
  blockAccount(account, reason) {
    return this.http.post<any>(environment.baseUrl + '/api/user/block', {account: account, reason: reason});
  }

  unblockAccount(account, reason) {
    return this.http.post<any>(environment.baseUrl + '/api/user/unblock', {account:account, reason:reason});
  }

  //account device block reasons
  getBlockDeviceReasons() {
    return this.http.get<JSON>(environment.baseUrl + '/api/user/blockDeviceReasons');
  }

  getUnblockDeviceReasons() {
    return this.http.get<JSON>(environment.baseUrl + '/api/user/unblockDeviceReasons');
  }

  //account device block/unblock
  blockDevice(deviceId, reasonId) {
    return this.http.get<any>(environment.baseUrl + '/api/user/blockDevice?deviceId='+deviceId+'&reasonId='+reasonId);
  }

  unblockDevice(deviceId, reasonId) {
    return this.http.get<JSON>(environment.baseUrl + '/api/user/unblockDevice?deviceId='+deviceId+'&reasonId='+reasonId);
  }

  checkAccountByEmail(email) {
    return this.http.get<any>(environment.baseUrl + '/api/user/checkByEmail?email=' + email);
  }

  checkAccountByPhone(phone) {
    return this.http.get<any>(environment.baseUrl + '/api/user/checkByPhone?phone=' + phone);
  }

  //create account/post new account
  createAccount(account) {
    return this.http.post<any>(environment.baseUrl + '/api/user/create', account);
  }

  editAccount(account) {
    return this.http.post<any>(environment.baseUrl + '/api/user/edit', account);
  }

  //verify account api
  verifyAccount(request) {
    return this.http.post<any>(environment.baseUrl + '/api/user/verify', request);
  }

  verifyAccountNew(account) {
    return this.http.post<any>(environment.baseUrl + '/api/user/changeType', account);
  }

  cancelVerifyRequest(request) {
    return this.http.post<any>(environment.baseUrl + '/api/user/cancelRequest', request);
  }

  viewVerifyRequest(accountId, requestId) {
    return this.http.get<any>(environment.baseUrl + '/api/user/viewRequest?accountId=' + accountId + '&requestId=' + requestId);
  }

  editVerifyRequest(req) {
    return this.http.post<any>(environment.baseUrl + '/api/user/editRequest', req);
  }

  getCountries() {
    return this.http.get<any>(environment.baseUrl + '/api/user/countries');
  }

  uploadPhoto(x) {
    return this.http.post<any>(environment.baseUrl + 'api/user/uploadPhoto', x);
  }

  getAccountPermissions() {
    return this.http.get<any>(environment.baseUrl + '/api/user/permissions');
  }

  linkAccount(request) {
    return this.http.post<any>(environment.baseUrl + '/api/user/linkAccount', request);
  }

  unlinkAccount(request) {
    return this.http.post<any>(environment.baseUrl + '/api/user/unlinkAccount', request);
  }

  addAccountIdentity(identity) {
    return this.http.post<any>(environment.baseUrl + '/api/user/addIdentity', identity);
  }

  removeAccountIdentity(identity) {
    return this.http.post<any>(environment.baseUrl + '/api/user/removeIdentity', identity);
  }

  setPrimaryIdentity(identity) {
    return this.http.post<any>(environment.baseUrl + '/api/user/setPrimary', identity);
  }

  resetAccessIdentity(identity) {
    return this.http.post<any>(environment.baseUrl + '/api/user/resetAccess', identity);
  }

  checkAccountIdentity(identity) {
    return this.http.post<any>(environment.baseUrl + '/api/user/checkIdentity?value=',  {value: identity});
  }

  removeDocument(document) {
    return this.http.post<any>(environment.baseUrl + '/api/user/deleteDocument', document);
  }

  addDocument(document) {
    console.log(document);
    return this.http.post<any>(environment.baseUrl + '/api/user/addDocument', document);
  }

  getDocumentStructure(riderType) {
    return this.http.get<any>(environment.baseUrl + '/api/user/verificationDocuments?riderType=' + riderType);
  }

  // refund(ticket) {
  //   return this.http.post<JSON>(environment.baseUrl + '/api/ticket/refund', ticket);
  // }

  getTopupInfo(id) {
    return this.http.get<any>(environment.baseUrl + '/api/user/topupRange?riderType=' + id);
  }

  assignSmartCard(request) {
    return this.http.post<any>(environment.baseUrl + '/api/user/registerCard', request);
  }

  unassignSmartCard(request) {
    return this.http.post<any>(environment.baseUrl + '/api/user/deregisterCard', request);
  }

}
