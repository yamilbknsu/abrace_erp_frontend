import { Component, OnInit } from '@angular/core';

// Services
import { UsersService } from '../../services/users.service';

// Models
import { User } from '../../models/User';

@Component({
  selector: 'app-users-view',
  templateUrl: './users-view.component.html',
  styleUrls: ['./users-view.component.css']
})
export class UsersViewComponent implements OnInit {

  users:User[];

  constructor(private usersService:UsersService) { }

  ngOnInit() {
    this.usersService.getUsers().subscribe(
      users => {
        console.log(users);
        this.users = users;
      }
    );
  }

}
