import { HttpInterceptorFn } from '@angular/common/http';

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api')) {
    const token = getCookie('XSRF-TOKEN');
    if (token) {
      req = req.clone({
        withCredentials: true,
        setHeaders: { 'X-XSRF-TOKEN': token }
      });
    } else {
      req = req.clone({ withCredentials: true });
    }
  }
  return next(req);
};
