import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuotasServiciosComponent } from './cuotas-servicios.component';

describe('CuotasServiciosComponent', () => {
  let component: CuotasServiciosComponent;
  let fixture: ComponentFixture<CuotasServiciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuotasServiciosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuotasServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
