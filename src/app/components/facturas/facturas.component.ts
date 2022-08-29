import { Component, OnInit } from '@angular/core';
import { dateToStr, displayModal, hideModal, makeguid, PaginationBuild, SelectItem } from 'src/app/services';
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
  detallesfac:any;
  pagination = new PaginationBuild();
  isForm = false;
  correlativo:any;
  form = new FormFactura();
  filter = new FormFactura();
  isNew = false;
  type:any;
  selected = new SelectItem();
  selectedService: any = new SelectItem();
  isEdit = false;
  instrumento_pago:any=[]
  inputValue: any = '';
  servicioSelect: any = '';
  options: Option[] = [];
  filteredOptions: Option[] = [];
  optionsServicios: Servicio[] = [];
  filteredOptionsServicios: Servicio[] = [];
  listService = [];
  listPagos = [];
  viewFac = false;
  sede = this.system.decodedToken.user.sede;
  viewFacture: any = null;
  viewEstudiante: any = null;
  esAnular = false;
  isPay = false;
  anuladas = false;
  optionCuotas = [];
  filteredOptionCuotas: Cuotas[] = [];
  pagos_insert = [];
  saldo_estudiante: any = 0;
  pagos = [];
  pagosxc:any = [];
  formaddpaynote:boolean = false;
  notasdecredito:any = [];
  formaddpaydebito:boolean = false;
  formaddpaytransferencia:boolean = false;
  notasdecredito_selected:any=[];
  rtipo:any="diario";
  rlibro:any='viejo';
  istrue_correlativo:any;
  rfecha:any='';
  printer:boolean=false;
  pagos_cuotasof:any;
  pagos_serviciosof:any;
  account:any;
  esReintegro: boolean = false;
  descuento: number = 0;
  fj: boolean = false;
  razonsocialfj: any;
  riffj: any;
  igtf: any=0;
  igtftotal: number=0;
  montobstotal: any = 0;
  igtffecha:any;
  isInvalidReferencia = false;
  activesaia:any;
  cedulasaia:any;


  compareFun = (o1: Option | string, o2: Option) => {
    if (o1) {
      //return true;
      return typeof o1 === 'string' ? o1 === o2.cedula : o1.cedula === o2.cedula;
    } else {
      return false;
    }
  };
  montotaluserpagad: number;
  cierrefecha: any;


  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.notasdecredito_selected = [];
    this.system.module.name = 'Facturas';
    this.system.module.icon = 'file-text-o';
    if (this.system.isMobile) {
      this.system.module.name = 'Facturas';
    }
    await this.refreshData();
  }
  cancelar() {}

  getaccount(){
    return this.system.post('api/facturas/cuentas' , { }).then(res => {
      try {
        //this.loadData = true;
        if (res.status === 200) {
          this.account = res.object;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });

  }

  typepay(){
    return this.system.post('api/facturas/tipospago' , { }).then(res => {
      try {
        //this.loadData = true;
        if (res.status === 200) {
          this.type = res.object;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });

  }
  async refreshData() {
    this.anuladas = false;
    this.correlativo = '';
    this.data = [];
    this.instrumento_pago = [];
    this.notasdecredito_selected = [];
    this.listPagos = [];
    this.notasdecredito = [];
    this.system.loading = true;
    this.selected.reset();
    this.getaccount();
    this.typepay();
    this.get_igtf();
    this.loadData = false;
    await this.system.post('api/facturas?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
      try {
        this.loadData = true;
        this.system.loading = false;
        if (res.status === 200) {
          this.pagination.init(res.object);
          this.selected.init(res.object.data);
          this.data = res.object.data;
          this.istrue_correlativo = res.object.data;
          return res.object.data;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });
  }

  async getfact(){
    const q = {tipo:this.rtipo,sede:this.sede,libro:this.rlibro,fecha:this.rfecha,anulada:this.anuladas}
   // window.open(this.system.reendpoint()+'api/facturas/export_factura');
   if(this.anuladas){
    await this.system.getDownloadFilePDF('api/facturas/export_reverso_factura?tipo='+this.rtipo+'&sede='+this.sede+'&fecha='+this.rfecha+'&libro='+this.rlibro+'&anulada='+this.anuladas,{},true).then(res => {
      try {
        //console.log(res.url);
        
      } catch (error) { 
        console.log(error);
      }
    })
   }else{
    await this.system.getDownloadFilePDF('api/facturas/export_factura?tipo='+this.rtipo+'&sede='+this.sede+'&fecha='+this.rfecha+'&libro='+this.rlibro,{},true).then(res => {
      try {
        //console.log(res.url);
        
      } catch (error) { 
        console.log(error);
      }
    })
  }
  }

  async getcierre(){
    const q = {fecha:this.cierrefecha}
   // window.open(this.system.reendpoint()+'api/facturas/export_factura');
    await this.system.getDownloadFilePDFCierre('api/pagos/cierre_caja?fecha='+this.cierrefecha,{},true).then(res => {
      try {
        //console.log(res.url);
        
      } catch (error) { 
        console.log(error);
      }
    })
  }

  async facturar_pagos() {
    //this.system.loading = true;
    await this.system.getDownloadFilePDFCierreFacturar('api/pagos/facturar_pagos' , {},true).then(res => {
      try {
        //this.system.loading = false;
      } catch (error) {
        return false;
      }
    });
  }

  openmodal(){
    displayModal('modal-view-report');
  }

  openmodal_cierre(){
    displayModal('modal-view-cierre');
  }
  closemodal(){
    hideModal('modal-view-report');
  }
  closemodal_igtf(){
    this.igtffecha = '';
    hideModal('modal-view-igtf');
  }
  closemodal_cierre(){
    hideModal('modal-view-cierre');
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
    this.printer=false;
    hideModal('modal-view-facture');
  }
  searchsaia() {
    console.log("saia");
     //this.loadData = false;
     this.activesaia = setTimeout(function(){
       true
     },4000)
  }

  modalSaia() {
    displayModal('modal-saia');
  }
  closemodalSaia() {
    hideModal('modal-saia');
  }
  toFixed(mon) {
    try {
      return parseFloat(mon).toFixed(2);
    } catch (error) {
      return mon;
    }
  }
  new() {
    //this.dataOption();
    //this.dataOptionServicios();
    this.listPagos = [];
    displayModal('modal-new-facture');
  }
  modalFactureClose() {
    this.viewFac = false;
    this.inputValue = '';
    this.listService = [];
    this.instrumento_pago = [];
    hideModal('modal-new-facture');
  }
  async dataOption(load = false, search = '') {
    await this.system.post('api/facturas/options', {search}, load).then(res => {
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
          this.optionsServicios = res.object.filter(x => x.plan !== null && x?.plan?.estado === 'activo' && x?.l_venta_id === null);
          this.optionCuotas = res.object.filter(x => x.isPay );
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

    if(value.length > 3){
      await this.system.post('api/facturas/options', {search: value}, false).then(res => {
        try {
          console.log(res);
          if (res.status === 200) {
            this.filteredOptions = res.object;
            this.riffj = res.object[0].factura_juridica.rif;
            this.razonsocialfj = res.object[0].factura_juridica.nombre;
          }
        } catch (error) { 
          console.log(error);
        }
      })
      //this.filteredOptions = this.options.filter(option => option.cedula.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }
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
    this.pagosxc = '';
    let obj = JSON.parse(JSON.stringify(this.servicioSelect));
    this.optionCuotas = this.optionCuotas.filter(item => item?.id !== this.servicioSelect?.id);
    this.optionsServicios = this.optionsServicios.filter(item => item !== this.servicioSelect);
    console.log("onSelectServicio",this.servicioSelect);
    obj.id = obj.id + '.' + makeguid();
    obj.isPay = this.isPay;
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
    console.log("here");
    console.log(obj.pagos_confirm);
    console.log("here");
    this.servicioSelect = '';
  }
  deleteSelectService(obj) {
    this.listService = this.listService.filter(x => x.id !== obj.id);
  }
  deleteSelectPago(obj) {
    this.listPagos = this.listPagos.filter(x => x.guid_ !== obj.guid_);
  }
  
  deleteSelectPago_(obj) {
    this.instrumento_pago = this.instrumento_pago.filter(x => x.guid !== obj.guid);
    this.pagos = JSON.parse(JSON.stringify(this.pagos.filter(x => x.guid !== obj.guid)));
    for(let i of this.listService) {
      i.pagos_confirm = i.pagos_confirm.filter(x => x.guid !== obj.guid);
    }
  }

  print(){
    this.printer=true;
    this.detallesfac = this.viewFacture.detalles;
    this.pagos_cuotasof = this.viewFacture.detalles.pagos_cuotas;
    this.pagos_serviciosof = this.viewFacture.detalles.pagosservicios;
    console.log(this.detallesfac);
    const self = this;
    setTimeout(() => {window.print();},100);
    setTimeout(() => {self.printer=false;},200);
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
      val = val + Number(this.system.toBs(i.monto));
    }
    return Number(val);
  }
  async save() {
    console.log("LA<MINICIO",this.igtf);
    //let saldo = Math.abs(this.resta_pagando).toFixed(2);
    let saldo = 0;
    let index = 0;
    for (let i of this.listService) {
      i.id = i.id.split('.')[0];
      console.log('save',i);
      let monto = Number(i?.plan?.mon_total ? i?.plan?.mon_total : i?.monto);
      i['monto_pagado'] = 0;
      for(let j of i.pagos_confirm) {
        let p = i['monto_pagado'];
        i['monto_pagado'] = i['monto_pagado'] + Number(j.monto);
        console.log(i['monto_pagado'] , Number(monto));
        if (i['monto_pagado'] >= monto) {
          saldo = saldo + (i['monto_pagado'] - monto);
          j.monto = monto - p;
          
        } else {
          j.monto = j.monto;
        }
      index = index + 1;
     
    }
    
    }
    this.igtftotal = 0;
    for (let i of this.instrumento_pago) {
      if(i.addpay == 7){
        this.igtftotal += (i.monto*this.igtf/100);
        this.montobstotal += (i.monto);
      } 
      i.monto = this.system.toD(i.monto);
    }    
    //this.pagos_refresh();

    const body = {
      estudiante_cedula: this.inputValue.cedula,
      sede: this.sede,
      nota_creditos : this.notasdecredito_selected,
      detalle_factura: this.listService,
      correlativo: this.correlativo,
      instrumento_pago: this.instrumento_pago,
      mon_total: this.system.toBs(this.total),
      monpagadouser:this.montotaluserpagad,
      monto_total: this.system.toBs(this.total),
      sub_total: this.sub_total,
      iva: this.iva,
      igtf: this.igtftotal,
      igtfdolar: this.system.toD(this.igtftotal),
      montobstotal: this.montobstotal,
      montototaligtf: this.system.toD(this.montobstotal),
      saldo : saldo.toFixed(2),
      descuento: this.descuento,
      fj: this.fj,
      razonsocial_fj: this.razonsocialfj === undefined ? null : this.razonsocialfj,
      rif_fj: this.riffj === undefined ? null : this.riffj
    };
    
    console.log(body);
     this.system.post('api/facturas/create', body, true).then(res => {
       try {
         console.log(res);
         if (res.status === 200) {
           this.modalFactureClose();
           this.refreshData();
         }
       } catch (error) {
         console.log(error);
    }
    });
  }
  isInvalid(obj, ref) {
    try {
      this.isInvalidReferencia = obj.filter(x => x.referencia === ref)?.length > 1;
      return obj.filter(x => x.referencia === ref)?.length > 1;
    } catch (error) {
      console.log(error);
    }
  }
  anular() {
    this.esAnular = true;
    displayModal('modal-anular');
  }
  modalAnularClose() {
    hideModal('modal-anular');
  }
  modalReintegroClose() {
    hideModal('modal-reintegro');
  }
  reintegro() {
    this.esReintegro = true;
    displayModal('modal-reintegro');
  }
  addPagos(servicio) {
//    console.log("lam",servicio);
      this.pagos=servicio.pagos_confirm;
      displayModal('modal-pagos');
  }

  addinstrumento() {
    //    console.log("lam",servicio);
          
          displayModal('modal-pagos');
      }
  modalPAgosClose() {
    hideModal('modal-pagos');
    this.pagos = [];
    //this.instrumento_pago = [];
    //this.refreshData();
  }
  reintegroConfirm() {
    console.log(this.viewFacture);
    const body = {factura: this.viewFacture};
    this.system.post('api/facturas/reintegro', body, true).then(res => {
      try {
        console.log(res);
        if (res.status === 200) {
          this.system.message(res.message, 'success', 5000);
          this.modalReintegroClose();
          this.refreshData();
        }
      } catch (error) {
        console.log(error);
      }
    });
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
  imprimirback() {
    const body = {viewFacture: this.viewFacture};
    this.system.getDownloadFilePDFFACTURA('api/facturas/imprimir_factura', body, true).then(res => {
      try {
        console.log("LAM");
        }
       catch (error) {
        console.log(error);
      }
    });
  }
  agregar_pago(pagos_confirm = []) {
    console.log("agregar_pago",pagos_confirm);
    if (pagos_confirm.length === 0) {
      this.listPagos.push({
        tipo_pago_id: '',
        monto: '',
        referencia: '',
        tipocuenta:'',
        fecha: '',
        confirm: false,
        json: {},
        guid_: makeguid()
      });
    } else {
      for (let p of pagos_confirm) {
        this.listPagos.push({
          tipo_pago_id: p.addpay,
          monto: p.monto,
          referencia: p.referencia,
          fecha: p.fecha,
          tipocuenta:p.tipocuenta,
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
    pago.montobs_cambio =  this.system.dolar.valor;
    this.instrumento_pago.push(pago);
  }

  agregar_pago_instrumento() {
    let pago = new FormPago();
    pago.guid = makeguid();
    pago.montobs_cambio =  this.system.dolar.valor;
    this.instrumento_pago.push(pago);
  }

  reporte_igtf() {
    if(!this.igtffecha){
      displayModal('modal-view-igtf');
    }else{
    //const q = {fecha:this.cierrefecha}
    this.system.getDownloadFilePDFIGTF('api/facturas/igtfReporte?fecha='+this.igtffecha , {}).then(res => {
      try {
      } catch (error) {
        return false;
      }
    });
  }   
}       
  
  get_igtf() {
    this.system.get('api/facturas/get_igtf' , {}).then(res => {
      try {
      this.igtf =  res.object;    
      } catch (error) {
        console.log(error);
      }
    })
  }

  reportarPago(is) {
    if (is) {
      console.log(is);
    }
  }
  pagos_refresh() {
    console.log("pagorefresh");
    try {
      let pagos_ = JSON.parse(JSON.stringify(this.listPagos));
      for(let i of this.listService) {
        if (!i.pagado) {
          if (i?.plan?.mon_total >= this.sumarPagos(pagos_)) {
            i['pagado'] = true;
            const p = new FormPago();
            p.monto = i?.plan?.mon_total;
            p.montobs_cambio =  this.system.dolar.valor;
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
    console.log("pagorefres_");
    try {
      let pagos_ = JSON.parse(JSON.stringify(this.listPagos));
      this.pagos_insert = [];
      for(let i of this.listService) {
        console.log("LAM--",i, pagos_);
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
        val += Number(i.montobs);
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
        val += Number(i.montobs);
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
      return 0;
      //return this.sub_total * (this.system.settingsService.Settings.iva/100);
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
      return this.system.toBs(val);
    } catch (error) {
      return 0;
    }
  }

  get pagado_instrumento() {
     
    try {
      let val = 0;
      let valtotal = 0;
      for (let i of this.instrumento_pago) {
           if (i.montobs_confirm !== '') {
               val += Number(this.system.toBs(i.monto));
               valtotal += Number(this.system.toBs(i.monto));
              }else{
                val += Number(i.monto);
                //i.montobs = this.system.toBs(i.monto);
                i.montobs = i.monto;
                valtotal += Number(i.monto);
              }
          
        }

        this.montotaluserpagad = valtotal;
 
      return val+this.sumpagos_confirm;
    } catch (error) {
      return 0;
    }
  }
  get sumpagos_confirm(){
    let index = 0;
    let index2 = 0;
    let val = 0;
    try {
    for(let i=0;i<this.listService.length;i++){
      for(let j of this.listService[index].pagos_confirm){
        val +=Number(j.montobs);
      }

      index = index +1;
      index2 = 0;
      
    }
    return val
  } catch (error) {
    return 1;
  }
  }
  get resta() {
    try {    
      return this.system.toBs(this.sub_total) - this.pagado_instrumento - this.descuento;
    } catch (error) {
      return 0;
    }
  }
  get resta_pagando() {
    try {
      let val = 0;
      for (let i of this.instrumento_pago) {
        val += Number(i.monto);
      }
      //return this.resta - val;
      return this.system.toBs(this.sub_total) - val - this.sumpagos_confirm - this.descuento;
      //return val;
    } catch (error) {
      return 0;
    }
  }

  async formaddpay(i){

    this.formaddpaynote = i == 2 ? true : false ;
    this.formaddpaytransferencia = i == 1 ? true : false ;
    this.formaddpaydebito = i == 5? true : false ;
    if(this.notasdecredito.length > 0){
      this.notasdecredito = this.notasdecredito;
    }else{

      if(i == 2){
        await this.system.post('api/facturas/notacredito', {estudiante_cedula: this.inputValue.cedula}, false).then(res => {
          try {
            console.log(res);
            if (res.status === 200) {
              this.notasdecredito = res.object;
              console.log(res);
            }
          } catch (error) { 
            console.log(error);
          }
        })
      }
  }
    
  }

  addpagonotacredito(i){
    let myDate = new Date();
    let p = new FormPago;
    p.referencia = i.pago_id;
    this.notasdecredito_selected.push(i);
    this.notasdecredito = this.notasdecredito.filter(item => item !== i);

    for (let index = 0; index <this.instrumento_pago.length; index++) {
      if (this.instrumento_pago[index].referencia === "") {
        this.instrumento_pago[index].referencia = i.pago_id; 
        this.instrumento_pago[index].monto = Number(i.montobs).toFixed(2);
        this.instrumento_pago[index].tipo_pago_id = 2;
        this.instrumento_pago[index].fecha = dateToStr(myDate,false); 
        console.log(this.system.toD(Number(i.montobs)));
      }
    }
    this.formaddpaynote = false;
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