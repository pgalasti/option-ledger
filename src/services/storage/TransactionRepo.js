import { Repo } from "./Repo";
import { Criteria } from "./Criteria";

export const TransactionAction = {
    OPEN: 'OPEN',
    CLOSE: 'CLOSE',
    ROLL: 'ROLL',
    ASSIGNED: 'ASSIGNED',
    EXPIRED: 'EXPIRED'
};

export class TransactionRepo extends Repo {

    constructor(persistence) {
        super(persistence);
        this.TRANSACTIONS_KEY = 'transactions';
    }

    load(criteria) {
        let results = this.persistence.load(this.TRANSACTIONS_KEY) || [];
        if (!criteria) {
            return results;
        }

        results = results.filter(t => criteria.Fields.every(f => {
            const value = f.fieldName.split('.').reduce((o, i) => (o ? o[i] : undefined), t);
            return value === f.value;
        }));
        return results;
    }

    save({ positionId, action, data, date }) {
        const transactions = this.load();
        const index = transactions.findIndex(t => t.positionId === positionId && t.action === action);

        if (index >= 0) {
            transactions[index] = {
                ...transactions[index],
                data,
                date: date || transactions[index].date
            };
        } else {
            const transaction = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                positionId,
                action,
                date: date || new Date().toISOString(),
                data
            };
            transactions.push(transaction);
        }

        this.persistence.save(this.TRANSACTIONS_KEY, transactions);
        return transactions;
    }

    delete(positionId) {
        const transactions = this.load();
        const newTransactions = transactions.filter(t => t.positionId !== positionId);
        this.persistence.save(this.TRANSACTIONS_KEY, newTransactions);
        return newTransactions;
    }
}
