import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LayoutComponent } from './shared/component/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { UsersComponent } from './pages/users/users.component';
import { HistoryComponent } from './pages/history/history.component';
import { ControllerComponent } from './pages/controller/controller.component';
import { PointsComponent } from './pages/points/points.component';
import { UpdatesComponent } from './pages/updates/updates.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingComponent } from './pages/setting/setting.component';
import { CreateUserComponent } from './pages/users/create-user/create-user.component';
import { SearchMasterComponent } from './pages/users/search-master/search-master.component';
import { authGuard } from './shared/auth/auth.guard';
import { FunTargetComponent } from './pages/controller/fun-target/fun-target.component';
import { RoulletComponent } from './pages/controller/roullet/roullet.component';
import { TripleChanceComponent } from './pages/controller/triple-chance/triple-chance.component';
import { PointCancleComponent } from './pages/reports/point-cancle/point-cancle.component';
import { PointRejectedComponent } from './pages/reports/point-rejected/point-rejected.component';
import { PointReceivedComponent } from './pages/reports/point-received/point-received.component';
import { GameReportComponent } from './pages/reports/game-report/game-report.component';
import { TransactionHistoryComponent } from './pages/reports/transaction-history/transaction-history.component';

import { RolletGameHistoryComponent } from './pages/history/rollet-game-history/rollet-game-history.component';
import { FuntargetGameHistoryComponent } from './pages/history/funtarget-game-history/funtarget-game-history.component';
// import { PlayerComponent } from './pages/player/PlayerComponent.component';

import { TripechanceGameHistoryComponent } from './pages/history/tripechance-game-history/tripechance-game-history.component';
import { PlayerComponent } from './pages/player/player.component';
import { TotalFunTargetGameHistoryComponent } from './pages/totalfuntarget-game-history copy/totalfuntarget-game-history.component';

const routes: Routes = [

  { path: 'login', component: LoginComponent },
 

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'users/search-master', component: SearchMasterComponent },
      { path: 'users/add', component: CreateUserComponent },
      { path: 'users/:id', component: CreateUserComponent },

      { path: 'history/triplechance', component: TripechanceGameHistoryComponent },
      { path: 'history/funtarget', component: FuntargetGameHistoryComponent },
      
      { path: 'history/rollet', component: RolletGameHistoryComponent },
      { path: 'history', component: HistoryComponent },


      { path: 'controller', component: ControllerComponent },
      { path: 'controller/roullet', component: RoulletComponent },
      { path: 'controller/fun-target', component: FunTargetComponent },
      { path: 'points', component: PointsComponent },
      { path: 'updates', component: UpdatesComponent },
            { path: 'player', component: PlayerComponent },

                        { path: 'playerss', component: TotalFunTargetGameHistoryComponent },



      { path: 'reports/transaction-history', component: TransactionHistoryComponent },
      { path: 'reports/game-report', component: GameReportComponent },
      { path: 'reports/point-rejected', component: PointRejectedComponent },
      { path: 'reports/point-received', component: PointReceivedComponent },
      { path: 'reports/point-cancled', component: PointCancleComponent },


      { path: 'reports', component: ReportsComponent },
      { path: 'setting', component: SettingComponent },
     
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
