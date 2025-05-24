import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScreenheaderComponent } from './screenheader.component';
import { TranslateModule, TranslateService  } from '@ngx-translate/core';
import { DetailsDataService } from '../../../services/details-data.service';
import { saveAs } from 'file-saver';
import { provideHttpClient } from '@angular/common/http';


describe('ScreenheaderComponent', () => {
    let component: ScreenheaderComponent;
    let fixture: ComponentFixture<ScreenheaderComponent>;
    let detailsDataService: DetailsDataService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ScreenheaderComponent, TranslateModule.forRoot()],
            providers: [ provideHttpClient(), DetailsDataService, TranslateService ],
        })
            .compileComponents();

        fixture = TestBed.createComponent(ScreenheaderComponent);
        detailsDataService = TestBed.inject(DetailsDataService);
        component = fixture.componentInstance;
        component.screenHeaderComponentDetails = {
            screenTitle: 'INI3 - Overall initialization-last steps',
            back: {
                actionIconName: 'arrow-standard-left',
                actionLabelName: 'Back',
            },
            download: {
                actionIconName: 'download',
                actionLabelName: 'Download',
            },
            filter: {
                actionIconName: 'filter',
                actionLabelName: 'Filter',
            },
            reset: {
              actionLabelName: 'reset',
              isFilterReset: false
            }
        }
        component.screenHeaderActionClick = jasmine.createSpyObj('screenHeaderActionClick', ['emitHeaderActionClick']);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call emitHeaderActionClick with correct action', () => {
        const action = 'ActionTest';
        // Call onActionClick with a test action
        component.onActionClick(action);
        // Verify that emitHeaderActionClick was called with the correct action
        expect(component.screenHeaderActionClick.emitHeaderActionClick).toHaveBeenCalledWith(action);
    });
    it('should download a file', fakeAsync(() => {
        const mockBlob = new Blob(['test'], { type: 'text/plain' });
        spyOn(detailsDataService, 'getExcelExportFile').and.returnValue(of(mockBlob))
        spyOn(window.URL, 'createObjectURL').and.returnValue('mockUrl');
        spyOn(saveAs, 'saveAs');
    
        component.onDownload();
        tick();
    
        expect(detailsDataService.getExcelExportFile).toHaveBeenCalled();
        expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
        expect(saveAs).toHaveBeenCalledWith('mockUrl', 'log-file');
    }));
});
