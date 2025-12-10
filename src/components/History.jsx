import React, { useState, useMemo } from 'react';
import { TransactionAction } from '../services/storage/TransactionRepo';
import { parseDate } from '../services/util/DateUtils';

const History = ({ transactionRepo }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [filterSymbol, setFilterSymbol] = useState('');

    const transactions = transactionRepo.load();

    const getPrice = (transaction) => {
        const { action, data } = transaction;
        let price = 0;
        let type = '';

        switch (action) {
            case TransactionAction.OPEN:
                price = data.priceSold;
                type = 'cr';
                break;
            case TransactionAction.CLOSE:
                price = data.priceClosed;
                type = 'db';
                break;
            case TransactionAction.ASSIGNED:
                price = data.assignedPrice;
                type = data.type === 'Short Put' ? 'db' : 'cr';
                break;
            case TransactionAction.EXPIRED:
                price = 0;
                break;
            case TransactionAction.ROLL:
                price = data.priceClosed;
                type = 'db';
                break;
            default:
                price = 0;
        }
        return { value: price || 0, type };
    };

    const sortedTransactions = useMemo(() => {
        let sortableItems = [...transactions];

        if (filterSymbol) {
            sortableItems = sortableItems.filter(t =>
                t.data.symbol.toLowerCase().includes(filterSymbol.toLowerCase())
            );
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'symbol') {
                    aValue = a.data.symbol;
                    bValue = b.data.symbol;
                } else if (sortConfig.key === 'date') {
                    aValue = parseDate(a.date);
                    bValue = parseDate(b.date);
                } else if (sortConfig.key === 'price') {
                    aValue = getPrice(a).value;
                    bValue = getPrice(b).value;
                } else {
                    return 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [transactions, sortConfig, filterSymbol]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    const formatAction = (action, data) => {
        switch (action) {
            case TransactionAction.OPEN:
                return 'STO';
            case TransactionAction.CLOSE:
                return 'BTC';
            case TransactionAction.ASSIGNED:
                return 'Assigned';
            case TransactionAction.EXPIRED:
                return 'Expired';
            case TransactionAction.ROLL:
                return `BTC (Rolled #${(data.rollCount || 0) + 1})`;
            default:
                return action;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return parseDate(dateString).toLocaleDateString();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Transaction History</h1>
                <div>
                    <input
                        type="text"
                        placeholder="Filter by Symbol"
                        value={filterSymbol}
                        onChange={(e) => setFilterSymbol(e.target.value)}
                        className="form-input"
                        style={{ maxWidth: '200px', padding: '0.5rem' }}
                    />
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text-main)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                            <th
                                style={{ padding: '1rem', cursor: 'pointer' }}
                                onClick={() => requestSort('symbol')}
                            >
                                Symbol{getSortIndicator('symbol')}
                            </th>
                            <th style={{ padding: '1rem' }}>Strike Price</th>
                            <th
                                style={{ padding: '1rem', cursor: 'pointer' }}
                                onClick={() => requestSort('date')}
                            >
                                Action Date{getSortIndicator('date')}
                            </th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                            <th style={{ padding: '1rem' }}>Quantity</th>
                            <th
                                style={{ padding: '1rem', cursor: 'pointer' }}
                                onClick={() => requestSort('price')}
                            >
                                Price{getSortIndicator('price')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            sortedTransactions.map((t) => {
                                const priceData = getPrice(t);
                                return (
                                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{t.data.symbol}</td>
                                        <td style={{ padding: '1rem' }}>${t.data.strikePrice?.toFixed(2)}</td>
                                        <td style={{ padding: '1rem' }}>{formatDate(t.date)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge ${t.data.type === 'Covered Call' ? 'call' : 'put'}`}>
                                                {t.data.type === 'Covered Call' ? 'Call' : 'Put'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{formatAction(t.action, t.data)}</td>
                                        <td style={{ padding: '1rem' }}>1</td>
                                        <td style={{ padding: '1rem' }}>
                                            ${priceData.value.toFixed(2)}
                                            {priceData.type && <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '4px' }}>{priceData.type}</span>}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
