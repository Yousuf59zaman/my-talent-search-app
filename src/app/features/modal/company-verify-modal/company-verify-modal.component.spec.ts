import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyVerifyModalComponent } from './company-verify-modal.component';

describe('CompanyVerifyModalComponent', () => {
  let component: CompanyVerifyModalComponent;
  let fixture: ComponentFixture<CompanyVerifyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyVerifyModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyVerifyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
