import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridUiComponent } from './grid-ui.component';

describe('GridUiComponent', () => {
  let component: GridUiComponent;
  let fixture: ComponentFixture<GridUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridUiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GridUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
