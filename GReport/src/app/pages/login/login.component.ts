import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {  FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AuthApiService } from '../../shared/services/authApi.service';

import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
    http = inject(HttpClient);
   authService = inject(AuthService);
  router = inject(Router);
  authApi = inject(AuthApiService);
  captchaText: any;
  incaptcha: any;

  submitted = false;
  model = {
    email: '',
    password: '',
    capcha: ''
  }

  isCaptchaValid: any;

  ngOnInit(): void {
    this.regCapcha();
  }

  onLogin(form: any): void {
    let data = {
      email: form.value.txtUserID,
      password: form.value.txtPassword,
      type:'report'
    }
    this.isCaptchaValid = this.incaptcha == this.captchaText;

    if (this.isCaptchaValid === false) {
      this.authService.showError('Invalid Capcha');
      this.regCapcha();
      return;
    }


    this.authApi.login(data).subscribe((response: any) => {
      if (response.status === 200) {
        this.authService.loginProcess(response);
        this.authService.ShowSuccess("Login Successfully");
        this.router.navigate(['/reports']);
      } else {
        this.authService.showError(response.message);
      }
    })
  }

  regCapcha() {
    this.captchaText = this.authService.generateCaptcha(6);
  }
  
}
