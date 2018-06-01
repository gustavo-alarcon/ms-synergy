import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumSeriesComponent } from './num-series.component';

describe('NumSeriesComponent', () => {
  let component: NumSeriesComponent;
  let fixture: ComponentFixture<NumSeriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumSeriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
