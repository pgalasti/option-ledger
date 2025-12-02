export class Repo {

    constructor(persistence) {
        this.persistence = persistence;
    }

    save(data) {
        throw new Error("save() must be implemented");
    }
    load(critieria /*{}*/) {
        throw new Error("load() must be implemented");
    }
    delete(keys /*[]*/) {
        throw new Error("delete() must be implemented");
    }
}