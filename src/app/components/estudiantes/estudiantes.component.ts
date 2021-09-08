import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
class User {
  nombre = '';
  apellido = '';
  correo = '';
  constructor() {}
}
@Component({
  selector: 'app-estudiantes',
  templateUrl: './estudiantes.component.html',
  styleUrls: ['./estudiantes.component.scss']
})
export class EstudiantesComponent implements OnInit {
  ready = false;
  cedula = '';
  cuotas = [];
  cuotas_pendientes = [];
  solvente = null;
  user = new User();
  selectedCuotasVencidas = new SelectItem();
  selectedCuotasPendientes = new SelectItem();
  cuotasToPay = [];
  tipo_pago_caja = '';
  isSearch = false;
  buscado = false;
  description = '';
  btnConfirm = false;
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Gestión del estudiante';
    this.system.module.icon = 'users';
    if (this.system.isMobile) {
      this.system.module.name = 'Estudiante';
    }
    this.ready = true;
    //this.search();
  }
  async search() {
    this.user = new User();
    if (this.cedula.length >= 7) {
      console.log(this.cedula);
      this.isSearch = true;
      this.cuotas = [];
      this.cuotas_pendientes = []
      this.system.get('api/estudiante?ci=' + this.cedula, {ci: this.cedula}, true).then( async (res) => {
        console.log(res);
        if (res.status === 200) {
          this.cuotas = res.object.cuotas;
          this.selectedCuotasVencidas.init(res.object.cuotas);
          this.selectedCuotasPendientes.init(res.object.cuotas_pendientes);
          this.solvente = res.object.solvente;
          this.cuotas_pendientes = res.object.cuotas_pendientes;

          for (let i = 0;i < this.cuotas.length;i++) {
            //this.cuotas[i].pagos = await this.getPagos(this.cuotas[i].id);
            let montopagado = 0;
            for(let j of this.cuotas[i].pagos) {
              if (j.montobs_confirm !== '') {
                console.log(parseFloat(j.monto));
                montopagado = montopagado + parseFloat(j.monto);
              }
            }
            this.cuotas[i].pagado = montopagado;
            this.cuotas[i].monto = (parseFloat(this.cuotas[i].monto) - this.cuotas[i].pagado).toFixed(2);
          }

          for (let i = 0;i < this.cuotas_pendientes.length;i++) {
            //this.cuotas_pendientes[i].pagos = await this.getPagos(this.cuotas_pendientes[i].id);
            let montopagado = 0;
            for(let j of this.cuotas_pendientes[i].pagos) {
              console.log(parseFloat(j.monto));
              montopagado = montopagado + parseFloat(j.monto);
            }
            this.cuotas_pendientes[i].pagado = montopagado;
            this.cuotas_pendientes[i].monto = parseFloat(this.cuotas_pendientes[i].monto) - this.cuotas_pendientes[i].pagado;
          }

          this.user = res.object.estudiante !== null ? res.object.estudiante : new User() ;
          if (this.solvente) {
            this.system.message('Estudiante solvente', 'success');
          } else {
            this.system.message('Estudiante no solvente', 'danger');
          }
        }
        this.isSearch = false;
        if (res.status === 204) {
          this.user = new User();
          this.system.message(res.message, 'danger');
        }
      });
    }
  }
  async getPagos(id) {
    return await this.system.post('api/estudiante/pagos', {c_c_e_lapso: id}, true).then(res => {
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
  reportarPagoModal(pendientes = 0) {
    this.cuotasToPay = [];
    this.btnConfirm = false;
    if (pendientes === 0) {
      for (let i of this.selectedCuotasVencidas.selected) {
        for (let j of this.cuotas) {
          if (i === j.id) {
            //j.referencia = '';
            j.montobs = this.system.toBs(j.monto);
            j.montobs_cambio = this.system.dolar.valor;
            j.fecha = new Date();
            j.tipo_pago_caja = this.tipo_pago_caja;
            j.tipo_pago_id = '3';
            j.referencia = this.description;
            this.cuotasToPay.push(j);
          }
        }
      }
    }
    if (pendientes === 1) {
      for (let i of this.selectedCuotasPendientes.selected) {
        for (let j of this.cuotas_pendientes) {
          if (i === j.id) {
            //j.referencia = '';
            j.montobs = this.system.toBs(j.monto);
            j.montobs_cambio = this.system.dolar.valor;
            j.fecha = new Date();
            j.tipo_pago_caja = this.tipo_pago_caja;
            j.tipo_pago_id = '3';
            j.referencia = this.description;
            this.cuotasToPay.push(j);
          }
        }
      }
    }
    
    displayModal('modal-pay');
  }
  reportarPagoCloseModal() {
    this.btnConfirm = false;
    hideModal('modal-pay');
  }
 async reportar() {
    try {
      const pagos = this.cuotasToPay;
      for (let i of pagos) {
        i.referencia = this.description;
      }
      const user = this.user;
      const tipo_pago_caja = this.tipo_pago_caja;
      await this.system.post('api/estudiante/reportarpago_caja',{ pagos, user, tipo_pago_caja}, true).then(async (res) => {
        try {
          console.log(res);
          if (res.status === 200) {
            this.system.message(res.message, 'success');
            this.reportarPagoCloseModal();
            this.search();
          } else {
            this.system.message(res.message, 'danger');
          }
        } catch (error) {
          console.log(error)
        } 
      });
    } catch (error) {
      console.log(error);
    }
  }
get total() {
  try {
    let val = 0;
    for (let i of this.cuotasToPay) {
      val += Number(i.monto);
    }
    return val;
  } catch (error) {
    return 0;
  }
}
}
