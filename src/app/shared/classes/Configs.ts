import { inject, signal } from "@angular/core";
import { ComponentConfig } from "../models/configs";
import { ActivatedRoute } from "@angular/router";
import { ApiResponse } from "../models/response";
import { ResponseCode } from "../enums/app.enums";
import { Subscription } from "rxjs";

export class ConfigResolver {
    private subscription : Subscription = new Subscription();
    public componentConfigs = signal<ComponentConfig<any>[]>([]);
    public activatedRoute = inject(ActivatedRoute);
    constructor() {
        this.getComponentConfigs();
    }

    private getComponentConfigs() {
        this.subscription = this.activatedRoute.data.subscribe({
            next: (routeResolver) => {
              const resolvedData: ApiResponse<ComponentConfig<any>[]> =
                routeResolver['componentConfig'];
              if (resolvedData.responseCode === ResponseCode.success) {
                this.componentConfigs.set(resolvedData.data as ComponentConfig<any>[]);
              }
            },
          });
    }

    public getComponent(componentName: string): boolean {
        const component = this.componentConfigs().find(
          (config) => config.name === componentName
        );
        return component ? true : false;
    }

    destroyRouteSubscription = () => this.subscription.unsubscribe()
}