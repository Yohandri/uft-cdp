import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';

class FormService {
  id = '';
  guid = '';
  nombre = '';
  description = '';
  periodo_id = '';
  l_venta_id = '';
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.nombre = user.nombre;
    this.description = user.description;
    this.periodo_id = user.periodo_id;
    this.l_venta_id = user.l_venta_id;
  }
  get isFilter() {
    return this.nombre !== '' || this.description !== '';
  }
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormService();
  filter = new FormService();
  isNew = false;
  selected = new SelectItem();
  periodos = [];
  libros_contable = [];
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Gestión de servicios';
    this.system.module.icon = 'server';
    if (this.system.isMobile) {
      this.system.module.name = 'Servicios';
    }
    await this.getPeriodos();
    await this.refreshData();
    await this.getLibrosContables();
  }
  new() {
    this.form = new FormService();
    this.isForm = true;
    this.isNew = true;
  }
  async cancelar() {
    this.form = new FormService();
    this.loadData = false;
    this.isForm = false;
    await this.refreshData();
  }
  edit(user) {
    this.form.edit(user);
    this.isForm = true;
    this.isNew = false;
  }
  async sincronizar() {
    this.loadData = false;
    //this.selected.reset();
    return this.system.post('api/servicios/syncup', {}).then(res => {
      try {
        this.loadData = true;
        console.log(res);
        if (res.status === 200) {
          this.refreshData();
          if (res.object) {
            this.system.message(res.message, 'success');
          }
          return res.object;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    });
  }
  async getPeriodos() {
    this.loadData = false;
    //this.selected.reset();
    return this.system.post('api/servicios/periodos', {}).then(res => {
      try {
        this.loadData = true;
        console.log(res);
        if (res.status === 200) {
          this.periodos = res.object;
          return res.object;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    });
  }
  async getLibrosContables() {
    this.loadData = false;
    //this.selected.reset();
    return this.system.post('api/servicios/libros_contable', {}).then(res => {
      try {
        this.loadData = true;
        console.log(res);
        if (res.status === 200) {
          this.libros_contable = res.object;
          return res.object;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    });
  }
  save() {
    console.log(this.form);
    this.system.loading = true;
    this.system.post(this.isNew ? 'api/servicios/create' : 'api/servicios/update' , this.form).then(res => {
      try {
        this.system.loading = false;
        if (res.status === 200) {
          console.log(res);
          if (res.object === 1) {
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
    this.system.post('api/servicios/delete' , body).then(res => {
      try {
        this.system.loading = false;
        if (res.status === 200) {
          this.refreshData();
          this.modalDeleteClose();
          this.system.message(res.message, 'success');
          return res;
        } else {
          if (res.status === 204) {
            this.system.message(res.message, 'danger');
          }
          return false;
        }
      } catch (error) {
        return false;
      }
    });
  }
  async refreshData(gopage = false) {
    this.data = [];
    this.loadData = false;
    this.selected.reset();
    if (!gopage && this.filter.isFilter) {
      this.pagination.page = 1;
    }
    return this.system.post('api/servicios?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
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
    this.filter = new FormService();
    this.refreshData();
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData(true);
  }

}
