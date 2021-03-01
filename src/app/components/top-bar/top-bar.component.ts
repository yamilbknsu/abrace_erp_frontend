import { Component, Input, OnInit } from '@angular/core';
import { SearchBarService } from 'src/app/services/serach-bar.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  @Input() displayname: string;

  searchInput: string = '';
  
  constructor(private searchBarService: SearchBarService) { }

  ngOnInit(): void {
  }

  updateSearchService(){
    this.searchBarService.getSearchInput$().next(this.searchInput.trim());
  }

}
