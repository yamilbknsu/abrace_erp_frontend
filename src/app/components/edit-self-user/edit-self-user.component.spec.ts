import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSelfUserComponent } from './edit-self-user.component';

describe('EditSelfUserComponent', () => {
  let component: EditSelfUserComponent;
  let fixture: ComponentFixture<EditSelfUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSelfUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSelfUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
