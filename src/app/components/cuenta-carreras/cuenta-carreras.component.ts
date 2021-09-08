import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-cuenta-carreras',
  templateUrl: './cuenta-carreras.component.html',
  styleUrls: ['./cuenta-carreras.component.scss']
})
export class CuentaCarrerasComponent implements OnInit {
  carreras = [];
  cuotas = [];
  bancos = [];
  tipospago = [];
  form = new FormRePago();
  selectCuota = '';
  pagos = [];
  displayCuotas = false;
  pagination = new PaginationBuild();
  PagosSelected = new SelectItem();
  selected = new SelectItem();
  constructor(
    public system: SystemService
  ) { }

  async  ngOnInit() {
    this.system.module.name = 'Gestión de carreras';
    this.system.module.icon = 'bookmark';
    if (this.system.isStudent) {
      this.system.getSaldo();
    }
    this.system.getStatus();
    this.carreras = await this.getCarreras();
    await this.refreshData();
    // this.cuotas = await this.getCuotas();
    // this.PagosSelected.reset();
    // const pagosSelelect = [];
    // for (let i = 0;i < this.cuotas.length;i++) {
    //   this.cuotas[i].pagos = await this.getPagos(this.cuotas[i].id);
    //   let montopagado = 0;
    //   for(let j of this.cuotas[i].pagos) {
    //     pagosSelelect.push(j);
    //     console.log(parseFloat(j.monto));
    //     montopagado = montopagado + parseFloat(j.monto);
    //   }
    //   this.cuotas[i].pagado = montopagado;
    //   this.cuotas[i].monto = parseFloat(this.cuotas[i].monto);
    // }
    // this.PagosSelected.init(pagosSelelect);
    this.displayCuotas = true;
    this.bancos = await this.getBancos();
    this.tipospago = await this.getTiposDePago();
    console.log(this.cuotas);
  }
  showConfirm() {
    try {
      if (this.form.tipo_pago_id === '2') {
        return this.restarSaldo(this.system.saldo) >= 0;
      } else {
        return true;
      }
    } catch (error) {
      return false;
    }
  }
  async refreshData() {
    this.displayCuotas = false;
    this.PagosSelected.reset();
    this.cuotas = await this.getCuotas();
    const pagosSelelect = [];
    this.selected.init(this.cuotas);
    for (let i = 0;i < this.cuotas.length;i++) {
      //this.cuotas[i].pagos = await this.getPagos(this.cuotas[i].id);
      let montopagado = 0;
      for(let j of this.cuotas[i].pagos) {
        pagosSelelect.push(j);
        console.log(parseFloat(j.monto));
        montopagado = montopagado + parseFloat(j.monto);
      }
      this.cuotas[i].pagado = montopagado;
      this.cuotas[i].monto = parseFloat(this.cuotas[i].monto);
    }
    this.PagosSelected.init(pagosSelelect);
    console.log(this.PagosSelected);
    this.system.getStatus();
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

PagoDelete() {
  const body = {ids: this.PagosSelected.selected};
  this.system.loading = true;
  this.system.post('api/pagos/delete' , body).then(res => {
    try {
      this.system.loading = false;
      if (res.status === 200) {
        this.refreshData();
        this.modalPagosClose();
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
changeTypePay(tipo) {
  if (tipo === '2') {
    this.form.montobs = this.system.toBs(this.montoAPagar);
    this.form.resetBanco();
    this.system.getSaldo();
  }
}
restarSaldo(saldo) {
  try {
    return Number(saldo) - Number(this.form.montobs);
  } catch (error) {
    return saldo;
  }
}
operarResta(i) {
  try {
    return (i.monto - i.pagado);
  } catch (error) {
    console.log(error);
    return 0;
  }
}
  // selectTab(tab) {
  //   this.tabSelect = tab;
  // }
  get montoAPagar() {
    try {
      return this.operarResta(this.cuotas.find(x => x.id === this.selectCuota));
    } catch (error) {
      return 0;
    }
  }
  initPay(id) {
    this.selectCuota = id;
    this.changeTypePay(this.form.tipo_pago_id);
    displayModal('modal-pay');
  }
  modalPayClose() {
    this.form.montobs = '0';
    hideModal('modal-pay');
  }
  initCardPay() {
    displayModal('modal-cardPay');
  }
  modalCardPayClose() {
    hideModal('modal-cardPay');
  }
  confirm() {
    console.log(this.form.montobs);
    const montobs = Number(this.form.montobs);
    if (montobs !== 0 && montobs !== null ) {
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
            await this.refreshData();
            //this.cuotas = await this.getCuotas();
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
          } else if (res.status === 204) {
            this.system.message(res.message, 'danger', 5000);
          }
        } catch (error) {
        }
      });
    } else {
      this.system.message('Introduzca monto', 'danger');
    }
    
  }
  restablecer(id) {
    this.system.post('api/estudiante/restablecer', {id}, true).then(async (res) => {
      try {
        if (res.status === 200) {
          this.refreshData();
        }
      } catch (error) {
        return 0;
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
    return obj.estado === 'anulado' ? false : new Date(obj.fecha_vencimiento).getTime() < new Date(fechaToday).getTime() && obj.estado !== 'pagado';
  }
  getTotalPagado(obj) {
    let val = 0;
    for(let i of obj) {
      val = val + Number(i.montobs);
    }
    return Number(val);
  }
  get deudaTotal() {
    try {
      let val = 0;
      for (let i of this.cuotas) {
        if ((i.estado === 'pendiente' || i.estado === 'parcial') && i.guid === null) {
          val = val + Number(i.monto);
        }
        if (i.estado === 'parcial') {
          val = val - Number(i.pagado);
        }
      }
      return val;
    } catch (error) {
      return 0;
    }
  }
}
class FormRePago {
  id = '';
  guid = '';
  titular_nombre = '';
  titular_apellido = '';
  titular_celular = '';
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
    this.titular_celular = user.titular_celular;
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
    this.titular_celular = '';
    this.titular_telefono = '';
    this.tipo_pago_id = '';
    this.banco_id = '';
    this.fecha = '';
    this.referencia = '';
    this.montobs = '';
    this.monto = 0;
    this.montobs_cambio = 0;
  }
  resetBanco() {
    this.titular_nombre = '';
    this.titular_apellido = '';
    this.titular_celular = '';
    this.titular_telefono = '';
    this.banco_id = '';
    this.fecha = '';
    this.referencia = '';
  }
  get isValidated() {
    if (this.tipo_pago_id !== '2') {
      return this.titular_nombre !== '' && this.titular_apellido !== '' 
    && this.titular_celular !== '' && this.titular_telefono !== ''
    && this.tipo_pago_id !== '' && this.banco_id !== ''
    && this.fecha !== '' && this.referencia !== '' && this.montobs !== ''
    }
    if (this.tipo_pago_id === '2') {
      return this.montobs !== '' 
    }
  }
}