import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaCarrerasComponent } from './cuenta-carreras.component';

describe('CuentaCarrerasComponent', () => {
  let component: CuentaCarrerasComponent;
  let fixture: ComponentFixture<CuentaCarrerasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuentaCarrerasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentaCarrerasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
