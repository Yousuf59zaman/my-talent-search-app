import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutComponent } from './layout.component';
import { ConfirmationModalService } from '../../services/confirmationModal/confirmation-modal.service';
import { ModalService } from '../../services/modal/modal.service';
import { CircularLoaderService } from '../../services/circularLoader/circular-loader.service';
import { DestroyRef } from '@angular/core';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        ConfirmationModalService,
        ModalService,
        CircularLoaderService,
        DestroyRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
