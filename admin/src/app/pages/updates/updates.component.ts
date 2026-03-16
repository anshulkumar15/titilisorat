import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.css']
})
export class UpdatesComponent {
  constructor(
    private authService: AuthService,
    private service: UserListService,
    private router: Router,
  ) { }


 ngOnInit(): void {

  this.service.getVersion().subscribe((res: any) => {
    if(res.data){
       this.user=res.data;
    }
   

  });
 }

 
  user: any = {};
  onSubmit(form: any) {
    let postData = {
      _id:1, 
      versionControle:this.user.versionControle,  
      appLink:this.user.appLink, 
    };
     if (form.valid) {
       
        this.service.updateVersion(postData).subscribe((res: any) => {
           if (res.status ===200) {
            this.authService.ShowSuccess("Saved Successfully")
           }
          else {
            this.authService.showError(res.message)
          }

        })
      }  
     
    else {
      this.authService.showError('All fields are required')
    }

  }


}
