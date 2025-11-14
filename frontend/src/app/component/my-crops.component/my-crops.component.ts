import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Crop } from '../../models/crop.model';
import { CropService } from '../../service/crop.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-crops',
  standalone: true,
  imports: [HttpClientModule,RouterModule, CommonModule, FormsModule],
  templateUrl: './my-crops.component.html',
  styleUrls: ['./my-crops.component.css']
})
export class MyCropsComponent implements OnInit {
  crops: Crop[] = [];
  editRow: Crop | null = null;
  message = '';
  loading = false;

  page = 0;
  size = 5;
  totalPages = 0;
  sort = 'id,desc';

  constructor(private svc: CropService) {}

  ngOnInit() {
    this.loadCrops();
  }

  loadCrops() {
    this.loading = true;
    this.svc.myCrops(this.page, this.size, this.sort).subscribe({
      next: (res) => {
        this.crops = res.content || res;
        this.totalPages = res.totalPages || 1;
        this.loading = false;
      },
      error: _ => {
        this.message = '❌ Failed to load crops.';
        this.loading = false;
      }
    });
  }

  changePage(p: number) {
    if (p >= 0 && p < this.totalPages) {
      this.page = p;
      this.loadCrops();
    }
  }

  startEdit(c: Crop) {
    this.editRow = { ...c };
  }

  cancelEdit() {
    this.editRow = null;
  }

  save() {
    if (!this.editRow) return;
    this.svc.update(this.editRow).subscribe({
      next: (updated) => {
        const i = this.crops.findIndex(x => x.id === updated.id);
        if (i >= 0) this.crops[i] = updated;
        this.message = '✅ Crop updated successfully.';
        this.editRow = null;
      },
      error: _ => this.message = '❌ Failed to save changes.'
    });
  }

  remove(id: number) {
    if (!confirm('Delete this crop?')) return;
    this.svc.remove(id).subscribe({
      next: _ => {
        this.crops = this.crops.filter(c => c.id !== id);
        this.message = '🗑️ Crop deleted.';
      },
      error: _ => this.message = '❌ Failed to delete crop.'
    });
  }
}
