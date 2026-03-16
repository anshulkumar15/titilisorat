import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';
import { state } from 'src/app/shared/data/state';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-child-registration',
  templateUrl: './child-registration.component.html',
  styleUrls: ['./child-registration.component.css']
})
export class ChildRegistrationComponent {
  states = state;
  reg: any = {};
  password;
  constructor(
    public authService: AuthService,
    private authApiService: AuthApiService,
    private toastr: ToastrService,
    private userService: UserListService,
  

    private router: Router
  ) { }
  ngOnInit(): void {
    this.authApiService.getPlayerVendor({idManager:this.authService.getEmail()}).subscribe((res: any) => {
      if(res.status =='200'){
          this.reg.email=res.register;
          this.reg.password=this.randPass();
      }
    
    });
    
  }
  onRegister(form: any) {
    console.log(form.value)
    let postData = { 
      full_name:this.reg.first_name, 
      last_name:this.reg.last_name, 
      email:this.reg.email, 
      password:this.reg.password, 
      idManager:this.authService.getEmail(), 
      role_id:5
        };
 
    if (form.valid) { 
        this.authApiService.createPlayerId(postData).subscribe((res: any) => {
          this.password=this.randPass();
        
          if (res.status ===200) {
            this.toastr.success("Register Successfully")
         //   this.router.navigate(['/login'])
          }
          else {
            this.toastr.error(res.message)
          }
        })
    }
    else {
      this.toastr.error('All fields are required')
    }
  }

  randPass() {
    return Math.floor(Math.random() * 9000) + 1000;

  }
}
