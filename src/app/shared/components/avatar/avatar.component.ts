import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { SalesPersonData } from '../../../core/layouts/nav/class/navbarResponse';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AvatarComponent implements OnInit{
  imageBaseUrl: string = 'http://bdjobs.com/ContactSalesPerson/'
  @Input() salesPerson: SalesPersonData | null = null;
  
  @Input() imageUrl: string = '';
  @Input() name: string = '';
  @Input() designation: string = '';
  @Input() phone: string = '';
  @Input() email: string = '';
  
  ngOnInit(): void {
    this.name = this.salesPerson?.salesPersonName || 'Raihan Ahmed';
    this.designation = this.salesPerson?.salesPersonDesignation || 'Sales Person';
    this.phone = this.salesPerson?.salesPersonContact || '01700000000';
    this.email = this.salesPerson?.salesPersonEmail || 'example@mail.com';
    this.imageUrl = this.imageBaseUrl + this.salesPerson?.salesPersonImage || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80';
  }

}
