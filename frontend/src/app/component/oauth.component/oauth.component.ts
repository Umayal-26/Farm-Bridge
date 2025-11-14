import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// ✅ Define a proper type for the global google object
declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-oauth',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="gSignInDiv"></div>`,
})
export class OAuthComponent implements OnInit {
  @Input() clientId!: string;
  @Output() credential = new EventEmitter<string>();

  ngOnInit() {
    // Load the Google Identity script dynamically
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initializeGoogleButton();
    document.head.appendChild(script);
  }

  private initializeGoogleButton() {
    // ✅ Safely access the global google object
    if (!window.google) {
      console.error('Google API not loaded.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => {
        if (response.credential) {
          this.credential.emit(response.credential); // ✅ Emits the Google ID token
        } else {
          console.error('No credential returned from Google.');
        }
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById('gSignInDiv'),
      {
        theme: 'outline',
        size: 'large',
        width: 280,
      }
    );
  }
}
