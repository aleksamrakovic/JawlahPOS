import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntercityComponent } from './intercity.component';

describe('IntercityComponent', () => {
  let component: IntercityComponent;
  let fixture: ComponentFixture<IntercityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntercityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntercityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
