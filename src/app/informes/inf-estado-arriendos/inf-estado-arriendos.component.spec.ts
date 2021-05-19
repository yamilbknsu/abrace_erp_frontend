import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfEstadoArriendosComponent } from './inf-estado-arriendos.component';

describe('InfEstadoArriendosComponent', () => {
  let component: InfEstadoArriendosComponent;
  let fixture: ComponentFixture<InfEstadoArriendosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfEstadoArriendosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfEstadoArriendosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
