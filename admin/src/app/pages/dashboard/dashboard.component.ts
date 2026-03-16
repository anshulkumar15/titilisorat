import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  dashData: any;
  livePlayers: any[] = []; // unique players for table

  constructor(
    public service: UserListService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getList(); // fetch dashboard + live players
  }

  // combined method
 getList() {
  // dashboard summary
  this.service.getAdminDashBoard().subscribe((d: any) => {
    this.dashData = d.data;
  });

  // live players list
  this.service.gamerunningfuntarget({
    page: 1,
    size: 100,
    role: 2
  }).subscribe((d: any) => {
    if (!d?.data || !d.data.length) {
      this.livePlayers = [];
      return;
    }

    // 1. Find latest round time (max playedTime in API data)
    const latestTime = d.data
      .map((row: any) => new Date(row.playedTime).getTime())
      .reduce((max, t) => Math.max(max, t), 0);

    // 2. Keep only rows from this latest time
    let liveData = d.data.filter((row: any) => {
      return new Date(row.playedTime).getTime() === latestTime;
    });

    // 3. Remove "No Players"
    liveData = liveData.filter((row: any) => {
      const name = row.playername?.trim();
      return name && name.toLowerCase() !== 'no players';
    });

    // 4. Sort by RoundCount (latest first)
    liveData.sort((a: any, b: any) => b.RoundCount - a.RoundCount);

    // 5. Keep only unique playernames
    let uniqueData = Object.values(
      liveData.reduce((acc: any, item: any) => {
        if (!acc[item.playername]) {
          acc[item.playername] = item;
        }
        return acc;
      }, {})
    );

    // 6. Bind only live users to table
    this.livePlayers = uniqueData;
  });
}

}
