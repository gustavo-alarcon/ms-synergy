import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
} from '@angular/animations';

@Component({
  selector: 'app-mstext',
  templateUrl: './mstext.component.html',
  styleUrls: ['./mstext.component.css'],
  animations: [
    trigger('routerAnimation', [
      transition('* <=> *', [
        // Initial state of new route
        query(':enter',
          style({
            position: 'fixed',
            width:'100%',
            transform: 'translateX(-100%)'
          }),
          {optional:true}),
        // move page off screen right on leave
        query(':leave',
          animate('500ms ease',
            style({
              position: 'fixed',
              width:'100%',
              transform: 'translateX(100%)'
            })
          ),
        {optional:true}),
        // move page in screen from left to right
        query(':enter',
          animate('500ms ease',
            style({
              opacity: 1,
              transform: 'translateX(0%)'
            })
          ),
        {optional:true}),
      ])
    ])
  ]
})
export class MsTextComponent implements OnInit {
  toogle:string = null;
  constructor() {
    if(localStorage.getItem('page')==null)
      localStorage.setItem('page', '1');
    this.toogle=JSON.parse(localStorage.getItem('page'));
   }

  ngOnInit() {
  }

  changePage(page){
    localStorage.setItem('page',page);
    this.toogle=JSON.parse(localStorage.getItem('page'));
  }

  logout(){
    localStorage.removeItem('web');
    localStorage.removeItem('db');
    localStorage.removeItem('user');
    localStorage.removeItem('page');
  }

  getRouteAnimation() {
    return this.toogle;
  }

}
