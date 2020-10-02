import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltyDetailsComponent } from './penalty-details.component';

describe('PenaltyDetailsComponent', () => {
  let component: PenaltyDetailsComponent;
  let fixture: ComponentFixture<PenaltyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PenaltyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
