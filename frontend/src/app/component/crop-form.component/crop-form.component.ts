import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CropService } from '../../service/crop.service';

@Component({
  selector: 'app-crop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './crop-form.component.html',
  styleUrls: ['./crop-form.component.css']
})
export class CropFormComponent {
  form: any;

  message = '';
  imagePreview: string | ArrayBuffer | null = null;
  types = ['Vegetable', 'Fruit', 'Grain', 'Flower', 'Spice', 'Other'];
  loading = false;

  constructor(private fb: FormBuilder, private svc: CropService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      pricePerUnit: [null, [Validators.required, Validators.min(1)]],
      quantity: [null, [Validators.required, Validators.min(1)]],
      location: [''],
      image: [null]
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result);
    reader.readAsDataURL(file);
    this.form.patchValue({ image: file });
  }

  submit() {
    if (this.form.invalid) {
      this.message = '⚠️ Please fill all required fields.';
      return;
    }

    // Build the Crop JSON exactly as your entity expects
    const crop = {
      name: this.form.value.name,
      type: this.form.value.type,
      pricePerUnit: this.form.value.pricePerUnit,
      quantity: this.form.value.quantity,
      location: this.form.value.location
      // (farmerId, imageUrl, id, timestamps are set server-side)
    };

    const data = new FormData();
    // ✅ IMPORTANT: send crop as JSON Blob under the part name "crop"
    data.append('crop', new Blob([JSON.stringify(crop)], { type: 'application/json' }));

    // ✅ OPTIONAL: file part must be named "image" to match @RequestPart MultipartFile image
    const file: File | null = this.form.value.image;
    if (file instanceof File) {
      data.append('image', file, file.name);
    }

    this.loading = true;
    this.svc.addCrop(data).subscribe({
      next: () => {
        this.loading = false;
        this.message = '✅ Crop added successfully!';
        setTimeout(() => this.router.navigate(['/farmer/crops']), 800);
      },
      error: err => {
        this.loading = false;
        // surface server message if present (e.g., role check or validation)
        this.message = err?.error?.message || '❌ Failed to add crop.';
        console.error('Add crop error:', err);
      }
    });
  }
}
