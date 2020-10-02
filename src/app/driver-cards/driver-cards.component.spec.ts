import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverCardsComponent } from './driver-cards.component';

describe('DriverCardsComponent', () => {
  let component: DriverCardsComponent;
  let fixture: ComponentFixture<DriverCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
