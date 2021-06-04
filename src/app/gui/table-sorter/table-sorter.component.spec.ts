import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSorterComponent } from './table-sorter.component';

describe('TableSorterComponent', () => {
  let component: TableSorterComponent;
  let fixture: ComponentFixture<TableSorterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableSorterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSorterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
