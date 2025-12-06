import React, { useState, useMemo } from 'react';
import AnalysisSearch from './AnalysisSearch';
import AnalysisMetrics from './AnalysisMetrics';
import AnalysisGraph from './AnalysisGraph';
import { TransactionAction } from '../services/storage/TransactionRepo';
import { Criteria, CriteriaField } from '../services/storage/Criteria';

const Analysis = ({ transactionRepo }) => {
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

        const positions = {};
        symbolTransactions.forEach(t => {
            if (!positions[t.positionId]) {
                positions[t.positionId] = { open: null, close: null, events: [] };
            }
            if (t.action === TransactionAction.OPEN) {
                positions[t.positionId].open = t;
            } else if ([TransactionAction.CLOSE, TransactionAction.EXPIRED, TransactionAction.ASSIGNED].includes(t.action)) {
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
        let rolledCount = 0; // Placeholder
        let totalRepurchased = 0;
        let repurchasedCount = 0;
        const graphData = [];

        Object.values(positions).forEach(pos => {
            if (!pos.open) return; // Should have an open transaction

            const openData = pos.open.data;
            const type = openData.type === 'Covered Call' ? 'Call' : 'Put'; // I need to define a static string const for this

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
                    totalRepurchased += cost * 100; // Track total repurchased amount (x100 for consistency)
                    repurchasedCount++;
                    fees += parseFloat(closeData.fees || 0);
                } else if (closeAction === TransactionAction.ASSIGNED) {
                    assignedCount++;
                    fees += parseFloat(closeData.fees || 0);
                } else if (closeAction === TransactionAction.EXPIRED) {
                    expiredCount++;
                }

                const netPL = (revenue - cost - fees) * 100;
                const rawPL = revenue - cost - fees;
                const pl = rawPL * 100;

                totalPL += pl;
                graphData.push({ date: closeDate, pl });
            }
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
                repurchasedCount
            },
            graphData
        };

    }, [selectedSymbol, transactions]);

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
                        <div className="metrics-section">
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
