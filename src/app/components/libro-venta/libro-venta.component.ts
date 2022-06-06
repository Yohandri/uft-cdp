import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-libro-venta',
  templateUrl: './libro-venta.component.html',
  styleUrls: ['./libro-venta.component.scss']
})
export class LibroVentaComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormLibroVenta();
  filter = new FormLibroVenta();
  isNew = false;
  selected = new SelectItem();
  periodos = [];
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Libro ventas';
    this.system.module.icon = 'book';
    //await this.getPeriodos();
    await this.refreshData();
  }

  new() {
    this.form = new FormLibroVenta();
    this.isForm = true;
    this.isNew = true;
  }
  async cancelar() {
    this.form = new FormLibroVenta();
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
  save() {
    console.log(this.form);
    this.system.loading = true;
    this.system.post(this.isNew ? 'api/libroVenta/create' : 'api/libroVenta/update' , this.form).then(res => {
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
    this.system.post('api/libroVenta/delete' , body).then(res => {
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
    return this.system.post('api/libroVenta?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
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
    this.filter = new FormLibroVenta();
    this.refreshData();
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData(true);
  }

}
class FormLibroVenta {
  id = '';
  guid = '';
  nombre = '';
  descripcion = '';
  periodo_id = '';
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.nombre = user.nombre;
    this.descripcion = user.descripcion;
    this.periodo_id = user.periodo_id;
  }
  get isFilter() {
    return this.nombre !== '' || this.descripcion !== '';
  }
}