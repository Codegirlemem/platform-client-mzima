import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserResponse } from '../interfaces/user.interface';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient, //
    protected override env: EnvService,
    private sessionService: SessionService,
  ) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'users';
  }

  getCurrentUser(): Observable<any> {
    return super.get('me').pipe(
      tap((userData) => {
        this.sessionService.setCurrentUser({
          userId: userData.id,
          realname: userData.realname,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions,
          gravatar: userData.gravatar,
          language: userData.language,
        });
        // FIXME?! window.dispatchEvent
        window.dispatchEvent(new CustomEvent('ush:analytics:refreshUserProperties'));
        window.dispatchEvent(
          new CustomEvent('datalayer:custom-event', {
            detail: {
              event: 'user logged in',
              event_type: 'user_interaction',
              user_role: userData.role === 'admin' ? 'admin' : 'member',
            },
          }),
        );
      }),
    );
  }

  public getUsers(url?: string): Observable<UserResponse> {
    return super.get(url);
  }
}