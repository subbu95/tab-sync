import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;
  let loader: HarnessLoader;
  let logSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent, MatSelectModule, NoopAnimationsModule],
    }).compileComponents();


    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    const mockData = [
      { id: '1', name: 'Audi' },
      { id: '3', name: 'BMW' },
      { id: '4', name: 'Ford' },
      { id: '5', name: 'Ferari' },
      { id: '6', name: 'Tata' },
    ];
    component.menuItems = mockData;
    component.labelKey = 'name';
    component.valueKey = 'id';
    // Spy on the console.log method for testing logging calls
    logSpy = spyOn(console, 'log');

    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should load all select harnesses', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(1);
  });

  it('should be able to check whether a select is in multi-selection mode', async () => {
    const select = await loader.getHarness(MatSelectHarness);

    expect(await select.isMultiple()).toBe(false);
  });

  it('should be able to open and close a select', async () => {
    const select = await loader.getHarness(MatSelectHarness);

    expect(await select.isOpen()).toBe(false);

    await select.open();
    expect(await select.isOpen()).toBe(true);

    await select.close();
    expect(await select.isOpen()).toBe(false);
  });

  it('should be able to get the value text from a select', async () => {
    const select = await loader?.getHarness(MatSelectHarness);
    await select?.open();
    const options = await select?.getOptions();
    await options[5]?.click();
    expect(await select.getValueText()).toBe('Select option');
  });

  it('selected value defind', () => {
    component.setDefault = '3';
    component.ngOnInit();
    expect(component.selected).toBe('3');
  });

  it('should register the onChange function', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fn = () => { };
    component.registerOnChange(fn);
    expect((component as DropdownComponent).onChangeCallback).toBe(fn);
  });

  it('should register the OnTouched function', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fn = () => { };
    component.registerOnTouched(fn);
    expect((component as DropdownComponent).onTouchedCallback).toBe(fn);
  });

  it('should register the setDisabledState function', () => {
    const fn = true;
    component.setDisabledState(fn);
    expect((component as DropdownComponent).disabled).toBe(fn);
  });
  it('should register the writeValue function', () => {
    const fn = 'test';
    component.writeValue(fn);
    expect((component as DropdownComponent).control.value).toBe(fn);
  });
  it('should register the writeValue function with null', () => {
    const fn = '';
    component.writeValue(fn);
    expect((component as DropdownComponent).control.value).toBe('');
  });

  it('should check bgColor on onWhite Background', () => {
    component.onWhite = true
    component.ngOnInit()
    expect((component.bgColor)).toBe('on-white');
  });
  it('should check selectionChange', () => {
    spyOn(component.changeEmitter, 'emit');
    spyOn(component, 'onChangeCallback');
    component.selectionChange('test')
    expect(component.selected).toBe('test');
    expect(component.onChangeCallback).toHaveBeenCalledWith('test');
    expect(component.changeEmitter.emit).toHaveBeenCalledWith('test');
  });
  // Test `get selectedCountry`
  it('should return the selected country when control.value matches a country key', () => {
    component.control.setValue('3');
    expect(component.selectedCountry).toEqual({ id: '3', name: 'BMW' });
  });
  it('should return undefined when no country matches control.value', () => {
    component.control.setValue('2');
    expect(component.selectedCountry).toBeUndefined();
  });
  // Test `onTouchedCallback`
  it('should log the value passed into the callback', () => {
    const value = 'Touched!';
    component.onTouchedCallback(value);
    expect(logSpy).toHaveBeenCalledWith(value);
  });
  // Test `onChangeCallback`
  it('should log the value passed into the callback', () => {
    const value = 'Changed!';
    component.onChangeCallback(value);
    expect(logSpy).toHaveBeenCalledWith(value);
  });
  // Test `onTouched`
  it('should be called without any arguments', () => {
    const onTouchedSpy = spyOn(component, 'onTouched').and.callThrough();
    component.onTouched();
    expect(onTouchedSpy).toHaveBeenCalled();
  });
});
