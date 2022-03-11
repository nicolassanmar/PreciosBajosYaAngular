import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import RestauranteModel from 'src/models/RestauranteModel';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import ProductoFlatModel from 'src/models/ProductoFlatModel';
import { PageEvent } from '@angular/material/paginator';
import SearchOptions from 'src/models/SearchOptions';

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

  latestSearchOptions!: SearchOptions;

  pageSize = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('City: ' + this.city);
    console.log('Querying ' + this.location);
    console.log('Productos: ' + this.products);
    this.http
      .get<RestauranteModel[]>(
        `${environment.backendUrl}/scraper/getAllProductsInArea?lat=${this.location[0]}&long=${this.location[1]}`
      )
      .subscribe((data) => {
        const restaurantesProductos = data.map((restaurante) => {
          return restaurante.products.map((producto) => {
            return {
              ...producto,
              restaurantName: restaurante.name,
              restaurantId: restaurante.restaurantId,
              deliveryTimeMaxMinutes: restaurante.deliveryTimeMaxMinutes,
              deliveryTimeMinMinutes: restaurante.deliveryTimeMinMinutes,
              opened: restaurante.opened,
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
        this.onProductSearch(this.latestSearchOptions);
      });
  }

  onResetLocation(): void {
    this.resetLocation.emit();
  }

  onPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    let endIndex = event.pageIndex * event.pageSize + event.pageSize;
    if (endIndex > this.searchedProducts.length) {
      endIndex = this.searchedProducts.length;
    }
    this.productsSlice = this.searchedProducts.slice(startIndex, endIndex);
  }

  onProductSearch(searchOptions: SearchOptions): void {
    this.latestSearchOptions = searchOptions;
    const filtered = this.filterProducts(this.products, searchOptions);
    this.searchedProducts = this.orderProducts(filtered, searchOptions);

    this.productsSlice = this.searchedProducts.slice(0, this.pageSize);
  }

  filterProducts(
    products: ProductoFlatModel[],
    searchOptions: SearchOptions
  ): ProductoFlatModel[] {
    const filtered = products.filter((product) => {
      if (
        searchOptions.search.length > 0 &&
        !product.nombre
          .toLowerCase()
          .includes(searchOptions.search.toLowerCase())
      ) {
        return false;
      }
      if (searchOptions.onlyShowImages && product.imagenes.length == 0) {
        return false;
      }
      console.log(product.opened);
      if (searchOptions.onlyShowOpen && product.opened != 1) {
        return false;
      }
      return true;
    });

    return filtered;
  }

  orderProducts(
    products: ProductoFlatModel[],
    searchOptions: SearchOptions
  ): ProductoFlatModel[] {
    if (searchOptions.orderedBy === 'precio') {
      return products.sort((a, b) => {
        return Number(a.precio) - Number(b.precio);
      });
    } else if (searchOptions.orderedBy === 'precioConEnvio') {
      return products.sort((a, b) => {
        return (
          Number(a.precio) +
          Number(a.shippingAmount) -
          (Number(b.precio) + Number(b.shippingAmount))
        );
      });
    } else if (searchOptions.orderedBy === 'tiempoEnvio') {
      return products.sort((a, b) => {
        return a.deliveryTimeMaxMinutes - b.deliveryTimeMaxMinutes;
      });
    } else if (searchOptions.orderedBy === 'estrellas') {
      return products.sort((a, b) => {
        return a.generalScore - b.generalScore;
      });
    } else {
      return products;
    }
  }
}
