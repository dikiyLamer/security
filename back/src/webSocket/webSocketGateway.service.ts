import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    } from '@nestjs/websockets';

    import { Socket, Server } from 'socket.io';
    
    @WebSocketGateway({
  
      transport: ['websocket'],
      cors: {
        origin: '*',
      },
    })
    export class WSGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
      
      @WebSocketServer() 
      server: Server;
      
      @SubscribeMessage('msgToServer')
      handleMessage(client: Socket, payload: string): void {

        this.server.emit('msgToClient', payload);
      }
    
      afterInit(server: Server) {
 
      }
    
      handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`)
      }
    
      handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`)

      }
    }