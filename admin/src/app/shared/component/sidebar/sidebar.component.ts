import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  sideBarData:any = [
    {name:'Dashboard', icon:'fa-solid fa-gauge',link:'/admin/dashboard',img:'dashboard.png'},
    {name:'Users', icon:'fa-solid fa-user', link:'/admin/users',img:'users.png'},
    {name:'History', icon:'fa-solid fa-clock-rotate-left',link:'/admin/history/funtarget', img:'history.png'},
    {name:'Players', icon:'fa-solid fa-user', link:'/admin/playerss',img:'users.png'},


    {name:'Live Players', icon:'fa-solid fa-clock-rotate-left',link:'/admin/player', img:'history.png'},
    {name:'Controller', icon:'fa-solid fa-plus',link:'/admin/controller/fun-target', img:'controller.png'},
    {name:'Points', icon:'fa-solid fa-wallet', link:'/admin/points', img:'points.png'},
    {name:'Updates', icon:'fa-solid fa-bezier-curve', link:'/admin/updates', img:'updates.png'},
    {name:'Reports', icon:'fa-solid fa-chart-simple', link:'/admin/reports', img:'reports.png'},
    {name:'Setting', icon:'fa-solid fa-gear', link:'/admin/setting', img:'setting.png'}
  ]

}
