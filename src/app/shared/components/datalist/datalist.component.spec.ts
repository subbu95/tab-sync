import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatalistComponent } from './datalist.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DatalistComponent', () => {
  let component: DatalistComponent;
  let fixture: ComponentFixture<DatalistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatalistComponent, BrowserAnimationsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DatalistComponent);
    component = fixture.componentInstance;
    const mockData = [
      { id: '1', name: 'Volvo' },
      { id: '3', name: 'BMW' },
      { id: '4', name: 'Ford' },
      { id: '5', name: 'Mazda' },
      { id: '6', name: 'I10' },
    ];
    component.menuItems = mockData;
    component.labelKey = 'name';
    component.valueKey = 'id';
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('selected value defind', () => {
    component.selValue = '3';
    component.ngOnInit();
    expect(component.selected).toBe('BMW');
  });

  it('onSelection', () => {
    component.onSelection('Ford');
    expect(component.selected).toBe('Ford');
  });
  it('onSelection  in case there is no matching option', () => {
    component.onSelection('tes');
    expect((component as DatalistComponent).selected).toBe('');
  });

  it('should register the onChange function', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fn = () => { };
    component.registerOnChange(fn);
    expect(component.onChanged).toBe(fn);
  });

  it('should register the OnTouched function', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fn = () => { };
    component.registerOnTouched(fn);
    expect(component.onTouched).toBe(fn);
  });

  it('should register the setDisabledState function', () => {
    const fn = true;
    component.setDisabledState(fn);
    expect(component.disabled).toBe(fn);
  });
  it('should register the writeValue function', () => {
    const fn = 'test';
    component.writeValue(fn);
    // expect((component as any).selected).toBe(fn);
    expect(component.control.value).toBe(fn)
  });
  it('should register the writeValue unassign function', () => {
    const fn = null;
    component.writeValue(fn);
    // expect((component as any).selected).toBe('--select--');
    expect(component.control.value).toBe('');
  });
  it('should emit the correct value when keyOnSelection is called', () => {
    const testValue = 'testValue';
    const keyChangeEmitterSpy = spyOn(component.keyChangeEmitter, 'emit');
    // Call the method with the test value
    component.keyOnSelection(testValue);
    // Check that the emit method was called with the correct value
    expect(keyChangeEmitterSpy).toHaveBeenCalledWith(testValue);
  });
});

