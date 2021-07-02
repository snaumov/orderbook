import React from 'react';
import { useWs } from './ws';
import OrderBook from './orderbook';

import './app.css';

function App() {

  const {data, subscribeETH, subscribeXBT, feed, close, error} = useWs("wss://www.cryptofacilities.com/ws/v1");

  return (
    <div className="App">
      {error ? 
        <div>💥</div>
        : 
        <OrderBook 
          newOrders={data}
          subscribeETH={subscribeETH}
          subscribeXBT={subscribeXBT}
          feed={feed}
          close={close}
        />
      }
    </div>
  );
}

export default App;
