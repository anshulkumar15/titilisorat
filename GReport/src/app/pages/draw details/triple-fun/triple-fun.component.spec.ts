import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripleFunComponent } from './triple-fun.component';

describe('TripleFunComponent', () => {
  let component: TripleFunComponent;
  let fixture: ComponentFixture<TripleFunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripleFunComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TripleFunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
