"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodeError = exports.SchemaError = exports.DecodeError = void 0;
class DecodeError extends Error {
    constructor(message) {
        super(`Decode Error: ${message}`);
        this.name = "DecodeError";
    }
}
exports.DecodeError = DecodeError;
class SchemaError extends Error {
    constructor(message) {
        super(`Schema Error: ${message}`);
        this.name = "SchemaError";
    }
}
exports.SchemaError = SchemaError;
class EncodeError extends Error {
    constructor(message) {
        super(`Encode Error: ${message}`);
        this.name = "EncodeError";
    }
}
exports.EncodeError = EncodeError;
