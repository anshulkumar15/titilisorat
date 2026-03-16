import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";


@Component({
    selector: 'app-leyout',
    standalone: true,
    templateUrl: './leyout.component.html',
    styleUrl: './leyout.component.scss',
    imports: [HeaderComponent, RouterOutlet, FooterComponent]
})
export class LeyoutComponent {

}
