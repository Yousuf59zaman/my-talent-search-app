import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioComponent } from './radio.component';
import { ChangeDetectorRef, DebugElement, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SelectRadioData } from '../../models/models';

describe('RadioComponent', () => {
  let component: RadioComponent;
  let fixture: ComponentFixture<RadioComponent>;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    const radioData = signal<SelectRadioData[]>([
      {
        id: 1,
        name: 'test',
        label: 'test',
      },
      {
        id: 2,
        name: 'test2',
        label: 'test2',
      },
    ]);

    component.radioItems =
      radioData as unknown as typeof fixture.componentInstance.radioItems;
    changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should have selected value intially if value is set from formcontrol', () => {
    const formControl = new FormControl(2);

    component.control.set(formControl);
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const elems: DebugElement[] = fixture.debugElement.queryAll(
      By.css('input[type="radio"]')
    );
    const firstControl: HTMLInputElement = elems[0].nativeElement;
    const secondControl: HTMLInputElement = elems[1].nativeElement;
    expect(firstControl.checked).toBeFalsy();
    expect(secondControl.checked).toBeTruthy();
  });
});
