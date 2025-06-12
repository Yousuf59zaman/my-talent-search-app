import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputComponent, InputType } from './input.component';
import { By } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';

describe('InputComponent', () => {
  let component: InputComponent<string>;
  let fixture: ComponentFixture<InputComponent<string>>;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputComponent<string>);
    component = fixture.componentInstance;
    changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should render placeholder text as passed input', () => {
    const placeholderValue = "This is the Test Placeholder";

    fixture.componentRef.setInput('placeholder', placeholderValue);
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.placeholder).toBe(placeholderValue);
  })

  it('Should render input as Required when required is equal true and vice versa', () => {
    const isRequired = false;
    fixture.componentRef.setInput('isRequired', isRequired);
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.required).toBe(isRequired);
  })

  it('Should render type of input passed from parent', () => {
    const type = 'password';

    fixture.componentRef.setInput('type', type);
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const inputElem: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElem.type).toBe(type);
  });

  it('Should render label if label is passed from parent', ()=> {
    const label = 'Test Label';

    fixture.componentRef.setInput('label', label);
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const labelElement: HTMLElement = fixture.debugElement.query(By.css("[data-testid='label']")).nativeElement;
    expect(labelElement.textContent).toBe(label);
  })

  it('Should not render label if label is not passed from parent', ()=> {
    const label = '';

    fixture.componentRef.setInput('label', label);
    changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const labelElement: HTMLElement = fixture.debugElement.query(By.css("[data-testid='label']"))?.nativeElement;
    expect(labelElement).toBeUndefined();
  })

});
