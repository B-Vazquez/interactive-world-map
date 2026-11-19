import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { MapApiService, WorldBankCountry } from '../map-api.service';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, OnDestroy {
  constructor(
    private mapApiService: MapApiService,
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef
  ){}

  text: string = '';
  errorMessage = '';
  mapErrorMessage = '';
  mapSvg: SafeHtml | null = null;
  private activeRequest?: Subscription;
  private mapRequest?: Subscription;

  @Output() countryName = new EventEmitter<string>();
  @Output() countryCapital= new EventEmitter<string>();
  @Output() countryRegion= new EventEmitter<string>();
  @Output() countryIncome= new EventEmitter<string>();
  @Output() countryLong= new EventEmitter<string>();
  @Output() countryLat= new EventEmitter<string>();

  ngOnInit(): void {
    this.mapRequest = this.mapApiService.getWorldMap().subscribe({
      // The SVG is a checked-in asset, not user- or API-provided markup.
      next: svg => {
        this.mapSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.mapErrorMessage = 'Unable to load the world map.';
        this.changeDetector.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.activeRequest?.unsubscribe();
    this.mapRequest?.unsubscribe();
  }

  onSubmit() {
    const trimmedText = this.text.trim();
    if(!trimmedText){
      alert("Please enter a country!")
    }
    else{
      const name = trimmedText.replace(/\s+/g, ' ');
      this.loadCountryDataSearch(name);
    }
  }

  loadCountryDataSearch(name: string){
    this.activeRequest?.unsubscribe();
    this.errorMessage = '';
    this.activeRequest = this.mapApiService.getCountries().subscribe({
      next: response => {
        const countries = this.getCountries(response);
        if (!countries) {
          this.setErrorMessage('Unable to read country data from the World Bank.');
          return;
        }

        const country = countries.find(
          item => item.name.toLowerCase() === name.toLowerCase()
        );
        if (!country) {
          this.setErrorMessage(`No country found for "${name}".`);
          return;
        }

        this.emitCountryData(country);
      },
      error: () => {
        this.setErrorMessage('Unable to load country data. Please try again.');
      }
    });
  }
    
  loadCountryDataClick(event: MouseEvent){
    const countryPath = event.target;
    if (!(countryPath instanceof Element) || countryPath.localName !== 'path' || !countryPath.id) {
      return;
    }
    this.loadCountryData(countryPath.id);
  }

  loadCountryData(countryId: string){
    this.activeRequest?.unsubscribe();
    this.errorMessage = '';
    this.activeRequest = this.mapApiService.getCountryInfo(countryId).subscribe({
      next: response => {
        const countries = this.getCountries(response);
        if (!countries || !countries[0]) {
          this.setErrorMessage('Unable to read country data from the World Bank.');
          return;
        }
        this.emitCountryData(countries[0]);
      },
      error: () => {
        this.setErrorMessage('Unable to load country data. Please try again.');
      }
    })
  }

  private getCountries(response: unknown): WorldBankCountry[] | null {
    if (!Array.isArray(response) || !Array.isArray(response[1])) {
      return null;
    }

    const countries: WorldBankCountry[] = [];
    for (const country of response[1] as unknown[]) {
      if (!this.isWorldBankCountry(country)) {
        return null;
      }
      countries.push(country);
    }
    return countries;
  }

  private isWorldBankCountry(value: unknown): value is WorldBankCountry {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const country = value as Record<string, unknown>;
    return typeof country['id'] === 'string' && typeof country['name'] === 'string';
  }

  private emitCountryData(country: WorldBankCountry): void {
    this.countryName.emit(country.name);
    this.countryCapital.emit(country.capitalCity ?? '');
    this.countryRegion.emit(country.region?.value ?? '');
    this.countryIncome.emit(country.incomeLevel?.value ?? '');
    this.countryLong.emit(country.longitude ?? '');
    this.countryLat.emit(country.latitude ?? '');
  }

  private setErrorMessage(message: string): void {
    this.errorMessage = message;
    this.changeDetector.markForCheck();
  }
}
