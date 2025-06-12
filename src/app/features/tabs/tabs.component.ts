import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  isExternalLink?: boolean;
  externalUrl?: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {
  @Input() tabs: TabItem[] = [];
  @Input({ required: true }) set activeTabId(id: string) {
    this._activeTabId.set(id);
  }
  @Output() tabChange = new EventEmitter<string>();
  
  _activeTabId = signal<string>('');
  
  selectTab(tab: TabItem): void {
    if (tab.isExternalLink && tab.externalUrl) {
      // Open external link in a new tab
      window.open(tab.externalUrl, '_blank');
    } else {
      // Handle regular tab change
      this._activeTabId.set(tab.id);
      this.tabChange.emit(tab.id);
    }
  }
  
  isActive(tabId: string): boolean {
    return this._activeTabId() === tabId;
  }
}
