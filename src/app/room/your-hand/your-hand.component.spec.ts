import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YourHandComponent } from './your-hand.component';

describe('YourHandComponent', () => {
  let component: YourHandComponent;
  let fixture: ComponentFixture<YourHandComponent>;

  beforeEach(waitForAsync(() => {
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
