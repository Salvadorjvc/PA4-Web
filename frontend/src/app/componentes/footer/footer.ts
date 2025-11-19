import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  template: `
    <footer class="bg-dark text-white text-center py-3 mt-5">
      <div class="container">
        <p class="mb-0">© 2025 Sistema de Gestión de Pedidos - Desarrollado con Angular & Socket.IO</p>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      position: fixed;
      bottom: 0;
      width: 100%;
    }
  `]
})
export class Footer {
  
}