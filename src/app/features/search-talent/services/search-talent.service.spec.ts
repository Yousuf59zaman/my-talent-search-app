import { TestBed } from '@angular/core/testing';

import { SearchTalentService } from './search-talent.service';

describe('SearchTalentService', () => {
  let service: SearchTalentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchTalentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
