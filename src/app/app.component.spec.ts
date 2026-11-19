import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { MapApiService } from './map-api.service';
import { MapInfoComponent } from './map-info/map-info.component';
import { MapComponent } from './map/map.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{
        provide: MapApiService,
        useValue: {
          getCountryInfo: () => of([]),
          getCountries: () => of([]),
          getWorldMap: () => of('')
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('passes selected country data from the map to the info panel', () => {
    const map = fixture.debugElement.query(By.directive(MapComponent))
      .componentInstance as MapComponent;
    const info = fixture.debugElement.query(By.directive(MapInfoComponent))
      .componentInstance as MapInfoComponent;

    map.countryName.emit('Russia');
    map.countryCapital.emit('Moscow');
    map.countryRegion.emit('Europe & Central Asia');
    map.countryIncome.emit('Upper middle income');
    map.countryLong.emit('37.6173');
    map.countryLat.emit('55.7558');
    fixture.detectChanges();

    expect(info.countryName).toBe('Russia');
    expect(info.countryCapital).toBe('Moscow');
    expect(info.countryRegion).toBe('Europe & Central Asia');
    expect(info.countryIncome).toBe('Upper middle income');
    expect(info.countryLong).toBe('37.6173');
    expect(info.countryLat).toBe('55.7558');
  });
});
