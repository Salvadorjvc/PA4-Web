export interface PlatoPedido {
    nombre: string;
    precio: number;
    cantidad: number;
  }
  
  export interface Pedido {
    _id?: string;            // MongoDB ID
    mesa: number;            // Número de mesa
    platos: PlatoPedido[];   // Platos del pedido
    estado: string;          // Pendiente / En preparación / Listo
    mozo: string;            // Nombre del mozo que hizo el pedido
    timestamp?: Date;        // Fecha del pedido
  }