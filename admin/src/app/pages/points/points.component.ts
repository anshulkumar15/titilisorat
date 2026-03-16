import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css']
})
export class PointsComponent {
  myForm = { senderEmail: "admin@admin.com", email: "", point: 0, role_id: '1' };
  constructor(
    private userService: UserListService,
    public authService: AuthService,
  ) { }

  getStateIdData() {
    this.userService.getStateIdData({}).subscribe(d => {
      console.log('getStateIdData', d);

    });
  }
  getCityIdData() {
    this.userService.getCityIdData({}).subscribe(d => {


    });

  }
  getMainIdData() {
    this.userService.getMainIdData({}).subscribe(d => {
      console.log('getMainIdData', d);
      

    });
  }

  sendStateIdPoints() {
    //{senderEmail: "admin@admin.com", email: "GK00500500", point: "1"}
    this.userService.sendStateIdPoints(this.myForm).subscribe(d => {
      this.myForm.point=0;
      if(d.status == 200){
        this.authService.ShowSuccess(d.message);

      }else{
        this.authService.showError(d.message);
      }
    });
  }
  sendCityIdPoints() {
    //{senderEmail: "admin@admin.com", email: "GK00309014", point: "1"}
    this.userService.sendCityIdPoints(this.myForm).subscribe(d => {
      this.myForm.point=0;
      if(d.status == 200){
        this.authService.ShowSuccess(d.message);

      }else{
        this.authService.showError(d.message);
      }
    });
  }
  sendPlayerIdPoints() {
    //{senderEmail: "admin@admin.com", email: "GK00107066", point: "1"}
    this.userService.sendPlayerIdPoints(this.myForm).subscribe(d => {
      this.myForm.point=0;
            if(d.status == 200){
        this.authService.ShowSuccess(d.message);

      }else{
        this.authService.showError(d.message);
      }
    });
  }

  sendMainIdPoints() {
    //{senderEmail: "admin@admin.com", email: "GK00107066", point: "1"}
    this.userService.sendMainIdPoints(this.myForm).subscribe(d => {
      this.myForm.point=0;
       if(d.status == 200){
        this.authService.ShowSuccess(d.message);

      }else{
        this.authService.showError(d.message);
      }
    });
  }
  sendMiniIdPoints() {
    //{senderEmail: "admin@admin.com", email: "GK00107066", point: "1"}
    this.userService.sendMiniIdPoints(this.myForm).subscribe(d => {
      this.myForm.point=0;
            if(d.status == 200){
        this.authService.ShowSuccess(d.message);

      }else{
        this.authService.showError(d.message);
      }
    });
  }

  // getStateIdData
  // sendStateIdPoints
  // 


  // getCityIdData
  // sendCityIdPoints

  // getMainIdData
  // sendMainIdPoints

  // sendPlayerIdPoints
  roleChanged(d){

  }
  onTransferSubmit(d) {
    this.myForm.senderEmail = this.authService.getEmail();
    if (this.myForm.role_id === '1') {
      if (!this.myForm.email) {
        this.authService.showError('Manger Id required');
      } else {
        this.sendMiniIdPoints();
      }

    } else if (this.myForm.role_id === '2') {
      if (!this.myForm.email) {
        this.authService.showError('Manger Id required');
      } else {
        this.sendStateIdPoints();
      }

    } else if (this.myForm.role_id === '3') {
      if (!this.myForm.email) {
        this.authService.showError('Manger Id required');

      } else {
        this.sendCityIdPoints();
      }

    } else if (this.myForm.role_id === '4') {
      if (!this.myForm.email) {
        this.authService.showError('Manger Id required');

      } else {
        this.sendMainIdPoints();
      }

    } else if (this.myForm.role_id === '5') {
      if (!this.myForm.email) {
        this.authService.showError('Manger Id required');

      } else {
        this.sendPlayerIdPoints();
      }
    }
  }
}
