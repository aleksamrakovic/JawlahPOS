import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccIntercityRoutesComponent } from './acc-intercity-routes.component';

describe('AccIntercityRoutesComponent', () => {
  let component: AccIntercityRoutesComponent;
  let fixture: ComponentFixture<AccIntercityRoutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccIntercityRoutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccIntercityRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
