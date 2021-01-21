import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-log-in-screen',
  templateUrl: './log-in-screen.component.html',
  styleUrls: ['./log-in-screen.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({opacity: 0}), animate('.5s', style({opacity: 1}))])
    ])
  ]
})
export class LogInScreenComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
