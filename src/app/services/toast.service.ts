import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageSubject = new BehaviorSubject<string | null>(null);

  message$ = this.messageSubject.asObservable();

  show(message: string) {
    this.messageSubject.next(message);
    setTimeout(() => {
      this.messageSubject.next(null);
    }, 3000); // El toast desaparece en 3 segundos
  }
}
