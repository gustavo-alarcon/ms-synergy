import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarSerieComponent } from './generar-serie.component';

describe('GenerarSerieComponent', () => {
  let component: GenerarSerieComponent;
  let fixture: ComponentFixture<GenerarSerieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerarSerieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerarSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
