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
  servicio_id = 0;
  lapso_codigo = '';
  cuotas = [];
  periodo_id = '';
  mon_inscripcion = '';
  estado = '';
  horas = 0;
  edit(user) {
    console.log(user);
    this.guid = user.guid;
    this.id = user.id;
    this.nombre = user.nombre;
    this.fecha_vencimiento = user.fecha_vencimiento;
    this.tipo = user.tipo;
    this.inscripcion = user.inscripcion;
    this.num_cuotas = user.num_cuotas;
    this.mon_total = user.mon_total;
    this.servicio_id = Number(user.servicio_id);
    this.lapso_codigo = user.lapso_codigo;
    this.periodo_id = user.periodo_id;
    this.mon_inscripcion = user.mon_inscripcion;
    this.estado = user.estado;
    this.horas = user.horas;
  }
  get isFilter() {
    return this.nombre !== '' || this.fecha_vencimiento !== '' 
    || this.tipo !== '' || this.inscripcion !== ''
    || this.num_cuotas !== '' || this.mon_total !== ''
    || this.servicio_id !== 0 || this.lapso_codigo !== '' || this.guid !== '' || this.estado !== '' || this.tipo !== ''
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
  servicios = {data: [], dataAll: []};
  lapsos = [];
  cuotas = [];
  numeroCuotas  = [];
  carreras = [];
  serviciosEstudiantil = [];
  max_num_cuotas = 15;
  horas_materias = [];
  periodos: any = [];
  horas_planes = [];
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Gestión de planes';
    this.system.module.icon = 'handshake-o';
    this.max_num_cuotas = this.system.settingsService.Settings.max_num_cuotas;
    this.horas_materias = this.system.settingsService.Settings.horas_materias;
    this.cuotasInit();
    await this.getService();
    this.periodos = await this.getPeriodos();
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
    this.getHoras_planes();
  }
  async cancelar() {
    this.form = new FormPlan();
    this.loadData = false;
    this.isForm = false;
    await this.refreshData();
  }
  async edit(user) {
    await this.getLapso(true);
    if (user.tipo === 'materia') {
      this.getHoras_planes();
    }
    this.form.edit(user);
    this.getCuotas();
    this.isForm = true;
    this.isNew = false;
  }
  esVencido(obj) {
    const fechaActual = new Date();
    const year = new Date(fechaActual).getFullYear();
    const month = ('0' + (fechaActual.getMonth() + 1)).slice(-2);
    const day = ('0' + fechaActual.getDate()).slice(-2);
    const fechaToday = year + '-' + month + '-' + day;
    return new Date(obj.fecha_vencimiento).getTime() < new Date(fechaToday).getTime() && obj.estado !== 'pagado';
  }
  save() {
    console.log(this.form);
    this.form.cuotas = this.cuotas;
    if (this.form.servicio_id === 0) {
      this.form.servicio_id = null;
    }
    if (this.form.tipo !== 'complejo' && this.isNew) {
      this.form.num_cuotas = '1';
      this.form.cuotas.push(new Cuotas('Cuota 1',this.form.fecha_vencimiento,this.form.nombre,this.form.mon_total));
    } else {
      if (this.isNew) {
        this.form.fecha_vencimiento = this.fechaV.fecha_final;
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
            //this.cancelar();
            this.edit(res.object.res);
            this.cuotas = res.object.cuotas;
            this.system.message(res.message, 'success');
          } else {
            //this.getLapso(true);
            this.cuotas = res.object;
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
    return this.system.post('api/planes?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
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
    //this.carreras = this.servicios.filter(x => x.carrera_id);
    
  }
  get serviciosE() {
    try {
      if (this.isNew) {
        return this.servicios['data'].filter(x => !x.carrera_id);
      } else {
        return this.servicios['dataAll'].filter(x => !x.carrera_id);
      }
    } catch (error) {
      return [];
    }
  }
  async getLapso(isEdit = false, isInscripcion = false) {
    const servicio_id = this.form.servicio_id;
    const periodo_id = this.form.periodo_id;
    const inscripcion = isInscripcion;
    this.lapsos = [];
    this.lapsos = await this.system.post('api/planes/lapsos', {servicio_id, isEdit, periodo_id, inscripcion}).then(res => {
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
  async getPeriodos() {
    return this.cuotas = await this.system.post('api/planes/periodos', {}).then(res => {
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
  async getHoras_planes() {
    await this.system.post('api/planes/horas_planes', {}).then(res => {
      try {
        if (res.status === 200) {
          this.horas_planes = res.object;
        } else {
        }
      } catch (error) {
      }
    });
  }
  disabledHora(hora) {
    try {
      return this.horas_planes.find(x => x === hora);
    } catch (error) {
      return true;
    }
  }
  async activarPlan() {
    await this.system.post('api/planes/activar', {plan_id: this.form.id, form: this.form}).then(res => {
      try {
        if (res.status === 200) {
          console.log(res);
          this.system.message(res.message, 'success');
          this.form.estado = this.form.estado === 'activo' ? 'inactivo' : 'activo';
          //this.cancelar();
          //return res.object;
        } else {
          this.system.message(res.message, 'danger');
          return [];
        }
      } catch (error) {
        return [];
      }
    });
  }
  async asignarPlan() {
    await this.system.get('api/planes/asignar', {plan_id: this.form.id}).then(res => {
      try {
        if (res.status === 200) {
          console.log(res);
          return res.object;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });
  }
  inscripcionLote() {
    this.system.post('api/planes/inscripcion_lote', {plan_id: this.form.id}, true).then(res => {
      try {
        if (res.status === 200) {
          console.log(res);
          this.system.message(res.message, 'success');
          return true;
        } else {
          this.system.message(res.message, 'danger');
          return false;
        }
      } catch (error) {
        return false;
      }
    });
  }
  cuotasInit() {
    for(let i = 1;i < (this.max_num_cuotas + 1);i++) {
      this.numeroCuotas.push(i);
    }
  }
  cuotasUpdate() {
    //this.cuotas = [];
    if (this.isNew) {
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
      //return this.servicios.find(x => x.id === id).nombre;
      return '';
    } catch (error) {
      return '';
    }
  }
  changeTipo() {
    this.cuotas = [];
    if (this.form.tipo === 'inscripcion') {
      this.getLapso(true, true);
    }
  }
  changeValor(i) {
    console.log(i, this.form.mon_total);
    let suma = 0;
    for(let c of this.cuotas) {
      suma += Number(c.valor);
    }
    this.form.mon_total = String(suma);
    this.form.num_cuotas = String(this.cuotas.length);
    console.log(suma);
  }
  addCuota() {
    this.cuotas.push(new Cuotas('Cuota nueva', '', '', ''));
    this.form.num_cuotas = String(this.cuotas.length);
  }
  deleteCuota(index) {
    this.cuotas.splice(index,1);
    let suma = 0;
    for(let c of this.cuotas) {
      suma += Number(c.valor);
    }
    this.form.mon_total = String(suma);
    this.form.num_cuotas = String(this.cuotas.length);
  }
  async deleteCuotaId(obj) {
    const body = {ids: [obj.id]};
    this.cuotas = this.cuotas.filter(x => x.id !== obj.id);
    let suma = 0;
    for(let c of this.cuotas) {
      suma += Number(c.valor);
    }
    this.form.mon_total = String(suma);
    this.form.num_cuotas = String(this.cuotas.length);
    this.system.loading = true;
    this.system.post('api/planes/cuotas/delete' , body).then(res => {
      try {
        this.system.loading = false;
        if (res.status === 200) {
          //this.refreshData();
          //this.modalDeleteClose();
          this.getCuotas();
          this.save();
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
  get fechaV() {
    try {
      return this.lapsos.find(x => x.codigo === this.form.lapso_codigo) ? this.lapsos.find(x => x.codigo === this.form.lapso_codigo) : {fecha_inicio: '', fecha_final: ''} ;
    } catch (error) {
      return {fecha_inicio: '', fecha_final: ''};
    }
  }
}
