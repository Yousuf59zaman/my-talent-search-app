import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedListCardComponent } from './purchased-list-card.component';

describe('PurchasedListCardComponent', () => {
  let component: PurchasedListCardComponent;
  let fixture: ComponentFixture<PurchasedListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasedListCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasedListCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
