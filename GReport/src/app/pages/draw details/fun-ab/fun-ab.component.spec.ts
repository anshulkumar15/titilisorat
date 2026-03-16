import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunABComponent } from './fun-ab.component';

describe('FunABComponent', () => {
  let component: FunABComponent;
  let fixture: ComponentFixture<FunABComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunABComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FunABComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
