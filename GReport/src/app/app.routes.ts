import { Routes } from '@angular/router';
import { ReportsComponent } from './pages/reports/reports.component';
import { LoginComponent } from './pages/login/login.component';
import { LeyoutComponent } from './shared/components/leyout/leyout.component';
import { RevenueComponent } from './pages/reports/revenue/revenue.component';
import { RoundComponent } from './pages/reports/rounds/round.component';

import { PokerRevenueComponent } from './pages/reports/poker-revenue/poker-revenue.component';
import { MultiplayerPointTransferComponent } from './pages/reports/multiplayer-point-transfer/multiplayer-point-transfer.component';
import { DailyStatusComponent } from './pages/reports/daily-status/daily-status.component';
import { FunABComponent } from './pages/draw details/fun-ab/fun-ab.component';
import { TripleFunComponent } from './pages/draw details/triple-fun/triple-fun.component';
import { FunRoulletComponent } from './pages/draw details/fun-roullet/fun-roullet.component';
import { FunTargetComponent } from './pages/draw details/fun-target/fun-target.component';
import { MailReportComponent } from './pages/mail-report/mail-report.component';
import { FuntargetRevenuComponent } from './pages/reports/funtarget-revenu/funtarget-revenu.component';

import { RoulletRevenuComponent } from './pages/reports/roullet-revenu/roullet-revenu.component';
import { authGuard } from './shared/auth/auth.guard';
import { WeeklyDetailsComponent } from './pages/weekly-details/weekly-details.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  {
    path: '',
    component: LeyoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'reports', component: ReportsComponent },
      { path: 'reports/revenue', component: RevenueComponent },

      { path: 'reports/round', component: RoundComponent },
      { path: 'revenue/rollet-revenu', component: RoulletRevenuComponent },
      { path: 'revenue/funtarget-revenu', component: FuntargetRevenuComponent },
      { path: 'reports/multiplayer-pt', component: MultiplayerPointTransferComponent },
      { path: 'reports/daily-status', component: DailyStatusComponent },

      { path: 'draw-details/fun-ab', component: FunABComponent },
      { path: 'draw-details/triple-fun', component: TripleFunComponent },
      { path: 'draw-details/fun-roullet', component: FunRoulletComponent },
      { path: 'draw-details/fun-target', component: FunTargetComponent },

      { path: 'mail-report', component: MailReportComponent },

      { path: 'week-report', component: WeeklyDetailsComponent }

    ]
  }
];
