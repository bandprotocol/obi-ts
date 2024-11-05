export class DecodeError extends Error {
    constructor(message) {
        super(`Decode Error: ${message}`);
        this.name = "DecodeError";
    }
}
export class SchemaError extends Error {
    constructor(message) {
        super(`Schema Error: ${message}`);
        this.name = "SchemaError";
    }
}
export class EncodeError extends Error {
    constructor(message) {
        super(`Encode Error: ${message}`);
        this.name = "EncodeError";
    }
}
