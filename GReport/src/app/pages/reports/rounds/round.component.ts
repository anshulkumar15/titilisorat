import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { AccordianComponent } from '../../../shared/components/accordian/accordian.component';
import { AuthService } from '../../../shared/services/auth.service';
import { UserListService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, AccordianComponent, DialogComponent, NgxPaginationModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] ,
  templateUrl: './round.component.html',
  styleUrl: './round.component.scss'
})
export class RoundComponent {
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
    size: 10,
    totalRecords: 0,
    endIndex: 0,
    find:'',
    startIndex: 0,
    s_date: '',
    e_date: '',
    role:2,
    pemail:''
  };




  report_name='/admin/history/rollet';

 
  constructor(public service: UserListService, private route: ActivatedRoute,  private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((users) => {
      this.filter = this.route.snapshot.paramMap.get('filter');
      this.getList();
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
    // Remove duplicates by RoundCount
    const seen = new Set();
  const filtered = d.data.filter(item => {
  if (seen.has(item.RoundCount)) return false;
  seen.add(item.RoundCount);
  return true;
});

// Add serial number starting from 1
this.tableRows = filtered.map((item, index) => ({
  ...item,
  serial: index + 1
}));

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
  getRoundFromTime(time: string): number {
  const date = new Date(time);
  const ms = date.getMilliseconds(); 
  // Convert 0–999 ms → scale into 1–60 rounds
  return Math.round((ms / 1000) * 60) || 1;
}

  getWinImagePath(winNo: string): string {
  return `assets/images/${winNo}.png`;  // Assuming images like 1.png, 2.png, etc.
}

}

