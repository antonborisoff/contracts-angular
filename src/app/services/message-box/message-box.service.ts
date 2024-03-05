import {
  Injectable
} from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class MessageBoxService {
  public constructor() { }

  public error(message: string): void {
    console.error(message)
    alert(message)
  }

  public confirm(message: string, onHandle: (confirmed: boolean) => void): void {
    onHandle(window.confirm(message))
  }
}
