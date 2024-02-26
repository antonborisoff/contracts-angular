import {
  inject
} from '@angular/core'
import {
  CanActivateFn,
  Router,
  UrlTree
} from '@angular/router'
import {
  AuthService
} from '../services/auth/auth.service'
import {
  map
} from 'rxjs'

export const authCanActivateGuard: CanActivateFn = (route, state) => {
  const isLoginPath = state.url === '/login'
  const auth$ = inject(AuthService)
  const router = inject(Router)
  return auth$.isAuth().pipe(
    map((isAuth: boolean) => {
      let result: UrlTree | boolean = false
      if (isLoginPath && isAuth) {
        result = router.createUrlTree(['/home'])
      }
      else if (isLoginPath && !isAuth) {
        result = true
      }
      else if (!isLoginPath && isAuth) {
        result = true
      }
      else if (!isLoginPath && !isAuth) {
        result = router.createUrlTree(['/login'])
      }
      return result
    })
  )
}
