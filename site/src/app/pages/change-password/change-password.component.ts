import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent { 
  user: any = {};
   constructor(
    public authService: AuthService,
    private authApiService: AuthApiService,
  ) { }
 
  onSubmit(form: any) {
    let postData = {
      email:this.authService.getEmail(), 
      old_password:this.user.old_password,  
      new_password:this.user.new_password, 
      
    };
 
    if (form.valid) {
      if (form.value.password === form.value.cpassword) {
        this.authApiService.resetPassword(postData).subscribe((res: any) => {
           if (res.status ===200) {
            this.authService.ShowSuccess("Register Successfully")
         //   this.router.navigate(['/login'])
          }
          else {
            this.authService.showError(res.message)
          }

        })
      } else {
        this.authService.showError("Password and Confirm Password must be match. ")
      }
    }
    else {
      this.authService.showError('All fields are required')
    }






  }
}
