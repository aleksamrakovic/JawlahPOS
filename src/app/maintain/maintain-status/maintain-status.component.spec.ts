import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintainStatusComponent } from './maintain-status.component';

describe('MaintainStatusComponent', () => {
  let component: MaintainStatusComponent;
  let fixture: ComponentFixture<MaintainStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintainStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintainStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
