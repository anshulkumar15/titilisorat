import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';
import { UserListService } from 'src/app/shared/services/user.service';
import * as io from 'socket.io-client';
import { CountdownService } from 'src/app/shared/services/countdown.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-fun-target',
  templateUrl: './fun-target.component.html',
  styleUrls: ['./fun-target.component.css']
})
export class FunTargetComponent{
  game = 3;
  funtargetui=-1;

  boxes4 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9','10','11']
  funtargetAdmin={
    "value": "-1",
    "selectedOption":"random_mode",
    "endDate":'',
    "startDate":'',
    "targetAmount":""
  }

  winTypes = ['Random Win', 'Min Bet Win', 'Max Bet Win', 'Selected Option Win','Target Amount'];
  selectedWinType = 'Random Win';
  selectedOption: string | number = 'random_win';
  optionRange: number[] = [];
  targetAmount: number = 0;
  startDate: string = '';
  endDate: string = '';


 

  funtargetResult = {
    "BetOnZero": 0,
    "BetOnOne": 0,
    "BetOnTwo": 0,
    "BetOnThree": 0,
    "BetOnFour": 0,
    "BetOnFive": 0,
    "BetOnSix": 0,
    "BetOnSeven": 0,
    "BetOnEight": 0,
    "BetOnNine": 0,
    "BetOnTen": 0,
    "BetOnEleven": 0
  };
  socket;
  resultCurent;
  constructor(
    public authService: AuthService,
    public authApiService: AuthApiService,
    private userService: UserListService,
    private router: Router,
    public countdowns: CountdownService,
     private cdr: ChangeDetectorRef

  ) {
    this.socket = io(environment.socketUrl);
    this.socket.on('connect', () => {
      // console.log('[Socket] Connected');
      this.connect(); // Register player after connection
    });

    this.socket.on('OnTimerStart',(message: any) => {
      // console.log('OnTimerStart',message);

      this.countdowns.startCountdown(message.result);
      this.cdr.detectChanges();
     });

     this.socket.on('OnCurrentTimer',(message: any) => {
      this.countdowns.startCountdown(message.gametimer)
      this.cdr.detectChanges();
     });

     this.socket.on("OnWinNo",  (data)=> {
      // console.log('OnWinNo',data);
     this.showresult(data.winNo)
     this.cdr.detectChanges();
    });
   }
  ngOnInit(): void {
   this.getAdminFuntarget();
   // Initialize range 0 to 11
    this.optionRange = Array.from({ length: 12 }, (_, i) => i);
  
    setInterval(() => {
    this.getbetfuntarget();
  }, 2000);
  }
  showresult(data){
      // console.log('[Result Received]', data);
    this.resultCurent=data;
  }
  connect(){
    this.socket.emit('RegisterPlayer',{
      playerId: 'GK01030301',
      balance: 45000,
      gameId:8,
    });
  }
  navigate() {
    if(this.game==3){
      this.router.navigate(['/admin/controller/fun-target']);

    }if(this.game==2){
      this.router.navigate(['/admin/controller/roullet']);

    }if(this.game==1){
      this.router.navigate(['/admin/controller']);

    }
  }
  // saveFunTarget() {
  //   let data = { value1: this.funtargetui }
  //   // console.log('[API] Save Roullet:', data);
  //   this.userService.Adminfuntarget(data).subscribe(d => {
  //     this.getAdminFuntarget();
  //     this.funtargetui=-1;

  //   });
  // }

    saveFunTarget() {
    const payload = {
      winType: this.selectedWinType,
      selectedOption: this.selectedOption,
      targetAmount: this.targetAmount,
      startDate: this.startDate,
      endDate: this.endDate
    };
    this.userService.Adminfuntarget(payload).subscribe(d => {
      this.getAdminFuntarget();
     

    });
   
    console.log('Saving target:', payload);
    // Call your backend API here
  }


  delFunTarget() {
    let data = { value1: -1 };
    // console.log('[API] Delete Roullet:', data);
    this.userService.Adminfuntarget(data).subscribe(d => {
      this.funtargetui=-1;
      this.getAdminFuntarget();
    });
  }
  
  getAdminFuntarget(){
    this.userService.getAdminfuntarget().subscribe(d=>{
       console.log('[API] getAdminroulette:', d);
      this.funtargetAdmin=d.data;
      this.selectedWinType = d.data.winType;
      this.selectedOption = d.data.selectedOption;
      this.targetAmount = d.data.targetAmount || 0;
      this.startDate = d.data.startDate || '';
      this.endDate = d.data.endDate || '';
      this.cdr.detectChanges();
    });
  }

  ///gamerunningfuntarget
  getbetfuntarget(){
    this.userService.getbetfuntarget().subscribe(d => {
      //  console.log('[API] getbetfuntarget:', d);
  this.funtargetResult = d.data;
  this.cdr.detectChanges();
});


}

  getObjectKeys(obj: any): string[] {
    // console.log(obj)
    return obj ? Object.keys(obj) : [];
  }


  onWinTypeChange() {
    if (this.selectedWinType === 'Selected Option Win') {
      this.selectedOption = 0; // default to first option
    } else {
      // Set string key identifiers based on win type
      switch (this.selectedWinType) {
        case 'Random Win':
          this.selectedOption = 'random_win';
          break;
        case 'Min Bet Win':
          this.selectedOption = 'min_bet_win';
          break;
        case 'Max Bet Win':
          this.selectedOption = 'max_bet_win';
          break;
        case 'Target Amount':
          this.selectedOption = 'target_amount';
          break;  
        default:
          this.selectedOption = 'random_win';
      }
    }

        // Clear targetAmount and date range if NOT Target Amount
      if (this.selectedWinType !== 'Target Amount') {
        this.targetAmount = 0;
        this.startDate = '';
        this.endDate = '';
      }

  }


 
}

