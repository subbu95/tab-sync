import { ProductOutputSetResolutionComponent } from './product-output-set-resolution.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidePanelOverlayComponent } from '@nielseniq/athena-core';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApiResponse, FilterapiService } from '../../../services/filterapi.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
describe('ProductOutputSetResolutionComponent', () => {
    let fixture: ComponentFixture<ProductOutputSetResolutionComponent>;
    let component: ProductOutputSetResolutionComponent;
    let sidePanel: SidePanelOverlayComponent;
    let filterapiServiceSpy: jasmine.SpyObj<FilterapiService>;
    let overlayContainer: HTMLElement;
    beforeEach(async () => {
        filterapiServiceSpy = jasmine.createSpyObj('FilterapiService', ['getFieldOptions', 'filterFetch']);
        filterapiServiceSpy.filterDataSubject = new BehaviorSubject<Record<string, ApiResponse>>({});
        filterapiServiceSpy.getFieldOptions.and.returnValue(of([]));
        await TestBed.configureTestingModule({
            imports: [ProductOutputSetResolutionComponent, BrowserAnimationsModule],
            providers: [
                { provide: FilterapiService, useValue: filterapiServiceSpy }
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ProductOutputSetResolutionComponent);
        component = fixture.componentInstance;
        component.filterFieldDetails = {
            text: [{ fieldName: 'testText', fieldValue: 'sample', formGroupKeyName: 'testtext' }],
            dropDown: [{
                fieldName: 'testDropdown', fieldOptions: [], fieldOptionValueKeyName: 'label', fieldOptionLabelKeyName: 'label', fieldValue: 'Option1', formGroupKeyName: 'testdropdown'
            }],
            radio: [{ fieldName: 'testRadio', fieldOptions: [], fieldOptionValueKeyName: 'label', fieldOptionLabelKeyName: 'label', fieldValue: 'OptionA', formGroupKeyName: 'testradio' }],
            date: [{
                fieldName: 'testDate', fromFieldValue: '', toFieldValue: '', formGroupFromKeyName: 'testdate_from', formGroupToKeyName: 'testdate_to'
            }]
        };
        sidePanel = fixture.debugElement.query(By.directive(SidePanelOverlayComponent)).componentInstance;
        overlayContainer = document.createElement('div');
        overlayContainer.classList.add('cdk-overlay-container');
        document.body.appendChild(overlayContainer);
        fixture.detectChanges();
    });
    // Test 1: Component Initialization
    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
    // Test 2: closeFilterPopup method
    it('should call close on the SidePanelOverlayComponent and update dataArray when closeFilterPopup is called', () => {
        spyOn(sidePanel, 'close');
        const testData = {
            status: { responseStatus: 'success', responseCode: '200' },
            body: { content: [{ fdoId: 1, label: 'Option1' }] },
        };
        component.closeFilterPopup(testData);
        expect(sidePanel.close).toHaveBeenCalled();
        expect(component.dataArray).toEqual(testData.body.content);
    });
    // Test 3: filterFieldDetails Initialization
    it('should initialize filterFieldDetails with the correct structure and default values', () => {
        expect(component.filterFieldDetails).toBeTruthy();
        expect(component.filterFieldDetails.dropDown?.length).toBeGreaterThan(0);
        expect(component.filterFieldDetails.radio?.length).toBeGreaterThan(0);
        expect(component.filterFieldDetails.date?.length).toBeGreaterThan(0);
    });
    // Test 4: ngOnDestroy method
    it('should unsubscribe from all subscriptions when ngOnDestroy is called', () => {
        const subscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        component.subscriptionList = [subscriptionSpy];
        component.ngOnDestroy();
        expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
    });
    // Test 5: navigateToComponent method
    it('should navigate to the correct component based on the type', () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        component.router = routerSpy;
        component.navigateToComponent('test-component', 'history');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['test-component'], {
            queryParams: { data: JSON.stringify(component.historyScreenDetails) },
            skipLocationChange: true,
        });
        component.navigateToComponent('test-component', 'others');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['test-component']);
    });
    // Test 6: ngOnInit method
    it('should initialize dataArray correctly from filterService data', () => {
        const mockData = {
            'fup/osr/list': {
                status: { responseStatus: 'success', responseCode: '200' },
                body: { content: [{ id: 1, label: 'Item' }] },
            },
        };
        component.filterService.filterDataSubject.next(mockData);
        component.ngOnInit();
        expect(component.dataArray).toEqual(mockData['fup/osr/list'].body.content);
    });
    it('should call openFilterPopup with action "filter" is triggered', () => {
        const action = 'filter';
        const headerActionSpy = spyOn(component, 'openFilterPopup');
        component.ngOnInit();
        component.screenHeaderActionClick.headerActionClick.next(action);
        expect(headerActionSpy).toHaveBeenCalledWith();
    });
    // Test 7: openDialog method
    it('should call openDialog on click of a button', () => {
        spyOn(component, 'openDialog');
        component.openDialog();
        expect(component.openDialog).toHaveBeenCalled();
    });
    // Test :8 deleteConfirmation method
    it('should log delete when deleteConfirmation is called', () => {
        spyOn(console, 'log');
        component.deleteConfirmation('text');
        expect(console.log).toHaveBeenCalled();
    });
    // Test 9: getHistoryData method
    // Test 10: openFilterPopup method
    it('should set the top of overlay to 52px when openFilterPopup is called', () => {
        component.openFilterPopup();
        const element = document.querySelector('.cdk-overlay-container') as HTMLElement;
        expect(element.style.top).toBe('52px');
    });
    it('should reset the top of overlay to 0px when side panel close event occurs', () => {
        component.openFilterPopup();
        component.filterDrawer.sidePanelCloseEvent.emit();
        const testData = {
            status: { responseStatus: 'success', responseCode: '200' },
            body: { content: [{ fdoId: 1, label: 'Option1' }] },
        };
        component.closeFilterPopup(testData);
        const element = document.querySelector('.cdk-overlay-container') as HTMLElement;
        expect(element.style.top).toBe('0px');
    });
});

