import { render, screen, fireEvent } from '@testing-library/react';
import OrderBook from './orderbook';
import {BookPage, ORDERS_MAX, TickSizeXBT} from './orders';
import {Feed} from './ws';

const defaultProps = {
    subscribeETH: () => {},
    subscribeXBT: () => {},
    close: () => {},
}

describe("Orderbook", () => {

    test('renders provided page', async () => {
        const orders: BookPage = {
            asks: [[111, 111]],
            bids: [[222, 222]]
        };
        render(<OrderBook newOrders={orders} feed={Feed.XBT} {...defaultProps} />);

        const items = await screen.findAllByText(111);
        expect(items).toHaveLength(3);
    });

    test('removes the row when the 0 is passed', async () => {

        const orders1: BookPage = {
            asks: [[111, 111]],
            bids: [[222, 222]]
        };

        const {rerender} = render(<OrderBook newOrders={orders1} feed={Feed.XBT} {...defaultProps} />);

        const items = await screen.findAllByText(111);
        expect(items).toHaveLength(3);

        const orders2: BookPage = {
            asks: [[111, 0]],
        };

        rerender(<OrderBook newOrders={orders2} feed={Feed.XBT} {...defaultProps} />);

        const items1 = await screen.queryAllByText(111);
        expect(items1).toHaveLength(0);
    });

    test('Grouping: when tick size is changed, groups rows', async () => {
        const orders: BookPage = {
            asks: [
                [111, 111],
                [111.5, 222]
            ],
        };

        const { getByTestId } = render(<OrderBook newOrders={orders} feed={Feed.XBT} {...defaultProps} />);
        const items = await screen.findAllByText(111);
        expect(items).toHaveLength(3);

        fireEvent.change(getByTestId("grouping-select"), { target: { value: TickSizeXBT.Medium }});

        expect(screen.queryAllByText(222)).toHaveLength(0);
        expect(screen.queryAllByText(333)).toHaveLength(2);
    });

    test("Should drop the rows when the feed changes", async () => {

        const orders: BookPage = {
            asks: [
                [111, 111],
            ],
        };

        const { rerender } = render(<OrderBook newOrders={orders} feed={Feed.XBT} {...defaultProps} />);
        const items = await screen.findAllByText(111);
        expect(items).toHaveLength(3);

        rerender(<OrderBook newOrders={orders} feed={Feed.ETH} {...defaultProps} />);

        expect(screen.queryAllByText(111)).toHaveLength(0);

    });

    test("Should render not more than ORDER_MAX allowed number of orders", async () => {

        const orders: BookPage = {
            asks: [],
        };

        for (let i = 1; i <= ORDERS_MAX; i++) {

            orders.asks?.push([i, i]);
        }


        const { rerender } = render(<OrderBook newOrders={orders} feed={Feed.XBT} {...defaultProps} />);
        expect(await screen.findAllByTestId("row-order")).toHaveLength(ORDERS_MAX);

        const orders1: BookPage = {
            asks: [[101, 101]],
        }

        rerender(<OrderBook newOrders={orders1} feed={Feed.XBT} {...defaultProps} />);
        expect(await screen.findAllByTestId("row-order")).toHaveLength(ORDERS_MAX);

    })

})