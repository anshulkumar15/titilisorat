import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { AccordianComponent } from '../../shared/components/accordian/accordian.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { UserListService } from '../../shared/services/user.service';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {NgxPaginationModule} from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
@Component({
  selector: 'app-weekly-reports',
  standalone: true,
  imports: [CommonModule, AccordianComponent, DialogComponent,NgxPaginationModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] ,
  templateUrl: './weekly-reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {

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
    s_date:'',
    e_date: '',
    role:-1,
    pemail:'',
    type:'send',
  };

report_name='/reports'
totalRows=[]
selectedItem;
headers=['Sr.no','TranferTo','Type','Amount','TranferTime'];
 
 
  constructor(public auth: AuthService,public service: UserListService, private route: ActivatedRoute, private router: Router) {
    this.setDefault();
   }

  ngOnInit(): void {

    this.route.paramMap.subscribe((users) => {
      this.report_name= this.router.url;
      this.filter = this.route.snapshot.paramMap.get('filter');
      this.getList();
      this.getTotal();
    });
  }
  setDefault(){
    const today = new Date();
    this.options.s_date = today.toISOString().substring(0, 10);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    this.options.e_date = nextDay.toISOString().substring(0, 10);
    this.options.search = this.auth.getEmail();
    this.options.role = this.auth.getRole();
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
  getTotalRec(){
    this.getList();
    this.getTotal();
  }
  getList() {

    if (this.filter === 'all') {
      this.options.find = '';
    }
    
    let filter = this.getFilter();
    this.service.PointHistory(filter).subscribe((d: any) => {
      this.tableRows = d.data; 
      if(this.options.type == 'receive'){
        this.tableRows=this.tableRows.map((d:any)=>{
        return this.rowTransform(d.FromAccountName,'',d.point,d.Date);
      }) 
      }else{
        this.tableRows=this.tableRows.map((d:any)=>{
          return this.rowTransform( d.ToAccountName,'',d.point,d.Date);
        })
      }
      

      this.setPaginate(d);
     

    });
  }
  getTotal() {

    if (this.filter === 'all') {
      this.options.find = '';
    }
    
    let filter = this.getFilter();
    this.service.getAgentRrofit(filter).subscribe((d: any) => {
      this.totalRows = d.data; 
      

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
      e_date: this.options.e_date,
      type: this.options.type,
    };
  }
  transfer(){
    if (this.filter === 'all') {
      this.options.find = '';
    }
    
    let filter = this.getFilter();
    this.service.transferPoint({emailId:filter.email}).subscribe((d: any) => {
      this.tableRows = d.data.transferRecord; 
      this.tableRows=this.tableRows.map((d:any)=>{
        return this.rowTransform( d.to,d.status,d.amount,d.date);
      })

    });
  }
  receive(){
    if (this.filter === 'all') {
      this.options.find = '';
    }
    
    let filter = this.getFilter();
    this.service.receive({emailId:filter.email}).subscribe((d: any) => {
      this.tableRows = d.data; 
      this.tableRows=this.tableRows.map((d:any)=>{
        return this.rowTransform(d.FromAccountName,d.status,d.point,d.createdAt);
      })

    });
  }
  rowTransform(account,type,point, Date){
    return {account,type,point, Date}
  };
  typeChanged(d){
    this.tableRows=[];
    this.totalRows = []; 

    if(d=='send'){
      this.headers= ['Sr.no','TranferTo','Amount','TranferTime'];
      this.getTotalRec();
    }
    if(d=='receive'){
      this.headers= ['Sr.no','RecivedFrom','Amount','Tranfer Time'];
      this.getTotalRec();
    }
    if(d=='pending'){
      this.headers= ['Sr.no','TranferTo','Amount','Tranfer Time'];
      this.transfer();

    }
    if(d=='accept'){
      this.headers= ['Sr.no','RecivedFrom','Amount','Tranfer Time'];
      this.receive();

    }
    
   
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
