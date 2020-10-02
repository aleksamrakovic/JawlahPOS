import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopUpAccountComponent } from './top-up-account.component';

describe('TopUpAccountComponent', () => {
  let component: TopUpAccountComponent;
  let fixture: ComponentFixture<TopUpAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopUpAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopUpAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
