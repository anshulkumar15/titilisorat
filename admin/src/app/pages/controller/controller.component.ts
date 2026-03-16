import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.css']
})
export class ControllerComponent {
  game = 1;
  rolletui=-1;
  funtargetui=-1;
  tripleui = {single: -1, double: -1, triple: -1}
  boxes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  boxes1 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  boxes2 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  boxes3 = [{key:0,value:0},{key:1,value:1},{key:2,value:2},{key:3,value:3},{key:4,value:4},{key:5,value:5},
    {key:6,value:6},{key:7,value:7},{key:8,value:8},{key:9,value:9},{key:10,value:10},
    {key:11,value:11},{key:12,value:12},{key:13,value:13},{key:14,value:14},{key:15,value:15},{key:16,value:16},
    {key:17,value:17},{key:18,value:18},{key:19,value:19},{key:20,value:20},
    {key:21,value:21},{key:22,value:22},{key:23,value:23},{key:24,value:24},{key:25,value:25},{key:26,value:26},
    {key:27,value:27},{key:28,value:28},{key:29,value:29},{key:30,value:30},  
    {key:31,value:31},{key:32,value:32},{key:33,value:33},{key:34,value:34},{key:35,value:35},{key:36,value:36},
    {key:37,value:'00'}
  ]
  boxes4 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  tripleCurrent =[{
    "singleNo": "0",
    "doubleNo": "0",
    "tripleNo": "0"
  }
];
  triplechanceAdamin = {
    "value1": "0",
    "value2": "0",
    "value3": "0"
  }
  rolletAdmin = {
    "value": "-1"
  }
  rolletResult = {
    "bet0": 0,
    "bet00": 0,
    "bet1": 0,
    "bet2": 0,
    "bet3": 0,
    "bet4": 0,
    "bet5": 0,
    "bet6": 0,
    "bet7": 0,
    "bet8": 0,
    "bet9": 0,
    "bet10": 0,
    "bet11": 0,
    "bet12": 0,
    "bet13": 0,
    "bet14": 0,
    "bet15": 0,
    "bet16": 0,
    "bet17": 0,
    "bet18": 0,
    "bet19": 0,
    "bet20": 0,
    "bet21": 0,
    "bet22": 0,
    "bet23": 0,
    "bet24": 0,
    "bet25": 0,
    "bet26": 0,
    "bet27": 0,
    "bet28": 0,
    "bet29": 0,
    "bet30": 0,
    "bet31": 0,
    "bet32": 0,
    "bet33": 0,
    "bet34": 0,
    "bet35": 0,
    "bet36": 0
  }
  funtargetAdmin={
    "value": "-1"
  }

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
    "BetOnNine": 0
  };
  constructor(
    public authService: AuthService,
    public authApiService: AuthApiService,
    private userService: UserListService,
    private router: Router,
  ) { }
  ngOnInit(): void {
   this.getAdmintriplechance();
   this.getRunningTriple();
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
  saveTripleChance() {
    let data = {
      "value1": this.tripleui.single,
      "value2": this.tripleui.double,
      "value3": this.tripleui.triple
    }
    this.userService.Admintriplechance(data).subscribe(d => {
      window.location.reload();
    });
  }
  delTripleChance() {
    let data = { value1: -1, value2: -1, value3: -1 };
    this.userService.Admintriplechance(data).subscribe(d => {
      window.location.reload();
    });
  }
  getRunningTriple(){
    this.userService.gamerunningtriplechance().subscribe(d=>{
      this.tripleCurrent= d.data;
    });
  }
  getAdmintriplechance(){
    this.userService.getAdmintriplechance().subscribe(d=>{
      this.triplechanceAdamin=d.data;
    });
  }
  //gamerunningtriplechance

  saveRoullet() {
    let data = { value1: this.rolletui }
    this.userService.Adminroulette(data).subscribe(d => {
      this.getAdminroulette();
      this.rolletui=-1;

    });
  }
  delRoullet() {

    let data = { value1: -1 }
    this.userService.Adminroulette(data).subscribe(d => {
      this.getAdminroulette();

    });
  }
  getCurrentRoulette(){
       this.userService.gamerunningroulette({}).subscribe(d => {

    });
  }
  getAdminroulette(){
    this.userService.getAdminroulette().subscribe(d=>{
      this.rolletAdmin=d.data;
    });
  }
  //gamerunningroulette
  saveFunTarget() {
    let data = { value1: this.funtargetui }
    this.userService.Adminfuntarget(data).subscribe(d => {
      this.getAdminFuntarget();
      this.funtargetui=-1;

    });
  }
  delFunTarget() {
    let data = { value1: -1 };
    this.userService.Adminfuntarget(data).subscribe(d => {
      this.funtargetui=-1;
      this.getAdminFuntarget();
    });
  }
  
  getAdminFuntarget(){
    this.userService.getAdminfuntarget().subscribe(d=>{
      this.funtargetAdmin=d.data;
    });
  }

  ///gamerunningfuntarget
  getCurrentFunTarget(){
    this.userService.gamerunningfuntarget({}).subscribe(d => {
      this.funtargetResult=d.data[0];

 });
}

  getObjectKeys(data) {
    return Object.keys(data);
  }

}
