import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
           Sistema de Pedidos
        </a>
        <div class="navbar-nav ms-auto">
          <span class="navbar-text text-white me-3">
            Bienvenido, <strong>{{usuario}}</strong> ({{rol}})
          </span>
          <button class="btn btn-outline-light btn-sm" (click)="cerrarSesion()">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class Header {
  usuario: string = '';
  rol: string = '';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('usuario');
      if (userData) {
        const user = JSON.parse(userData);
        this.usuario = user.username;
        this.rol = user.rol;
      }
    }
  }

  cerrarSesion() {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario');
    }
    this.router.navigate(['/login']);
  }
}