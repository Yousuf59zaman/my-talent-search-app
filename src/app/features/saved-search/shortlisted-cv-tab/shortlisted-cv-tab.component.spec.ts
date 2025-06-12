import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortlistedCvTabComponent } from './shortlisted-cv-tab.component';

describe('ShortlistedCvTabComponent', () => {
  let component: ShortlistedCvTabComponent;
  let fixture: ComponentFixture<ShortlistedCvTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortlistedCvTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortlistedCvTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
