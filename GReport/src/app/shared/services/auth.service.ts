import { Injectable, PLATFORM_ID, afterNextRender, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { environment } from "../../../environments/environment";
 import { ToastrService } from 'ngx-toastr';

const BACKEND_URL = environment.apiUrl + "/auth";


@Injectable({ providedIn: "root" })
export class AuthService {
  cart: any;
  currentCurrency;
  currency = [];
   currencyhotel = [{ factor: 1, symbol: '₹', iso: 'INR' }, { factor: 0.012, symbol: '$', iso: 'USD' }, { factor: 0.045, symbol: 'AED', iso: 'AED' }];
   currencyactivty = [{ factor: 22.17, symbol: '₹', iso: 'INR' }, { factor: 0.27, symbol: '$', iso: 'USD' }, { factor: 1, symbol: 'AED', iso: 'AED' }];
  
  lastSearchUrl = "/tours-sightseeing/dubai-city";
  cartCount = 0;
  private isAuthenticated = false;
  private storagekey='funrepgreport';
  isLoading = false;
  private token: any;
  private tokenTimer: any;
  private userId: any;
  public authStatusListener = new BehaviorSubject(false);
  private role: any;
  public roleName = { 0: 'SuperAdmin', 1: 'MiniAdmin', 2: 'Sate', 3: 'City', 4: 'Main', 5: 'Player' };

  id:any;
  name: any;
  imageId: any;
  serviceId: any;
  siteData: any;
  email:any;
  point=0;
  siteUrl = environment.apiUrl + '/settings/filter/SITE';
 
  constructor(private http: HttpClient, private router: Router, public toastr:ToastrService ) {
   // this.currentCurrency = this.getCurrentCurrency();
       this.autoAuthUser();
  }

  getCurrentCurrency() {
    let ds = sessionStorage.getItem("currency");

    if (!ds) {
      return this.currency[0];
    }
    let d = JSON.parse(ds);

    const index = this.currency.findIndex(object => {
      return object.iso === d.iso;
    });
    return this.currency[index];
  }
  setCurrency() {
    sessionStorage.setItem('currency', JSON.stringify(this.currentCurrency));
  }
  redirectTo(url = '/') {
    window.location.href = url;
  }
  getSiteData() {
    return this.http.get(this.siteUrl);
  }

  getPageData(page:any) {
    return this.http.post<any>(environment.apiUrl + '/pages/filter/' + page, '');
  }

  getAllPages() {
    return this.http.post<any>(environment.apiUrl + '/pages/list/','');
  }

  addPage(data) {
    return this.http.post<any>(environment.apiUrl + '/pages/add/', data);
  }

  updatePage(id, data) {
    return this.http.post<any>(environment.apiUrl + '/pages/'+id, data);
  }

  deletePage(id) {
    return this.http.delete<any>(environment.apiUrl + '/pages/'+id);
  }


  setSiteData(data: any) {
    data.exchange['INR']['AED'] ;


    this.currencyhotel = this.currencyhotel.map(r=>{
      if(r.iso !='INR'){
        r.factor=data.exchange['INR'][r.iso];
      }
      return r;
    });

    this.currencyactivty = this.currencyactivty.map(r=>{
      if(r.iso !='AED'){
        r.factor=data.exchange['AED'][r.iso];
      }
      return r;
    });


    return this.siteData = data;
  }
  getProfile() {
    return this.http.get(environment.apiUrl + `/users/profile`);
  }
  getBookingList() {
    return this.http.get(environment.apiUrl + `/users/bookings`);
  }
  chagePassword(data) {
    return this.http.post(environment.apiUrl + `/users/change-password`, data);
  }
  forgotPassword(data) {
    return this.http.post(environment.apiUrl + `/auth/forgot-password`, data);
  }
  resetPassword(data) {
    return this.http.post(environment.apiUrl + '/auth/resetPassword/'+data['token'], data);
  }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }
  getUserId() {

    return this.userId;
  }
  getPoint() {

    return this.point;
  }
  getRole() {
    return this.role;
  }
  getName() {
    return this.name;
  }
  getEmail() {
    return this.email;
  }

   
  registerUser(data: any) {

 //   return this.http.post(BACKEND_URL + "/register/user", data);
  }
  sendcontact(data: any) {
    return this.http
      .post<any>(
        BACKEND_URL + "/sendcontact",
        data
      );
  }

  login(data: any) {

    // return this.http
    //   .post<{ token: string; expiresIn: number; userId: string }>(
    //     BACKEND_URL + "/adminlogin",
    //     data
    //   );
  }
  loginProcess(response: any) {
    const token = response.token;
    this.token = token;

    if (token) {
      const expiresInDuration = 30 * 3600;//response.expiresIn;
      //this.setAuthTimer(expiresInDuration);
      this.isAuthenticated = true;
      let tokenData: any = JSON.parse(atob(this.token.split('.')[1]));
      //console.log('tokenData', tokenData)
      if (tokenData) {
        this.role = tokenData.role_id;
        this.id = tokenData.user_id;
        this.name = response.data.username;
        this.email= response.data.user_id
        // this.selectedGroup = tokenData.selectedGroup;
        this.imageId = response.imageId;
      }

      this.authStatusListener.next(true);
      const now = new Date();
      const expirationDate = new Date(
        now.getTime() + expiresInDuration * 1000
      );
      this.saveAuthData(response, expirationDate);
    }
  }
  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expire = new Date(authInformation.expirationDate);
    const expiresIn = expire.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      let tokenData: any = JSON.parse(atob(this.token.split('.')[1]));
 
      if (tokenData) {
        this.role = tokenData.role_id;
        this.id = tokenData.user_id;
        this.name = authInformation.data.username;
        this.email= authInformation.data.user_id
        this.imageId = authInformation.imageId;
      }
      this.isAuthenticated = true;

      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }else{
      this.logout();
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.redirectTo('/')
  }

  private setAuthTimer(duration: number) {

    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }


  private saveAuthData(d: any, expirationDate: any) {
    d["expirationDate"] = expirationDate.toISOString()
    sessionStorage.setItem(this.storagekey, JSON.stringify(d));


  }

  private clearAuthData() {
    sessionStorage.removeItem(this.storagekey);
  }

  private getAuthData() {
    let ds = sessionStorage.getItem(this.storagekey);
 
    if (!ds) {
      return false;
    }
    let d = JSON.parse(ds);
    if (!d.token || !d.expirationDate) {
      return false;
    }
     return d;
  }

  getPrice(a) {
    if (!a) return 0;
    let p = parseFloat(a);
    p *= this.currentCurrency.factor;
    return p;
  }
  getSymbole() {
    return this.currentCurrency.symbol;
  }
  textStrip(text) {
    if (!text) return '';
    return text.replace(/rayna/gi, "k");
  }
  showError(msg){
     this.toastr.error(msg)
  }
  ShowSuccess(msg){
     this.toastr.success(msg);

  }
  generateCaptcha(length=4) {
    const characters = '7856903214';
    return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');

  }
 
}
