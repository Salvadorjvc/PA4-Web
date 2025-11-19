import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private url = 'https://pa4-web.onrender.com'; // URL del servidor backend

  constructor() {
    this.socket = io(this.url);
  }

  // Emitir nuevo pedido
  enviarPedido(pedido: any) {
    this.socket.emit('nuevo-pedido', pedido);
  }

  // Actualizar estado del pedido
  actualizarEstado(pedidoId: string, nuevoEstado: string) {
    this.socket.emit('actualizar-estado', { pedidoId, nuevoEstado });
  }
  

  // Eliminar pedido
  eliminarPedido(pedidoId: string) {
    this.socket.emit('eliminar-pedido', pedidoId);
  }
  

  // Escuchar pedidos actuales
  obtenerPedidosActuales(): Observable<any[]> {
    return new Observable(observer => {
      this.socket.on('pedidos-actuales', (pedidos: any[]) => {
        observer.next(pedidos);
      });
    });
  }

  // Escuchar nuevo pedido creado
  escucharNuevoPedido(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('pedido-creado', (pedido: any) => {
        observer.next(pedido);
      });
    });
  }

  // Escuchar actualización de estado
  escucharActualizacionEstado(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('estado-actualizado', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Escuchar pedido eliminado
  escucharPedidoEliminado(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('pedido-eliminado', (pedidoId: string) => {
        observer.next(pedidoId);
      });
    });
  }
  

  // Desconectar socket
  desconectar() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}