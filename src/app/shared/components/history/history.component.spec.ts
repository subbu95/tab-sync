import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HistoryScreenComponent } from './history.component';
describe('HistoryScreenComponent', () => {
    let component: HistoryScreenComponent;
    let fixture: ComponentFixture<HistoryScreenComponent>;
    let mockActivatedRoute: object;
    let mockRouter: Record<'navigate', object>;
    beforeEach(() => {
        // Mocking ActivatedRoute and Router
        mockActivatedRoute = {
            queryParams: of({
                data: '{"screenTitle": "INI3 - Overall initialization", "screenComponentName": "overall-initialisation", "filterFieldObject": {"field1": "value1"}, "gridDataObject": [], "gridColumnNames": ["col1", "col2"]}'
            })
        };
        mockRouter = {
            navigate: jasmine.createSpy('navigate')
        };
        TestBed.configureTestingModule({
            imports: [HistoryScreenComponent],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(HistoryScreenComponent);
        component = fixture.componentInstance;
    });
    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
    it('should initialize historyScreenDetails from query params', () => {
        component.ngOnInit();
        expect(component.historyScreenDetails).toEqual({
            screenTitle: 'INI3 - Overall initialization',
            screenComponentName: 'overall-initialisation',
            filterFieldObject: { field1: 'value1' },
            gridDataObject: [],
            gridColumnNames: ['col1', 'col2']
        });
    });
    it('should call goBack and navigate correctly', () => {
        // Initialize the historyScreenDetails first
        component.historyScreenDetails = {
            screenTitle: 'INI3 - Overall initialization',
            screenComponentName: 'overall-initialisation',
            filterFieldObject: { field1: 'value1' },
            gridDataObject: [],
            gridColumnNames: ['col1', 'col2']
        };
        // Call goBack
        component.goBack();
        // Check if navigate was called with the correct URL and options
        expect(mockRouter.navigate).toHaveBeenCalledWith(['follow-up/overall-initialisation'], { skipLocationChange: true });
    });
    it('should return the keys of an object from objectKeys()', () => {
        const obj = { field1: 'value1', field2: 'value2' };
        const keys = component.objectKeys(obj);
        expect(keys).toEqual(['field1', 'field2']);
    });
    it('should return empty array if object is empty in objectKeys()', () => {
        const obj = {};
        const keys = component.objectKeys(obj);
        expect(keys).toEqual([]);
    });
});
