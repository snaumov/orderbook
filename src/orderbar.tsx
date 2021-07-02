import React from 'react';
import { OrderWithTotal } from './orders';

import styles from './orderbar.module.css';

interface Props {
    order: OrderWithTotal,
    max: number,
    isBid?: boolean,
    isFirst?: boolean,
    isMobile?: boolean,
}

/**
 * Single row in an OrderBook.
 */
const OrderBar = ({ order, max, isBid = false, isFirst = false, isMobile = false }: Props) => {

    const colorPercentage = (order[2] / max) * 100;
    const barColor = isBid ? '#3D202B' : '#193839';

    return (
        <>
        {
            isFirst 
            && (
                <div className={styles.orderbar}>
                    {
                        (isBid || isMobile) ? (
                            <>
                                <span className={`${styles.orderbarItem} ${styles.headerItem}`}>TOTAL</span> 
                                <span className={`${styles.orderbarItem} ${styles.headerItem}`}>SIZE</span> 
                                <span className={`${styles.orderbarItem} ${styles.headerItem}`}>PRICE</span> 
                            </>
                        )
                        :
                        (
                            <>
                                <span className={`${styles.orderbarItem} ${styles.headerItem}`}>PRICE</span> 
                                <span className={`${styles.orderbarItem} ${styles.headerItem}`}>SIZE</span> 
                                <span className={`${styles.orderbarItem} ${styles.headerItem}`}>TOTAL</span> 
                            </>
                        )
                    }
                </div>
            )  
        }
        <div 
            className={styles.orderbar}
            style={{
                background: (isBid || isMobile) ? 
                    `linear-gradient(90deg, transparent 0%, transparent ${100 - colorPercentage}%, ${barColor} ${100 - colorPercentage}%, ${barColor} 100%)`
                    : `linear-gradient(90deg, ${barColor} 0%, ${barColor} ${colorPercentage}%, transparent ${colorPercentage}%, transparent 100%)`,
            }}
            data-testid="row-order"
        >
            {
                (isBid || isMobile) ? (
                    <>
                        <span className={styles.orderbarItem}>{order[1]}</span>
                        <span className={styles.orderbarItem}>{order[2]}</span>
                        <span className={`${styles.orderbarItem} ${styles.price}`}>{order[0]}</span>
                    </>
                )
                :
                (
                    <>
                        <span className={`${styles.orderbarItem} ${styles.price}`}>{order[0]}</span>
                        <span className={styles.orderbarItem}>{order[2]}</span>
                        <span className={styles.orderbarItem}>{order[1]}</span>
                    </>
                )
            }
        </div>
        </>
    )
}

export default OrderBar;