import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AuthApiService } from 'src/app/shared/services/authApi.service';
import { UserListService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent {
  role = { 0: 'SuperAdmin', 1: 'MiniAdmin', 2: 'State', 3: 'City', 4: 'Main', 5: 'Player' };
  adminMini = [];
  state = [];
  city = [];
  main = [];

  players:[];

  test = [];
  test1 = [];
  test2 = [];
  myForm: any = { "email": "GKOO", "role_id": "2", "mini_id": "", "state_id": "", "city_id": "", "main_id": "" };
  constructor(
    public authService: AuthService,
    public authApiService: AuthApiService,
    private userService: UserListService,

  ) { }
  testSet(d) { console.log('test1', d); }

  ngOnInit(): void {
    this.getAdminMiniIdData()
  }
  resetForm() {
    this.state = []; this.city = []; this.main = [];
  }
  roleChanged(d) {
    if (d == 1) {
      this.myForm.email = 'GK01'
    } else {
      this.myForm.email = 'GK00'
    }
  }
  //
  getAdminMiniIdData() {
    this.userService.getAdminMiniIdData().subscribe(d => {
      this.adminMini = d.data;
    });
  }
  getStateOfAdmin(d) {
    this.city = []; this.state = []; this.main = [];
    this.myForm['state_id'] = ''; this.myForm['city_id'] = ''; this.myForm['main_id'] = '';
    this.userService.getStateOfAdmin({ state_id: d }).subscribe((d: any) => {
      this.state = d.data;

    });
  }
  getCitybyState(d) {
    this.city = []; this.main = [];
    this.myForm['city_id'] = ''; this.myForm['main_id'] = '';
    this.userService.getCitybyState({ state_id: d }).subscribe((d: any) => {
      this.city = d.data;

    });
  }
  getmainbycity(d) {
    this.main = [];
    this.myForm['main_id'] = '';
    this.userService.getmainbycity({ state_id: d }).subscribe((d: any) => {
      this.main = d.data;

    });
  }

  ///
  createPlayerId() {
    // {password: 3930, admin_number: "", email: "GK00101234", role_id: 5, main_id: "GK00100210"}
    let data = { password: this.randPass(), idManager: this.myForm.main_id, email: this.myForm.email }

    this.authApiService.createPlayerId(data).subscribe((d: any) => {
      if (d.status == 200) {
        this.authService.ShowSuccess(d.message);
        window.location.reload();

      } else {
        this.authService.showError(d.message);
      }
    });
  }
  createMainId() {
    //{password: 5243, admin_number: "", email: "GK00003012", role_id: 4, city_id: "GK00301234"}
    let data = { password: this.randPass(), idManager: this.myForm.city_id, email: this.myForm.email }
    this.authApiService.createMainId(data).subscribe(d => {
      if (d.status == 200) {
        this.authService.ShowSuccess(d.message);
        window.location.reload();
      } else {
        this.authService.showError(d.message);
      }
    });
  }
  createStateId() {
    // {password: 8603, admin_number: "", email: "GK00200000", role_id: 2}
    let data = { password: this.randPass(), idManager: this.myForm.mini_id, email: this.myForm.email }
    this.authApiService.createStateId(data).subscribe(d => {

      if (d.status === 200) {
        this.authService.ShowSuccess(d.message);
        window.location.reload();
      } else {
        this.authService.showError(d.message);
      }
    });
  }
  createCityId() {
    //{password: 5342, admin_number: "", email: "GK00101234", role_id: 3, state_id: "GK00101234"}
    let data = { password: this.randPass(), idManager: this.myForm.state_id, email: this.myForm.email }

    this.authApiService.createCityId(data).subscribe(d => {
      if (d.status == 200) {
        this.authService.ShowSuccess(d.message);
        window.location.reload();
      } else {
        this.authService.showError(d.message);
      }

    });
  }
  createMiniAdminId() {
    //{password: 5342, admin_number: "", email: "GK00101234", role_id: 3, state_id: "GK00101234"}
    let data = { password: this.randPass(),idManager: "admin@admin.com",  email: this.myForm.email, role_id: 1 }

    this.authApiService.adduserbyadmin(data).subscribe(d => {
      if (d.status == 200) {
        this.authService.ShowSuccess(d.message);
        window.location.reload();
      } else {
        this.authService.showError(d.message);
      }

    });
  }
  onSubmit(d) {
    if (this.myForm.role_id === '1') {
      // if (!this.myForm.mini_id) {
      //   this.authService.showError('Manger Id required');
      // } else {
      this.createMiniAdminId();
      //}

    } else if (this.myForm.role_id === '2') {
      if (!this.myForm.mini_id) {
        this.authService.showError('Manger Id required');
      } else {
        this.createStateId();
      }

    } else if (this.myForm.role_id === '3') {
      if (!this.myForm.state_id) {
        this.authService.showError('Manger Id required');

      } else {
        this.createCityId();
      }

    } else if (this.myForm.role_id === '4') {
      if (!this.myForm.city_id) {
        this.authService.showError('Manger Id required');

      } else {
        this.createMainId();
      }

    } else if (this.myForm.role_id === '5') {
      if (!this.myForm.city_id) {
        this.authService.showError('Manger Id required');

      } else {
        this.createPlayerId();
      }

    }
  }

  randPass() {
    return Math.floor(Math.random() * 9000) + 1000;

  }
  handleResponse(response) {
    if (response.status === 200) {

      this.authService.ShowSuccess("Point transfered Successfully");
      // this.router.navigate(['/admin/dashboard']);
    } else {
      this.authService.showError(response.message);
    }


  }
  getbymanager(e){
    if(this.myForm.main_id){
      this.userService.getEmailsByManager({ idManager: this.myForm.main_id}).subscribe((d: any) => {
        this.players = d.data;
  
      });
    }
  
  }
}
