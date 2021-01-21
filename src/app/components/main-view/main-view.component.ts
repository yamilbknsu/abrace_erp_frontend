import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit {

  displayname: string;

  constructor(private userService: UsersService) { }

  ngOnInit(): void {
    this.displayname = this.userService.getDisplayName();
  }

}
