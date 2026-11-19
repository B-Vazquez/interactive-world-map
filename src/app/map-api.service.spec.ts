import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MapApiService } from './map-api.service';

describe('MapApiService', () => {
  let service: MapApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MapApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests country information over HTTPS', () => {
    service.getCountryInfo('ru').subscribe();

    const request = httpTestingController.expectOne(
      'https://api.worldbank.org/v2/country/ru?format=json'
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('requests the country list in one paginated request', () => {
    service.getCountries().subscribe();

    const request = httpTestingController.expectOne(
      'https://api.worldbank.org/v2/country?format=json&per_page=400'
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('loads the world map as a static SVG asset', () => {
    service.getWorldMap().subscribe();

    const request = httpTestingController.expectOne('assets/world-map.svg');
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('text');
    request.flush('<svg></svg>');
  });
});
