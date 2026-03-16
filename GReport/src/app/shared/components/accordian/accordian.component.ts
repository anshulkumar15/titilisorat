import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-accordian',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordian.component.html',
  styleUrl: './accordian.component.scss'
})
export class AccordianComponent {

  @Input() items: { title: string; content: string }[] = [];

  selectedItem: any;

  toggleItem(item: any) {
    this.selectedItem = this.selectedItem === item ? null : item;
  }
}
