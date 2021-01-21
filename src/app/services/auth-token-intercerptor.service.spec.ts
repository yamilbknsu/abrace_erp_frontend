import { TestBed } from '@angular/core/testing';

import { AuthTokenIntercerptorService } from './auth-token-intercerptor.service';

describe('AuthTokenIntercerptorService', () => {
  let service: AuthTokenIntercerptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthTokenIntercerptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
