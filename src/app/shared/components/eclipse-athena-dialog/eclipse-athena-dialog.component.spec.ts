import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { EclipseAthenaDialogComponent } from './eclipse-athena-dialog.component';
import { DetailsDataService } from '../../../services/details-data.service';
import { UtilityService } from '../../../services/utility.service';
import { LoaderService } from '../../../services/loader.service';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService  } from '@ngx-translate/core';
import { saveAs } from 'file-saver';

describe('EclipseAthenaDialogComponent', () => {
  let component: EclipseAthenaDialogComponent;
  let fixture: ComponentFixture<EclipseAthenaDialogComponent>;
  let loaderService: LoaderService;
  let detailsDataService: DetailsDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EclipseAthenaDialogComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), DetailsDataService, UtilityService, LoaderService, TranslateService ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EclipseAthenaDialogComponent);
    loaderService = TestBed.inject(LoaderService);
    detailsDataService = TestBed.inject(DetailsDataService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onSelectedChange and open the dialog when openDialog is called', () => {
    spyOn(component, 'onSelectedChange');
    component.dialogBox = jasmine.createSpyObj('DialogComponent', ['open']);

    component.openDialog();

    expect(component.onSelectedChange).toHaveBeenCalledWith(component.primaryTab, component.monId);
    expect(component.dialogBox.open).toHaveBeenCalled();
  });

  it('should call close() on dialogBox when onCloseDialogEvent() is called', () => {
    component.dialogBox = jasmine.createSpyObj('DialogComponent', ['close']);

    component.onCloseDialogEvent();

    expect(component.dialogBox.close).toHaveBeenCalled();
  });

  it('should emit confirmEvent and call close() on dialogBox when confirm() is called', () => {
    spyOn(component.confirmEvent, 'emit');
    component.dialogBox = jasmine.createSpyObj('DialogComponent', ['close']);

    component.confirm();

    expect(component.confirmEvent.emit).toHaveBeenCalledWith("Confirmation");
    expect(component.dialogBox.close).toHaveBeenCalled();
  });

  it('should switch to secondary tab and fetch details data when onSelectedChange is called with secondaryTab', () => {
    spyOn(loaderService, 'showLoader');
    spyOn(component, 'getDetailsData');

    component.onSelectedChange(component.secondaryTab, component.monId);

    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(component.getDetailsData).toHaveBeenCalled();
    expect(component.tabSelected).toBe(component.secondaryTab);
    expect(component.isPrimaryTabActive).toBeFalse();
    expect(component.isSecondaryTabActive).toBeTrue();
  });

  it('should switch to primary tab and fetch job log data when onSelectedChange is called with primaryTab', () => {
    spyOn(loaderService, 'showLoader');
    spyOn(component, 'getJobLogData');

    component.onSelectedChange(component.primaryTab, component.monId);

    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(component.getJobLogData).toHaveBeenCalled();
    expect(component.tabSelected).toBe(component.primaryTab);
    expect(component.isPrimaryTabActive).toBeTrue();
    expect(component.isSecondaryTabActive).toBeFalse();
  });

  it('should fetch details data and update detailsData on success', () => {

    spyOn(loaderService, 'hideLoader');

    const mockResponse = {
      status: {
        timestamp: "2025-02-11 04:42:19",
        responseStatus: "Success",
        responseCode: "200"
      },
      body: {
        monId: 123986,
        couCode: "FR",
        tprId: 1364,
        job_id: 30774,
        unix_process: 324649,
        session: "A_PRDINI",
        management_unit: "E___FRCITL",
        command_line: "COU_CODE=FR;IMDB_SCHEMA=ECLIPSE_IMDB02;USER_ID=186000;WORKTEAM_ID=4;",
        step: "C_IAS - Ias Controller",
        week: "W 2025 06",
        execution_server: "INSTRUCTION",
        status: "DONE",
        result: "OK"
  }
};

    spyOn(detailsDataService, 'getJobDetails').and.returnValue(of(mockResponse));
    component.monId = 120391;
    component.detailsPath = 'testDetailsPath';
    component.getDetailsData();

    expect(detailsDataService.getJobDetails).toHaveBeenCalledWith(120391, 'testDetailsPath');
    expect(loaderService.hideLoader).toHaveBeenCalled();
  });

  it('should handle error response and set error properties', () => {
    spyOn(loaderService, 'hideLoader');

    const mockError = {
      error: {
        status: {
          errors: [{ code: '404', message: 'Not Found' }],
          responseStatus: 'FAIL'
        }
      }
    };

    spyOn(detailsDataService, 'getJobDetails').and.returnValue(throwError(() => mockError));

    component.getDetailsData();

    expect(detailsDataService.getJobDetails).toHaveBeenCalledWith(component.monId, component.detailsPath);
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.isSecondaryTabActive).toBeFalse();
    expect(component.hasError).toBeTrue();
    expect(component.errorCode).toBe('404 FAIL');
    expect(component.errorMessage).toBe('Not Found');
  });

  it('should fetch job log data and update job log data on success', () => {

    spyOn(loaderService, 'hideLoader');

    spyOn(detailsDataService, 'getJobLogDetails');
    // component.monId = 120391;
    component.detailsPath = 'testDetailsPath';
    component.getJobLogData(component.monId);

    expect(detailsDataService.getJobLogDetails).toHaveBeenCalledWith();
    expect(loaderService.hideLoader).toHaveBeenCalled();
  });

  it('should handle error response and set error properties', () => {
    spyOn(loaderService, 'hideLoader');

    const mockError = {
      error: {
        status: {
          errors: [{ code: '404', message: 'Not Found' }],
          responseStatus: 'FAIL'
        }
      }
    };

    spyOn(detailsDataService, 'getJobLogDetails').and.returnValue(throwError(() => mockError));

    component.getJobLogData(component.monId);

    expect(detailsDataService.getJobLogDetails).toHaveBeenCalledWith();
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.isPrimaryTabActive).toBeFalse();
    expect(component.hasError).toBeTrue();
    expect(component.errorCode).toBe('404 FAIL');
    expect(component.errorMessage).toBe('Not Found');
  });

  it('should call delete when deleteConfirmation is called', () => {
    spyOn(component, 'delete');

    component.deleteConfirmation('Test');

    expect(component.delete).toHaveBeenCalled();
  });

  it('should log "resolve" when delete is called', () => {
    spyOn(console, 'log');

    component.delete('resolve');

    expect(console.log).toHaveBeenCalledWith('resolve');
  });

  it('should toggle tabs correctly when switching to the primary tab', () => {
    component.onSelectedChange(component.primaryTab, component.monId);
    expect(component.tabSelected).toBe(component.primaryTab);
    expect(component.isPrimaryTabActive).toBeTrue();
    expect(component.isSecondaryTabActive).toBeFalse();
  })

  it('should toggle tabs correctly when switching to the secondary tab', () => {
    component.onSelectedChange(component.secondaryTab, component.monId);
    expect(component.tabSelected).toBe(component.secondaryTab);
    expect(component.isSecondaryTabActive).toBeTrue();
    expect(component.isPrimaryTabActive).toBeFalse();
  })

  it('should download a file', fakeAsync(() => {
    const mockBlob = new Blob(['test'], { type: 'text/plain' });
    spyOn(detailsDataService, 'downloadFile').and.returnValue(of(mockBlob))
    spyOn(window.URL, 'createObjectURL').and.returnValue('mockUrl');
    spyOn(saveAs, 'saveAs');

    component.downloadFile();
    tick();

    expect(detailsDataService.downloadFile).toHaveBeenCalled();
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(saveAs).toHaveBeenCalledWith('mockUrl', 'log-file');
  })
  )

  it('should unsubscribe step details subscription on ngOnDestroy', () => {
    spyOn(component.stepDetailsSubscription, 'unsubscribe');
    spyOn(component.jobLogSubscription, 'unsubscribe');
    spyOn(component.saveLogSubscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(component.stepDetailsSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.jobLogSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.saveLogSubscription.unsubscribe).toHaveBeenCalled();
  });

});
