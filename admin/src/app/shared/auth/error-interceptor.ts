import {HttpInterceptor,HttpRequest, HttpHandler,HttpErrorResponse
} from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { Injectable } from "@angular/core";
 

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {debugger
        if (error.status === 0) {
          alert('Network Error');

        }else if (error.status === 401) {
          // Unauthorized error, possibly due to token expiration
        alert('Please login');
        } else {
          // Handle other errors
          alert('An error occurred:'+ error.error || error.message);
    
        }
    
         return  throwError(() => error);
      })
    );
  }
}
