import { TestBed } from '@angular/core/testing';

import { SavedFiltersService } from './saved-filters.service';

describe('SavedFiltersService', () => {
  let service: SavedFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavedFiltersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
