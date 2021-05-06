import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
class FormPlan {
  id = '';
  guid = '';
  fecha_vencimiento = '';
  nombre = '';
  tipo = '';
  inscripcion = '';
  num_cuotas = '';
  mon_total = '';
  servicio_id = '';
  lapso_codigo = '';
  cuotas = [];
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.nombre = user.nombre;
    this.fecha_vencimiento = user.fecha_vencimiento;
    this.tipo = user.tipo;
    this.inscripcion = user.inscripcion;
    this.num_cuotas = user.num_cuotas;
    this.mon_total = user.mon_total;
    this.servicio_id = user.servicio_id;
    this.lapso_codigo = user.lapso_codigo;
  }
  get isFilter() {
    return this.nombre !== '' || this.fecha_vencimiento !== '' 
    || this.tipo !== '' || this.inscripcion !== ''
    || this.num_cuotas !== '' || this.mon_total !== ''
    || this.servicio_id !== '' || this.lapso_codigo !== '' || this.guid !== ''
  }
}
class Cuotas {
  nombre = '';
  valor = '';
  fecha_vencimiento = '';
  description	= '';
  plan_id = '';
  constructor(nombre = '',fecha_vencimiento = '', description = '', valor = '') {
    this.nombre = nombre;
    this.fecha_vencimiento = fecha_vencimiento;
    this.description = description;
    this.valor = valor;
  }
}
@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.scss']
})
export class PlanesComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormPlan();
  filter = new FormPlan();
  isNew = false;
  selected = new SelectItem();
  servicios = [];
  lapsos = [];
  cuotas = [];
  numeroCuotas  = [];
  carreras = [];
  serviciosEstudiantil = [];
  max_num_cuotas = 15;
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Gestión de planes';
    this.system.module.icon = 'handshake-o';
    this.max_num_cuotas = this.system.settingsService.Settings.max_num_cuotas;
    this.cuotasInit();
    await this.getService();
    await this.refreshData();
    if (!this.isNew) {
      //this.cuotasUpdate();
    }
  }
  new() {
    this.form = new FormPlan();
    this.isForm = true;
    this.isNew = true;
    this.cuotas = [];
  }
  async cancelar() {
    this.form = new FormPlan();
    this.loadData = false;
    this.isForm = false;
    await this.refreshData();
  }
  async edit(user) {
    await this.getLapso(true);
    this.form.edit(user);
    this.getCuotas();
    this.isForm = true;
    this.isNew = false;
  }
  save() {
    console.log(this.form);
    this.form.cuotas = this.cuotas;
    if (this.form.tipo === 'simple' && this.isNew) {
      this.form.num_cuotas = '1';
      this.form.cuotas.push(new Cuotas('Cuota 1',this.form.fecha_vencimiento,this.form.nombre,this.form.mon_total));
    } else {
      if (this.isNew) {
        this.form.fecha_vencimiento = this.cuotas[this.cuotas.length - 1].fecha_vencimiento;
      }
    }
    this.system.loading = true;
    this.system.post(this.isNew ? 'api/planes/create' : 'api/planes/update' , this.form).then(res => {
      try {
        this.system.loading = false;
        if (res.status === 200) {
          console.log(res);
          if (res.object === 1) {
            this.system.message(res.message, 'success');
          }
          if (this.isNew) {
            this.edit(res.object.res);
            this.cuotas = res.object.cuotas;
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
    this.system.post('api/planes/delete' , body).then(res => {
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
    return this.system.post('api/planes', {pagination: this.pagination, filter: this.filter }).then(res => {
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
  async getService() {
    this.servicios = await this.system.post('api/planes/servicios', {}).then(res => {
      try {
        if (res.status === 200) {
          return res.object;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });
    this.carreras = this.servicios.filter(x => x.carrera_id);
    this.serviciosEstudiantil = this.servicios.filter(x => !x.carrera_id);
  }
  async getLapso(isEdit = false) {
    const servicio_id = this.form.servicio_id;
    this.lapsos = await this.system.post('api/planes/lapsos', {servicio_id, isEdit}).then(res => {
      try {
        if (res.status === 200) {
          return res.object;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });
  }
  async getCuotas() {
    this.cuotas = await this.system.post('api/planes/cuotas', {plan_id: this.form.id}).then(res => {
      try {
        if (res.status === 200) {
          return res.object;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });
  }
  cuotasInit() {
    for(let i = 1;i < (this.max_num_cuotas + 1);i++) {
      this.numeroCuotas.push(i);
    }
  }
  cuotasUpdate() {
    this.cuotas = [];
    let iscuota1 = false;
    let numCuotas = Number(this.form.num_cuotas);
    const monXcuotas = Number(this.form.mon_total) / (numCuotas + (this.form.inscripcion ? 1 : 0));
    const lapso = this.lapsos.find(x => x.codigo === this.form.lapso_codigo);
    const fecha_v = lapso?.fecha_inicio;
    if (this.form.inscripcion) {
      iscuota1 = true;
      this.cuotas.push(new Cuotas('Inscripción', fecha_v, '', monXcuotas.toFixed(2)));
    }
    if (this.form.inscripcion) {
      //numCuotas = numCuotas - 1;
    }
    for(let i = 0;i < numCuotas;i++) {
      const e = new Date(fecha_v);
      e.setMonth(e.getMonth() + i);
      e.setDate(e.getDate() + 1);
      let fechaVencimiento = e.getMonth()+1 < 10 ? e.getFullYear() +"-"+ '0' + (e.getMonth()+1) +"-"+ (e.getDate() < 10 ? '0' + e.getDate() : e.getDate() ) : e.getFullYear() +"-"+ (e.getMonth()+1) +"-"+ (e.getDate() < 10 ? '0' + e.getDate() : e.getDate() );
      if (new Date(fechaVencimiento) > new Date(lapso?.fecha_final)) {
        const j = new Date(lapso.fecha_final);
        j.setDate(j.getDate() - 1);
        fechaVencimiento = j.getMonth()+1 < 10 ? j.getFullYear() +"-"+ '0' + (j.getMonth()+1) +"-"+ (j.getDate() < 10 ? '0' + j.getDate() : j.getDate() ) : j.getFullYear() +"-"+ (j.getMonth()+1) +"-"+ (j.getDate() < 10 ? '0' + j.getDate() : j.getDate() );
      }
      this.cuotas.push(new Cuotas('Cuota ' + (i + 1), fechaVencimiento, '', monXcuotas.toFixed(2)));
      //this.cuotas.push(new Cuotas('Cuota ' + (iscuota1 ? i + 2 : i + 1), fechaVencimiento, '', monXcuotas.toFixed(2)));
    }
  }
  initDelete() {
    displayModal('modal-delete');
  }
  modalDeleteClose() {
    hideModal('modal-delete');
  }
  resetFilter() {
    this.filter = new FormPlan();
    this.refreshData();
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData(true);
  }
  getNameService(id) {
    try {
      return this.servicios.find(x => x.id === id).nombre;
    } catch (error) {
      return '';
    }
  }
  changeTipo() {
    this.cuotas = [];
  }
}
