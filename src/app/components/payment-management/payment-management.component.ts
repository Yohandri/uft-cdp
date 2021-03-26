import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-management',
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.scss']
})
export class PaymentManagementComponent implements OnInit {
  tabSelect = 0;
  constructor() { }

  ngOnInit(): void {
  }
  selectTab(tab) {
    this.tabSelect = tab;
  }
}
