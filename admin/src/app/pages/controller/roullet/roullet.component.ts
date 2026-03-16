import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';
import { UserListService } from 'src/app/shared/services/user.service';
import { CountdownService } from 'src/app/shared/services/countdown.service';
import { environment } from "src/environments/environment";

import * as io from 'socket.io-client';

@Component({
  selector: 'app-roullet',
  templateUrl: './roullet.component.html',
  styleUrls: ['./roullet.component.css']
})
export class RoulletComponent implements OnInit, OnDestroy {
  game = 2;
  rolletui = -1;
  resultCurent = '';
  socket: any;

  rolletAdmin = {
    value: '-1'
  };

  rolletResult = {};

  boxes3 = Array.from({ length: 38 }, (_, i) => ({
    key: i === 37 ? 37 : i,
    value: i === 37 ? '00' : i
  }));

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

    this.socket.on('OnTimerStart', (message: any) => {
      // console.log('[Socket] OnTimerStart:', message);
      this.countdowns.startCountdown(message.result);
      this.cdr.detectChanges();
    });

    this.socket.on('OnCurrentTimer', (message: any) => {
      // console.log('[Socket] OnCurrentTimer:', message);
      this.countdowns.startCountdown(message.gametimer);
      this.cdr.detectChanges();
    });

    this.socket.on("OnWinNo", (data) => {
      // console.log('[Socket] OnWinNo:', data);
      this.showresult(data.winNo);
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    // console.log('[Component Init]');
    this.getAdminroulette();
    

  setInterval(() => {
    this.getbetroulette();
  }, 2000);

  }

  ngOnDestroy(): void {
    // console.log('[Component Destroy]');
    this.countdowns.stopCountdown();
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  connect() {
    const playerData = {
      playerId: 'GK01030301',
      balance: 45000,
      gameId: 7
    };
    // console.log('[Socket Emit] RegisterPlayer:', playerData);
    this.socket.emit('RegisterPlayer', playerData);
  }

  showresult(data: any) {
    // console.log('[Result Received]', data);
    this.resultCurent = data;
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

  saveRoullet() {
    const data = { value1: this.rolletui };
    // console.log('[API] Save Roullet:', data);
    this.userService.Adminroulette(data).subscribe(d => {
      this.getAdminroulette();
      this.rolletui = -1;
    });
  }

  delRoullet() {
    const data = { value1: -1 };
    // console.log('[API] Delete Roullet:', data);
    this.userService.Adminroulette(data).subscribe(d => {
      this.getAdminroulette();
    });
  }

  getAdminroulette() {
    this.userService.getAdminroulette().subscribe(d => {
      // console.log('[API] getAdminroulette:', d);
      this.rolletAdmin = d.data;
      this.cdr.detectChanges();
    });
  }

  getbetroulette() {
    this.userService.getbetroulette().subscribe(d => {
      // console.log('[API] getbetroulette:', d);
      this.rolletResult = d.data;
      this.cdr.detectChanges();
    });
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getFilteredBetKeys(): string[] {
  return Object.keys(this.rolletResult || {}).filter(
    key => key.toLowerCase().includes('value')
  );
}


}
