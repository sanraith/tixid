import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ClientActions, EmitResponse } from 'src/shared/socket';

@Component({
  selector: 'app-ready-button',
  template: `
    <button [disabled]="!isEnabled || readyCompleted" (click)="indicateReady()">Ready</button>
    <button [class.hidden]="!allowForce || isEnabled || pendingAction || waitingForTimeout" (click)="forceReady()">
      Force everyone to ready
    </button>
  `,
  styleUrls: ['./ready-button.component.sass']
})
export class ReadyButtonComponent implements OnInit {
  @Input() isEnabled: boolean = true;
  @Input() allowForce: boolean = false;

  pendingAction: boolean = false;
  readyCompleted: boolean = false;
  waitingForTimeout: boolean = true;

  constructor(private roomSocket: Socket) { }

  ngOnInit(): void {
    this.waitTimeout();
  }

  indicateReady() {
    this.emitAction(ClientActions.indicateReady);
  }

  forceReady() {
    if (confirm("Are you sure you want to force everybody else to be ready?")) {
      this.emitAction(ClientActions.forceReady);
    }
  }

  private emitAction(action: ClientActions) {
    this.pendingAction = true;
    this.roomSocket.emit(action, null, (resp: EmitResponse) => {
      if (!resp.success) {
        alert(resp.message);
        this.isEnabled = true;
      }
      this.pendingAction = false;
      this.waitTimeout();
    });
  }

  private waitTimeout() {
    this.waitingForTimeout = true;
    setTimeout(() => this.waitingForTimeout = false, 5000);
  }
}
