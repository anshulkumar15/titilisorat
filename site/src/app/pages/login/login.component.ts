import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  model = {
    email: '',
    password: '',
    capcha: ''
  }
  captchaText: any;
  incaptcha: any;
  isCaptchaValid: any;
  constructor(
    private authService: AuthService,
    private authApi: AuthApiService,
    private router: Router,
  ) { }


  ngOnInit(): void {

    this.regCapcha();
  }

  onLogin(form: any) {
    let data = {
      email: form.value.txtUserID,
      password: form.value.txtPassword,
      type: 'vendor'
    }
    this.isCaptchaValid = this.incaptcha == this.captchaText;

    if (this.isCaptchaValid === false) {
      this.authService.showError('Invalid Capcha');
      this.regCapcha();
      return;
    }


    this.authApi.login(data).subscribe((response: any) => {

      if (response.status === 200) {

        //    if(this.authService.getRole() ==4 || this.authService.getRole() ==3 ||this.authService.getRole() ==2 ) {
        this.authService.loginProcess(response);
        this.authService.ShowSuccess("Login Successfully");
        this.router.navigate(['/point-transfer']);

        //    }else{
        //     this.authService.showError('Login Not Allowed');
        //    return ;
        //  }

      } else {
        this.authService.showError(response.message);
      }


    })
  }
  regCapcha() {
    this.captchaText = this.authService.generateCaptcha(6);
  }
  onCopy(event: ClipboardEvent): void {
    event.preventDefault();
  }
}
