export default class ProductoFlatModel {
  constructor(
    public nombre: string,
    public precio: string,
    public descripcion: string,
    public imagenes: string | string[],
    public seccion: string,
    public restaurantName: string,
    public restaurantId: string,
    public deliveryTimeMaxMinutes: number,
    public deliveryTimeMinMinutes: number,
    public generalScore: number,
    public link: string,
    public nextHour: string,
    public nextHourClose: string,
    public shippingAmount: number,
    public logo: string
  ) {}
}
