import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Small pub/sub so components can tell DealerRequestsComponent to refresh.
 * We keep it tiny: components call notifyChanged() and subscribers receive a void event.
 */
@Injectable({ providedIn: 'root' })
export class RequestStateService {
  private changes = new Subject<void>();

  /** call to notify listeners that requests changed (created/updated) */
  notifyChanged() {
    this.changes.next();
  }

  /** observable to subscribe to */
  onChanged(): Observable<void> {
    return this.changes.asObservable();
  }
}
