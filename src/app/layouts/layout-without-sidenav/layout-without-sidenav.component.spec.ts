import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutWithoutSidenavComponent } from './layout-without-sidenav.component';

describe('LayoutWithoutSidenavComponent', () => {
  let component: LayoutWithoutSidenavComponent;
  let fixture: ComponentFixture<LayoutWithoutSidenavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutWithoutSidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutWithoutSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
