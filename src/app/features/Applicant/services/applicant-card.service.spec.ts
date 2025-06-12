import { TestBed } from '@angular/core/testing';

import { ApplicantCardService } from './applicant-card.service';

describe('ApplicantCardService', () => {
  let service: ApplicantCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicantCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
