import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
class FormTipoPago {
  id = '';
  guid = '';
  nombre = '';
  description = '';
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.nombre = user.nombre;
    this.description = user.description;
  }
  get isFilter() {
    return this.nombre !== '' || this.description !== '';
  }
}
@Component({
  selector: 'app-tipo-pago',
  templateUrl: './tipo-pago.component.html',
  styleUrls: ['./tipo-pago.component.scss']
})
export class TipoPagoComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormTipoPago();
  filter = new FormTipoPago();
  isNew = false;
  selected = new SelectItem();
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Tipos de pago';
    this.system.module.icon = 'money';
    await this.refreshData();
  }
  new() {
    this.form = new FormTipoPago();
    this.isForm = true;
    this.isNew = true;
  }
  async cancelar() {
    this.form = new FormTipoPago();
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
    this.system.post(this.isNew ? 'api/tipospagos/create' : 'api/tipospagos/update' , this.form).then(res => {
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
    this.system.post('api/tipospagos/delete' , body).then(res => {
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
    return this.system.post('api/tipospagos', {pagination: this.pagination, filter: this.filter }).then(res => {
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
    this.filter = new FormTipoPago();
    this.refreshData();
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData();
  }
}
