import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SocketService } from '../../services/socket.service';

interface Plato {
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Pedido {
  _id: string;
  mesa: number;
  platos: Plato[];
  estado: string;
  mozo: string;
  timestamp: string;
}

@Component({
  selector: 'app-cocinero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocinero.html',
  styleUrls: ['./cocinero.css']
})
export class Cocinero implements OnInit, OnDestroy {

  pedidos: Pedido[] = [];
  audio: HTMLAudioElement | null = null;

  constructor(
    private socketService: SocketService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {

    // Crear audio SOLO en el navegador (evita error SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio('assets/notification.mp3');
    }

    // Obtener pedidos actuales
    this.socketService.obtenerPedidosActuales().subscribe(pedidos => {
      this.pedidos = pedidos;
      this.ordenarPedidos();
    });

    // Escuchar nuevos pedidos
    this.socketService.escucharNuevoPedido().subscribe(pedido => {
      this.pedidos.push(pedido);
      this.ordenarPedidos();
      this.reproducirNotificacion();
      this.mostrarNotificacion(`Nuevo pedido de Mesa ${pedido.mesa}`);
    });

    // Escuchar actualizaciones de estado
    this.socketService.escucharActualizacionEstado().subscribe(data => {
      const pedido = this.pedidos.find(p => p._id === data.pedidoId);
      if (pedido) {
        pedido.estado = data.estado;
        this.ordenarPedidos();
      }
    });

    // Escuchar pedidos eliminados
    this.socketService.escucharPedidoEliminado().subscribe(pedidoId => {
      this.pedidos = this.pedidos.filter(p => p._id !== pedidoId);
    });
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: string) {
    pedido.estado = nuevoEstado;
    this.ordenarPedidos();
    this.socketService.actualizarEstado(pedido._id, nuevoEstado);
  }

  eliminarPedido(pedidoId: string) {
    if (confirm('¿Está seguro de eliminar este pedido?')) {
      this.socketService.eliminarPedido(pedidoId);
    }
  }

  ordenarPedidos() {
    const orden: any = {
      'Pendiente': 1,
      'En Preparación': 2,
      'Listo para Servir': 3
    };

    this.pedidos.sort((a, b) => (orden[a.estado] || 0) - (orden[b.estado] || 0));
  }

  obtenerColorEstado(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'warning';
      case 'En Preparación': return 'info';
      case 'Listo para Servir': return 'success';
      default: return 'secondary';
    }
  }

  obtenerEstado(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'Pendiente';
      case 'En Preparación': return 'En Preparación';
      case 'Listo para Servir': return 'Listo para Servir';
      default: return 'Por anotar';
    }
  }

  contarPedidosPorEstado(estado: string): number {
    return this.pedidos.filter(p => p.estado === estado).length;
  }

  reproducirNotificacion() {
    if (this.audio) {
      this.audio.play().catch(() => {});
    }
  }

  mostrarNotificacion(mensaje: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nuevo Pedido', {
        body: mensaje,
        icon: '/assets/icon.png'
      });
    }
  }

  ngOnDestroy() {}
}
