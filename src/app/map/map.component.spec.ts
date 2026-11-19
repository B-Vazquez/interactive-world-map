import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AppModule } from '../app.module';
import { MapApiService } from '../map-api.service';
import { MapComponent } from './map.component';

type MockMapApiService = {
  getCountryInfo: Mock<MapApiService['getCountryInfo']>;
  getCountries: Mock<MapApiService['getCountries']>;
  getWorldMap: Mock<MapApiService['getWorldMap']>;
};

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mapApiService: MockMapApiService;

  beforeEach(async () => {
    mapApiService = {
      getCountryInfo: vi.fn<MapApiService['getCountryInfo']>(),
      getCountries: vi.fn<MapApiService['getCountries']>(),
      getWorldMap: vi.fn<MapApiService['getWorldMap']>()
    };
    mapApiService.getWorldMap.mockReturnValue(of(''));

    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: MapApiService, useValue: mapApiService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads country data and emits its details', () => {
    mapApiService.getCountryInfo.mockReturnValue(of([
      { page: 1 },
      [{
        id: 'RU',
        name: 'Russian Federation',
        capitalCity: 'Moscow',
        region: { value: 'Europe & Central Asia' },
        incomeLevel: { value: 'Upper middle income' },
        longitude: '37.6173',
        latitude: '55.7558'
      }]
    ]));

    const countryName = vi.fn();
    const countryCapital = vi.fn();
    const countryRegion = vi.fn();
    const countryIncome = vi.fn();
    const countryLong = vi.fn();
    const countryLat = vi.fn();
    component.countryName.subscribe(countryName);
    component.countryCapital.subscribe(countryCapital);
    component.countryRegion.subscribe(countryRegion);
    component.countryIncome.subscribe(countryIncome);
    component.countryLong.subscribe(countryLong);
    component.countryLat.subscribe(countryLat);

    component.loadCountryData('RU');

    expect(mapApiService.getCountryInfo).toHaveBeenCalledTimes(1);
    expect(mapApiService.getCountryInfo).toHaveBeenCalledWith('RU');
    expect(countryName).toHaveBeenCalledTimes(1);
    expect(countryName).toHaveBeenCalledWith('Russian Federation');
    expect(countryCapital).toHaveBeenCalledWith('Moscow');
    expect(countryRegion).toHaveBeenCalledWith('Europe & Central Asia');
    expect(countryIncome).toHaveBeenCalledWith('Upper middle income');
    expect(countryLong).toHaveBeenCalledWith('37.6173');
    expect(countryLat).toHaveBeenCalledWith('55.7558');
  });

  it('loads country details when a path in the loaded SVG is clicked', () => {
    mapApiService.getCountryInfo.mockReturnValue(of([
      { page: 1 },
      [{ id: 'RU', name: 'Russian Federation' }]
    ]));
    component.mapSvg = TestBed.inject(DomSanitizer).bypassSecurityTrustHtml(
      '<svg xmlns="http://www.w3.org/2000/svg"><path id="ru" d="M0 0"></path></svg>'
    );
    fixture.detectChanges();

    const path = fixture.nativeElement.querySelector('path') as SVGPathElement;
    path.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(mapApiService.getCountryInfo).toHaveBeenCalledTimes(1);
    expect(mapApiService.getCountryInfo).toHaveBeenCalledWith('ru');
  });

  it('renders the map as soon as the asset request resolves', async () => {
    const mapResponse = new Subject<string>();
    mapApiService.getWorldMap.mockReturnValue(mapResponse);
    const asyncFixture = TestBed.createComponent(MapComponent);
    asyncFixture.autoDetectChanges();

    mapResponse.next(
      '<svg xmlns="http://www.w3.org/2000/svg"><path id="ru" d="M0 0"></path></svg>'
    );
    await asyncFixture.whenStable();

    expect(asyncFixture.nativeElement.querySelector('path')).not.toBeNull();
    asyncFixture.destroy();
  });

  it('searches with one country-list request and emits the match', () => {
    const country = {
      id: 'RU',
      name: 'Russian Federation',
      capitalCity: 'Moscow',
      region: { value: 'Europe & Central Asia' },
      incomeLevel: { value: 'Upper middle income' },
      longitude: '37.6173',
      latitude: '55.7558'
    };
    mapApiService.getCountries.mockReturnValue(of([{ page: 1 }, [country]]));
    const countryName = vi.fn();
    component.countryName.subscribe(countryName);

    component.loadCountryDataSearch('russian federation');

    expect(mapApiService.getCountries).toHaveBeenCalledTimes(1);
    expect(mapApiService.getCountryInfo).not.toHaveBeenCalled();
    expect(countryName).toHaveBeenCalledTimes(1);
    expect(countryName).toHaveBeenCalledWith('Russian Federation');
  });

  it('reports an error payload instead of reading it as a country', () => {
    mapApiService.getCountries.mockReturnValue(of([
      { page: 1 },
      [{ message: [{ key: 'Invalid query', value: 'Invalid query' }] }]
    ]));

    expect(() => component.loadCountryDataSearch('Russia')).not.toThrow();
    expect(component.errorMessage).toBe('Unable to read country data from the World Bank.');
  });

  it('displays a message when the country-list request fails', () => {
    mapApiService.getCountries.mockReturnValue(
      throwError(() => new Error('network unavailable'))
    );

    component.loadCountryDataSearch('Russia');

    expect(component.errorMessage).toBe('Unable to load country data. Please try again.');
  });

  it('cancels an earlier search so its response cannot win a race', () => {
    const firstSearch = new Subject<unknown>();
    const secondSearch = new Subject<unknown>();
    mapApiService.getCountries
      .mockReturnValueOnce(firstSearch)
      .mockReturnValueOnce(secondSearch);
    const countryName = vi.fn();
    component.countryName.subscribe(countryName);

    component.loadCountryDataSearch('First');
    component.loadCountryDataSearch('Second');
    firstSearch.next([{ page: 1 }, [{ id: 'FI', name: 'First' }]]);
    secondSearch.next([{ page: 1 }, [{ id: 'SE', name: 'Second' }]]);

    expect(countryName).toHaveBeenCalledTimes(1);
    expect(countryName).toHaveBeenCalledWith('Second');
  });
});
