import {
  Component,
  ChangeDetectionStrategy,
  HostListener
} from "@angular/core";
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  group
} from "@angular/animations";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  /*animations: [
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
          animate('600ms ease',
            style({
              position: 'fixed',
              width:'100%',
              transform: 'translateX(100%)'
            })
          ),
        {optional:true}),
        // move page in screen from left to right
        query(':enter',
          animate('600ms ease',
            style({
              opacity: 1,
              transform: 'translateX(0%)'
            })
          ),
        {optional:true}),
      ])
    ])
  ]*/
  animations: [
    trigger("routerAnimation", [
      transition(
        "1 => 2, 2 => 3, 3 => 4, 4 => 5, 1 => 3, 1 => 4, 1 => 5, 2 => 4, 2 => 5, 3 => 5",
        [
          style({ height: "!" }),
          query(":enter", style({ transform: "translateX(100%)" }), {
            optional: true
          }),
          query(
            ":enter, :leave",
            style({ position: "absolute", top: 0, left: 0, right: 0 }),
            { optional: true }
          ),
          // animate the leave page away
          group([
            query(
              ":leave",
              [
                animate(
                  "0.3s cubic-bezier(.35,0,.25,1)",
                  style({ transform: "translateX(-100%)" })
                )
              ],
              { optional: true }
            ),
            // and now reveal the enter
            query(
              ":enter",
              animate(
                "0.3s cubic-bezier(.35,0,.25,1)",
                style({ transform: "translateX(0)" })
              ),
              { optional: true }
            )
          ])
        ]
      ),
      transition(
        "5 => 4, 4 => 3, 3 => 2 , 2 => 1, 5 => 3, 5 => 2, 5 => 1, 4 => 2, 4 => 1, 3 => 1",
        [
          style({ height: "!" }),
          query(":enter", style({ transform: "translateX(-100%)" }), {
            optional: true
          }),
          query(
            ":enter, :leave",
            style({ position: "absolute", top: 0, left: 0, right: 0 }),
            { optional: true }
          ),
          // animate the leave page away
          group([
            query(
              ":leave",
              [
                animate(
                  "0.3s cubic-bezier(.35,0,.25,1)",
                  style({ transform: "translateX(100%)" })
                )
              ],
              { optional: true }
            ),
            // and now reveal the enter
            query(
              ":enter",
              animate(
                "0.3s cubic-bezier(.35,0,.25,1)",
                style({ transform: "translateX(0)" })
              ),
              { optional: true }
            )
          ])
        ]
      )
    ])
  ]
})
export class AppComponent {
  currentDepht: number = null;

  constructor() {}

  @HostListener("document:contextmenu", ["$event"])
  onDocumentRightClick(event) {
    return false;
  }

  getDepth(outlet) {
    return outlet.activatedRouteData.depth;
  }

  getRouteAnimation(outlet) {
    return outlet.activatedRouteData.animation;
  }
}
