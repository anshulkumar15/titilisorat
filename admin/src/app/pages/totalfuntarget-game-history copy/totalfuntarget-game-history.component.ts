import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from 'src/app/shared/services/user.service';

interface GameHistoryItem {
  _id: string;
  playername: string;
  betpoint: number;
  winpoint: number;
}

interface FilterOptions {
  orderBy: string;
  orderDir: string;
  page: number;
  search: string;
  size: number;
  totalRecords: number;
  endIndex: number;
  find: string;
  startIndex: number;
  role: number;
  pemail: string;
}

@Component({
  selector: 'app-totalfuntarget-game-history',
  templateUrl: './totalfuntarget-game-history.component.html',
  styleUrls: ['./totalfuntarget-game-history.component.css']
})
export class TotalFunTargetGameHistoryComponent implements OnInit {
  tableRows: GameHistoryItem[] = [];
  pageArr: number[] = [5, 10, 20, 50, 100];
  submitted = false;
  checkboxes: string[] = [];
  filter = 'all';
  isLoading = false;
  
  options: FilterOptions = {
    orderBy: '_id',
    orderDir: 'DESC',
    page: 1,
    search: '',
    size: 28000, // Set to a high value to fetch all records
    totalRecords: 0,
    endIndex: 0,
    find: '',
    startIndex: 0,
    role: 2,
    pemail: ''
  };
  
  report_name = '/admin/history/funtarget';

  constructor(
    private service: UserListService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.filter = this.route.snapshot.paramMap.get('filter') || 'all';
      this.getList();
    });
  }

  navigate(): void {
    this.router.navigate([this.report_name]);
  }

  selectItem(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.value) return;
    
    if (target.checked) {
      this.checkboxes.push(target.value);
    } else {
      this.checkboxes = this.checkboxes.filter(id => id !== target.value);
    }
  }

百分之

  showChecked(data: GameHistoryItem): boolean {
    return this.checkboxes.includes(data._id);
  }

  selectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.checkboxes = this.tableRows.map(row => row._id);
    } else {
      this.checkboxes = [];
    }
  }

  confirm(id: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.service.deleteUser(id).subscribe({
        next: () => this.getList(),
        error: (error) => console.error('Error deleting record:', error)
      });
    }
  }

  pageChange(page: number): void {
    this.options.page = page;
    this.getList();
  }

  pageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.options.size = Number(target.value);
    this.options.page = 1; // Reset to first page when changing page size
    this.getList();
  }

  search(term: string): void {
    this.options.search = term.trim();
    this.options.page = 1; // Reset to first page when searching
    this.getList();
  }

getList(): void {
  if (this.filter === 'all') {
    this.options.find = '';
  }

  this.isLoading = true;
  const filter = this.getFilter();

  this.service.gamerunningfuntarget(filter).subscribe({
    next: (response: any) => {
  const uniquePlayers = new Map<string, GameHistoryItem>();

(response.data || []).forEach((item: GameHistoryItem) => {
  if (item.playername !== 'No Players') {
    if (!uniquePlayers.has(item.playername)) {
      uniquePlayers.set(item.playername, {
        _id: item._id,
        playername: item.playername,
        betpoint: item.betpoint || 0,
        winpoint: item.winpoint || 0   // ✅ default 0 if not present
      });
    } else {
      const existing = uniquePlayers.get(item.playername)!;
      existing.betpoint += item.betpoint || 0;
      existing.winpoint += item.winpoint || 0; // ✅ safe addition
    }
  }
});


      this.tableRows = Array.from(uniquePlayers.values());

      // ✅ Set size equal to total records
      this.options.totalRecords = response.recordsTotal || this.tableRows.length;
      this.options.size = this.options.totalRecords;

      this.setPagination(response);
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error fetching game history:', error);
      this.tableRows = [];
      this.isLoading = false;
    }
  });
}


 setPagination(response: any): void {
  this.options.startIndex = 1 + (this.options.page - 1) * this.options.size;
  this.options.endIndex = Math.min(
    (this.options.page - 1) * this.options.size + this.options.size,
    this.options.totalRecords
  );
}


  getFilter(): any {
    return {
      page: this.options.page,
      size: this.options.size,
      email: this.options.search,
      role: this.options.role,
      pemail: this.options.pemail
    };
  }

  roleChanged(): void {
    this.options.page = 1;
    this.getList();
  }

  searchManager(value: string): void {
    this.options.pemail = value.trim();
    this.options.page = 1;
    this.getList();
  }

  gameChanged(value: string): void {
    this.filter = value;
    this.options.page = 1;
    this.getList();
  }

  get isFirstPage(): boolean {
    return this.options.page === 1;
  }

  get isLastPage(): boolean {
    return this.options.page * this.options.size >= this.options.totalRecords;
  }

  get totalPages(): number {
    return Math.ceil(this.options.totalRecords / this.options.size);
  }
}