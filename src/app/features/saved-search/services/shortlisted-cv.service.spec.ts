import { TestBed } from '@angular/core/testing';

import { ShortlistedCvService } from './shortlisted-cv.service';

describe('ShortlistedCvService', () => {
  let service: ShortlistedCvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShortlistedCvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
