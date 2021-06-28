import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system.service';
import { displayModal, hideModal, PaginationBuild, refreshArrayPage } from 'src/app/services';
@Component({
  selector: 'app-payment-management',
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.scss']
})
export class PaymentManagementComponent implements OnInit {
  tabSelect = 0;
  payment_type = [{value: 'saldo', key: 'Saldo'}, {value: 'transferencia', key: 'Transferencia'}];
  bank = [{value: 'provincial', key: 'Provincial'}, {value: 'banesco', key: 'Banesco'}];
  carreras = [];
  cuotas = [];
  bancos = [];
  tipospago = [];
  form = new FormRePago();
  selectCuota = '';
  pagos = [];
  displayCuotas = false;
  pagination = new PaginationBuild();
  constructor(
    public system: SystemService
  ) { }

  async  ngOnInit() {
    this.system.module.name = 'Gestión de cuenta';
    this.system.module.icon = 'user';
    if (this.system.isStudent) {
      this.system.getSaldo();
    }
    this.system.getStatus();
    this.carreras = await this.getCarreras();
    this.cuotas = await this.getCuotas();
    // for (let i = 0;i < this.cuotas.length;i++) {
    //   this.cuotas[i].pagos = await this.getPagos(this.cuotas[i].id);
    //   let montopagado = 0;
    //   for(let j of this.cuotas[i].pagos) {
    //     console.log(parseFloat(j.monto));
    //     montopagado = montopagado + parseFloat(j.monto);
    //   }
    //   this.cuotas[i].pagado = montopagado;
    //   this.cuotas[i].monto = parseFloat(this.cuotas[i].monto);
    // }
    this.displayCuotas = true;
    this.bancos = await this.getBancos();
    this.tipospago = await this.getTiposDePago();
    console.log(this.cuotas);
  }
  async refreshData() {
    this.displayCuotas = false;
    this.cuotas = await this.getCuotas();
    for (let i = 0;i < this.cuotas.length;i++) {
      this.cuotas[i].pagos = await this.getPagos(this.cuotas[i].id);
      let montopagado = 0;
      for(let j of this.cuotas[i].pagos) {
        console.log(parseFloat(j.monto));
        montopagado = montopagado + parseFloat(j.monto);
      }
      this.cuotas[i].pagado = montopagado;
      this.cuotas[i].monto = parseFloat(this.cuotas[i].monto);
    }
    this.displayCuotas = true;
  }
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    await this.refreshData();
  }
  async getCarreras() {
     return await this.system.post('api/estudiante/carreras', {}).then(res => {
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
  async getCuotas() {
    return await this.system.post('api/estudiante/cuotas?page=' + this.pagination.page, {pagination: this.pagination}).then(res => {
       try {
         if (res.status === 200) {
           console.log(res);
           this.pagination.init(res.object);
           return res.object.data;
         } else {
           return [];
         }
       } catch (error) {
         return [];
       }
     });
 }
 async getBancos() {
  return await this.system.post('api/estudiante/bancos', {}, false).then(res => {
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
async getTiposDePago() {
  return await this.system.post('api/estudiante/tipospago', {}, false).then(res => {
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
async getPagos(id) {
  return await this.system.post('api/estudiante/pagos', {c_c_e_lapso: id}, false).then(res => {
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

  selectTab(tab) {
    this.tabSelect = tab;
  }
  initPay(id) {
    this.selectCuota = id;
    displayModal('modal-pay');
  }
  modalPayClose() {
    hideModal('modal-pay');
  }
  initCardPay() {
    displayModal('modal-cardPay');
  }
  modalCardPayClose() {
    hideModal('modal-cardPay');
  }
  confirm() {
    this.form.addCuota(this.selectCuota);
    this.form.monto = this.system.toD(this.form.montobs);
    this.form.montobs_cambio = this.system.dolar.valor;
    console.log(this.form);
    this.system.post('api/estudiante/reportarpago', this.form, true).then(async (res) => {
      try {
        if (res.status === 200) {
          console.log(res);
          this.modalPayClose();
          this.displayCuotas = false;
          this.cuotas = await this.getCuotas();
          this.form.reset();
          for (let i = 0;i < this.cuotas.length;i++) {
            this.cuotas[i].pagos = await this.getPagos(this.cuotas[i].id);
            let montopagado = 0;
            for(let j of this.cuotas[i].pagos) {
              console.log(parseFloat(j.monto));
              montopagado = montopagado + parseFloat(j.monto);
            }
            this.cuotas[i].pagado = montopagado;
            this.cuotas[i].monto = parseFloat(this.cuotas[i].monto);
          }
          this.displayCuotas = true;
        } else {
        }
      } catch (error) {
      }
    });
  }
  verPagos(obj) {
    console.log(obj);
    this.pagos = obj.pagos;
    displayModal('modal-pagos');
  }
  modalPagosClose() {
    hideModal('modal-pagos');
  }
  gettipopago(id) {
    return this.tipospago.find(x => x.id === id)?.nombre;
  }
  getBanco(id) {
    return this.bancos.find(x => x.id === id)?.nombre;
  }
  esVencido(obj) {
    const fechaActual = new Date();
    const year = new Date(fechaActual).getFullYear();
    const month = ('0' + (fechaActual.getMonth() + 1)).slice(-2);
    const day = ('0' + fechaActual.getDate()).slice(-2);
    const fechaToday = year + '-' + month + '-' + day;
    return new Date(obj.fecha_vencimiento).getTime() < new Date(fechaToday).getTime() && obj.estado !== 'pagado';
  }
  getTotalPagado(obj) {
    let val = 0;
    for(let i of obj) {
      val += Number(i.montobs);
    }
    return Number(val);
  }
}
class FormRePago {
  id = '';
  guid = '';
  titular_nombre = '';
  titular_apellido = '';
  titular_cedula = '';
  titular_telefono = '';
  tipo_pago_id = '';
  banco_id = '';
  fecha = '';
  referencia = '';
  montobs = '';
  monto = 0;
  c_c_e_lapso = '';
  user_id = '';
  montobs_cambio = 0;
  addCuota(id) {
    this.c_c_e_lapso = id;
  }
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.titular_nombre = user.titular_nombre;
    this.titular_apellido = user.titular_apellido;
    this.titular_cedula = user.titular_cedula;
    this.titular_telefono = user.titular_telefono;
    this.tipo_pago_id = user.tipo_pago_id;
    this.banco_id = user.banco_id;
    this.fecha = user.fecha;
    this.referencia = user.referencia;
    this.montobs = user.montobs;
    this.monto = user.monto;
    this.montobs_cambio = user.montobs_cambio;
  }
  reset() {
    this.guid = '';
    this.id = '';
    this.titular_nombre = '';
    this.titular_apellido = '';
    this.titular_cedula = '';
    this.titular_telefono = '';
    this.tipo_pago_id = '';
    this.banco_id = '';
    this.fecha = '';
    this.referencia = '';
    this.montobs = '';
    this.monto = 0;
    this.montobs_cambio = 0;
  }
  get isValidated() {
    return this.titular_nombre !== '' && this.titular_apellido !== '' 
    && this.titular_cedula !== '' && this.titular_telefono !== ''
    && this.tipo_pago_id !== '' && this.banco_id !== ''
    && this.fecha !== '' && this.referencia !== '' && this.montobs !== ''
  }
}