import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCategoryTabComponent } from './all-category-tab.component';

describe('AllCategoryTabComponent', () => {
  let component: AllCategoryTabComponent;
  let fixture: ComponentFixture<AllCategoryTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCategoryTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCategoryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
