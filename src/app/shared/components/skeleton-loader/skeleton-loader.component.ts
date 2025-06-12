import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'card-skeleton-loader',
  standalone: true,
  imports: [NgxSkeletonLoaderModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class CardSkeletonLoaderComponent {

}
