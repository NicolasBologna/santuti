import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { CartFloatingComponent } from './components/cart-floating/cart-floating.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContactFloatingComponent } from './components/contact-floating/contact-floating.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    ToastComponent,
    CartFloatingComponent,
    FooterComponent,
    ContactFloatingComponent,
    ContactFloatingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Santuti';
}
