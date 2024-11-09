import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    // request begins
    console.log(`${method} ${url}`);

    return next.handle()
      .pipe(   // we use the pipe just to log the end of the request
        tap(() => console.log(`  ${method} ${url} - ${Date.now() - now}ms`)),
      );
  }
}
