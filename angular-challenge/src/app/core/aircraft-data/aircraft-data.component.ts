import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { DataModelService } from '../../service/data-model.service';
import { Aircraft, FlightRoute, AircraftResponse, CallsignResponse } from '../../model/data-model.model';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY, forkJoin } from 'rxjs';

type SearchType = 'callsign' | 'aircraft';

@Component({
  selector: 'app-aircraft-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  providers: [DataModelService],
  templateUrl: './aircraft-data.component.html',
  styleUrl: './aircraft-data.component.scss',
})
export class AircraftDataComponent {

  private fb = inject(FormBuilder);
  private api = inject(DataModelService);

  form = this.fb.nonNullable.group({
    searchType: this.fb.nonNullable.control<SearchType>('aircraft'),
    searchInput: this.fb.control<string>('', [Validators.required])
  });

  loading = signal(false);
  error = signal<string | undefined>(undefined);
  aircraft = signal<Aircraft[]>([]);
  flightroute = signal<FlightRoute[]>([]);

  combinedColumns = ['searchInput', 'typeAirline', 'details', 'locationRoute'];

  get placeholderLabel(): string {
    return this.form.controls.searchType.value === 'callsign' ? 'Callsign(s)' : 'Registration code(s)';
  }

  get placeholderExample(): string {
    return this.form.controls.searchType.value === 'callsign'
      ? 'e.g. DAL9925, DAL1234'
      : 'e.g. D-ENVR, N228PT';
  }

  onSearch(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(undefined);
    this.loading.set(true);
    this.aircraft.set([]);
    this.flightroute.set([]);

    const { searchType, searchInput } = this.form.getRawValue();
    const inputValue = (searchInput ?? '').split(/[\s,]+/).map(id => id.trim()).filter(id => !!id);

    if (inputValue.length === 0) {
      this.loading.set(false);
      return;
    }

    const requests = inputValue.map(value =>
      searchType === 'callsign' ? this.api.getCallsign(value) : this.api.getAircraft(value)
    );

    forkJoin(requests).pipe(
      finalize(() => this.loading.set(false)),
      catchError(err => {
        this.error.set(err?.error?.message || `Request failed (${err?.status})` || 'Request failed');
        return EMPTY;
      })
    ).subscribe((results: (AircraftResponse | CallsignResponse)[]) => {
      if (searchType === 'callsign') {
        this.flightroute.set(results.map(r => (r as CallsignResponse).response.flightroute));
      } else {
        this.aircraft.set(results.map(r => (r as AircraftResponse).response.aircraft));
      }
    });
  }

  getCombinedResults() {
    const combined: any[] = [];
    this.aircraft().forEach(a => combined.push({ type: 'aircraft', data: a }));
    this.flightroute().forEach(f => combined.push({ type: 'callsign', data: f }));
    return combined;
  }

  getIdentifier(item: any): string {
    return item.type === 'aircraft' ? item.data.registration : item.data.callsign;
  }

  getTypeOrAirline(item: any): string {
    return item.type === 'aircraft' ? item.data.type : (item.data.airline?.name || 'Unknown');
  }

  getTypeOrAirlineSecondary(item: any): string {
    if (item.type === 'aircraft') {
      return item.data.icao_type ? `ICAO Type: ${item.data.icao_type}` : '';
    } else {
      const icao = item.data.airline?.icao || '';
      const iata = item.data.airline?.iata || '';
      return `ICAO: ${icao} | IATA: ${iata}`;
    }
  }

  getManufacturerOrCountry(item: any): string {
    return item.type === 'aircraft' ? item.data.manufacturer : (item.data.airline?.country || '');
  }

  getDetailsLine1(item: any): string {
    if (item.type === 'aircraft') {
      return item.data.mode_s ? `Mode-S: ${item.data.mode_s}` : '';
    } else {
      return item.data.callsign_icao ? `ICAO: ${item.data.callsign_icao}` : '';
    }
  }

  getDetailsLine2(item: any): string {
    if (item.type === 'aircraft') {
      return item.data.registered_owner ? `Owner: ${item.data.registered_owner}` : '';
    } else {
      return item.data.callsign_iata ? `IATA: ${item.data.callsign_iata}` : '';
    }
  }

  getLocationRoute(item: any): string {
    if (item.type === 'aircraft') {
      return item.data.registered_owner_country_name || '';
    } else {
      const origin = item.data.origin?.iata_code || '';
      const dest = item.data.destination?.iata_code || '';
      return `${origin} → ${dest}`;
    }
  }

  getLocationRouteSecondary(item: any): string {
    if (item.type === 'aircraft') {
      return item.data.registered_owner_country_iso_name ? `Country Code: ${item.data.registered_owner_country_iso_name}` : '';
    } else {
      const origin = item.data.origin?.municipality || '';
      const dest = item.data.destination?.municipality || '';
      return `${origin} → ${dest}`;
    }
  }

}
