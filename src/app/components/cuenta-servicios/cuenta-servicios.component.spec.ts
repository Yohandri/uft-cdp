import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaServiciosComponent } from './cuenta-servicios.component';

describe('CuentaServiciosComponent', () => {
  let component: CuentaServiciosComponent;
  let fixture: ComponentFixture<CuentaServiciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuentaServiciosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentaServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
