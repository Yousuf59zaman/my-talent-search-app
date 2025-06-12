import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedListTabComponent } from './purchased-list-tab.component';

describe('PurchasedListTabComponent', () => {
  let component: PurchasedListTabComponent;
  let fixture: ComponentFixture<PurchasedListTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasedListTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasedListTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
