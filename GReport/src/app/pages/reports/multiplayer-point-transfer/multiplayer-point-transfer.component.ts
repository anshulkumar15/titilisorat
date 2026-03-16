import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { AccordianComponent } from '../../../shared/components/accordian/accordian.component';

@Component({
  selector: 'app-multiplayer-point-transfer',
  standalone: true,
  imports: [AccordianComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] ,
  templateUrl: './multiplayer-point-transfer.component.html',
  styleUrl: './multiplayer-point-transfer.component.scss'
})
export class MultiplayerPointTransferComponent {
  items = [
    { title: 'Point Transferred', content: ' ' },
    { title: 'Points Transferred But yet to be Received', content: '' },
    { title: 'Points Received', content: '' },
    { title: 'Points yet to be Received', content: '' },
    { title: 'Points Rejected', content: '' },
    { title: 'Points Cancelled', content: '' },
  ]
  
}
