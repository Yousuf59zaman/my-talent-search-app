import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';
import { ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;
  let changeDetectorRef: ChangeDetectorRef

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should render checked input if we pass true from parent', () => {

    const formControl = new FormControl(true);

    component.control.set(formControl);
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const inputElement:HTMLInputElement = fixture.debugElement.query(By.css('[data-testid="allow-user"]')).nativeElement;
    expect(inputElement.checked).toBeTruthy();
  })

  it('Should be checked and readonly if passed the data accordingly', () => {

    const formControl = new FormControl(true);

    component.control.set(formControl);
    fixture.componentRef.setInput('isDisabled', true);
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const inputElement:HTMLInputElement = fixture.debugElement.query(By.css('[data-testid="allow-user"]')).nativeElement;
    expect(inputElement.checked).toBeTruthy();
    expect(inputElement.readOnly).toBeTruthy();
  })

  it('Should toggle checkbox if clicked on label', () => {
    const formControl = new FormControl(false);

    component.control.set(formControl);
    component.onClickLabel();
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const inputElement:HTMLInputElement = fixture.debugElement.query(By.css('[data-testid="allow-user"]')).nativeElement;
    expect(inputElement.checked).toBeTruthy();
  })
});
