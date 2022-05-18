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
  selectCuota = [];
  pagos = [];
  displayCuotas = false;
  pagination = new PaginationBuild();
  PagosSelected = new SelectItem();
  selected = new SelectItem();
  cuotasAll = [];
  test: number = 0;
  selectNotaCredito: number = 0;
  nota_credito: any = [];
  constructor(
    public system: SystemService
  ) { }

  async  ngOnInit() {
    this.system.module.name = 'Gestión de carreras';
    this.system.module.icon = 'bookmark';
    if (this.system.isStudent) {
      this.system.getSaldo();
      this.system.getNotaCredito();
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
        return this.n_c_pagar >= this.system.toBs(this.monto_pagar);
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
      this.cuotas[i].index = i;
      this.cuotas[i].check = false;
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
    this.getcuotasAll();
  }
  async getcuotasAll() {
    this.cuotasAll = await this.system.post('api/estudiante/cuotasAll', {}, false).then(res => {
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
      if(this.form.montobs) {
        return Number(saldo) - Number(this.form.montobs);
      } else {
        return Number(saldo);
      }
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
      return this.operarResta(this.cuotas.find(x => x.id === this.selectCuota.find(y => y === x.id)));
    } catch (error) {
      return 0;
    }
  }
  initPay(id = null) {
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
    let send = true;
    if (this.form.tipo_pago_id === '2') {
      let sum: number = 0;
      for(let s = 0;s < this.nota_credito.length;s++) {
        sum += Number(this.nota_credito[s]?.montobs);
      }
      this.form.montobs = sum.toFixed(2);
    }
    console.log(this.form.montobs);
    const montobs = Number(this.form.montobs);
    if (montobs !== 0 && montobs !== null ) {
      this.form.addCuota(this.selectCuota);
      this.form.monto = this.system.toD(this.form.montobs);
      this.form.montobs_cambio = this.system.dolar.valor;
      this.form.nota_creditos = this.nota_credito;
      //this.form.c_c_e_lapso = [this.form.c_c_e_lapso];
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
        this.system.post('api/estudiante/reportarpago', this.form, true).then(async (res) => {
          try {
            this.form.reset();
            if (res.status === 200) {
              console.log(res);
              this.modalPayClose();
              this.displayCuotas = false;
              await this.refreshData();
              //this.cuotas = await this.getCuotas();
              
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
              this.displayCuotas = true;
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
  refreshCurrentCheck(index, _) {
    let cuotas = this.cuotas.filter(x => x.estado !== 'pagado' && x.estado !== 'anulado').sort((n1,n2): any => n1 < n2);
    const val = this.selected.value[cuotas[index]?.id];
    if (!val.value) {
      for (let i = index; i >= 0; i--) {
        this.selected.value[cuotas[i]?.id].value = false;
      }
    }
  }
  isActive(index: any, obj: any) {
    let cuotas = this.cuotas.filter(x => x.estado !== 'pagado' && x.estado !== 'anulado').sort((n1,n2): any => n1 < n2);
    if (obj.rp_carreraestudiante_lapso === null) {
      return true;
    }
    if (cuotas.length - 1 === index) {
      return true;
    }
    if (obj.estado === 'pagado' || obj.estado === 'anulado') {
      return false;
    }
    for (let i = index + 1; i < cuotas.length; i++) {
      if(cuotas[index + 1].rp_carreraestudiante_lapso === null) {
        return true;
      }
      return this.selected.value[cuotas[i]?.id].value;
    }
    return true;
  }
  isPayCuota(is, obj) {
    try {
      if (is) {
        const cuotas = this.cuotasAll.filter(x => x.estado !== 'pagado' && x.estado !== 'anulado').sort((n1,n2): any => n1 < n2);
        console.log(cuotas, this.selected.value);
        if (cuotas.length > 0) {
          let activeIndex = 0;
          // let val =  this.selected.value[obj.id];
          // if (val.id === obj.id  || (val.value ? cuotas[index + 1].id === obj.id : false )) {
          //   return true;
          // } else {
          //    return false;
          // }
          let val =  this.selected.value[obj.id];
          let count = this.selected.value.filter(x => x.value);
          console.log(count, this.test);
          if (cuotas[0]?.id === obj?.id) {
            return true;
          }
          if (count[0]?.value === false) {
            return count[0]?.value;
          }
          // const currentIndex = this.cuotas.indexOf(obj);
          // const nextIndex = (currentIndex + 1) % this.cuotas.length;
          // this.cuotas[nextIndex].nombre = 'test';
          // console.log(nextIndex, this.cuotas[nextIndex])


          // const is = count.find(x => x.id === obj.id);
          // if (is || ((cuotas[count.length]?.id === obj?.id) ? count[count.length - 1]?.value  : false )) {
          //   this.test = obj.id;
          //   return true;
          // } else {
          //   return false;
          // }


          // if(this.selected.value[this.test]?.value || this.selected.value[obj?.id]?.value) {
          //   for (let c = 0; c < cuotas.length;c++) {
          //     console.log(c);
          //     if (cuotas[c]?.id === obj?.id ||((cuotas[count.length]?.id === obj?.id) ? true  : this.selected.value[obj?.id]?.value )) {
          //       this.test = obj.id;
          //       return true;
          //     } else {
          //       return false;
          //     }
          //   }
          // } else {
            
          //   if (cuotas[0]?.id === obj?.id) {
          //     this.test = obj.id;
          //     return true;
          //   } else {
          //     //this.selected.value[obj?.id]?.value = false;
          //     return false;
          //   }
            
          // }
          
          // if (val.id === cuotas[0].id && val.value === false) {
          //   this.selected.reset();
          // }
          // if (cuotas[0].id === obj.id || (val.value ? cuotas[1].id === obj.id : false )) {
          //   return true;
          // } else {
          //   return false;
          // }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
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
  c_c_e_lapso: any[] = [];
  user_id = '';
  montobs_cambio = 0;
  nota_creditos = [];
  addCuota(ids) {
    this.c_c_e_lapso = ids;
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
    this.c_c_e_lapso = [];
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