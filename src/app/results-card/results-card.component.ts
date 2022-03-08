import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import RestauranteModel from 'src/models/RestauranteModel';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import ProductoFlatModel from 'src/models/ProductoFlatModel';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-results-card',
  templateUrl: './results-card.component.html',
  styleUrls: ['./results-card.component.css'],
})
export class ResultsCardComponent implements OnInit {
  @Input() location!: [number, number];
  @Input() city!: string;

  @Output() resetLocation = new EventEmitter();

  products!: ProductoFlatModel[];
  searchedProducts!: ProductoFlatModel[];
  productsSlice!: ProductoFlatModel[];

  pageSize = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('City: ' + this.city);
    console.log('Querying ' + this.location);
    this.http
      .get<RestauranteModel[]>(
        `${environment.backendUrl}/scraper/getAllProductsInArea?lat=${this.location[0]}&long=${this.location[1]}`
      )
      .subscribe((data) => {
        const restaurantesProductos = data.map((restaurante) => {
          return restaurante.products.map((producto) => {
            console.log(producto);
            return {
              ...producto,
              restaurantName: restaurante.name,
              restaurantId: restaurante.restaurantId,
              deliveryTimeMaxMinutes: restaurante.deliveryTimeMaxMinutes,
              deliveryTimeMinMinutes: restaurante.deliveryTimeMinMinutes,
              generalScore: restaurante.generalScore,
              link: restaurante.link,
              nextHour: restaurante.nextHour,
              nextHourClose: restaurante.nextHourClose,
              shippingAmount: restaurante.shippingAmount,
              logo: restaurante.logo,
            };
          });
        });
        this.products = restaurantesProductos.flat();
        this.searchedProducts = this.products;
        this.productsSlice = this.searchedProducts.slice(0, this.pageSize);
      });
  }

  onResetLocation(): void {
    this.resetLocation.emit();
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    const startIndex = event.pageIndex * event.pageSize;
    let endIndex = event.pageIndex * event.pageSize + event.pageSize;
    if (endIndex > this.searchedProducts.length) {
      endIndex = this.searchedProducts.length;
    }
    this.productsSlice = this.searchedProducts.slice(startIndex, endIndex);
  }
}
