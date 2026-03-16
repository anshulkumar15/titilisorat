import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { ChildRegistrationComponent } from './pages/child-registration/child-registration.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { PinComponent } from './pages/pin/pin.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile.component';
import { PinAndPasswordComponent } from './pages/pin-and-password/pin-and-password.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { authGuard } from './shared/auth/auth.guard';
import { GameRecordsComponent } from './pages/game-records/game-records.component';
import { ContactComponent } from './pages/contact/contact.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: '',
    component: LayoutComponent,
     canActivate: [authGuard],
    children: [
      { path: 'game-records', component: GameRecordsComponent },
      { path: 'point-transfer', component: HomeComponent },
      { path: 'child-reg', component: ChildRegistrationComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'change-pin', component: PinComponent },
      { path: 'update-profile', component: UpdateProfileComponent },
      { path: 'pin-and-password', component: PinAndPasswordComponent },
      { path: 'contact', component: ContactComponent },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
