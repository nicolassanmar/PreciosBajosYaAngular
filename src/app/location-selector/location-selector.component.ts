import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import * as mapboxgl from 'mapbox-gl';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-location-selector',
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.css'],
})
export class LocationSelectorComponent implements OnInit {
  constructor(private http: HttpClient) {}

  map!: mapboxgl.Map;
  markerPosition!: [number, number];
  marker!: mapboxgl.Marker;

  locationForm = new FormGroup({
    locationInput: new FormControl('', Validators.required),
  });

  @Output() submitLocation = new EventEmitter();

  ngOnInit(): void {
    (mapboxgl as any).accessToken = environment.mapboxKey;

    //this.markerPosition = [lat, long];
    this.markerPosition = [-34.8832711, -56.1340765];

    this.map = new mapboxgl.Map({
      container: 'mapContainer', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [this.markerPosition[1], this.markerPosition[0]], // starting position [lng, lat]
      zoom: 13.5, // starting zoom
    });

    this.map.on('click', (e) => {
      console.log(`A click event has occurred at ${e.lngLat}`);
      this.marker.remove();
      this.createMarker(e.lngLat.lat, e.lngLat.lng);
      this.markerPosition = [e.lngLat.lat, e.lngLat.lng];
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.markerPosition = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          this.map.flyTo({
            animate: true,
            center: [this.markerPosition[1], this.markerPosition[0]],
          });
          this.marker.remove();
          this.createMarker(...this.markerPosition);
        },
        undefined,
        {
          enableHighAccuracy: true,
        }
      );
    }

    this.createMarker(...this.markerPosition);
  }

  createMarker(lat: number, long: number): void {
    this.marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([long, lat])
      .addTo(this.map);
    this.marker.on('dragend', () => {
      this.markerPosition = [
        this.marker.getLngLat().lat,
        this.marker.getLngLat().lng,
      ];
    });
  }

  onSubmitLocation(): void {
    console.log(this.markerPosition);
    this.submitLocation.emit(this.markerPosition);
  }

  onSearch(): void {
    const location: string = this.locationForm.get('locationInput')?.value;
    const queryString = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      location
    )}.json?country=UY&language=es&limit=1&access_token=${encodeURIComponent(
      environment.mapboxKey
    )}`;
    this.http.get(queryString).subscribe((data: any) => {
      console.log(data);
      const lat = data['features'][0]['center'][1];
      const long = data['features'][0]['center'][0];
      this.markerPosition = [lat, long];
      this.marker.remove();
      this.createMarker(lat, long);
      this.map.flyTo({
        animate: true,
        speed: 3,
        center: [long, lat],
      });
    });
  }
}
