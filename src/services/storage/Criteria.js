export class Criteria {
    fields = [];
    constructor() {
    }

    get Fields() {
        return this.fields;
    }

    addField(field) {
        this.fields.push(field);
    }
};

export class CriteriaField {
    constructor(fieldName, value, operator = 'equals') {
        this.fieldName = fieldName;
        this.value = value;
        this.operator = operator;
    }
};