import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokerRevenueComponent } from './poker-revenue.component';

describe('PokerRevenueComponent', () => {
  let component: PokerRevenueComponent;
  let fixture: ComponentFixture<PokerRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokerRevenueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PokerRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
