import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent {
  constructor(
    private authService: AuthService,
    private authApi: AuthApiService,
    private router: Router,
  ) { }
  ngOnInit(): void {
    this.authService.logout();
    // debugger
    // if(this.authService.getToken()){
    //    this.router.navigate(['/admin/dashboard']);
    // }
     
  }

}
