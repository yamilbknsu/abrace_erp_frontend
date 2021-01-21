import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPropiedadComponent } from './edit-propiedad.component';

describe('EditPropiedadComponent', () => {
  let component: EditPropiedadComponent;
  let fixture: ComponentFixture<EditPropiedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPropiedadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPropiedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
