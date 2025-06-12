import { TestBed } from '@angular/core/testing';

import { CustomSelectService } from './custom-select.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CustomSelectService', () => {
  let service: CustomSelectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomSelectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
