import {
  Component,
  Inject
} from '@angular/core'
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog'
import {
  MatIconModule
} from '@angular/material/icon'
import {
  MatToolbarModule
} from '@angular/material/toolbar'

import {
  MatButtonModule
} from '@angular/material/button'
import {
  CommonModule
} from '@angular/common'
import {
  MessageConfig,
  MESSAGE_DISPLAY_ATTRIBUTES_MAP
} from '../../interfaces'
import {
  Translation,
  TranslocoPipe,
  provideTranslocoScope
} from '@ngneat/transloco'
import {
  getTranslocoInlineLoader
} from '../../../../../transloco/transloco-loaders'

const COMPONENT_TRANSLOCO_SCOPE = 'message'
@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    TranslocoPipe,
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class MessageComponent {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }

  public messages = MESSAGE_DISPLAY_ATTRIBUTES_MAP
  public constructor(@Inject(MAT_DIALOG_DATA) public data: MessageConfig) {}
}
