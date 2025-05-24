import { TestBed } from '@angular/core/testing';

import { LegacyComponentService } from './legacy-component.service';

describe('LegacyComponentService', () => {
  let service: LegacyComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LegacyComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
