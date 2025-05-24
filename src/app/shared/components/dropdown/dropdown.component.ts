import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IconModule, TooltipModule } from '@nielseniq/athena-core';
import { CountryFlagPipe } from '../../pipe/country-flag.pipe';
import { TruncatePipe } from '../../pipe/truncate.pipe';

@Component({
  selector: 'eclipse-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TooltipModule,
    CountryFlagPipe,
    IconModule,
    TruncatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DropdownComponent),
    },
  ],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DropdownComponent implements OnInit, ControlValueAccessor {
  @Input() menuItems!: any;
  @Input() valueKey = 'value';
  @Input() labelKey = 'label';
  @Input() disabled = false;
  // @Input() heading = '';
  @Input() setDefault!: string;
  @Input() defaultLabelText = 'Select option';
  @Input() onWhite = false;
  @Input() size = 'medium';
  @Input() isDefaultLabelRequired = true;
  @Input() isStringList = false;
  @Input() fieldName!: string;
  @Input() filterdropdownWidth: string ='';
  @Output() changeEmitter: EventEmitter<string> = new EventEmitter<string>();

  searchText = '';
  selectedValue = '';

  onTouchedCallback: (value: string) => void = (_value) => { console.log(_value) };

  onChangeCallback: (value: string) => void = (_value) => { console.log(_value) };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => { };
  control = new FormControl({ value: '', disabled: this.disabled });

  bgColor = ''
  selected = '';
  selectedOption!: string;

  ngOnInit() {
    if (this.onWhite) {
      //on the property changes to onWhite true , background will change accordingly to white background
      this.bgColor = 'on-white'
    }
    // setting up the default from 'setDefault' input Decorator
    if (this.setDefault && this.setDefault != '') {
      const item = this.menuItems.find((e: any) => e[this.valueKey] == this.setDefault);
      this.selected = item ? item[this.valueKey] : '';
    }
  }

  selectionChange(value: string) {
    //on the selection change of dropdown value will be emit to the parent component with formcontrol
    this.selected = value;
    this.onChangeCallback(value); // it is provided by the parent component and value is passed as an argument to notify parent
    this.changeEmitter.emit(value) // emits the value observable and parent component to listen the changes
  }

  writeValue(value: string): void {
    //this.selectedOption = val ?? this.defaultLabelText;
    if (value) {
      //setting the control value
      this.selected = value;
      this.control.setValue(value, { emitEvent: false });
    } else {
      // if val is null or empty control will be reset
      this.selected = '';
      this.control.reset('');
    }
  }
  registerOnChange(fn: (value: string) => void): void {
    //Registers a callback function that is called when the control's value changes in the UI.
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: (value: string) => void): void {
    //Registers a callback function that is called by the forms API on initialization to update the form model
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    //Function that is called by the forms API when the control status changes to or from 'DISABLED'. Depending on the status, it enables or disables the appropriate DOM element.
    this.disabled = isDisabled;
  }

  get selectedCountry() {
    return this.menuItems.find(
      (country: any) => country[this.valueKey] === this.control.value
    );
  }
  public iconName = 'chevron-down';
  onOpenedChange(isOpened: boolean) {
    if (isOpened) {
      this.iconName = 'chevron-up'
    } else {
      this.iconName = 'chevron-down'
      this.searchText = ''
    }
  }
  filteredOptions(): any {
    if(this.isStringList) {
      return this.menuItems.filter((opt: any) => opt.toLowerCase().startsWith(this.searchText.toLowerCase()));
    } 
    else {
      return this.menuItems.filter((opt: any) => opt[this.labelKey].toLowerCase().startsWith(this.searchText.toLowerCase()));
    }
  }
}
