import { Component, OnInit } from '@angular/core';
import { dateToStr, displayModal, hideModal, makeguid, PaginationBuild, SelectItem } from 'src/app/services';
import { SystemService } from 'src/app/services/system.service';
import {FormPago} from 'src/app/components/pagos/pagos.component';
import { identifierModuleUrl } from '@angular/compiler';
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
  isInvalidReferencia2 = false;
  activesaia:any;
  cedulasaia:any;
  datasede: any[] = [];
  showAmount = true;
  carrera = '';
  sedeUser = null;

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
  monNoteCredito: any;


  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    console.log(this.system.decodedToken?.user?.sede);
    this.sedeUser = this.system.decodedToken?.user?.sede;
    this.notasdecredito_selected = [];
    this.system.module.name = 'Facturas';
    this.system.module.icon = 'file-text-o';
    if (this.system.isMobile) {
      this.system.module.name = 'Facturas';
    }
    this.getsedes();
    this.data = await this.refreshData();
  }
  cancelar() {}

  getsedes(){
 
    this.system.post('api/facturas/sedes', {},true).then(res => {
      try {
        this.system.loading = false;
        if (res.status === 200) {
          this.datasede = res.object;
          return res;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    });


  }


  async refresh() {
    this.data = await this.refreshData();
  }

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
    return await this.system.post('api/facturas?page=' + this.pagination.page, {pagination: this.pagination, filter: this.filter }).then(res => {
      try {
        this.loadData = true;
        this.system.loading = false;
        if (res.status === 200) {
          this.pagination.init(res.object);
          this.selected.init(res.object.data);
          //this.data = res.object.data;
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
  async resetFilter() {
    this.filter = new FormFactura();
    this.data = await this.refreshData();
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
       return true
     },4000)
  }

  modalSaia() {
    displayModal('modal-saia');
  }
  closemodalSaia() {
    hideModal('modal-saia');
    this.activesaia = false;
    this.cedulasaia = '';
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
    this.descuento = 0;
    this.showAmount = true;
    displayModal('modal-new-facture');
  }
  modalFactureClose() {
    this.viewFac = false;
    this.inputValue = '';
    this.listService = [];
    this.instrumento_pago = [];
    hideModal('modal-new-facture');
    hideModal('modal-edit-facture');
  }
  async dataOption(load = false, search = '') {
    await this.system.post('api/facturas/options', {search, sede: this.sedeUser}, load).then(res => {
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
      await this.system.post('api/facturas/options', {search: value, sede: this.sedeUser}, false).then(res => {
        try {
          console.log(res);
          if (res.status === 200) {
            this.filteredOptions = res.object;
            this.riffj = res.object[0]?.factura_juridica?.rif;
            this.razonsocialfj = res.object[0]?.factura_juridica?.nombre;
            this.carrera = res.object[0]?.c_e_lapso[0]?.carrera_estudiante || null;
          }
          if (this.filteredOptions.length == 0) {
            this.system.message('Estudiante no encontrado. puede estar con diferente sede', 'warning', 3000);
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
  isSelectDisabled(_obj) {
    try {
      if(_obj.tipo != 'cuota') {return false};
      if(_obj.c_e_lapso == null) {return false};
      if(this.filteredOptionsServicios[0].nombre + this.filteredOptionsServicios[0].c_e_lapso.lapso == _obj.nombre + _obj.c_e_lapso?.lapso){
        return false;
      }else{
        return true;
      }
    } catch (error) {
      return true;
    }
  }
  onSelectServicio() {
    this.pagosxc = '';
    let obj = JSON.parse(JSON.stringify(this.servicioSelect));
    console.log(obj);
    this.optionCuotas = this.optionCuotas.filter(item => item?.id !== this.servicioSelect?.id);
    console.log("onSelectServicio",this.servicioSelect);
    obj.id = obj.id + '.' + makeguid();
    obj.isPay = this.isPay;
    obj.carrera_estudiante = this.carrera;
    obj.montovirtual = obj?.plan?.mon_total ? this.system.toFixed(this.system.toBs(obj?.plan?.mon_total)) : this.system.toFixed(this.system.toBs(obj.monto));
    for (let i of obj.pagos_confirm) {
      i['plan'] = {mon_total: i.monto};

      if (i?.pagos_confirm?.length > 0) {
        this.agregar_pago(i.pagos_confirm);
      }
    }

    // if (obj?.pagos_confirm?.length === 0) {
    //   obj.pagos_confirm.push(new FormPago());
    // }
    if (obj.tipo !== 'servicio') {
      if (this.esBecado && this.tipoBeca == 'Media' && obj.estado != 'pagado') {
        obj.montovirtual = this.system.toBs(obj?.c_e_lapso_3?.plan_cuota.find(x => x.nombre == obj.nombre)?.valor);
        this.descuento += Number(this.system.toFixed(Number(obj.montovirtual)/2));
        //this.descuento = Number(this.descuento.toFixed(2));
        console.log(obj.montovirtual);
      }
      if (this.esBecado && this.tipoBeca == 'Completa' && obj.estado != 'pagado') {
        obj.montovirtual = this.system.toBs(obj?.c_e_lapso_3?.plan_cuota.find(x => x.nombre == obj.nombre)?.valor);
        this.descuento += Number(this.system.toFixed(Number(obj.montovirtual)));
      }
    } else {
      if (this.esBecado && this.tipoBeca == 'Media') {
        obj.montovirtual = this.system.toBs(obj?.plan?.mon_total);
        this.descuento += Number(this.system.toFixed(Number(obj.montovirtual)/2));
        //this.descuento = Number(this.descuento.toFixed(2));
      }
      if (this.esBecado && this.tipoBeca == 'Completa' && obj.estado != 'pagado') {
        obj.montovirtual = this.system.toBs(obj?.plan?.mon_total);
        this.descuento += Number(this.system.toFixed(Number(obj.montovirtual)));
      }
    }
    
    this.listService.push(obj);
    console.log("here");
    console.log(obj, this.inputValue);
    console.log("here");
    this.servicioSelect = '';
  }
  deleteSelectService(obj) {
    console.log(this.esBecado , this.tipoBeca);
    if (this.esBecado && this.tipoBeca == 'Media' && obj.estado != 'pagado') {
      this.descuento -= Number(this.system.toFixed(this.system.toBs(Number(obj.monto)/2)));
      this.descuento = Number(this.descuento.toFixed(2));
      console.log(obj, this.descuento);
    }
    if (this.esBecado && this.tipoBeca == 'Completa' && obj.estado != 'pagado') {
      this.descuento -= Number(this.system.toFixed(this.system.toBs(Number(obj.monto))));
    }
    this.listService = this.listService.filter(x => x.id !== obj.id);
    if (this.listService.length == 0) {
      this.descuento = 0;
    }
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
      //val = val + Number(this.system.toBs(i.monto));
      val += Number(i.montobs);
    }
    return Number(val);
  }
  async save(type = '') {
    //let saldo = Math.abs(this.resta_pagando).toFixed(2);
    let saldo = 0;
    let index = 0;
    this.showAmount = false;
    console.log(this.listService);
    for (let i of this.listService) {
      i.monto = this.system.toD(i.montovirtual);
      i.id = i.id.toString();
      i.id = i.id ? i.id.split('.')[0] : i.id;
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
    i.isPay = i.isPay ? i.isPay : false;
    i.tipo = i.cuota_id || i?.pagosxc?.length >= 0 ? 'cuota' : 'servicio';
    if (type == 'reverso' && i.tipo == 'cuota') {
      i.isPay = true;
      i['c_e_lapso_3'] = {lapso: ''};
      i['c_e_lapso'] = {carrera: {nombre: i.descripcion}};
    }
    if (type == 'reverso') {
      i['plan'] = {mon_total: i.monto, fecha_vencimiento: '', id: ''};
      i['description'] = i.descripcion;
      if (i.tipo == 'servicio') {
        i['description'] = i.description || i.nombre;
        i['montobs'] = i.montovirtual;
      }
    }
    }
    this.igtftotal = 0;
    for (let i of this.instrumento_pago) {
      if(i.addpay == '7'){
        this.igtftotal += (i.montobs*(this.igtf/100));
        this.montobstotal += (i.montobs);
      }
      //i.montobs = i.monto;
      // i.monto = parseInt((this.system.toD(i.montobs) * 10).toString(), 10)/10;
      i.monto = this.system.toD(i.montobs);
      i.tipocuenta = i.tipocuenta ? i.tipocuenta : '';
    }    
    //this.pagos_refresh();

    let body = {};
    if (type == '') {
      body = {
        estudiante_cedula: this.inputValue.cedula,
        sede: this.sede,
        nota_creditos : this.notasdecredito_selected,
        detalle_factura: this.listService,
        correlativo: this.correlativo,
        instrumento_pago: this.instrumento_pago,
        mon_total: this.sub_total.toFixed(2),
        monpagadouser:this.montotaluserpagad,
        monto_total: this.sub_total.toFixed(2),
        sub_total: this.sub_total.toFixed(2),
        iva: this.iva,
        igtf: this.igtftotal,
        igtfdolar: this.system.toD(this.igtftotal),
        montobstotal: this.montobstotal,
        montototaligtf: this.system.toD(this.montobstotal),
        saldo : saldo.toFixed(2),
        descuento: this.descuento,
        fj: this.fj,
        razonsocial_fj: this.razonsocialfj === undefined ? null : this.razonsocialfj,
        rif_fj: this.riffj === undefined ? null : this.riffj,
        type,
        id: 0
      };
    } else {
      body = {
        estudiante_cedula: this.viewFacture?.estudiante?.cedula,
        sede: this.sede,
        nota_creditos : this.notasdecredito_selected,
        detalle_factura: this.listService,
        correlativo: this.correlativo,
        instrumento_pago: this.instrumento_pago,
        mon_total: this.sub_total.toFixed(2),
        monpagadouser:this.montotaluserpagad,
        monto_total: this.sub_total.toFixed(2),
        sub_total: this.sub_total.toFixed(2),
        iva: this.iva,
        igtf: this.igtftotal,
        igtfdolar: this.system.toD(this.igtftotal),
        montobstotal: this.montobstotal,
        montototaligtf: this.system.toD(this.montobstotal),
        saldo : saldo.toFixed(2),
        descuento: this.descuento,
        fj: this.fj,
        razonsocial_fj: this.razonsocialfj === undefined ? null : this.razonsocialfj,
        rif_fj: this.riffj === undefined ? null : this.riffj,
        type,
        id: this.viewFacture.id
      };
    }
    
    console.log(body);
         this.system.post('api/facturas/create', body, true).then(res => {
           try {
             if (res.status === 200) {
               this.modalFactureClose();
               this.refresh();
               this.showAmount = true;
             } else {
               this.system.message(res.message, 'danger', 7000);
             }
           } catch (error) {
             console.log(error);
        }
        });
  }
  verificarReferencia(referencia) {
    const body = {referencia};
    if(referencia != '') {
      this.isInvalidReferencia2 = false;
      this.system.post('api/facturas/referencia', body, true).then(res => {
        try {
          console.log(res);
          if (res.status === 200) {
            this.isInvalidReferencia2 = res.object != 0;
          }
        } catch (error) {
          console.log(error);
    }
    });
    }
  }
  isInvalid(obj, ref) {
    try {
      this.isInvalidReferencia = obj.filter(x => x.referencia === ref)?.length > 1;
      return obj.filter(x => x.referencia === ref)?.length > 1;
    } catch (error) {
      console.log(error);
    }
  }
  isMonth(factura) {
    const year = new Date(factura?.created_at).getFullYear();
    const month = new Date(factura?.created_at).getMonth();
    const year_ = new Date().getFullYear();
    const month_ = new Date().getMonth();
    return year == year_ ? month == month_ : false ;
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
  async editarFactura() {
    hideModal('modal-view-facture');
    displayModal('modal-edit-facture');
    console.log(this.viewFacture);
    // this.inputValue = this.viewFacture.estudiante_cedula;
    for (let i of this.viewFacture.detalles) {
      i.montovirtual = i.montobs;
      i.pagos_confirm = [];
    }
    this.listService = this.viewFacture.detalles;
    for (let i of this.viewFacture.instrumento_pago) {
      i.addpay = i.tipo_pago_id;
    }
    this.instrumento_pago = this.viewFacture.instrumento_pago;
    this.dataOptionServicios(this.viewFacture?.estudiante?.cedula);
    this.saldo_estudiante = await this.system.getSaldoCedula(this.viewFacture?.estudiante?.cedula);

     await this.system.post('api/facturas/options', {search: this.inputValue, sede: this.sedeUser}, false).then(res => {
       try {
         console.log(res);
         if (res.status === 200) {
           this.filteredOptions = res.object;
           this.riffj = res.object[0].factura_juridica?.rif;
           this.razonsocialfj = res.object[0].factura_juridica?.nombre;
           this.inputValue = this.filteredOptions.find(x => x.cedula == this.inputValue);
         }
       } catch (error) { 
         console.log(error);
       }
     })
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
    console.log(this.viewFacture.mon_total,this.monNoteCredito);
    if(this.monNoteCredito > this.viewFacture.mon_total){
      this.system.message("El monto del reintegro no puede ser mayor a la factura","danger");
    }else{

      this.viewFacture.mon_total = this.monNoteCredito;
      const body = {viewFacture: this.viewFacture};
      this.system.getDownloadFilePDFFACTURA('api/facturas/reintegro', body, true).then(res => {
        try {
          console.log(res);
          this.modalReintegroClose();
          this.refresh();
          this.monNoteCredito = '';
          this.modalViewFactureClose();
        } catch (error) {
          console.log(error);
        }
      });
  }
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
  async imprimirback() {
    const body = {viewFacture: this.viewFacture};
    this.system.getDownloadFilePDFFACTURA('api/facturas/imprimir_factura', body, true).then(async (res) => {
      try {
        console.log("LAM");
        this.data = await this.refreshData();
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
  getpComnfirm(array) {
    try {
      let val = 0;
      for (let i of array) {
        val += Number(i.montobs);
      }
      return val.toFixed(2);
    } catch (error) {
      console.log(error);
    }
  }
  get total() {
    try {
      let val = 0;
      for (let i of this.listService) {
        // val += Number(i?.plan?.mon_total ? i.plan.mon_total : i.monto);
        val += Number(i.montovirtual );
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
        // i.estado = 'pendiente';
        if (i?.estado == 'pagado') {
          val += Number(this.getpComnfirm(i.pagos_confirm));
        } else {
          let pC = 0;
          for(let j of i?.pagos_confirm) {
            pC += Number(j.montobs);
          }
          //val += Number(i?.plan?.mon_total ? this.system.toBs(i.plan.mon_total) - pC : this.system.toBs(i.monto) - pC);
          val += Number(i.montovirtual - pC);
        }
        
        // val += Number(i?.plan?.mon_total ? i.plan.mon_total : i.monto);
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
              //  val += Number(this.system.toBs(i.monto));
              //  valtotal += Number(this.system.toBs(i.monto));

               val += Number(i.montobs);
               valtotal += Number(i.montobs);
              }else{
                val += Number(i.montobs);
                // i.montobs = this.system.toBs(i.monto);
                // i.montobs = i.monto;
                valtotal += Number(i.montobs);
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
      return this.sub_total - this.pagado_instrumento - this.descuento;
    } catch (error) {
      return 0;
    }
  }
  get resta_pagando() {
    try {
      let val = 0;
      for (let i of this.instrumento_pago) {
        val += Number(i.montobs);
      }
      //return this.resta - val;
      return this.sub_total - val - this.sumpagos_confirm - this.descuento;
      //return val;
    } catch (error) {
      return 0;
    }
  }

  get esBecado() {
    try {
      return this.inputValue?.prd?.becado_uft === 1;
    } catch (error) {
      return false;
    }
  }

  get tipoBeca() {
    try {
      return this.inputValue?.prd?.tipo_beca;
    } catch (error) {
      return '';
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
    p.referencia = i.id;
    this.notasdecredito_selected.push(i);
    this.notasdecredito = this.notasdecredito.filter(item => item !== i);

    for (let index = 0; index <this.instrumento_pago.length; index++) {
      if (this.instrumento_pago[index].referencia === "") {
        this.instrumento_pago[index].referencia = i.id; 
        this.instrumento_pago[index].montobs = Number(i.montobs).toFixed(2);
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
  id:any;
  nombre: string;
  description: string;
  c_e_lapso: any;
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