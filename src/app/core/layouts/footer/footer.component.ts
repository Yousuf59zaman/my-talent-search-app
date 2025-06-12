import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FooterBottomComponent } from '../footer-bottom/footer-bottom.component';
import { LastUserType, LastUserTypes } from '../../../shared/enums/app.enums';

import { LocalstorageService } from '../../services/essentials/localstorage.service';
import { interval, map } from 'rxjs';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FooterBottomComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements AfterViewInit {
  private localStorageService = inject(LocalstorageService);
  IsCorporateUser = signal(
    this.localStorageService.getItem(LastUserType) === LastUserTypes.Corporate
  );

  listenOnUserTypeSub = interval(200)
    .pipe(
      map(() =>
        this.IsCorporateUser.set(
          this.localStorageService.getItem(LastUserType) ===
            LastUserTypes.Corporate
        )
      )
    )
    .subscribe();

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.listenOnUserTypeSub && !this.listenOnUserTypeSub.closed) {
        this.listenOnUserTypeSub.unsubscribe();
      }
    }, 10000);
  }
}
