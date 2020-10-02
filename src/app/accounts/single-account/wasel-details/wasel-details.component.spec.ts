import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaselDetailsComponent } from './wasel-details.component';

describe('WaselDetailsComponent', () => {
  let component: WaselDetailsComponent;
  let fixture: ComponentFixture<WaselDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaselDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaselDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
