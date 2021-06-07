import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfCanonComponent } from './inf-canon.component';

describe('InfCanonComponent', () => {
  let component: InfCanonComponent;
  let fixture: ComponentFixture<InfCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
