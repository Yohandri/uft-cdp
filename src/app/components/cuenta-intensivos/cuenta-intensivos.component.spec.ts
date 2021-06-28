import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaIntensivosComponent } from './cuenta-intensivos.component';

describe('CuentaIntensivosComponent', () => {
  let component: CuentaIntensivosComponent;
  let fixture: ComponentFixture<CuentaIntensivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuentaIntensivosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentaIntensivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
