import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
class FormPago {
  id = '';
  guid = '';
  referencia = '';
  titular_cedula = '';
  titular_nombre = '';
  titular_apellido = '';
  titular_telefono = '';
  monto = '';
  fecha = '';
  description = '';
  tipo_pago_id = '';
  user_id = '';
  banco_id = '';
  montobs = 0;
  montobs_confirm = '';
  montobs_cambio = '';
  cedula = '';
  tipo = '';
  user = {nombre: '', apellido: '', cedula: ''};
  c_servicio = {nombre: '', tipo: ''};
  c_c_e_lapso = {c_e_lapso: {carrera: {nombre: ''}}}
  tipo_pago_caja = '';
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.referencia = user.referencia;
    this.monto = user.monto;
    this.fecha = user.fecha;
    this.description = user.description;
    this.tipo_pago_id = user.tipo_pago_id;
    this.user_id = user.user_id;
    this.banco_id = user.banco_id;
    this.titular_cedula = user.titular_cedula;
    this.titular_nombre = user.titular_nombre;
    this.titular_apellido = user.titular_apellido;
    this.titular_telefono = user.titular_telefono;
    this.titular_cedula = user.titular_cedula;
    this.montobs = user.montobs;
    this.montobs_confirm = user.montobs_confirm;
    this.montobs_cambio = user.montobs_cambio;
    this.cedula = user.cedula;
    this.user = user.user;
    this.c_servicio = user?.c_servicio;
    this.c_c_e_lapso = user?.c_c_e_lapso;
    this.tipo = user.tipo;
    this.tipo_pago_caja = user.tipo_pago_caja;
  }
  get isFilter() {
    return this.referencia !== '' || this.monto !== '' 
    || this.fecha !== '' || this.description !== '' || this.tipo_pago_id !== '' || this.user_id !== '' || this.titular_cedula
    || this.banco_id !== ''|| this.titular_nombre !== ''|| this.titular_apellido !== '' || this.cedula !== '';
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
  tipospago = [];
  bancos = [];
  urlUpload = '';
  banco_id = '';
  from = '';
  to = '';
  confirm = '';
  type = '';
  constructor(
    public system: SystemService,
    private msg: NzMessageService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Pagos';
    this.system.module.icon = 'usd';
    this.changeBank();
    this.tipospago = await this.getTiposDePago();
    this.bancos = await this.getBancos();
    await this.refreshData();
  }
  changeBank() {
    setTimeout(() => {
      this.urlUpload = this.system.settingsService.Settings.endpoint + 'api/planes/import_' + (this.banco_id === '1' ? 'provincial' : (this.banco_id === '2' ?  'banesco' : 'mercantil'));
    }, 100);
  }
  handleChange(info: NzUploadChangeParam): void {
    console.log(info);
    if (info.type === 'success') {
      const res = info.fileList[0].response;
      if (res.status === 200) {
        this.msg.success(`${info.file.name} cargado con éxito`);
      }
      if (res.status === 204) {
        this.msg.error(`${res.message}`);
      }
    }
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    // if (info.file.status === 'done') {
    //   this.msg.success(`${info.file.name} file uploaded successfully`);
    // } else if (info.file.status === 'error') {
    //   this.msg.error(`${info.file.name} file upload failed.`);
    // }
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
  descargar_pagos_open() {
    displayModal('modal-download');
  }
  descargar_pagos_close() {
    hideModal('modal-download');
    this.from = '';
    this.to = '';
  }
  async descargar_pagos() {
    const body = {from: this.from, to: this.to, confirm: this.confirm, type: this.type};
    console.log(body);
    return await this.system.getDownloadFile('api/pagos/exportar?p=' + JSON.stringify(body), body, true).then(res => {
      try {
        //this.descargar_pagos_close();
        return true;
      } catch (error) {
        return false;
      }
    });
  }
  async getTiposDePago() {
    return await this.system.post('api/estudiante/tipospago', {}, true).then(res => {
       try {
         if (res.status === 200) {
           console.log(res);
           res.object.push({id: 3, nombre: 'Caja'});
           return res.object;
         } else {
           return [];
         }
       } catch (error) {
         return [];
       }
     });
  }
  async getBancos() {
    return await this.system.post('api/estudiante/bancos', {}, true).then(res => {
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
    return this.system.post('api/pagos?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
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
  openUpoad() {
    displayModal('modal-upload');
  }
  modalUploadClose() {
    hideModal('modal-upload');
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData();
  }
  gettipopago(id) {
    return this.tipospago.find(x => x.id === id)?.nombre;
  }
  getBanco(id) {
    return this.bancos.find(x => x.id === id)?.nombre;
  }
  toFixed(mon) {
    try {
      return parseFloat(mon).toFixed(2);
    } catch (error) {
      return mon;
    }
  }
  async confirmar_pagos() {
    await this.system.get('api/planes/confirmar_pagos', {}, true).then(async (res) => {
       try {
         if (res.status === 200) {
           console.log(res);
            await this.refreshData();
         } 
       } catch (error) {
         console.log(error);
       }
     });
  }
  getdisabled() {
    return this.banco_id === '';
  }
  get token() {
    try {
      return 'Bearer ' +  localStorage.getItem('access_token');
    } catch (error) {
      
    }
  }
}
