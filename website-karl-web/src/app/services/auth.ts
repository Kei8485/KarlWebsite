import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ // old syntax na nakalagay ung Service - Dapat Injectible
  providedIn: 'root' // who can acces
})
export class AuthService {
  // This is the URL to your Django local server
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }  //httpClient data type | http variable name

  // kukunin ung email and pass para isend sa backend
  login(email: string, codePass: string): Observable<any> { // function na gagamitin
    return this.http.post(`${this.apiUrl}/login/`, {
      email: email,
      code: codePass
    });
  }
}