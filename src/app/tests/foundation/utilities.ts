import {
  Location
} from '@angular/common'
import {
  TestBed
} from '@angular/core/testing'

export class Utilities {
  public static getLocationPath(): string {
    const location = TestBed.inject(Location)
    return location.path()
  }
}
