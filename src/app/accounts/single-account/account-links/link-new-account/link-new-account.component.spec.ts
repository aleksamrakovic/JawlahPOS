import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkNewAccountComponent } from './link-new-account.component';

describe('LinkNewAccountComponent', () => {
  let component: LinkNewAccountComponent;
  let fixture: ComponentFixture<LinkNewAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkNewAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkNewAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
