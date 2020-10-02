import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccTicketsListComponent } from './acc-tickets-list.component';

describe('AccTicketsListComponent', () => {
  let component: AccTicketsListComponent;
  let fixture: ComponentFixture<AccTicketsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccTicketsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccTicketsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
