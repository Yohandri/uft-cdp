import { Component, OnInit } from '@angular/core';
import { displayModal, hideModal, makeguid, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
import {FormPago} from 'src/app/components/pagos/pagos.component';
@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.scss']
})
export class FacturasComponent implements OnInit {
  data: any = [];
  loadData = false;
  pagination = new PaginationBuild();
  isForm = false;
  form = new FormFactura();
  filter = new FormFactura();
  isNew = false;
  selected = new SelectItem();
  selectedService: any = new SelectItem();
  isEdit = false;

  inputValue: any = '';
  servicioSelect: any = '';
  options: Option[] = [];
  filteredOptions: Option[] = [];
  optionsServicios: Servicio[] = [];
  filteredOptionsServicios: Servicio[] = [];
  listService = [];
  listPagos = [];
  viewFac = false;
  viewFacture: any = null;
  viewEstudiante: any = null;
  esAnular = false;
  isPay = false;
  optionCuotas = [];
  filteredOptionCuotas: Cuotas[] = [];
  pagos_insert = [];
  saldo_estudiante: any = 0;
  pagos = [];

  compareFun = (o1: Option | string, o2: Option) => {
    if (o1) {
      //return true;
      return typeof o1 === 'string' ? o1 === o2.cedula : o1.cedula === o2.cedula;
    } else {
      return false;
    }
  };

  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Facturas';
    this.system.module.icon = 'file-text-o';
    if (this.system.isMobile) {
      this.system.module.name = 'Facturas';
    }
    await this.refreshData();
  }
  cancelar() {}
  refreshData() {
    this.data = [];
    this.loadData = false;
    this.selected.reset();
    return this.system.post('api/facturas?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
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
  async goPage(page, ctrl = '') {
    this.pagination.page = ctrl === '+' ? page + 1 > this.pagination.last_page ? page : page + 1 : ctrl === '-' ? page - 1 < 1 ? 1 : page -1 : page;
    this.data = await this.refreshData();
  }
  resetFilter() {
    this.filter = new FormFactura();
    this.refreshData();
  }
  async edit(obj = null) {
    this.viewEstudiante = null;
    await this.dataOption(true);
    this.viewFac = true;
    this.viewFacture = obj;
    console.log(this.options, this.viewEstudiante);
    
    this.viewEstudiante = this.options.find(x => x.cedula === obj.estudiante_cedula);
    console.log(this.viewEstudiante);
    displayModal('modal-view-facture');
  }
  modalViewFactureClose() {
    hideModal('modal-view-facture');
  }
  toFixed(mon) {
    try {
      return parseFloat(mon).toFixed(2);
    } catch (error) {
      return mon;
    }
  }
  new() {
    this.dataOption();
    //this.dataOptionServicios();
    this.listPagos = [];
    displayModal('modal-new-facture');
  }
  modalFactureClose() {
    this.viewFac = false;
    this.inputValue = '';
    this.listService = [];
    hideModal('modal-new-facture');
  }
  async dataOption(load = false) {
    await this.system.post('api/facturas/options', {}, load).then(res => {
      try {
        console.log(res);
        if (res.status === 200) {
          this.options = res.object;
        }
      } catch (error) { 
        console.log(error);
      }
    })
  }
  async dataOptionServicios(cedula) {
    this.selectedService.reset();
    this.system.post('api/facturas/servicios', {cedula}, false).then(res => {
      try {
        console.log(res);
        if (res.status === 200) {
          this.selectedService.init(res.object);
          this.optionsServicios = res.object.filter(x => x.plan !== null && x?.plan?.estado === 'activo');
          this.optionCuotas = res.object.filter(x => x.tipo !== undefined);
          // for (let i of this.optionCuotas) {
          //   i['plan'] = {mon_total: i.monto};
          //   if (i?.pagos_confirm?.length > 0) {
          //     this.agregar_pago(i.pagos_confirm);
          //   }
          // }
          for (let i of this.optionsServicios) {
            i['pagos_confirm'] = [];
          }
        }
      } catch (error) { 
        console.log(error);
      }
    })
  }
  async onChange(value: any) {
    typeof value === 'string' ? value = value : value = value.cedula; 
    if (value.length > 6) {
      this.dataOptionServicios(value);
      this.saldo_estudiante = await this.system.getSaldoCedula(value);
    }
    this.filteredOptions = this.options.filter(option => option.cedula.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }
  onChangeServicios(value: any): void {
    typeof value === 'string' ? value = value : value = value.nombre;
    if (this.isPay) {
      this.filteredOptionsServicios = this.optionCuotas.filter(option => option.nombre.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    } else {
      this.filteredOptionsServicios = this.optionsServicios.filter(option => option.nombre.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }
    
  }
  // onChangeCuotas(value: any): void {
  //   typeof value === 'string' ? value = value : value = value.nombre; 
  //   this.filteredOptionCuotas = this.optionCuotas.filter(option => option.nombre.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  // }
  // onSelectEstudiante(value) {
  //   this.dataOptionServicios(value.cedula);
  // }
  onSelectServicio() {
    console.log(this.servicioSelect);
    let obj = JSON.parse(JSON.stringify(this.servicioSelect));
    obj.id = obj.id + '.' + makeguid();
    for (let i of obj.pagos_confirm) {
      i['plan'] = {mon_total: i.monto};
      if (i?.pagos_confirm?.length > 0) {
        this.agregar_pago(i.pagos_confirm);
      }
    }
    // if (obj?.pagos_confirm?.length === 0) {
    //   obj.pagos_confirm.push(new FormPago());
    // }
    this.listService.push(obj);
    this.servicioSelect = '';
  }
  deleteSelectService(obj) {
    this.listService = this.listService.filter(x => x.id !== obj.id);
  }
  deleteSelectPago(obj) {
    this.listPagos = this.listPagos.filter(x => x.guid_ !== obj.guid_);
  }
  deleteSelectPago_(obj) {
    this.pagos = JSON.parse(JSON.stringify(this.pagos.filter(x => x.guid !== obj.guid)));
    for(let i of this.listService) {
      i.pagos_confirm = i.pagos_confirm.filter(x => x.guid !== obj.guid);
    }
  }
  estaPago(servicio) {
    let pago = 0;
    for (let i of servicio.pagos_confirm) {
      pago = pago + i.monto;
    }
    console.log('pago? ', pago >= Number(servicio.monto));
    return pago >= Number(servicio.monto);
  }
  getTotalPagado(obj) {
    let val = 0;
    for(let i of obj) {
      val = val + Number(i.monto);
    }
    return Number(val);
  }
  save() {
    //let saldo = Math.abs(this.resta_pagando).toFixed(2);
    let saldo = 0;
    for (let i of this.listService) {
      i.id = i.id.split('.')[0];
      console.log(i);
      let monto = Number(i?.plan?.mon_total ? i?.plan?.mon_total : i?.monto);
      i['monto_pagado'] = 0;
      for(let j of i.pagos_confirm) {
        const p = i['monto_pagado'];
        i['monto_pagado'] = i['monto_pagado'] + Number(j.monto);
        console.log(i['monto_pagado'] , Number(monto));
        if (i['monto_pagado'] >= monto) {
          saldo = saldo + (i['monto_pagado'] - monto);
          j.monto = monto - p;
          
        } else {
          j.monto = j.monto;
        }
          
      }
    }
    //this.pagos_refresh();
    const body = {
      estudiante_cedula: this.inputValue.cedula,
      detalle_factura: this.listService,
      mon_total: this.total,
      sub_total: this.sub_total,
      iva: this.iva,
      saldo : saldo.toFixed(2)
    };
    
    console.log(body);
    // this.system.post('api/facturas/create', body, true).then(res => {
    //   try {
    //     console.log(res);
    //     if (res.status === 200) {
    //       //this.modalFactureClose();
    //       //this.refreshData();
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // });
  }
  anular() {
    this.esAnular = true;
    displayModal('modal-anular');
  }
  modalAnularClose() {
    hideModal('modal-anular');
  }
  addPagos(servicio) {
    console.log(servicio);
    this.pagos = servicio.pagos_confirm;
    displayModal('modal-pagos');
  }
  modalPAgosClose() {
    hideModal('modal-pagos');
    this.pagos = [];
  }
  anularConfirm() {
    console.log(this.viewFacture);
    const body = {id: this.viewFacture?.id || 0};
    this.system.post('api/facturas/anular', body, true).then(res => {
      try {
        console.log(res);
        if (res.status === 200) {
          this.system.message(res.message, 'success', 5000);
          this.modalAnularClose();
          this.refreshData();
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
  agregar_pago(pagos_confirm = []) {
    console.log(pagos_confirm);
    if (pagos_confirm.length === 0) {
      this.listPagos.push({
        tipo_pago_id: '',
        monto: '',
        referencia: '',
        fecha: '',
        confirm: false,
        json: {},
        guid_: makeguid()
      });
    } else {
      for (let p of pagos_confirm) {
        this.listPagos.push({
          tipo_pago_id: p.tipo_pago_id,
          monto: p.monto,
          referencia: p.referencia,
          fecha: p.fecha,
          confirm: true,
          servicio_id: p.c_c_e_lapso ? p.c_c_e_lapso : p.c_servicio,
          json: p,
          guid_: makeguid()
        });
      }
      
    }
  }
  agregar_pago_() {
    let pago = new FormPago();
    pago.guid = makeguid();
    this.pagos.push(pago);
  }
  reportarPago(is) {
    if (is) {
      console.log(is);
    }
  }
  pagos_refresh() {
    try {
      let pagos_ = JSON.parse(JSON.stringify(this.listPagos));
      for(let i of this.listService) {
        console.log(i, pagos_);
        if (!i.pagado) {
          if (i?.plan?.mon_total >= this.sumarPagos(pagos_)) {
            i['pagado'] = true;
            const p = new FormPago();
            p.monto = i?.plan?.mon_total;
            p.referencia = undefined;
            i.pagos_confirm.push()
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  sumarPagos(pagos) {
    let val = 0;
    for(let i of pagos) {
      val = val + i.monto;
    }
    return val;
  }
  pagos_refresh_() {
    try {
      let pagos_ = JSON.parse(JSON.stringify(this.listPagos));
      this.pagos_insert = [];
      for(let i of this.listService) {
        console.log(i);
        for(let j of i?.pagos_confirm) {
          let monto_servicio = i.monto ? Number(i.monto) : Number(i?.plan?.mon_total);
          let monto_confirmado = Number(j.monto);
          console.log(monto_confirmado , monto_servicio);
          console.log(monto_confirmado <= monto_servicio);
          if (monto_confirmado <= monto_servicio) {
            const pago = new FormPago();
            pago.monto = ((monto_servicio - monto_confirmado).toFixed(2));
            for (let p of pagos_) {
              if (p.monto > 0) {
                p.monto = p.monto - Number(pago.monto);
                pago.referencia = p.referencia;
                break;
              }
            }
            if (i.plan) {
              pago.c_servicio = i;
            } else {
              pago.c_c_e_lapso = i;
            }
            this.pagos_insert.push(pago);
          }
        }
      }
      console.log(this.pagos_insert, Math.abs(this.resta_pagando).toFixed(2));
      console.log(pagos_);
    } catch (error) {
      console.log(error);
    }
  }
  get total() {
    try {
      let val = 0;
      for (let i of this.listService) {
        val += Number(i?.plan?.mon_total ? i.plan.mon_total : i.monto);
      }
      return val + this.iva;
    } catch (error) {
      return 0;
    }
  }
  get view_total() {
    try {
      let val = 0;
      for (let i of this.viewFacture?.detalles) {
        val += Number(i.monto);
      }
      return val + Number(this.viewFacture?.iva);
    } catch (error) {
      return 0;
    }
  }
  get view_sub_total() {
    try {
      let val = 0;
      for (let i of this.viewFacture?.detalles) {
        val += Number(i.monto);
      }
      return val;
    } catch (error) {
      return 0;
    }
  }
  get sub_total() {
    try {
      let val = 0;
      for (let i of this.listService) {
        val += Number(i?.plan?.mon_total ? i.plan.mon_total : i.monto);
      }
      return val;
    } catch (error) {
      return 0;
    }
  }
  get iva() {
    try {
      return this.sub_total * (this.system.settingsService.Settings.iva/100);
    } catch (error) {
      return 0;
    }
  }
  get pagado() {
    try {
      let val = 0;
      for (let i of this.listService) {
        for (let j of i.pagos_confirm) {
          // if (j.montobs_confirm !== '') {
          //   val += Number(j.monto);
          // }
          val += Number(j.monto);
        }
      }
      return val;
    } catch (error) {
      return 0;
    }
  }
  get resta() {
    try {
      return this.sub_total - this.pagado;
    } catch (error) {
      return 0;
    }
  }
  get resta_pagando() {
    try {
      let val = 0;
      for (let i of this.listPagos) {
        val += Number(i.monto);
      }
      //return this.resta - val;
      return this.sub_total - val - this.pagado;
      //return val;
    } catch (error) {
      return 0;
    }
  }
}
interface Option {
  cedula: string;
  nombres: string;
  apellidos: string;
}
interface Servicio {
  nombre: string;
  description: string;
}
interface Cuotas {
  nombre: string;
  description: string;
}
class FormFactura {
  id = '';
  guid = '';
  nombre = '';
  description = '';
  codigo = '';
  cedula = '';
  estado = '';
  monto = '';
  carrera = '';
  iva = '';
  descuento = '';
  created_at = '';
  edit(user) {
    this.guid = user.guid;
    this.id = user.id;
    this.nombre = user.nombre;
    this.description = user.description;
    this.codigo = user.codigo;
    this.cedula = user.cedula;
    this.estado = user.estado;
    this.monto = user.monto;
    this.iva = user.iva;
    this.descuento = user.descuento;
    this.created_at = user.created_at;
    this.carrera = user?.c_e_lapso?.carrera?.nombre;
  }
  get isFilter() {
    return this.nombre !== '' || this.description !== '' || this.codigo !== '' || this.cedula !== ''
    || this.estado !== '' || this.monto !== '' || this.carrera !== '' || this.created_at !== '';
  }
}