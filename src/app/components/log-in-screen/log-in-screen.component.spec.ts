import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LogInScreenComponent } from './log-in-screen.component';

describe('LogInScreenComponent', () => {
  let component: LogInScreenComponent;
  let fixture: ComponentFixture<LogInScreenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LogInScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogInScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
