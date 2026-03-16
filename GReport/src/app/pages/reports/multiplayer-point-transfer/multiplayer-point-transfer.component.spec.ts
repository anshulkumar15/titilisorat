import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplayerPointTransferComponent } from './multiplayer-point-transfer.component';

describe('MultiplayerPointTransferComponent', () => {
  let component: MultiplayerPointTransferComponent;
  let fixture: ComponentFixture<MultiplayerPointTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplayerPointTransferComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiplayerPointTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
