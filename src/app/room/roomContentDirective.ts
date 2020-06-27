import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[room-content]',
})
export class RoomContentDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}