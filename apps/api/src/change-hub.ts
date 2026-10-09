// Module responsible for notifying connected operators about parcel changes.
import { EventEmitter } from 'node:events';

export class ChangeHub {
  private readonly emitter = new EventEmitter();

  publish(parcelId: string) {
    this.emitter.emit('parcel', parcelId);
  }

  subscribe(listener: (parcelId: string) => void) {
    this.emitter.on('parcel', listener);
    return () => this.emitter.off('parcel', listener);
  }
}
