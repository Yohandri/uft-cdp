import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-cuenta-servicios',
  templateUrl: './cuenta-servicios.component.html',
  styleUrls: ['./cuenta-servicios.component.scss']
})
export class CuentaServiciosComponent implements OnInit {
  serviciosList = [];
  servicioSelect = '';
  tabSelect = 0;
  cuotas = [];
  pagination = new PaginationBuild();
  displayCuotas = false;
  selectCuota = '';
  pagos = [];
  selected = new SelectItem();
  form = new FormRePago();
  bancos = [];
  tipospago = [];
  PagosSelected = new SelectItem();
  becado_media = false;
  selectNotaCredito: number = 0;
  nota_credito: any = [];
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Gestión de servicios';
    this.system.module.icon = 'file-o';
    this.becado_media = this.system.decodedToken?.user?.becado_media || false;
    if (this.system.isMobile) {
      this.system.module.name = 'Servicios';
    }
    if (this.system.isStudent) {
      this.system.getSaldo();
    }
    this.getCarreras();
    this.refreshData();
    this.system.getStatus();
    this.bancos = await this.getBancos();
    this.tipospago = await this.getTiposDePago();
  }
  selectTab(tab) {
    this.tabSelect = tab;
  }
  changeTypePay(tipo) {
    if (tipo === '2') {
      //this.form.montobs = this.system.toBs(this.montoAPagar);
      this.form.resetBanco();
      this.system.getSaldo();
    }
  }
  showConfirm() {
    try {
      if (this.form.tipo_pago_id === '2') {
        return this.n_c_pagar >= this.system.toBs(this.monto_pagar);
      } else {
        return this.form.isValidated;
      }
    } catch (error) {
      return false;
    }
  }
  async getCarreras() {
    this.serviciosList = await this.system.post('api/estudiante/servicios', {}).then(res => {
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
     if (this.becado_media) {
       for(let i of this.serviciosList) {
         i.mon_total = Number(i.mon_total) / 2;
       }
     }
 }
 async getCuotas() {
  this.cuotas = [];
  this.cuotas = await this.system.post('api/estudiante/cuotas_servicios?page=' + this.pagination.page, {pagination: this.pagination, tipo: 'servicio'}).then(res => {
     try {
       if (res.status === 200) {
         console.log(res);
         this.pagination.init(res.object);
         this.selected.init(res.object.data);
         return res.object.data;
       } else {
         return [];
       }
     } catch (error) {
       return [];
     }
   });
   
   for (let i = 0;i < this.cuotas.length;i++) {
    //this.cuotas[i].pagos = await this.getPagos(this.cuotas[i].id);
    let montopagado = 0;
    for(let j of this.cuotas[i].pagos) {
      console.log(parseFloat(j.monto));
      montopagado = montopagado + parseFloat(j.monto);
    }
    this.cuotas[i].pagado = montopagado;
    this.cuotas[i].monto = parseFloat(this.cuotas[i].monto);
  }
}
operarResta(i) {
  try {
    console.log(i);
    return (i?.monto - i?.pagado);
  } catch (error) {
    console.log(error);
    return 0;
  }
}
async refreshData() {
  this.displayCuotas = false;
  this.PagosSelected.reset();
  await this.getCuotas();
  const pagosSelelect = [];
  for (let i = 0;i < this.cuotas.length;i++) {
    for(let j of this.cuotas[i].pagos) {
      pagosSelelect.push(j);
    }
  }
  this.PagosSelected.init(pagosSelelect);
  console.log(pagosSelelect ,this.PagosSelected);
  this.displayCuotas = true;
  this.system.getNotaCredito();
}
async goPage(page, ctrl = '') {
  this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
  await this.refreshData();
}
getTotalPagado(obj) {
  try {
    let val = 0;
    for(let i of obj) {
      val = val + Number(i.montobs);
    }
    return Number(val);
  } catch (error) {
    return 0;
  }
}
get montoAPagar() {
  try {
    return this.operarResta(this.cuotas.find(x => x.id === Number(this.selectCuota)));
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
  this.nota_credito = [];
  hideModal('modal-pay');
}
verPagos(obj) {
  console.log(obj, this.PagosSelected);
  this.pagos = obj.pagos;
  displayModal('modal-pagos');
}
modalPagosClose() {
  hideModal('modal-pagos');
}
initDelete() {
  displayModal('modal-delete');
}
modalDeleteClose() {
  hideModal('modal-delete');
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
confirm() {
  let send = true;
  if (this.form.tipo_pago_id === '2') {
    let sum: number = 0;
    for(let s = 0;s < this.nota_credito.length;s++) {
      sum += Number(this.nota_credito[s]?.montobs);
    }
    this.form.montobs = sum.toFixed(2);
  }
  console.log(this.form);
  const montobs = Number(this.form.montobs);
    if (montobs !== 0 && montobs !== null ) {
  this.form.addCuota(this.selectCuota);
  this.form.monto = this.system.toD(this.form.montobs);
  this.form.montobs_cambio = this.system.dolar.valor;
  this.form.tipo = 'servicio';
  this.form.nota_creditos = this.nota_credito;
  console.log(this.form);
  if (this.form.referencia !== null) {
    this.form.referencia = String(this.form.referencia).replace(/\./g, '');
  } else {
    send = false;
    this.form.referencia = '';
    this.system.message('La referencia no debe de utilizar caracteres especiales', 'warning');
  }
  if (this.form.titular_celular !== null ) {
    this.form.titular_celular = String(this.form.titular_celular).replace(/\./g, '');
  } else {
    send = false;
    this.form.titular_celular = '';
    this.system.message('La cedula no debe de utilizar caracteres especiales', 'warning');
  }
  if (send) {
    this.system.post('api/estudiante/reportarpago_servicio', this.form, true).then(async (res) => {
      try {
        if (res.status === 200) {
          console.log(res);
          this.modalPayClose();
          
          this.form.reset();
          await this.refreshData();
        } else if (res.status === 204) {
          this.system.message(res.message, 'danger', 5000);
        }
      } catch (error) {
      }
    });
  }
  
} else {
  this.system.message('Introduzca monto', 'danger');
}
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
delete() {
  const body = {ids: this.selected.selected};
  this.system.loading = true;
  this.system.post('api/estudiante/delete_cuotas_servicios' , body).then(res => {
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
 async solicitar_servicio() {
   const planSelect = this.serviciosList.find(x => x?.servicio?.id === Number(this.servicioSelect));
   //console.log(this.serviciosList, planSelect);
   const body = {becado_mdeia: this.becado_media, codigo: planSelect?.lapso_codigo, servicio: this.servicioSelect, tipo: planSelect?.tipo === 'inscripcion' ? 'inscripcion' : 'servicio'};
   //console.log(body);
  await this.system.post('api/estudiante/solicitar_servicio', body, true).then(res => {
     try {
       if (res.status === 200) {
         console.log(res);
         this.refreshData();
         this.servicioSelect = '';
         this.tabSelect = 1;
         return true;
       } else {
         return false;
       }
     } catch (error) {
       return false;
     }
   });
}
async getPagos(id) {
  return await this.system.post('api/estudiante/pagos_servicios', {c_servicio: id}, false).then(res => {
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
restarSaldo(saldo) {
  try {
    console.log(saldo, this.form.montobs);
    if(this.form.montobs) {
      return Number(saldo) - Number(this.form.montobs);
    } else {
      return Number(saldo);
    }
    
  } catch (error) {
    console.log(error);
    return saldo;
  }
}
isPayCuota(is) {
  try {
    if (is) {
      const isSolvente = this.system.isSolvente;
      if (isSolvente) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
addNotaCredito() {
  if (this.selectNotaCredito !== 0) {
    const obj = this.system.nota_credito.find(x => x.id === Number(this.selectNotaCredito));
    this.nota_credito.push(obj);
    this.selectNotaCredito = 0;
  }
}
isSelectDisabled(_obj) {
  try {
    return this.nota_credito.find(x => x.id === Number(_obj.id))
  } catch (error) {
    return true;
  }
}
selectDelete(_obj) {
  this.nota_credito = this.nota_credito.filter(x => x.id !== _obj.id);
}
get monto_pagar() {
  try {
    let total = 0;
    for(let i of this.selectCuota) {
      let _total = this.cuotas.find(x => x.id === i);
      total += Number(_total.monto) - Number(_total.pagado);
    }
    return total;
  } catch (error) {
    
  }
}
get n_c_pagar() {
  try {
    let total = 0;
    for(let i of this.nota_credito) total+=Number(i.montobs);
    return total;
  } catch (error) {
    console.log(error);
    return 0;
  }
}
 get servicio() {
  try {
    return this.serviciosList.find(x => x?.servicio?.id === Number(this.servicioSelect));
  } catch (error) {
    return {};
  }
 }
 get cuotasPendientes() {
   try {
     return this.cuotas.filter(x => x.estado !== 'pagado')?.length;
   } catch (error) {
     return 0
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
  c_servicio = [];
  user_id = '';
  montobs_cambio = 0;
  tipo = '';
  nota_creditos = [];
  addCuota(id) {
    this.c_servicio = id;
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
    this.tipo = user.tipo;
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
    // if (this.tipo_pago_id === '2') {
    //   return this.montobs !== '' 
    // }
  }
}