import createTree, {Tree} from 'functional-red-black-tree';

export type Order = [number, number]; // [price, size]
export type OrderWithTotal = [number, number, number]; // [price, size, total]

export interface BookPage {
    bids?: Array<Order>,
    asks?: Array<Order>,
}

export enum TickSizeXBT {
    Small = 0.5,
    Medium = 1,
    Large = 2.5,
}

export enum TickSizeEth {
    Small = 0.05,
    Medium = 0.1,
    Large = 0.25,
}

const negativeComparator = (a: number, b: number) => {
    if (a === b) {
        return 0
    }
    if (a > b) {
        return -1;
    }
    return 1;
}

export const ORDERS_MAX = 100;

/**
 * Manages the state of an OrderBook
 */
class OrderBook {
    bids: Tree<number, number>;
    asks: Tree<number, number>;

    groupedBids: Tree<number, number>;
    groupedAsks: Tree<number, number>;

    tickSize: TickSizeEth | TickSizeXBT;

    constructor() {
        this.bids = createTree(negativeComparator);
        this.asks = createTree();
        this.groupedBids = createTree(negativeComparator);
        this.groupedAsks = createTree();

        this.tickSize = TickSizeXBT.Small;
    } 

    private trimTrees = () => {
        if (this.groupedBids.length > ORDERS_MAX) {
            let newTree = this.groupedBids;
            const iter = this.groupedBids.at(ORDERS_MAX - 1);
            while (iter.hasNext) {
                iter.next();
                if (iter.key) {
                    newTree = this.groupedBids.remove(iter.key);
                }
            };       
            this.groupedBids = newTree;
        }

        if (this.groupedAsks.length > ORDERS_MAX) {
            let newTree = this.groupedAsks;
            const iter = this.groupedAsks.at(ORDERS_MAX - 1);
            while (iter.hasNext) {
                iter.next();
                if (iter.key) {
                    newTree = this.groupedAsks.remove(iter.key);
                }
            };       
            this.groupedAsks = newTree;
        }
        
    }

    private addGroupedBid = (bid: Order) => {
        const closestGroup = this.getClosestGroup(bid[0]);
        const levelSize = this.groupedBids.get(closestGroup) || 0;

        this.groupedBids = this.groupedBids.remove(closestGroup);
        this.groupedBids = this.groupedBids.insert(closestGroup, levelSize + bid[1]);
        this.trimTrees();
    }

    private addGroupedAsk = (ask: Order) => {
        const closestGroup = this.getClosestGroup(ask[0]);
        const levelSize = this.groupedAsks.get(closestGroup) || 0;

        this.groupedAsks = this.groupedAsks.remove(closestGroup);
        this.groupedAsks = this.groupedAsks.insert(closestGroup, levelSize + ask[1]);
        this.trimTrees();
    }

    private addBid = (bid: Order) => {
        this.bids = this.bids.remove(bid[0]);
        this.bids = this.bids.insert(bid[0], bid[1]);
        this.addGroupedBid(bid);
    }

    private removeBid = (key: number) => {
        this.bids = this.bids.remove(key);
        this.groupedBids = this.groupedBids.remove(key);
    }

    private addAsk = (ask: Order) => {
        this.asks = this.asks.remove(ask[0]);
        this.asks = this.asks.insert(ask[0], ask[1]);
        this.addGroupedAsk(ask);
    }

    private removeAsk = (key: number) => {
        this.asks = this.asks.remove(key);
        this.groupedAsks = this.groupedAsks.remove(key);
    }

    private getClosestGroup = (level: number) => {
        const remainder = level % this.tickSize;
        return Math.floor((level - remainder) * 100) / 100;
    }

    addOrders = (page: BookPage) => {
        if (page.bids) {
            page.bids.forEach((bid) => {
               if (bid[1] === 0) {
                   this.removeBid(bid[0]);
               } 
               else {
                   this.addBid(bid);
               }
            });
        }

        if (page.asks) {
            page.asks.forEach((ask) => {
                if (ask[1] === 0) {
                    this.removeAsk(ask[0]);
                }
                else {
                    this.addAsk(ask);
                }
            })
        }
    }

    getAsks = () => {
        const asks: Array<OrderWithTotal> = [];
        let runningTotal = 0;
        this.groupedAsks.forEach((price, size) => {
            runningTotal += size;
           asks.push([price, size, runningTotal]); 
        });

        return asks;
    };

    getBids = () => {
        const bids: Array<OrderWithTotal> = [];
        let runningTotal = 0;
        this.groupedBids.forEach((price, size) => {
            runningTotal += size;
           bids.push([price, size, runningTotal]); 
        });

        return bids;
    };

    setTickSize = (tickSize: TickSizeXBT | TickSizeEth) => {
        this.groupedBids = createTree(negativeComparator);
        this.groupedAsks = createTree();

        this.tickSize = tickSize;

        this.bids.forEach((price, size) => {
            this.addGroupedBid([price, size]);
        });

        this.asks.forEach((price, size) => {
            this.addGroupedAsk([price, size]);
        });
    }

    drop = () => {
        this.bids = createTree(negativeComparator);
        this.asks = createTree();
        this.groupedBids = createTree(negativeComparator);
        this.groupedAsks = createTree();
    }

}


export default OrderBook;