import { Injectable, PipeTransform } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const authApi = environment.apiUrl + '/auth';
@Injectable({
  providedIn: 'root'
})

export class AuthApiService {

  constructor(private http: HttpClient) { }
  signUp(data) {
    return this.http.post<any>(authApi + '/signUp', data);

  }
  login(data) {
    return this.http.post<any>(authApi + '/login', data);
  }

 
 
  check_login(data) {
    return this.http.post<any>(authApi + '/check-login', data);

  }
checklogin(data){
return this.http.post<any>(authApi + '/checklogin',data);

}
forcelogin(data){
return this.http.post<any>(authApi + '/forcelogin', data);

}


//return this.http.post<any>(authApi + '/forgotPassword',AuthController.forgotPassword)
resetPassword(data){
return this.http.post<any>(authApi + '/resetPassword',data);

}
adduserbyadmin(data){
return this.http.post<any>(authApi + '/adduserbyadmin', data);

}

adduserbyadmin1(data){
return this.http.post<any>(authApi + '/adduserbyadmin1', data);
}

getRoleId(data){
return this.http.post<any>(authApi + '/getRoleId', data);
}


createStateId(data){
return this.http.post<any>(authApi + '/createStateId', data);
}

createCityId(data){
return this.http.post<any>(authApi + '/createCityId', data);
}

createMainId(data){
  return this.http.post<any>(authApi + '/createMainId', data);
}

createPlayerId(data){
  return this.http.post<any>(authApi + '/createPlayerId', data);
}

Checkplayerlist(data){
  return this.http.post<any>(authApi + "/Checkplayerlist", data);
}

changePassword(data){
  return this.http.post<any>(authApi + "/changePassword", data);

}
getPassword(data){
  return this.http.get<any>(authApi + "/getPassword");

}

 







}
