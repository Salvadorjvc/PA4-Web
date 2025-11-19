import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../../services/socket.service';
import { Pedido } from '../../modelos/pedido';


interface Plato {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-mesero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesero.html',
  styleUrls: ['./mesero.css']
})
export class Mesero implements OnInit, OnDestroy {
  platosDisponibles: Plato[] = [];  // Inicialmente vacío

  mesaSeleccionada: number = 1;
  mesas: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
  
  misPedidos: Pedido[] = [];
  usuario: string = '';

  constructor(
    private socketService: SocketService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Obtener usuario del localStorage
      const userData = localStorage.getItem('usuario');
      if (userData) {
        this.usuario = JSON.parse(userData).username;
      }

      // Cargar platos desde la base de datos
      this.http.get<any[]>('https://pa4-web.onrender.com').subscribe({
        next: (platos) => {
          this.platosDisponibles = platos.map(plato => ({
            nombre: plato.nombre,
            precio: plato.precio,
            cantidad: 0
          }));
        },
        error: (err) => {
          console.error('Error al cargar platos:', err);
          alert('No se pudieron cargar los platos');
        }
      });

      // Escuchar pedidos actuales
      this.socketService.obtenerPedidosActuales().subscribe(pedidos => {
        this.misPedidos = pedidos.filter((p: any) => p.mozo === this.usuario);
      });

      // Escuchar nuevos pedidos
      this.socketService.escucharNuevoPedido().subscribe((pedido: any) => {
        if (pedido.mozo === this.usuario) {
          this.misPedidos.push(pedido);
        }
      });

      // Escuchar actualizaciones de estado
      this.socketService.escucharActualizacionEstado().subscribe((data: any) => {
        const pedido = this.misPedidos.find(p => p._id === data.pedidoId);
        if (pedido) {
          pedido.estado = data.estado;

          // Mostrar notificación si está listo
          if (data.estado === 'Listo para Servir') {
            this.mostrarNotificacion(`¡Pedido de Mesa ${data.mesa} está listo!`);
          }
        }
      });

      // Escuchar pedidos eliminados
      this.socketService.escucharPedidoEliminado().subscribe((pedidoId: string) => {
        this.misPedidos = this.misPedidos.filter(p => p._id !== pedidoId);
      });
      
    }
  }

  enviarPedido() {
    const platosSeleccionados = this.platosDisponibles
      .filter(plato => plato.cantidad > 0)
      .map(plato => ({
        nombre: plato.nombre,
        precio: plato.precio,
        cantidad: plato.cantidad
      }));

    if (platosSeleccionados.length === 0) {
      alert('Debe seleccionar al menos un plato');
      return;
    }

    const pedido = {
      mesa: this.mesaSeleccionada,
      platos: platosSeleccionados,
      mozo: this.usuario
    };

    this.socketService.enviarPedido(pedido);

    // Limpiar formulario
    this.platosDisponibles.forEach(plato => plato.cantidad = 0);

    alert(`Pedido enviado para Mesa ${this.mesaSeleccionada}`);
  }

  calcularTotal(): number {
    return this.platosDisponibles.reduce(
      (total, plato) => total + (plato.precio * plato.cantidad),
      0
    );
  }

  obtenerColorEstado(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'bg-warning';
      case 'En Preparación': return 'bg-info';
      case 'Listo para Servir': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  mostrarNotificacion(mensaje: string) {
    if (isPlatformBrowser(this.platformId)) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pedido Listo', {
          body: mensaje,
          icon: '/assets/icon.png'
        });
      } else {
        alert(mensaje);
      }
    }
  }

  ngOnDestroy() {}
}
