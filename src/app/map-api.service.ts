import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';

export interface WorldBankCountry {
  id: string;
  name: string;
  capitalCity?: string;
  region?: { value: string };
  incomeLevel?: { value: string };
  longitude?: string;
  latitude?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapApiService {

  constructor(private http:HttpClient) { }

  getCountryInfo (countryId: string): Observable<unknown> {
    const url = `https://api.worldbank.org/v2/country/${countryId}?format=json`;
    return this.http.get(url);
  }

  getCountries(): Observable<unknown> {
    const url = 'https://api.worldbank.org/v2/country?format=json&per_page=400';
    return this.http.get(url);
  }

  getWorldMap(): Observable<string> {
    return this.http.get('assets/world-map.svg', { responseType: 'text' });
  }
}
