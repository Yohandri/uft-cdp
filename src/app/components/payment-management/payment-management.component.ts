import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system.service';
import { displayModal, hideModal, refreshArrayPage } from 'src/app/services';
@Component({
  selector: 'app-payment-management',
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.scss']
})
export class PaymentManagementComponent implements OnInit {
  tabSelect = 0;
  payment_type = [{value: 'saldo', key: 'Saldo'}, {value: 'transferencia', key: 'Transferencia'}];
  bank = [{value: 'provincial', key: 'Provincial'}, {value: 'banesco', key: 'Banesco'}];
  constructor(
    public system: SystemService
  ) { }

  ngOnInit(): void {
  }
  selectTab(tab) {
    this.tabSelect = tab;
  }
  initPay() {
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
}
