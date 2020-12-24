import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FinalResultsComponent } from './final-results.component';

describe('FinalResultsComponent', () => {
  let component: FinalResultsComponent;
  let fixture: ComponentFixture<FinalResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
