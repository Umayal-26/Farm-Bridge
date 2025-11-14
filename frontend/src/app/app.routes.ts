// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';

// Auth components
import { LoginComponent } from './component/login.component/login.component';
import { RegisterComponent } from './component/register.component/register.component';
import { SelectRoleComponent } from './component/select-role.component/select-role.component';

// Farmer components
import { FarmerDashboardComponent } from './component/farmer-dashboard.component/farmer-dashboard.component';
import { CropFormComponent } from './component/crop-form.component/crop-form.component';
import { FarmerRequestsComponent } from './component/farmer-requests.component/farmer-requests.component';

// Dealer components
import { CropsListComponent } from './component/crops-list.component/crops-list.component';
import { DealerRequestsComponent } from './component/dealer-requests.component/dealer-requests.component';
import { DealerCartComponent } from './component/dealer-cart.component/dealer-cart.component.component';

// Admin components

import { AdminCropsComponent } from './component/admin-crops.component/admin-crops.component';
import { AdminPaymentsComponent } from './component/admin-payments.ts/admin-payments.ts';
import { AdminDashboardComponent } from './component/admin-dashboard.component/admin-dashboard.component';

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Authentication routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'select-role', component: SelectRoleComponent },

  // 🌾 Farmer routes
  {
    path: 'farmer/crops',
    component: FarmerDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['FARMER'] }
  },
  { path: 'farmer/crops/new', component: CropFormComponent, canActivate: [RoleGuard], data: { roles: ['FARMER'] } },
  { path: 'farmer/requests', component: FarmerRequestsComponent, canActivate: [RoleGuard], data: { roles: ['FARMER'] } },

  // 🧑‍💼 Dealer routes
  {
    path: 'dealer',
    redirectTo: 'dealer/crops',
    pathMatch: 'full'
  },
  { path: 'dealer/crops', component: CropsListComponent, canActivate: [RoleGuard], data: { roles: ['DEALER'] } },
  { path: 'dealer/requests', component: DealerRequestsComponent, canActivate: [RoleGuard], data: { roles: ['DEALER'] } },
  { path: 'dealer/cart', component: DealerCartComponent, canActivate: [RoleGuard], data: { roles: ['DEALER'] } },

  // 👩‍💻 Admin routes
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { path: 'admin/crops', component: AdminCropsComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/payments', component: AdminPaymentsComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },

  // 🚫 Fallback for undefined routes
  { path: '**', redirectTo: '/login' },
];
