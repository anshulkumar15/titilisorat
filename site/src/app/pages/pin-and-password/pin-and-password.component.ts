import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';

@Component({
  selector: 'app-pin-and-password',
  templateUrl: './pin-and-password.component.html',
  styleUrls: ['./pin-and-password.component.css']
})
export class PinAndPasswordComponent {
  userList=[];
  destriData1=[];
  constructor(
     public authService: AuthService,
    private authApiService: AuthApiService,
    ) { }

  ngOnInit(): void {
    // debugger
    // if(this.authService.getToken()){
    //    this.router.navigate(['/admin/dashboard']);
    // }
    this.getPlayerList();
  }
  getPlayerList(){
    let postData={idManager: this.authService.getEmail()}
    this.authApiService.Checkplayerlist(postData).subscribe((res: any) => {
      console.log(res)
      if (res.status ===200) {
        this.userList= res.data;
        // this.authService.ShowSuccess("Register Successfully")
     //   this.router.navigate(['/login'])
      }
      else {
        this.authService.showError(res.message)
      }

    }) 
  }
 
   changepinpass = async () => {
    let arr = this.destriData1;
    debugger;
    for (let postData of this.destriData1) {
      const reset = 1000 + Math.floor(Math.random() * 9000);
      
      postData.newpassword= reset;
      postData.status='processing';
      this.authApiService.changePassword(postData).subscribe(d=>{
        if(d.status === 200 ){
          postData.status='done';
        }else{
          postData.status='error';

        }
        
      });
    }

    
  };
  selectedUser='';
  addMember(){
    if (this.selectedUser && !this.destriData1.includes(this.selectedUser)) {
      this.destriData1.push({email:this.selectedUser,newpassword:''});
    }
  }
  removeEmail(email: string) {
    const index = this.destriData1.indexOf(email);
    if (index !== -1) {
      this.destriData1.splice(index, 1);
    }
  }
}
