import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropsListComponent } from './crops-list.component';

describe('CropsListComponent', () => {
  let component: CropsListComponent;
  let fixture: ComponentFixture<CropsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
