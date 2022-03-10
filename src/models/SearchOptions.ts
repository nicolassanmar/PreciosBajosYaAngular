class SearchOptions {
  constructor(
    public search: string,
    public matchDescription: boolean,
    /* ordering */
    public orderedBy: 'tiempoEnvio' | 'estrellas' | 'precioConEnvio' | 'precio',
    public ascendingOrder: boolean,
    /* filtering */
    public onlyShowImages: boolean,
    public onlyShowOpen: boolean
  ) {}
}

export default SearchOptions;
