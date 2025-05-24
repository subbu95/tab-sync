import { TestBed } from '@angular/core/testing';

import { ScreenheaderbuttonclickService } from './screenheaderbuttonclick.service';

describe('ScreenheaderbuttonclickService', () => {
  let service: ScreenheaderbuttonclickService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenheaderbuttonclickService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should emit header action click with correct action name', () => {
    spyOn(service.headerActionClick, 'emit'); // spy on the EventEmitter
    const actionName = 'HeaderAction';
    service.emitHeaderActionClick(actionName);
    expect(service.headerActionClick.emit).toHaveBeenCalledWith(actionName); // check that it was called with the correct value
  });
  it('should emit list action click with correct action name and rowData', () => {
    spyOn(service.listActionClick, 'emit'); // spy on the EventEmitter
    const actionName = 'ListAction';
    const rowData = { id: 1, name: 'Test Row' };
    const expectedPayload = JSON.stringify({ actionName, rowData });
    service.emitListActionClick(actionName, rowData);
    expect(service.listActionClick.emit).toHaveBeenCalledWith(expectedPayload); // check that it was called with the serialized string
  });
});
