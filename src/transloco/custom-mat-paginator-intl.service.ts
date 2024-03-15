import {
  Injectable,
  OnDestroy
} from '@angular/core'
import {
  MatPaginatorIntl
} from '@angular/material/paginator'
import {
  TranslocoService
} from '@ngneat/transloco'
import {
  Subscription
} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class CustomMatPaginatorIntlService extends MatPaginatorIntl implements OnDestroy {
  private translationSubscription: Subscription
  private translationsLoaded = false
  public constructor(private ts: TranslocoService) {
    super()

    // we need to wait until the translations are loaded and update the labels
    // otherwise paginator might use the labels too soon (e.g. if paginator component is loaded first)
    this.translationSubscription = this.ts.selectTranslateObject('PAGINATOR').subscribe((translation) => {
      this.firstPageLabel = translation['FIRST_PAGE_LABEL']
      this.lastPageLabel = translation['LAST_PAGE_LABEL']
      this.nextPageLabel = translation['NEXT_PAGE_LABEL']
      this.previousPageLabel = translation['PREVIOUS_PAGE_LABEL']
      this.itemsPerPageLabel = translation['ITEMS_PER_PAGE_LABEL']
      this.translationsLoaded = true
      // notify paginator about the changes
      this.changes.next()
    })
  }

  public override getRangeLabel = (page: number, pageSize: number, totalItems: number): string => {
    const fromItem = page * pageSize
    const toItem = fromItem + pageSize > totalItems ? totalItems : fromItem + pageSize
    return this.translationsLoaded
      ? this.ts.translate('PAGINATOR.FROM_ITEM_TO_ITEM_OUT_OF_ITEMS', {
        fromItem: fromItem,
        toItem: toItem,
        totalItems: totalItems
      })
      : ''
  }

  public ngOnDestroy(): void {
    this.translationSubscription.unsubscribe()
  }
}
