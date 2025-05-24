import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'eclipse-datalist',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatInputModule, CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DatalistComponent),
    },
  ],
  templateUrl: './datalist.component.html',
  styleUrl: './datalist.component.css'
})
export class DatalistComponent implements OnInit {
  @Input() menuItems!: Record<string, string>[]

  @Input() valueKey = "value";
  @Input() labelKey = "label";
  @Input() listname!: string;
  @Input() selValue!: string;
  @Input() isDisabled = false;
  @Input() fieldName = "";
  selectedUser : any = null;
  @Output() changeEmitter: EventEmitter<object> = new EventEmitter<object>();
  @Output() keyChangeEmitter: EventEmitter<string> = new EventEmitter<string>();

  @Input() selected!: string;
  disabled = false;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => { };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChanged: () => void = () => { };
  control = new FormControl({ value: '', disabled: this.isDisabled });
  actualUserID: string | undefined;

  ngOnInit() {
    if (this.selValue && this.selValue != '') {
      const item = this.menuItems.find((e: Record<string, string>) => e[this.valueKey] == this.selValue);
      this.selected = item ? item[this.labelKey] : '';
    }
  }
  onSelection(value: string) {
    const val = this.menuItems.find((e: Record<string, string>) => (e[this.labelKey] === value));
    if (val) {
     this.selectedUser = val ;
     this.actualUserID = val[this.labelKey]
     this.selected = `${val['firstName']}  ${val['lastName']}`;
     } else {
      this.selectedUser = null ;
      this.selected ='' ;
      this.actualUserID = '';
     }
  
    this.changeEmitter.emit(val);
  }

  keyOnSelection(value: string | undefined) {
    this.selectedUser = null;
    this.keyChangeEmitter.emit(value);
  }
  writeValue(value: string | null): void {
    // this.selected = value ?? '--select--';
    if (value) {
      //setting the control value
      this.control.setValue(this.selected, { emitEvent: false });
    } else {
      // if val is null or empty control will be reset
      this.menuItems = [];
      this.control.reset('');
    }
  }
  registerOnChange(fn: () => void): void {
    this.onChanged = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}

