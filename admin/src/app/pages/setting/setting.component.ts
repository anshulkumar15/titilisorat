import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  user: any = {};
  qrCodeFile: File | null = null;
  qrCodeUrl: string = ''; // Holds the full image URL to show

  

  constructor(
    private authService: AuthService,
    private authApi: AuthApiService,
    private router: Router
    
  ) {}

  ngOnInit(): void {
    this.loadAdminDetails();
   
   
  }

  onPasswordSubmit(form: any) {
    const email = this.authService.getEmail();

    const postData = {
      email,
      old_password: this.user.old_password,
      new_password: this.user.new_password
    };

    if (form.valid) {
      if (this.user.new_password === this.user.con_password) {
        this.authApi.resetPassword(postData).subscribe((res: any) => {
          if (res.status === 200) {
            this.authService.ShowSuccess("Password changed successfully");
          } else {
            this.authService.showError(res.message);
          }
        });
      } else {
        this.authService.showError("Password and Confirm Password must match");
      }
    } else {
      this.authService.showError('All fields are required');
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.qrCodeFile = event.target.files[0];

      // Show preview of selected file
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.qrCodeUrl = e.target.result;
      };
      reader.readAsDataURL(this.qrCodeFile);
    }
  }

  onContactUpdate(form: any) {
    const email = this.authService.getEmail();

    if (!this.user.phone && !this.user.upi && !this.qrCodeFile) {
      this.authService.showError('Please update at least one field (Phone, UPI, or QR Code)');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    if (this.user.phone) formData.append('phone', this.user.phone);
    if (this.user.upi) formData.append('upi', this.user.upi);
    if (this.qrCodeFile) formData.append('file', this.qrCodeFile);
    

    this.authApi.updateAdminDetails(formData).subscribe(
      (res: any) => {
        if (res.message) {
          this.authService.ShowSuccess("Contact details updated");
          this.loadAdminDetails(); // Reload to show updated image
        }
      },
      (err) => {
        this.authService.showError("Failed to update contact details");
      }
    );
  }

  loadAdminDetails() {
    const email = this.authService.getEmail();
    this.authApi.getAdminDetails({ email }).subscribe((res: any) => {
      this.user.phone = res.phone;
      this.user.upi = res.upi;
      if (res.qrCode) {
        this.qrCodeUrl = `${environment.imageUrl}/assets${res.qrCode}`;
      }
    });
  }
}
