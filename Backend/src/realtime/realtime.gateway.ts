import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const origins = (
  process.env.CORS_ORIGINS ?? 'http://localhost:8081,http://localhost:19006'
)
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: { origin: origins },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    void client.join('feed');
  }
  publicationChanged(event: 'publication_created' | 'publication_updated' | 'publication_available', publicationId: string, type: 'LIVE' | 'STATIC') {
    this.server?.to('feed').emit(event, { publicationId, type });
  }
  stockUpdated(publicationId: string, newStock: number) {
    this.server?.to('feed').emit('stock_updated', { publicationId, newStock });
  }
  publicationExpired(publicationId: string) {
    this.server?.to('feed').emit('publication_expired', { publicationId });
  }
  gangaActivated(publicationId: string, newPrice: string) {
    this.server
      ?.to('feed')
      .emit('ganga_activated', { publicationId, newPrice });
  }
}
