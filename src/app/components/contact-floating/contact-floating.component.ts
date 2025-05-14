import { Component } from '@angular/core';
import { WHATSAPP_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-contact-floating',
  imports: [],
  templateUrl: './contact-floating.component.html',
  styleUrl: './contact-floating.component.scss'
})
export class ContactFloatingComponent {
  message = 'Hola! Quería consultarte por los productos de la web';
  whatsappUrl = `${WHATSAPP_BASE_URL}${encodeURIComponent(this.message)}`;
}
