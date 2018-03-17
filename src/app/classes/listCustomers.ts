import { ListAction } from './listAction'

export class ListCustomers {

    listAction: ListAction[];
    total: number;
    taxes: number;
    subtotal: number;
    lastItemClicked: any;
    client: any;

    constructor() {
        this.listAction;
        this.total;
        this.taxes;
        this.subtotal;
        this.lastItemClicked;
        this.client;
    }

}