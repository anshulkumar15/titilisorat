import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoulletRevenuComponent } from './roullet-revenu.component';

describe('RoulletRevenuComponent', () => {
  let component: RoulletRevenuComponent;
  let fixture: ComponentFixture<RoulletRevenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoulletRevenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoulletRevenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
