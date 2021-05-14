import { Component, OnInit } from '@angular/core';
import { LoadingIconService } from '../../services/loading-icon.service';
import { UsersService } from 'src/app/services/users.service';
import '../../../assets/fonts/Roboto-Bold-bold.js';
import '../../../assets/fonts/Roboto-Regular-normal.js';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit {

  displayname: string;

  constructor(private userService: UsersService, private loadingIconService: LoadingIconService) { }

  ngOnInit(): void {
    this.displayname = this.userService.getDisplayName();
    this.loadingIconService.checkCierresMes();
    this.loadingIconService.checkReajustes();
  }

}
