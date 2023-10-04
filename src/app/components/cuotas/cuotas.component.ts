import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
class FormCuota {
  id = '';
  guid = '';
  nombre = '';
  description = '';
  fecha_vencimiento = '';
  cedula = '';
  estado = '';
  monto = '';
  carrera = '';
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.nombre = user.nombre;
    this.description = user.description;
    this.fecha_vencimiento = user.fecha_vencimiento;
    this.cedula = user.cedula;
    this.estado = user.estado;
    this.monto = user.monto;
    this.carrera = user?.c_e_lapso?.carrera?.nombre;
  }
  get isFilter() {
    return this.nombre !== '' || this.description !== '' || this.fecha_vencimiento !== '' || this.cedula !== ''
    || this.estado !== '' || this.monto !== '' || this.carrera !== '';
  }
}
@Component({
  selector: 'app-cuotas',
  templateUrl: './cuotas.component.html',
  styleUrls: ['./cuotas.component.scss']
})
export class CuotasComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormCuota();
  filter = new FormCuota();
  isNew = false;
  selected = new SelectItem();
  isEdit = false;
  objedit: any = {};
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Cuotas';
    this.system.module.icon = 'archive';
    await this.refreshData();
  }
  async refreshData() {
    this.data = [];
    this.loadData = false;
    this.selected.reset();
    return this.system.post('api/cuotas?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
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
  delete() {
    const body = {ids: this.selected.selected};
    console.log(body);
    this.system.loading = true;
    this.system.post('api/cuotas/cuotasAnular' , body).then(res => {
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
  async descargar_cuotas() {
    const body = {filter: this.filter};
    console.log(body);
    return await this.system.getDownloadFile_cuota('api/cuotas/exportar?p=' + JSON.stringify(body), body, true).then(res => {
      try {
        //this.descargar_pagos_close();
        return true;
      } catch (error) {
        return false;
      }
    });
  }
  cuotas_lote() {
    this.system.post('api/planes/cuotas_lote', {}).then(res => {
      try {
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    });
  }
  async cancelar() {
    this.form = new FormCuota();
    this.loadData = false;
    this.isForm = false;
    await this.refreshData();
  }
  edit(user) {
    this.form.edit(user);
    this.objedit = user;
    this.isForm = true;
    this.isNew = false;
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData();
  }
  resetFilter() {
    this.filter = new FormCuota();
    this.refreshData();
  }
  initDelete() {
    displayModal('modal-delete');
  }
  modalDeleteClose() {
    hideModal('modal-delete');
  }
  toFixed(mon) {
    try {
      return parseFloat(mon).toFixed(2);
    } catch (error) {
      return mon;
    }
  }

  get pagos() {
    try {
      return this.objedit?.pagos_3 || [];
    } catch (error) {
      return [];
    }
  }

}
