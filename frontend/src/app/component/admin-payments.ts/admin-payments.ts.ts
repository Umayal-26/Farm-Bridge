// src/app/component/admin-payments.ts/admin-payments.ts.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';
import autoTable from 'jspdf-autotable';
// also keep: import jsPDF from 'jspdf';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PaymentRow {
  id: number;
  dealerId: number;
  farmerId: number;
  cropId?: number;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | string;
  paymentDate?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './admin-payments.ts.html',
  styleUrls: ['./admin-payments.ts.css']
})
export class AdminPaymentsComponent {
  private readonly base = `${environment.apiBaseUrl}/payments/admin`;

  from = '';
  to = '';

  rows: PaymentRow[] = [];
  loading = false;
  message = '';

  constructor(private http: HttpClient) {}

  load(): void {
    this.message = '';
    if (!this.from || !this.to) {
      this.message = '⚠️ Please select a valid date-time range.';
      return;
    }
    const f = this.ensureSeconds(this.from);
    const t = this.ensureSeconds(this.to);

    this.loading = true;
    this.http.get<PaymentRow[]>(`${this.base}/range`, {
      params: { from: f, to: t }
    }).subscribe({
      next: (data) => {
        this.rows = Array.isArray(data) ? data : [];
        this.loading = false;
        if (!this.rows.length) this.message = 'No payments found in this range.';
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error?.message || '❌ Failed to fetch payments.';
      }
    });
  }

  badge(status?: string): string {
    const s = (status ?? '').toUpperCase();
    switch (s) {
      case 'SUCCESS': return 'bg-success';
      case 'FAILED': return 'bg-danger';
      case 'PENDING': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  private ensureSeconds(dt?: string): string {
    if (!dt) return new Date().toISOString().slice(0, 19);
    return /\d{2}:\d{2}:\d{2}$/.test(dt) ? dt : `${dt}:00`;
  }

  downloadPdfForRow(row: PaymentRow): void {
  try {
    // Defensive conversions
    const idStr = String(row.id ?? 'N/A');
    const dealerStr = String(row.dealerId ?? 'N/A');
    const farmerStr = String(row.farmerId ?? 'N/A');
    const cropStr = row.cropId != null ? String(row.cropId) : 'N/A';
    const amountNum = Number(row.amount ?? 0);
    const amountStr = amountNum.toFixed(2);
    const statusStr = String(row.status ?? 'UNKNOWN');

    const whenRaw = row.paymentDate ?? row.createdAt ?? new Date().toISOString();
    const whenDate = new Date(String(whenRaw));
    const whenFormatted = isNaN(whenDate.getTime()) ? new Date().toLocaleString() : whenDate.toLocaleString();

    // create doc
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pageWidth = (doc as any).internal.pageSize.getWidth();

    // header
    doc.setFontSize(18);
    doc.text('Farm-Bridge', margin, 60);
    doc.setFontSize(12);
    doc.text('Payment Receipt', margin, 82);

    // meta (right)
    doc.setFontSize(10);
    doc.text(`Receipt: R${idStr}`, pageWidth - margin, 60, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 76, { align: 'right' });

    // divider
    doc.setLineWidth(0.5);
    doc.line(margin, 95, pageWidth - margin, 95);

    // two-column details
    const leftX = margin;
    const rightX = pageWidth / 2 + 10;
    let y = 115;

    doc.setFontSize(11);
    doc.text(`Payment ID: #${idStr}`, leftX, y);
    doc.text(`Status: ${statusStr}`, rightX, y);
    y += 18;
    doc.text(`Dealer ID: ${dealerStr}`, leftX, y);
    doc.text(`Farmer ID: ${farmerStr}`, rightX, y);
    y += 18;
    doc.text(`Crop ID: ${cropStr}`, leftX, y);
    doc.text(`Paid At: ${whenFormatted}`, rightX, y);
    y += 28;

    // Amount emphasized (use a concrete font name to satisfy TS)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Paid:', leftX, y);
    doc.setFontSize(16);
    doc.text(`₹ ${amountStr}`, leftX + 110, y);
    doc.setFont('helvetica', 'normal');
    y += 36;

    // Use the autotable plugin function directly.
    // (doc.autoTable might not exist depending on import bundling, so call the function)
    (autoTable as any)(doc as any, {
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Payment ID', `#${idStr}`],
        ['Request/Crop', cropStr],
        ['Dealer ID', dealerStr],
        ['Farmer ID', farmerStr],
        ['Status', statusStr],
        ['Amount', `₹ ${amountStr}`],
        ['Paid At', whenFormatted],
      ],
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230] },
      margin: { left: margin, right: margin }
    });

    const finalY = ((doc as any).lastAutoTable?.finalY ?? (y + 140)) + 30;
    doc.setFontSize(10);
    doc.text('Thank you for using Farm-Bridge', margin, finalY);
    doc.text('Farmer signature: ____________________', pageWidth - margin, finalY + 40, { align: 'right' });

    // download
    doc.save(`receipt_payment_${idStr}.pdf`);
  } catch (err) {
    console.error('PDF generation failed', err);
    this.message = '❌ Could not generate PDF (check console).';
  }
}
}