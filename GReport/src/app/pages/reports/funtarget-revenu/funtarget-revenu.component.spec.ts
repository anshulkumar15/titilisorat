import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuntargetRevenuComponent } from './funtarget-revenu.component';

describe('FuntargetRevenuComponent', () => {
  let component: FuntargetRevenuComponent;
  let fixture: ComponentFixture<FuntargetRevenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuntargetRevenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FuntargetRevenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
