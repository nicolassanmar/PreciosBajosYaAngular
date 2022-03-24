import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import SearchOptions from 'src/models/SearchOptions';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {
  hidden: boolean = false;

  @Output() searchEvent = new EventEmitter<SearchOptions>();

  searchForm = new FormGroup({
    search: new FormControl(''),
    matchDescription: new FormControl(false),
    orderBy: new FormControl('precio'),
    ascendingOrder: new FormControl(true),
    onlyShowImages: new FormControl(false),
    onlyShowOpen: new FormControl(false),
  });

  constructor() {}

  ngOnInit(): void {
    this.onSearch();
    console.log('searchbar init');
  }
  onSearch() {
    console.log(this.searchForm.value);
    const formOptions = this.searchForm.value;
    const options = new SearchOptions(
      formOptions.search,
      formOptions.matchDescription,
      formOptions.orderBy,
      formOptions.ascendingOrder,
      formOptions.onlyShowImages,
      formOptions.onlyShowOpen
    );
    this.searchEvent.emit(options);
  }

  onHide() {
    this.hidden = !this.hidden;
  }
}
