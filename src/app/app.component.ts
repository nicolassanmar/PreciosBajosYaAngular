import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import SearchOptions from 'src/models/SearchOptions';
import cities from './cities.json';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  location: [number, number] | undefined;
  title = 'PreciosBajosYa';
  city!: string;

  searchOptions: SearchOptions = {
    search: '',
    matchDescription: false,
    orderedBy: 'precio',
    ascendingOrder: true,
    onlyShowImages: false,
    onlyShowOpen: false,
  };

  constructor(private cookieService: CookieService) {
    let loc = this.cookieService.get('location');
    if (loc) {
      this.location = JSON.parse(loc);
      this.city = this.cookieService.get('city');
    }
  }

  onSubmitLocation(loc: [number, number]): void {
    this.location = loc;
    this.cookieService.set('location', JSON.stringify(this.location));

    let closest = cities.data[0];
    let closestDist =
      Math.pow(closest.latitude - loc[0], 2) +
      Math.pow(closest.longitude - loc[1], 2);
    cities.data.forEach((currentCity) => {
      // find squared distance between this location and the currentCity
      let dist =
        Math.pow(currentCity.latitude - loc[0], 2) +
        Math.pow(currentCity.longitude - loc[1], 2);
      if (dist < closestDist) {
        closest = currentCity;
        closestDist = dist;
      }
    });
    this.city = closest.name.toLowerCase().replace(' ', '-');
    this.cookieService.set('city', this.city);
  }
  onResetLocation(): void {
    this.location = undefined;
    this.cookieService.delete('location');
  }
}
