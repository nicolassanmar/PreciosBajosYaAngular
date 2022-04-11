import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import RestauranteModel from 'src/models/RestauranteModel';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import ProductoFlatModel from 'src/models/ProductoFlatModel';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import SearchOptions from 'src/models/SearchOptions';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import * as productComponent from '../product-item/product-item.component';

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

  pageSize = 6;

  @ViewChild('paginator') paginator!: MatPaginator;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit(): void {
    console.log('City: ' + this.city);
    console.log('Querying ' + this.location);
    console.log('Productos: ' + this.products);
    const fetchData = async () => {
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
    };
    fetchData();
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
    this.paginator.firstPage();
  }

  filterProducts(
    products: ProductoFlatModel[],
    searchOptions: SearchOptions
  ): ProductoFlatModel[] {
    const filtered = products.filter((product) => {
      if (
        searchOptions.search.length > 0 &&
        !quitarTildes(product.nombre.toLowerCase()).includes(
          quitarTildes(searchOptions.search.toLowerCase())
        ) &&
        (searchOptions.matchDescription === false ||
          !quitarTildes(product.descripcion.toLowerCase()).includes(
            quitarTildes(searchOptions.search.toLowerCase())
          ))
      ) {
        return false;
      }
      if (searchOptions.onlyShowImages && product.imagenes.length == 0) {
        return false;
      }
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
    const mult = searchOptions.ascendingOrder == true ? 1 : -1;
    if (searchOptions.orderedBy === 'precio') {
      return products.sort((a, b) => {
        return (Number(a.precio) - Number(b.precio)) * mult;
      });
    } else if (searchOptions.orderedBy === 'precioConEnvio') {
      return products.sort((a, b) => {
        return (
          (Number(a.precio) +
            Number(a.shippingAmount) -
            (Number(b.precio) + Number(b.shippingAmount))) *
          mult
        );
      });
    } else if (searchOptions.orderedBy === 'tiempoEnvio') {
      return products.sort((a, b) => {
        return (a.deliveryTimeMaxMinutes - b.deliveryTimeMaxMinutes) * mult;
      });
    } else if (searchOptions.orderedBy === 'estrellas') {
      return products.sort((a, b) => {
        return (a.generalScore - b.generalScore) * mult;
      });
    } else {
      return products;
    }
  }

  onRandom() {
    const getRandomInt = (min: number, max: number) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const randomProduct =
      this.searchedProducts[getRandomInt(0, this.searchedProducts.length)];

    console.log(randomProduct);
    const dialogRef = this.dialog.open(productComponent.ProductItemComponent);
    dialogRef.componentInstance.product = randomProduct;
  }
}

const quitarTildes = (string: string) => {
  return string
    .normalize('NFD')
    .replace(/[\u0300-\u0302]|[\u0304-\u036f]/g, '');
};
