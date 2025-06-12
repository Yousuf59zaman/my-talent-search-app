import { TestBed } from '@angular/core/testing';

import { CircularLoaderService } from './circular-loader.service';

describe('CircularLoaderService', () => {
  let service: CircularLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CircularLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
