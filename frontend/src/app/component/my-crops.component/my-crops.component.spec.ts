import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCropsComponent } from './my-crops.component';

describe('MyCropsComponent', () => {
  let component: MyCropsComponent;
  let fixture: ComponentFixture<MyCropsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCropsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCropsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
