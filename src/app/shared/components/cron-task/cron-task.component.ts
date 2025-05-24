import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CronApiService } from '../../../services/cron-api.service';
import { UtilityService } from '../../../services/utility.service';
import { Subscription } from 'rxjs';
import { CronApiModel } from '../../../models/common/cron-api.model';

@Component({
  selector: 'eclipse-cron-task',
  template: ``,
  standalone: true
})
export class CronTaskComponent implements OnInit, OnDestroy {
  private worker!: Worker;
  crondata: any;
  subscription = new Subscription();
  sessionRunning!: boolean;
  @Output() cronApichangeEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private cronApiService: CronApiService,
    private utilService: UtilityService) { }

  ngOnInit() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./api-cron.worker', import.meta.url));
      this.worker.onmessage = () => {
        this.triggerApiCall();
      };
    } else {
      console.warn('Web Workers are not supported in this environment.');
    }
  }

  triggerApiCall() {
    const sub = this.cronApiService.getCronApi().subscribe({
      next: (cronApiData: CronApiModel) => {
        this.sessionRunning = cronApiData.body.isSessionRunning;
        this.cronApichangeEmitter.emit(this.sessionRunning);
      },
      error: (error) => {
        // this.utilService.openToast(
        //   'error',
        //   'Failed',
        //   error.error?.error ||
        //   error.error?.message ||
        //   error.error?.status?.errors?.[0]?.message ||
        //   'An unknown error occurred'
        // );
      }
    });
    this.subscription.add(sub);
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
