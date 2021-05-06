import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
class FormPago {
  id = '';
  guid = '';
  referencia = '';
  monto = '';
  fecha = '';
  description = '';
  tipo_pago_id = '';
  user_id = '';
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.referencia = user.referencia;
    this.monto = user.monto;
    this.fecha = user.fecha;
    this.description = user.description;
    this.tipo_pago_id = user.tipo_pago_id;
    this.user_id = user.user_id;
  }
  get isFilter() {
    return this.referencia !== '' || this.monto !== '' 
    || this.fecha !== '' || this.description !== '' || this.tipo_pago_id !== '' || this.user_id !== '';
  }
}
@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss']
})
export class PagosComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormPago();
  filter = new FormPago();
  isNew = false;
  selected = new SelectItem();
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Pagos';
    this.system.module.icon = 'usd';
    await this.refreshData();
  }
  new() {
    this.form = new FormPago();
    this.isForm = true;
    this.isNew = true;
  }
  async cancelar() {
    this.form = new FormPago();
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
    this.system.post(this.isNew ? 'api/pagos/create' : 'api/pagos/update' , this.form).then(res => {
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
    this.system.post('api/pagos/delete' , body).then(res => {
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
    return this.system.post('api/pagos', {pagination: this.pagination, filter: this.filter }).then(res => {
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
    this.filter = new FormPago();
    this.refreshData();
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData();
  }

}
