import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedFiltersTabComponent } from './saved-filters-tab.component';

describe('SavedFiltersTabComponent', () => {
  let component: SavedFiltersTabComponent;
  let fixture: ComponentFixture<SavedFiltersTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedFiltersTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedFiltersTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
