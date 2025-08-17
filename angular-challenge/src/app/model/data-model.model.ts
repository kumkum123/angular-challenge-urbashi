export interface Aircraft {
  type: string;
  icao_type: string;
  manufacturer: string;
  mode_s: string;
  registration: string;
  registered_owner_country_iso_name: string;
  registered_owner_country_name: string;
  registered_owner_operator_flag_code: string | null;
  registered_owner: string;
  url_photo: string | null;
  url_photo_thumbnail: string | null;
}

export interface FlightRoute {
  callsign: string;
  callsign_icao: string | null;
  callsign_iata: string | null;
  airline: Airline | null;
  origin: Airport;
  midpoint?: Airport | null;
  destination: Airport;
}

export interface Airport {
  country_iso_name: string;
  country_name: string;
  elevation: number;
  iata_code: string;
  icao_code: string;
  latitude: number;
  longitude: number;
  municipality: string;
  name: string;
}

export interface Airline {
  name: string;
  icao: string;
  iata: string | null;
  country: string;
  country_iso: string;
  callsign: string | null;
}

export type AircraftResponse = { response: { aircraft: Aircraft } };
export type CallsignResponse = { response: { flightroute: FlightRoute } };
