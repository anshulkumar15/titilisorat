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

  constructor(
    private authService: AuthService,
    private authApi: AuthApiService,
    private router: Router,
  ) { }


  ngOnInit(): void {
  }

  onLogin(form: any) {
    this.authApi.login({ ...form.value, type: 'admin' }).subscribe((response: any) => {

      if (response.status === 200) {

        this.authService.loginProcess(response);
        if (this.authService.getRole() == 0 || this.authService.getRole() == 1) {
          this.authService.ShowSuccess("Login Successfully");
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.authService.showError('Login Not Allowed');
          return;
        }

      } else {
        this.authService.showError(response.message);
      }


    })

  }


}
