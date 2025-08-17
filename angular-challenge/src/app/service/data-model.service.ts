import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AircraftResponse, CallsignResponse } from '../model/data-model.model';

@Injectable({
  providedIn: 'root'
})
export class DataModelService {

   private baseUrl = 'https://api.adsbdb.com/v0';

  constructor(private http: HttpClient) { }

   getAircraft(registration: string): Observable<AircraftResponse> {
    return this.http.get<AircraftResponse>(`${this.baseUrl}/aircraft/${registration}`);
  }

  getCallsign(callsign: string): Observable<CallsignResponse> {
    return this.http.get<CallsignResponse>(`${this.baseUrl}/callsign/${callsign}`);
  }
}
