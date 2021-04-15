import { TestBed } from '@angular/core/testing';

import { LoadingIconService } from './loading-icon.service';

describe('LoadingIconService', () => {
  let service: LoadingIconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingIconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
