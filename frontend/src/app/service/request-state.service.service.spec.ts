import { TestBed } from '@angular/core/testing';

import { RequestStateService } from './request-state.service.service';

describe('RequestStateServiceService', () => {
  let service: RequestStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
