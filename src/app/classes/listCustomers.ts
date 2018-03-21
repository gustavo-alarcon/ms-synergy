import { ListAction } from './listAction'

export class ListCustomers {

    listAction: ListAction[];
    total: number;
    taxes: number;
    subtotal: number;
    lastItemClicked: any;
    client: any;
    igvType: any;
    correlativo : any;
    documento : any;
    serie : any;
    paymentType:any;
    given:any;
    change:any;
    user : any;
    date : any;

    constructor() {
        this.listAction;
        this.total;
        this.taxes;
        this.subtotal;
        this.lastItemClicked;
        this.client;
        this.igvType;
        this.correlativo;
        this.documento;
        this.serie;
        this.paymentType;
        this.given;
        this.change;
        this.user;
        this.date;
    }

}