import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  transferData = {
    receive: "GK", sender: "", pin: "", point: ""

  };
  receiveArr = [];
  sendArr = [];
  point = 0;

  selectedReceive = [];
  selectedSender = [];


  constructor(
    private userService: UserListService,
    public authService: AuthService,
  ) { }
  ngOnInit(): void {
    this.getViewData();
  }

  getViewData() {
    this.refreshReciver();
    this.refreshSender();
    this.getPlayerPoint();
  }

  onTransferSubmit(d) {
    this.transferData.sender = this.authService.getEmail();
    
    this.userService.sendPointsUsers(this.transferData).subscribe((d) => {
      this.transferData.pin='';
      if (d.status == 200) {
        this.getViewData();
        this.authService.ShowSuccess(d.message);

      } else {
        this.authService.showError(d.message);
      }

     
    });

  }

  refreshReciver() {
    this.userService.receive({ emailId: this.authService.getEmail() }).subscribe((d) => {
      this.receiveArr = d.data;
    });


  }
  refreshSender() {
    this.userService.transferPoint({ emailId: this.authService.getEmail() }).subscribe((d) => {
      this.sendArr = d.data.transferRecord;
    });

  }


  getPlayerPoint() {
    this.userService.getPlayerPoint({ email: this.authService.getEmail() }).subscribe((d) => {
      this.authService.point = d.point;
    });
  }

  accpetPointsUser() {
    this.userService.accpetPointsUser({ id: this.selectedSender }).subscribe(d => {
      this.getViewData();
    });
  }
  cancelTransferableId() {
    this.userService.cancelTransferableId({ id: this.selectedSender }).subscribe(d => {
      this.getViewData();
    });
  }

  DeleteUpdate() {
    this.userService.DeleteUpdate({ id: this.selectedReceive, emailId: this.authService.getEmail() }).subscribe(d => {
      this.getViewData();
    });
  }


  rejectPoint() {
    this.userService.rejectPoint({ id: this.selectedReceive, emailId: this.authService.getEmail()  }).subscribe(d => {
      this.getViewData();
    });
  }



  selectSendItem(e: any, type: any) {
    if (!e.target.value) {
    return;
    }
    if (e.target.checked) {
      this.selectedSender.push(e.target.value);
      console.log(this.selectedSender);
    }
    else {
      this.selectedSender = this.selectedSender.filter((x: any) => x !== e.target.value);
      console.log(this.selectedSender);
    }
  }
  showSendChecked(data: any) {
    return this.selectedSender.includes(data.id);
  }
  selectSendAll(e: any) {
    if (e.target.checked) {
      this.sendArr.map(x => this.selectedSender.push(x._id));
    } else {
      this.selectedSender = [];
    }
    console.log(this.selectedSender);
  }


  selectReciveItem(e: any, type: any) {
    if (!e.target.value) {
      return;
    }
    if (e.target.checked) {
      this.selectedReceive.push(e.target.value);
      console.log(this.selectedReceive);
    }
    else {
      this.selectedReceive = this.selectedReceive.filter((x: any) => x !== e.target.value);
      console.log(this.selectedReceive);
    }
  }
  showReciveChecked(data: any) {
    return this.selectedReceive.includes(data.id);
  }
  selectReciveAll(e: any) {
    if (e.target.checked) {
      this.receiveArr.map(x => this.selectedReceive.push(x._id));
    } else {
      this.selectedReceive = [];
    }
    console.log(this.selectedReceive);
  }
  
}
