import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request, Response } from "express";
import { Observable, map, of, tap } from "rxjs";
import { Rule } from "src/roles/entities/rule.entity";
import { RolesService } from "src/roles/roles.service";
import { UsersService } from "src/users/users.service";
import { AuthorizationService } from "../authorization.service";
import { DataFiltererService } from "src/utils/dataFilterer.service";

//Checks if the received data fullfills the authorization rules
@Injectable()
export class DataControlInterceptor implements NestInterceptor {

    constructor(private usersService: UsersService, private rolesService: RolesService, private authorizationService: AuthorizationService, private dataFiltererService: DataFiltererService){}

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {

        const req: Request = context.switchToHttp().getRequest();
        const jwtToken: string = req.signedCookies.bearer_token;
        const userId = this.usersService.extractID(jwtToken);
        const userSnap = await this.usersService.getUserById(userId);
        const userRules: Rule[] = await this.authorizationService.getUserRules(userSnap);  
        const {method, path: url, body, params, query} = req;

        let routeRule: Rule;

        for (let rule of userRules){
            if (rule.method == method) {
                if (Object.keys(params).length != 0){
                    let concreteRuleUrl;
                    for (let parameter of rule.data_in.parameters){
                        if(params.hasOwnProperty(parameter)){
                            concreteRuleUrl = rule.route.replace(parameter,params[parameter]);
                        }
                    }
                    if (concreteRuleUrl == url){
                        routeRule = rule;
                        break;
                    }
                }
                else {
                    if (rule.route == url){
                        routeRule = rule;
                        break;
                    }
                }
            }
        }

        if(routeRule != undefined){
        
            this.dataFiltererService.filter(body,routeRule.data_in.body);
    
            this.dataFiltererService.filter(params,routeRule.data_in.parameters);
    
            this.dataFiltererService.filter(query,routeRule.data_in.queries);  
        }



        return next.handle().pipe(map(
            (data) => {
                if(routeRule != undefined){
                    this.dataFiltererService.filter(data,routeRule.data_out.body)
                }
                return data;
            })
        );
    }
}
