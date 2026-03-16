import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {

  @Input() title: any;
  @Input() message: any;
  @Output() closeDialog: EventEmitter<void> = new EventEmitter<void>();

  onClose(): void {
    this.closeDialog.emit();
  }
}
