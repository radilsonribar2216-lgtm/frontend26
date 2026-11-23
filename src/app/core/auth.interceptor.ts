import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req,next) => {
 const token=sessionStorage.getItem('clinica_token');
 if(!token || req.url.endsWith('/auth/login') || req.url.endsWith('/auth/bootstrap')) return next(req);
 return next(req.clone({setHeaders:{Authorization:'Bearer '+token}}));
};
