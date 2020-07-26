import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YourHandComponent } from './your-hand.component';

describe('YourHandComponent', () => {
  let component: YourHandComponent;
  let fixture: ComponentFixture<YourHandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YourHandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YourHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
