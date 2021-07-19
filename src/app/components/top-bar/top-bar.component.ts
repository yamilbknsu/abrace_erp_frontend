import { Component, Input, OnInit } from '@angular/core';
import { SearchBarService } from 'src/app/services/serach-bar.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  @Input() displayname: string;

  users;
  selectedUser = '';

  searchInput: string = '';
  
  constructor(private searchBarService: SearchBarService, private usersService: UsersService) { }

  ngOnInit(): void {
    this.users = this.usersService.loadUsers();
    this.selectedUser = localStorage.getItem('current_userid');
  }

  updateSearchService(){
    this.searchBarService.getSearchInput$().next(this.searchInput.trim());
  }

  changeSelectedUser(){
    localStorage.setItem('current_userid', this.selectedUser);
    window.location.reload()
  }

}
