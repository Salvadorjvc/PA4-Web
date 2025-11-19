import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from './componentes/header/header';
import { Footer } from './componentes/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    Footer
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'Sistema de Gestión de Pedidos';

  constructor(private router: Router) {}

  // Opcional: ocultar header/footer en login
  mostrarHeader(): boolean {
    return !this.router.url.includes('/login');
  }

  mostrarFooter(): boolean {
    return !this.router.url.includes('/login');
  }
}