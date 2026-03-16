import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-game-records',
  templateUrl: './game-records.component.html',
  styleUrls: ['./game-records.component.css']
})
export class GameRecordsComponent {
  andar_bahar = [{
    "id": 207,
    "playername": "GK00103470",
    "RoundCount": 8,
    "winNo": 27,
    "Win_singleNo":'',
    "Date": "2023-10-10T09:47:07.000Z"
  }]
  aviator_list = [{
    "id": 207,
    "playername": "",
    "RoundCount": 8,
    "Win_singleNo": 27,
    "Date": "2023-10-10T09:47:07.000Z"
  }]
  target = [{
    "id": 207,
    "playername": "",
    "RoundCount": 8,
    "Win_singleNo": 27,
    "Date": "2023-10-10T09:47:07.000Z"
  }]
  roulette = [{
    "id": 207,
    "playername": "",
    "RoundCount": 8,
    "Win_singleNo": 27,
    "Date": "2023-10-10T09:47:07.000Z"
  }]
  constructor(
    public authService: AuthService,
    private authApiService: AuthApiService,
    private userService: UserListService,
  ) { }

  ngOnInit(): void {
    // debugger
    // if(this.authService.getToken()){
    //    this.router.navigate(['/admin/dashboard']);
    // }
    this.getRoulette();
    this.getTarget();
    this.getAviator();
    this.getAndharBharar();
  }
  getAndharBharar() {
    this.userService.getFunabResult({}).subscribe((res: any) => {
      console.log(res)
      if (res.status === 200) {
        this.andar_bahar = res.data;
        // this.authService.ShowSuccess("Register Successfully")
        //   this.router.navigate(['/login'])
      }
    })
  }
  getAviator() {
    let d = { "page": 1, "size": 20, "email": "GK01010100", "role": -1, "pemail": "", "s_date": "2024-02-18", "e_date": "2024-02-19", "type": "send" };
    this.userService.getAviatorResult(d).subscribe((res: any) => {
      console.log(res)
      if (res.status === 200) {
        this.aviator_list = res.data;
        // this.authService.ShowSuccess("Register Successfully")
        //   this.router.navigate(['/login'])
      }
    })
  }
  getTarget() {
    let d = { "page": 1, "size": 20, "email": "GK01010100", "role": -1, "pemail": "", "s_date": "2024-02-18", "e_date": "2024-02-19", "type": "send" };

    this.userService.getFuntartgetResult(d).subscribe((res: any) => {
      console.log(res)
      if (res.status === 200) {
        this.target = res.data;
        // this.authService.ShowSuccess("Register Successfully")
        //   this.router.navigate(['/login'])
      }
    })
  }
  getRoulette() {
    let d = { "page": 1, "size": 20, "email": "GK01010100", "role": -1, "pemail": "", "s_date": "2024-02-18", "e_date": "2024-02-19", "type": "send" };

    this.userService.getRolletResult(d
    ).subscribe((res: any) => {
      console.log(res)
      if (res.status === 200) {
        this.roulette = res.data;
        // this.authService.ShowSuccess("Register Successfully")
        //   this.router.navigate(['/login'])
      }
    })
  }
  // getGamerecords(){
  //   Gamerecords
  //   this.userService.gameer({}).subscribe(d=>{

  //   })
  //     }



}
