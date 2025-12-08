import { Repo } from "./Repo";

export class PositionRepo extends Repo {

    constructor(persistence) {
        super(persistence);
        this.POSITIONS_KEY = 'positions';
    }

    load() {
        return this.persistence.load(this.POSITIONS_KEY) || [];
    }

    save(position) {
        const positions = this.load();
        const index = positions.findIndex(p => p.id === position.id);

        if (index >= 0) {
            positions[index] = position;
        } else {
            positions.unshift(position);
        }

        this.persistence.save(this.POSITIONS_KEY, positions);
        return positions;
    }

    delete(id) {
        if (id === '*') {
            this.persistence.delete(this.POSITIONS_KEY);
            return [];
        }

        const positions = this.load();
        const newPositions = positions.filter(p => p.id !== id);
        this.persistence.save(this.POSITIONS_KEY, newPositions);
        return newPositions;
    }
}
