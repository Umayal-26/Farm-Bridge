import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerCartComponentComponent } from './dealer-cart.component.component';

describe('DealerCartComponentComponent', () => {
  let component: DealerCartComponentComponent;
  let fixture: ComponentFixture<DealerCartComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealerCartComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealerCartComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
