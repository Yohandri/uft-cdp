import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibroVentaComponent } from './libro-venta.component';

describe('LibroVentaComponent', () => {
  let component: LibroVentaComponent;
  let fixture: ComponentFixture<LibroVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibroVentaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibroVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
