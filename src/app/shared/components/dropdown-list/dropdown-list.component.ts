import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectItem } from '../../models/models';

@Component({
  selector: 'app-dropdown-list',
  imports: [ReactiveFormsModule],
  templateUrl: './dropdown-list.component.html',
  styleUrl: './dropdown-list.component.scss',
  standalone: true
})
export class DropdownListComponent {
  readonly isOpen = input<boolean>(false); 
  readonly control = input<FormControl>(new FormControl());
  readonly options = input<SelectItem[]>([]);

  getSelected(SelectedObj: SelectItem) {
    this.control().setValue(SelectedObj.value)
  }

}
