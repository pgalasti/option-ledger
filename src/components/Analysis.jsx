import React, { useState, useMemo } from 'react';
import AnalysisSearch from './AnalysisSearch';
import AnalysisMetrics from './AnalysisMetrics';
import AnalysisGraph from './AnalysisGraph';
import { TransactionAction } from '../services/storage/TransactionRepo';
import { Criteria, CriteriaField } from '../services/storage/Criteria';

const Analysis = ({ transactionRepo, positions: openPositions = [] }) => {
    const [selectedSymbol, setSelectedSymbol] = useState(null);

    const transactions = useMemo(() => {
        if (!selectedSymbol) return [];
        const criteria = new Criteria();
        criteria.addField(new CriteriaField('data.symbol', selectedSymbol));
        return transactionRepo.load(criteria);
    }, [selectedSymbol, transactionRepo]);

    const analysisData = useMemo(() => {
        if (!selectedSymbol) return null;

        const symbolTransactions = transactions;
        const symbolOpenPositions = openPositions.filter(p => p.symbol === selectedSymbol);

        const positions = {};
        symbolTransactions.forEach(t => {
            if (!positions[t.positionId]) {
                positions[t.positionId] = { open: null, close: null, events: [] };
            }
            if (t.action === TransactionAction.OPEN) {
                positions[t.positionId].open = t;
            } else if ([TransactionAction.CLOSE, TransactionAction.EXPIRED, TransactionAction.ASSIGNED, TransactionAction.ROLL].includes(t.action)) {
                positions[t.positionId].close = t;
            }
            positions[t.positionId].events.push(t);
        });

        let totalPL = 0;
        let tradeCount = 0;
        let callsCount = 0;
        let putsCount = 0;
        let assignedCount = 0;
        let expiredCount = 0;
        let rolledCount = 0;
        let totalRepurchased = 0;
        let repurchasedCount = 0;
        const graphData = [];

        // Process Closed Positions
        Object.values(positions).forEach(pos => {
            if (!pos.open) return; // Should have an open transaction

            const openData = pos.open.data;
            const type = openData.type === 'Covered Call' ? 'Call' : 'Put';

            tradeCount++;
            if (type === 'Call') callsCount++; else putsCount++;

            if (pos.close) {
                const closeAction = pos.close.action;
                const closeData = pos.close.data;
                const closeDate = pos.close.date;

                let revenue = parseFloat(openData.priceSold || 0);
                let cost = 0;
                let fees = parseFloat(openData.fees || 0);

                if (closeAction === TransactionAction.CLOSE) {
                    cost = parseFloat(closeData.priceClosed || 0);
                    totalRepurchased += cost * 100;
                    repurchasedCount++;
                    fees += parseFloat(closeData.fees || 0);
                } else if (closeAction === TransactionAction.ASSIGNED) {
                    assignedCount++;
                    fees += parseFloat(closeData.fees || 0);
                } else if (closeAction === TransactionAction.EXPIRED) {
                    expiredCount++;
                } else if (closeAction === TransactionAction.ROLL) {
                    cost = parseFloat(closeData.priceClosed || 0);
                    rolledCount++;
                    fees += parseFloat(closeData.fees || 0);
                }

                const netPL = ((revenue - cost) * 100) - fees;
                const pl = netPL;

                totalPL += pl;
                graphData.push({ date: closeDate, pl });
            }
        });

        // Process Open Positions
        symbolOpenPositions.forEach(pos => {
            tradeCount++;
            const type = pos.type === 'Covered Call' ? 'Call' : 'Put';
            if (type === 'Call') callsCount++; else putsCount++;

            const revenue = parseFloat(pos.priceSold || 0);
            const fees = parseFloat(pos.fees || 0);
            const netPL = (revenue * 100) - fees; // Treat as unrealized gain (cash collected)

            totalPL += netPL;
            graphData.push({ date: pos.sellDate, pl: netPL });
        });

        return {
            metrics: {
                totalPL,
                tradeCount,
                callsCount,
                putsCount,
                assignedCount,
                expiredCount,
                rolledCount,
                totalRepurchased,
                repurchasedCount,
                openPositionsCount: symbolOpenPositions.length
            },
            graphData,
            openPositions: symbolOpenPositions
        };

    }, [selectedSymbol, transactions, openPositions]);

    return (
        <div className="analysis-container" style={{ padding: '0.5rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Trade Analysis</h1>
                <AnalysisSearch onSelectSymbol={setSelectedSymbol} />
            </div>

            {selectedSymbol && analysisData ? (
                <div className="analysis-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.25rem' }}>{selectedSymbol}</h2>
                        <span style={{ color: 'var(--color-text-muted)' }}>Performance Overview</span>
                    </div>

                    <div className="analysis-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '0.5rem', flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.5rem' }}>
                        <div className="metrics-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <AnalysisMetrics metrics={analysisData.metrics} />
                        </div>
                        <div className="graph-section" style={{ minHeight: '250px', height: '100%' }}>
                            <AnalysisGraph data={analysisData.graphData} />
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                    <p>Select a symbol to view analysis</p>
                </div>
            )}
        </div>
    );
};

export default Analysis;
