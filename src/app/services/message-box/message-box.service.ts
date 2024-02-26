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
}
