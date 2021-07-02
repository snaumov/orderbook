import React, {useRef, useState, useEffect} from 'react';
import Orders, { BookPage, OrderWithTotal, TickSizeEth, TickSizeXBT } from './orders';
import { Feed } from './ws';
import OrderBar from './orderbar';

import styles from './orderbook.module.css';
import { useMediaQuery } from './mediaQuery';

interface Props {
    newOrders: BookPage,
    feed: Feed | null,
    subscribeETH: () => void,
    subscribeXBT: () => void,
    close: () => void,
}

function OrderBook({ newOrders, feed, subscribeETH, subscribeXBT, close }: Props) {
    const [bids, setBids] = useState<Array<OrderWithTotal>>([]);
    const [asks, setAsks] = useState<Array<OrderWithTotal>>([]);
    const [tickSize, setTickSize] = useState<TickSizeXBT | TickSizeEth>(TickSizeXBT.Small);
    const isMobile = useMediaQuery();
    const isInitialMount = useRef(true);

    const orders = useRef<Orders>(new Orders());

    useEffect(() => {
        // Will replace the current orders with the new ones

        if (feed !== null) {
            orders.current.addOrders(newOrders);
            setAsks(orders.current.getAsks());
            setBids(orders.current.getBids());
        }
    }, [newOrders, feed]);
    
    useEffect(() => {
        // Nullifies the current bids/asks on feed switch (except on an initial render) 

        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            orders.current.drop();
            orders.current.setTickSize(feed === Feed.XBT ? TickSizeXBT.Small : TickSizeEth.Small);
            setAsks(orders.current.getAsks());
            setBids(orders.current.getBids());
        }
    }, [feed]);

    const handleTickSizeChange = (tickSize: TickSizeXBT | TickSizeEth) => {
        setTickSize(tickSize);
        orders.current.setTickSize(tickSize);
        setAsks(orders.current.getAsks());
        setBids(orders.current.getBids());
    }

    const handleFeedSwitch = () => {
        if (feed === Feed.XBT) {
            subscribeETH();
        }
        else {
            subscribeXBT();
        }
    }

    return (
        <div className={styles.orderbook}>
            <div className={styles.header}>
                <h3>Order Book</h3>
                {
                    feed === Feed.ETH ? 
                    (
                        <select className={styles.groupSelect} value={tickSize} onChange={(e) => handleTickSizeChange(Number(e.target.value))} data-testid="grouping-select">
                            <option label={`Group ${TickSizeEth.Small}`} value={TickSizeEth.Small}>{TickSizeEth.Small}</option>
                            <option label={`Group ${TickSizeEth.Medium}`} value={TickSizeEth.Medium}>{TickSizeEth.Medium}</option>
                            <option label={`Group ${TickSizeEth.Large}`} value={TickSizeEth.Large}>{TickSizeEth.Large}</option>
                        </select>
                    )
                    :
                    (
                        <select className={styles.groupSelect} value={tickSize} onChange={(e) => handleTickSizeChange(Number(e.target.value))} data-testid="grouping-select">
                            <option label={`Group ${TickSizeXBT.Small}`} value={TickSizeXBT.Small}>{TickSizeXBT.Small}</option>
                            <option label={`Group ${TickSizeXBT.Medium}`} value={TickSizeXBT.Medium}>{TickSizeXBT.Medium}</option>
                            <option label={`Group ${TickSizeXBT.Large}`} value={TickSizeXBT.Large}>{TickSizeXBT.Large}</option>
                        </select>
                    )
                }
            </div>
            <div className={styles.table}>
                <div className={styles.bids}>
                    {bids.map((bid, idx) => <OrderBar isBid isFirst={!isMobile && (idx === 0)} order={bid} max={bids.length && bids[bids.length - 1][2]} key={`${bid[1]}_${bid[2]}`} isMobile={isMobile} />)}
                </div>
                <div className={styles.asks}>
                    {(isMobile ? [...asks].reverse() : asks).map((ask, idx) => <OrderBar isFirst={idx === 0} order={ask} max={asks.length && asks[asks.length - 1][2]} key={`${ask[1]}_${ask[2]}`} isMobile={isMobile} />)}
                </div>
            </div>
            <div className={styles.footer}>
                <button className={`${styles.footerButton} ${styles.buttonToggle}`} onClick={handleFeedSwitch}>&#x1F504; Toggle Feed</button>
                <button className={`${styles.footerButton} ${styles.buttonKill}`} onClick={close}>&#128336; Kill Feed</button>
            </div>
        </div>
    );
}

export default OrderBook;
