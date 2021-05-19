import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfEstadoPagosComponent } from './inf-estado-pagos.component';

describe('InfEstadoPagosComponent', () => {
  let component: InfEstadoPagosComponent;
  let fixture: ComponentFixture<InfEstadoPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfEstadoPagosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfEstadoPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
