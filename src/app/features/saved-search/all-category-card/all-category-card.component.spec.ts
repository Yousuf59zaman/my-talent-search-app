import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCategoryCardComponent } from './all-category-card.component';

describe('AllCategoryCardComponent', () => {
  let component: AllCategoryCardComponent;
  let fixture: ComponentFixture<AllCategoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCategoryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCategoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
