import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { HeaderComponent } from './shared/component/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { ChildRegistrationComponent } from './pages/child-registration/child-registration.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { PinComponent } from './pages/pin/pin.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile.component';
import { PinAndPasswordComponent } from './pages/pin-and-password/pin-and-password.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
  import { AuthInterceptor } from './shared/auth/auth.interceptor';
 import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
 
 import { ToastrModule } from 'ngx-toastr';
import { ErrorInterceptor } from './shared/auth/error-interceptor';
import { GameRecordsComponent } from './pages/game-records/game-records.component';
import { ContactComponent } from './pages/contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    HomeComponent,
    LayoutComponent,
    ChildRegistrationComponent,
    ChangePasswordComponent,
    PinComponent,
    UpdateProfileComponent,
    PinAndPasswordComponent,
    LogoutComponent,
    GameRecordsComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,BrowserAnimationsModule,FormsModule,HttpClientModule,
    ToastrModule.forRoot(),
   
  

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
