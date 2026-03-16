import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent {
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
    role:-1,
    pemail:'',
    sender:'',

  };

report_name='/admin/report'


 
  constructor(public service: UserListService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((users) => {
     this.report_name= this.router.url;
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
    this.service.PointHistory(filter).subscribe((d: any) => {
      this.tableRows = d.data; 
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
      sender: this.options.sender,
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

}
