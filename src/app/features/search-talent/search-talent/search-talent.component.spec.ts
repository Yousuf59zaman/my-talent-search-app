import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTalentComponent } from './search-talent.component';

describe('SearchTalentComponent', () => {
  let component: SearchTalentComponent;
  let fixture: ComponentFixture<SearchTalentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchTalentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchTalentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
