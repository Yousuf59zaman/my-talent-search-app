import { Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Component({ 
    template: ''
})
export abstract class Base implements OnDestroy {

    protected componentDestroyed$: Subject<void>;
   
   constructor() {
       this.componentDestroyed$ = new Subject<void>();
   
       const destroyFunc = this.ngOnDestroy;
       this.ngOnDestroy = () => {
           destroyFunc.bind(this)();
           console.log('from base')
           this.componentDestroyed$.next();
           this.componentDestroyed$.complete();
       };
   }

   public ngOnDestroy() { }
}