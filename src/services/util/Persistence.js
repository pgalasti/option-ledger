export class Persistence {
  save(key, data) {
    throw new Error("save() must be implemented");
  }
  load(key) {
    throw new Error("load() must be implemented");
  }
  delete(key) {
    throw new Error("delete() must be implemented");
  }
}