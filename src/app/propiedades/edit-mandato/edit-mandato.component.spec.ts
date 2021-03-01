import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMandatoComponent } from './edit-mandato.component';

describe('EditMandatoComponent', () => {
  let component: EditMandatoComponent;
  let fixture: ComponentFixture<EditMandatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMandatoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMandatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
