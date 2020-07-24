import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import { BaseBackend } from './base.backend';

export class RemoteBackend extends BaseBackend {
  constructor(name: string) {
    super(name);
    const socket = io('http://localhost:3030/');
    const app = feathers();
    app.configure(socketio(socket));
    this.instances = app.service('instances');
    this.convertImageData = true;
    this.setupHooks();
  }
}
