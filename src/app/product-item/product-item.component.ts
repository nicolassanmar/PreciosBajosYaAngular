import { Component, Input, OnInit } from '@angular/core';
import ProductoFlatModel from 'src/models/ProductoFlatModel';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css'],
})
export class ProductItemComponent implements OnInit {
  @Input() product!: ProductoFlatModel;
  @Input() city!: string;
  productImageBaseUrl =
    'https://images.deliveryhero.io/image/pedidosya/products/';
  restaurantImageBaseUrl =
    'https://images.deliveryhero.io/image/pedidosya/restaurants/';

  productImage!: string;
  restaurantImage!: string;
  constructor() {}

  ngOnInit(): void {
    console.log(this.product.imagenes);
    this.productImage =
      this.product.imagenes &&
      this.product.imagenes !== '' &&
      this.product.imagenes !== '[]' &&
      this.product.imagenes != [] &&
      this.product.imagenes.length > 0
        ? this.productImageBaseUrl + this.product.imagenes
        : 'assets/images/food1.png';
    this.restaurantImage =
      this.product.logo &&
      this.product.logo !== '' &&
      this.product.logo !== '[]'
        ? this.restaurantImageBaseUrl + this.product.logo
        : 'assets/images/food2.png';
  }
}
