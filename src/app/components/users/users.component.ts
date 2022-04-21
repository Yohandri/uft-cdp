import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
class PaginationBuild {
  page = 1;
  per_page = 10;
  last_page = 0;
  pages = [];
  init(res) {
    this.pages = [];
    this.last_page = res.last_page;
    for (let i = 1;i <= res.last_page;i++) {
      if (this.page + 4 >= i + 2 && this.page - 4 <= i - 2) {
        this.pages.push(i);
      }
    }
    if (this.pages.length === 1) {
      this.pages = [];
    }
  }
}
class FormUser {
  id = '';
  cedula = '';
  nombre = '';
  apellido = '';
  correo = '';
  profile_id = '';
  password = '';
  rp_user = {profile_id: 0}
  edit(user) {
    this.cedula = user.cedula;
    this.nombre = user.nombre;
    this.apellido = user.apellido;
    this.correo = user.correo;
    this.rp_user.profile_id = user.rp_user.profile_id;
    this.id = user.id;
  }
  get isFilter() {
    return this.cedula != '' || this.nombre !== '' || this.apellido !== '' || this.profile_id !== '';
  }
}
class SelectItem {
  value = [];
  isSelectAll = false;
  init(data) {
    for(let i = 0;i < data.length;i++) {
      this.value[data[i].id] = {id: data[i].id, value: false};
    }
  }
  selectAll() {
    if (this.isSelectAll) {
      this.reset();
    } else {
      for(let i of this.value) {
        if (i) {
          i.value = true;
        }
      }
      this.isSelectAll = true;
    }
  }
  reset() {
    for(let i of this.value) {
      if (i) {
        i.value = false;
      }
    }
    this.isSelectAll = false;
  }
  get selected() {
    const s = this.value.filter(x => x.value);
    let val = [];
    for(let i = 0;i < s.length;i++) {
      val.push(s[i].id);
    }
    return val;
  }
}
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormUser();
  filter = new FormUser();
  isNew = false;
  selected = new SelectItem();
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Gestión de usuarios';
    this.system.module.icon = 'user';
    if (this.system.isMobile) {
      this.system.module.name = 'Usuarios';
    }
    await this.refreshData();
    console.log(this.data);
  }
  new() {
    this.form = new FormUser();
    this.isForm = true;
    this.isNew = true;
  }
  async cancelar() {
    this.form = new FormUser();
    this.loadData = false;
    this.isForm = false;
    await this.refreshData();
  }
  edit(user) {
    this.form.edit(user);
    this.isForm = true;
    this.isNew = false;
  }
  save() {
    console.log(this.form);
    this.system.loading = true;
    this.system.post(this.isNew ? 'api/users/create' : 'api/users/update' , this.form).then(res => {
      try {
        this.system.loading = false;
        if (res.status === 200) {
          console.log(res);
          if (res.object) {
            this.system.message(res.message, 'success');
          }
          if (this.isNew) {
            this.edit(res.object);
            this.system.message(res.message, 'success');
          }
          return res;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    });
  }
  delete() {
    const body = {ids: this.selected.selected};
    this.system.loading = true;
    this.system.post('api/users/delete' , body).then(res => {
      try {
        this.system.loading = false;
        if (res.status === 200) {
          this.refreshData();
          this.modalDeleteClose();
          this.system.message(res.message, 'success');
          return res;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    });
  }
  async refreshData() {
    this.data = [];
    this.loadData = false;
    this.selected.reset();
    return this.system.post('api/users?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
      try {
        this.loadData = true;
        if (res.status === 200) {
          this.pagination.init(res.object);
          this.selected.init(res.object.data);
          this.data = res.object.data;
          return res.object.data;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });
  }
  initDelete() {
    displayModal('modal-delete');
  }
  modalDeleteClose() {
    hideModal('modal-delete');
  }
  resetFilter() {
    this.filter = new FormUser();
    this.refreshData();
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData();
  }
  getNameProfile(id) {
    if (id === 1) {
      return 'Administrador';
    }
    if (id === 2) {
      return 'Administración';
    }
    if (id === 3) {
      return 'Estudiante';
    }
    if (id === 4) {
      return 'Coordinador';
    }
    if (id === 5) {
      return 'Caja';
    } 
  }
  get isValidForm() {
    try {
      return this.form.cedula !== '' && this.form.nombre !== '' && this.form.apellido && this.form.correo !== ''
      && this.form.rp_user.profile_id !== 0 && this.form.password !== '';
    } catch (error) {
      return false
    }
  }
}
