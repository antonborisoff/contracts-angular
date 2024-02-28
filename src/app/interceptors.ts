import {
  HttpInterceptorFn
} from '@angular/common/http'
import {
  inject
} from '@angular/core'
import {
  AuthService
} from './services/auth/auth.service'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth$ = inject(AuthService)
  const authReq = req.clone({
    headers: req.headers.set('Auth-token', auth$.getAuthToken() || '')
  })
  return next(authReq)
}
