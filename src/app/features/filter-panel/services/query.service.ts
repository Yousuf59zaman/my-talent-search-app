import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Pagination } from '../../../shared/models/models';
import { FilterForm } from '../models/form.models';
import { CvSearchService } from './cv-search.service';
import { FilterStore } from '../../../store/filter.store';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  isQueryLoading = new Subject<boolean>();
  filterQuery$: Subject<FilterForm> = new Subject();

  isRefreshQuery = new BehaviorSubject<boolean>(false);
  isRefreshQuery$ = this.isRefreshQuery.asObservable();

  private paginationObs = new BehaviorSubject<Pagination>({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });
  private paginationObs$ = this.paginationObs.asObservable();
  private _pagination!: Pagination;

  private cvSearchService = inject(CvSearchService);
  private filterStore = inject(FilterStore);

  allSrc$ = [this.filterQuery$.asObservable(), this.paginationObs$];

  filterQueryRes$ = combineLatest(this.allSrc$).pipe(
    debounceTime(500),
    tap((src) => this.getTotalCvCount(src[0] as FilterForm)),
    switchMap((filterData) => {
      return this.cvSearchService.getCVs(
        filterData[0] as FilterForm,
        (filterData[1] as Pagination).pageNo
      );
    })
  );

  public getTotalCvCount(filterData: FilterForm) {
    this.cvSearchService
      .getCVCount(filterData)
      .pipe(filter((data) => !!data))
      .subscribe((count) => {
        if (count) {
          this.filterStore.setTotalCvCount(count.totalCvCount);
        }
      });
  }

  public set pagination(p: Pagination) {
    this._pagination = p;
    const pagination = {
      pageNo: this._pagination.pageNo,
      pageSize: this._pagination.pageSize,
    };
    this.paginationObs.next(pagination);
    this.isQueryLoading.next(true);
  }

  public get pagination(): Pagination {
    return this._pagination;
  }
}
