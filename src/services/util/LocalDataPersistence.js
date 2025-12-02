import { Persistence } from '../Persistence.js';

// I should actually write a class around this to make it more generic and given a flag
// to switch between local storage and API
export class LocalDataPersistence extends Persistence {
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    load(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    delete(key) {
        localStorage.removeItem(key);
    }
}