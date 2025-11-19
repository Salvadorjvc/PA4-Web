import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username: string = '';
  password: string = '';
  error: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Por favor complete todos los campos';
      return;
    }

    const backendUrl = 'https://pa4-web.onrender.com'; 

    // Llamar al API para autenticar
    this.http.post<any>(`${backendUrl}/api/login`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        
        // Redirigir según el rol
        if (response.usuario.rol === 'mozo') {
          this.router.navigate(['/mesero']);
        } else if (response.usuario.rol === 'cocinero') {
          this.router.navigate(['/cocinero']);
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al iniciar sesión';
      }
    });
  }
}