import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceBlockComponent } from './device-block.component';

describe('DeviceBlockComponent', () => {
  let component: DeviceBlockComponent;
  let fixture: ComponentFixture<DeviceBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
