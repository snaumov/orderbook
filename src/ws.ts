import { useEffect, useRef, useState } from 'react';

export enum Feed {
    XBT,
    ETH,
}

enum WsError {
    CannotSubscribe = "Can not subscribe to feed",
}

enum ProductId {
    XBTUSD = 'PI_XBTUSD',
    ETHUSD = 'PI_ETHUSD',
}

export function useWs(url: string) {
    const [data, setData] = useState({});
    const [feed, setFeed] = useState<Feed | null>(null);
    const [error, setError] = useState<WsError | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket(url);
        ws.current.onopen = () => {
            subscribeXBT();
        };
        ws.current.onclose = () => {};
        ws.current.onmessage = handleMessage; 
    }, [url]);

    const handleMessage = (e: MessageEvent<any>) => {
        try {
            const data = JSON.parse(e.data);

            // console.log(data);
            if (data.event === "subscribed" && Array.isArray(data.product_ids)) {
                if (data.product_ids.length) {
                    const productId = data.product_ids[0];
                    if (productId === ProductId.XBTUSD) {
                        setFeed(Feed.XBT);
                        setError(null);
                        return;
                    }
                    else if (productId === ProductId.ETHUSD) {
                        setFeed(Feed.ETH);
                        setError(null);
                        return;
                    }

                }
            }

            if (data.event === "unsubscribed") {
                setFeed(null);
                setData({});
                return;
            }

            if (data.bids || data.asks) {
                setData(data);
            }
        } 
        catch (e) {
            console.log(e);
        }
    }

    function subscribeETH () {
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

    const subscribeXBT = () => {
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
    };
    
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
    }

    return {
        close,
        subscribeXBT,
        subscribeETH,
        feed,
        error,
        data,
    }
}