import {
  Injectable
} from '@angular/core'
import {
  MessageComponent
} from './component/message/message.component'
import {
  MatDialog,
  MatDialogConfig
} from '@angular/material/dialog'
import {
  MessageActions,
  MessageType
} from './interfaces'

@Injectable({
  providedIn: 'root'
})
export class MessageBoxService {
  public constructor(private dialog: MatDialog) { }

  private getGeneralMessageBoxConfig(type: MessageType): MatDialogConfig {
    return {
      id: `${type}MessageBox`,
      width: '20rem'
    }
  }

  public error(message: string): void {
    this.dialog.open(MessageComponent, {
      data: {
        type: MessageType.ERROR,
        message: message,
        buttons: [{
          key: MessageActions.CLOSE,
          raised: true
        }]
      },
      ...this.getGeneralMessageBoxConfig(MessageType.ERROR)
    })
  }

  public confirm(message: string, onHandle?: (confirmed: boolean) => void): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      data: {
        type: MessageType.CONFIRM,
        message: message,
        buttons: [
          {
            key: MessageActions.CANCEL,
            raised: false
          },
          {
            key: MessageActions.CONFIRM,
            raised: true
          }
        ]
      },
      ...this.getGeneralMessageBoxConfig(MessageType.CONFIRM)
    })
    dialogRef.afterClosed().subscribe((result: MessageActions) => {
      const confirmed = (result === MessageActions.CONFIRM)
      onHandle?.(confirmed)
    })
  }
}
