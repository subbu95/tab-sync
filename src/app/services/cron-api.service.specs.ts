import { TestBed } from '@angular/core/testing';
import { CronApiService } from './cron-api.service';


describe('CronApiService', () => {
  let service: CronApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CronApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
