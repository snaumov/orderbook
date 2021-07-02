import { useCallback, useEffect, useRef, useState } from 'react';
import throttle from 'lodash.throttle';

export enum Feed {
    XBT,
    ETH,
}

enum WsError {
    CannotConnect = "Can not connect to the server",
    CannotSubscribe = "Can not subscribe to a feed",
}

enum ProductId {
    XBTUSD = 'PI_XBTUSD',
    ETHUSD = 'PI_ETHUSD',
}

const WS_THROUGHPUT = 50; // ms

/**
 * Websocket hook. Handles connection and sending/receiving.
 */
export function useWs(url: string) {
    const [data, setData] = useState({});
    const setDataThrottled = useRef(throttle(setData, WS_THROUGHPUT)).current;

    const [feed, setFeed] = useState<Feed | null>(null);
    const [error, setError] = useState<WsError | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to websocket endpoint
        try {
            ws.current = new WebSocket(url);
        } 
        catch (e) {
            setError(WsError.CannotConnect);
        }
    }, [url]); 

    const handleMessage = useCallback((e: MessageEvent<any>) => {
        try {
            const data = JSON.parse(e.data);

            if (data.event === "subscribed" && Array.isArray(data.product_ids)) {
                if (data.product_ids.length) {
                    const productId = data.product_ids[0];
                    if (productId === ProductId.XBTUSD) {
                        setData({});
                        setFeed(Feed.XBT);
                        setError(null);
                        return;
                    }
                    else if (productId === ProductId.ETHUSD) {
                        setData({});
                        setFeed(Feed.ETH);
                        setError(null);
                        return;
                    }

                }
            }

            if (data.event === "unsubscribed") {
                setData({});
                setFeed(null);
                return;
            }

            if (data.bids || data.asks) {
                setDataThrottled(data);
            }
        } 
        catch (e) {
            console.log(e);
        }
    }, [setDataThrottled]);
    
    const subscribeETH = () => {
        if (feed === Feed.ETH) {
            return;
        }

        try {
            if (feed === Feed.XBT) {
                unsubscribeXBT();
            }
            ws.current?.send(JSON.stringify({"event":"subscribe","feed":"book_ui_1","product_ids":["PI_ETHUSD"]}));
        }
        catch (e) {
            setError(WsError.CannotSubscribe)
        }
    };

    const subscribeXBT = useCallback(() => {
        if (feed === Feed.XBT) {
            return;
        }

        try {
            if (feed === Feed.ETH) {
                unsubscribeETH();
            }
            ws.current?.send(JSON.stringify({"event":"subscribe","feed":"book_ui_1","product_ids":["PI_XBTUSD"]}));
        }
        catch (e) {
            setError(WsError.CannotSubscribe)
        }
    }, [feed]);
    
    const unsubscribeETH = () => {
        ws.current?.send(JSON.stringify({"event":"unsubscribe","feed":"book_ui_1","product_ids":["PI_ETHUSD"]}));
    }

    const unsubscribeXBT = () => {
        ws.current?.send(JSON.stringify({"event":"unsubscribe","feed":"book_ui_1","product_ids":["PI_XBTUSD"]}));
    }

    const close = () => {
        if (feed !== null) {
            feed === Feed.XBT ? unsubscribeXBT() : unsubscribeETH();
        }
    };

    useEffect(() => {
        // Bind websocket listeners.

        if (ws.current) {
            ws.current.onopen = () => {
                subscribeXBT();
            };
            ws.current.onmessage = handleMessage; 
        }
    }, [ws, subscribeXBT, handleMessage]);

    return {
        close,
        subscribeXBT,
        subscribeETH,
        feed,
        error,
        data,
    }
}