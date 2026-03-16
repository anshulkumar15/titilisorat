import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './shared/component/layout/layout.component';
import { SidebarComponent } from './shared/component/sidebar/sidebar.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HeaderComponent } from './shared/component/header/header.component';
import { UsersComponent } from './pages/users/users.component';
import { HistoryComponent } from './pages/history/history.component';
import { ControllerComponent } from './pages/controller/controller.component';
import { PointsComponent } from './pages/points/points.component';
import { UpdatesComponent } from './pages/updates/updates.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingComponent } from './pages/setting/setting.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { CreateUserComponent } from './pages/users/create-user/create-user.component';
import { SearchMasterComponent } from './pages/users/search-master/search-master.component';
 import { AuthInterceptor } from './shared/auth/auth.interceptor';
import { ErrorInterceptor } from './shared/auth/error-interceptor';
//import { LogoutComponent } from './pages/logout/logout.component';

 import { RouterModule, Routes } from '@angular/router';
  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ToastrModule } from 'ngx-toastr';
import { TripleChanceComponent } from './pages/controller/triple-chance/triple-chance.component';
import { FunTargetComponent } from './pages/controller/fun-target/fun-target.component';
import { RoulletComponent } from './pages/controller/roullet/roullet.component';
import { PointCancleComponent } from './pages/reports/point-cancle/point-cancle.component';
import { PointRejectedComponent } from './pages/reports/point-rejected/point-rejected.component';
import { PointReceivedComponent } from './pages/reports/point-received/point-received.component';
import { GameReportComponent } from './pages/reports/game-report/game-report.component';
import { TransactionHistoryComponent } from './pages/reports/transaction-history/transaction-history.component';
import { RolletGameHistoryComponent } from './pages/history/rollet-game-history/rollet-game-history.component';
import { FuntargetGameHistoryComponent } from './pages/history/funtarget-game-history/funtarget-game-history.component';
import { TripechanceGameHistoryComponent } from './pages/history/tripechance-game-history/tripechance-game-history.component';
import { PlayerComponent } from './pages/player/player.component';
import { TotalFunTargetGameHistoryComponent } from './pages/totalfuntarget-game-history copy/totalfuntarget-game-history.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    SidebarComponent,
    LoginComponent,
    DashboardComponent,
    HeaderComponent,
    UsersComponent,
    HistoryComponent,
    ControllerComponent,
    PointsComponent,
    UpdatesComponent,
  
    ReportsComponent,
    SettingComponent,
    CreateUserComponent,
    SearchMasterComponent,
    TripleChanceComponent,
    FunTargetComponent,
    RoulletComponent,
    TotalFunTargetGameHistoryComponent,
    PointCancleComponent,
    PointRejectedComponent,
    PointReceivedComponent,
    GameReportComponent,
    TransactionHistoryComponent,
    RolletGameHistoryComponent,
    FuntargetGameHistoryComponent,
    TripechanceGameHistoryComponent,
    PlayerComponent

  ],
  imports: [

    BrowserModule,
    AppRoutingModule,
    BrowserModule,BrowserAnimationsModule,FormsModule,HttpClientModule,
    ToastrModule.forRoot(),
    NgbModule,
     NgxPaginationModule,
 
     
  ],
  providers: [
    
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
