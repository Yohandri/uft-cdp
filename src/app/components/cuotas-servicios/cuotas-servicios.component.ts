import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
class FormCuota {
  id = '';
  guid = '';
  nombre = '';
  description = '';
  created_at = '';
  cedula = '';
  estado = '';
  monto = '';
  tipo = '';
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.nombre = user.nombre;
    this.description = user.description;
    this.created_at = user.created_at;
    this.cedula = user.cedula;
    this.estado = user.estado;
    this.monto = user.monto;
    this.tipo = user?.tipo;
  }
  get isFilter() {
    return this.nombre !== '' || this.description !== '' || this.created_at !== '' || this.cedula !== ''
    || this.estado !== '' || this.monto !== '' || this.tipo !== '';
  }
}
@Component({
  selector: 'app-cuotas-servicios',
  templateUrl: './cuotas-servicios.component.html',
  styleUrls: ['./cuotas-servicios.component.scss']
})
export class CuotasServiciosComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormCuota();
  filter = new FormCuota();
  isNew = false;
  selected = new SelectItem();
  isEdit = false;
  constructor(
    public system: SystemService
  ) { }
  async ngOnInit() {
    this.system.module.name = 'Cuotas de servicios';
    this.system.module.icon = 'square-o';
    await this.refreshData();
  }
  async refreshData() {
    this.data = [];
    this.loadData = false;
    this.selected.reset();
    return this.system.post('api/servicios/cuotasEstudiantes?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
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
  async cancelar() {
    this.form = new FormCuota();
    this.loadData = false;
    this.isForm = false;
    await this.refreshData();
  }
  edit(user) {
    //this.form.edit(user);
    //this.isForm = true;
    //this.isNew = false;
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

}
