import { Component, signal } from '@angular/core';
import {  RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './service/auth.service';
import { NavbarComponent } from './component/navbar.component/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // ← plural & correct key
})
export class App {
  protected readonly title = signal('Farm-Bridge');

  constructor(public auth: AuthService) {}

  logout() {
  this.auth.logout(); // navigation handled inside AuthService
}

}
