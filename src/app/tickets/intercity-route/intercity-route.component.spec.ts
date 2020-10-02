import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntercityRouteComponent } from './intercity-route.component';

describe('IntercityRouteComponent', () => {
  let component: IntercityRouteComponent;
  let fixture: ComponentFixture<IntercityRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntercityRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntercityRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
