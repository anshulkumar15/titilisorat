import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';
import { UserListService } from 'src/app/shared/services/user.service';
import { state } from 'src/app/shared/data/state';


@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent {
states = state;
  reg;
  constructor(
    public authService: AuthService,
    private authApiService: AuthApiService,
    private toastr: ToastrService,
    private userService: UserListService,
    private router: Router
  ) { }



  ngOnInit(): void {
    this.userService.getProfile().subscribe(d=>{
      this.reg = d.data;
    });
  }

  onRegister(form: any) {



    console.log(form.value)
    let postData = {
      first_name: this.reg.first_name,
      last_name: this.reg.last_name,
      address:this.reg.last_name,
      postal_code:this.reg.postal_code,
      city:this.reg.city,
      state:this.reg.state,
      country:this.reg.country,
      phone:this.reg.phone,

    };

    if (form.valid) {

      this.userService.updateProfile(postData).subscribe((res: any) => {
         if (res.status === 200) {
          this.toastr.success("Profile Updated")
          //   this.router.navigate(['/login'])
        }
        else {
          this.toastr.error(res.message)
        }

      })
    } else {
      this.toastr.error('All fields are required')
    }






  }
}