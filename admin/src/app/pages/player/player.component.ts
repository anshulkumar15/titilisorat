import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent  {
  tableRows: any = [];
  pageArr:number[] =[5,10,20,50,100]
   submitted = false;
  checkboxes: any = [];
  filter = 'all';
  options = {
    orderBy: '_id',
    orderDir: 'DESC',
    page: 1,
    search: '',
    size: 20,
    totalRecords: 0,
    endIndex: 0,
    find:'',
    startIndex: 0,
    s_date: '',
    e_date: '',
    role:2,
    pemail:''
  };
  report_name='/admin/player';

 
  constructor(public service: UserListService, private route: ActivatedRoute,  private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((users) => {
      this.filter = this.route.snapshot.paramMap.get('filter');
      this.getList();
      this.setDefault();
    });
  }
  navigate() {
   
    this.router.navigate([this.report_name]);

}

  selectItem(e: any, type: any) {
    if (!e.target.value) {
      return;
    }
    if (e.target.checked) {
      this.checkboxes.push(e.target.value);
      console.log(this.checkboxes);
    }
    else {
      this.checkboxes = this.checkboxes.filter((x: any) => x !== e.target.value);
      console.log(this.checkboxes);
    }
  }
  showChecked(data: any) {
    return this.checkboxes.includes(data._id);
  }
  selectAll(e: any) {
    if (e.target.checked) {
      this.tableRows.map(x => this.checkboxes.push(x._id));
    } else {
      this.checkboxes = [];
    }
    console.log(this.checkboxes);
  }
  confirm(id: any) {
    let ok = confirm('Are you sure?');

    if (ok) {
      this.service.deleteUser(id).subscribe(d => {
        this.getList();
        alert('Deleted!');

      })
      alert('Deleted!');
    }
  }



  pageChange(page: number) {
    this.options.page = +page;
    this.getList();
  }
  pageSizeChange(size: any) {
     this.options.size = parseInt(size.target.value);
    this.getList()

  }
  search(term: any): void {
    this.options.search = term;
    this.options.page = 1;
    //this.searchTerms.next(term);
    this.getList();
  }
getList() {
  if (this.filter === 'all') {
    this.options.find = '';
  }

  let filter = this.getFilter();
  this.service.gamerunningfuntarget(filter).subscribe((d: any) => {
    if (!d?.data || !d.data.length) {
      this.tableRows = [];
      return;
    }

    // 1. Find latest playedTime from API
    const latestTime = d.data
      .map((row: any) => new Date(row.playedTime).getTime())
      .reduce((max, t) => Math.max(max, t), 0);

    // 2. Filter only rows that have this latest playedTime
    let liveData = d.data.filter((row: any) => {
      const played = new Date(row.playedTime).getTime();
      return played === latestTime;
    });

    // 3. Remove "No Players"
    liveData = liveData.filter((row: any) => {
      const name = row.playername?.trim();
      return name && name.toLowerCase() !== "no players";
    });

    // 4. Sort by RoundCount
    liveData.sort((a: any, b: any) => b.RoundCount - a.RoundCount);

    // 5. Keep only unique players
    let uniqueData = Object.values(
      liveData.reduce((acc: any, item: any) => {
        if (!acc[item.playername]) {
          acc[item.playername] = item;
        }
        return acc;
      }, {})
    );

    this.tableRows = uniqueData;
    this.setPaginate(d);
  });
}


  setPaginate(d){
     this.options.startIndex = 1 +(this.options.page - 1) * this.options.size  ;
      this.options.endIndex = (this.options.page - 1) * this.options.size + this.options.size;
      this.options.totalRecords = d.recordsTotal;
      if (this.options.endIndex > d.recordsTotal) {
        this.options.endIndex = this.options.totalRecords;
      }
  }
  getFilter() {
    return {
      page:this.options.page,
      size: this.options.size,
      email: this.options.search,
      role: this.options.role,
      pemail:this.options.pemail,
      s_date: this.options.s_date,
    };
  }
  roleChanged(d){
    this.getList();
  }
  searchManager(v){
    this.options.pemail=v;
    this.getList();
  }
  gameChanged(v){
    this.filter=v;
    this.getList();
  }
  setDefault() {
    const today = new Date();
    this.options.s_date = today.toISOString().substring(0, 10);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    this.options.e_date = nextDay.toISOString().substring(0, 10);
    // this.options.search = this.auth.getEmail();
  }
  sdateChanged(d){
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    this.options.e_date = nextDay.toISOString().substring(0, 10);
     
  }
  /*
  RoulletGamePlayHistory
  FunTargetGamePlayHistory
  TripleChanceGamePlayHistory
  PointHistory
  PointCancel
  PointRejected
  PointReceived
  GameReport
*/
}
