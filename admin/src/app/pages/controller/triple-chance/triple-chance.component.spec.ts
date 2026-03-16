import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripleChanceComponent } from './triple-chance.component';

describe('TripleChanceComponent', () => {
  let component: TripleChanceComponent;
  let fixture: ComponentFixture<TripleChanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TripleChanceComponent]
    });
    fixture = TestBed.createComponent(TripleChanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
