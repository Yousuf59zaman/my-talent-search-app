import { TestBed } from '@angular/core/testing';

import { PurchasedListService } from './purchased-list.service';

describe('PurchasedListService', () => {
  let service: PurchasedListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchasedListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
