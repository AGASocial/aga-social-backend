import { Injectable } from "@nestjs/common";


@Injectable()
export class DataFiltererService {
    constructor(){}

    async filter(data: Object, dataRules: string[]) {

        for (let attribute in data) {
            if (typeof(data[attribute]) == 'object') {
                if (Array.isArray(data[attribute])) {
                    let nestedArray = data[attribute];
                    if (typeof(nestedArray[0]) != 'object') {
                        if (!(dataRules.includes(attribute))) {
                            delete data[attribute];
                        }
                    }
                    else {
                        let nodeRules: string[] = [];
                        for (let dataRule of dataRules){
                            let dataRuleSearch = dataRule.search(attribute);
                            if ((dataRuleSearch != -1) && (attribute != dataRule)) {
                                dataRule = dataRule.slice(dataRule.indexOf('.')+1);
                                nodeRules.push(dataRule);
                            }
                        }
                        for(let member of nestedArray){
                            if(typeof(member) == 'object')
                                this.filter(member,nodeRules);
                        }
                    }
                }
                else {
                    let nodeRules: string[] = [];
                    for (let dataRule of dataRules){
                        let dataRuleSearch = dataRule.search(attribute);
                        if ((dataRuleSearch != -1) && (attribute != dataRule)) {
                            dataRule = dataRule.slice(dataRule.indexOf('.')+1);
                            nodeRules.push(dataRule);
                        }
                    }
                    this.filter(data[attribute],nodeRules);
                }
            }
            else {
                if (!(dataRules.includes(attribute))) {
                    delete data[attribute];
                }
            }
        }
    }
}