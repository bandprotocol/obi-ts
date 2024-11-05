"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObiSpec = exports.Obi = exports.ObiBytes = exports.ObiString = exports.ObiStruct = exports.ObiVector = exports.ObiBool = exports.ObiInteger = void 0;
const errors_1 = require("./errors");
class ObiBase {
}
class ObiInteger extends ObiBase {
    static REGEX = /^(u|i)(8|16|32|64|128|256)$/;
    isSigned;
    sizeInBytes;
    maxValue;
    constructor(schema) {
        super();
        this.isSigned = schema[0] === "i";
        this.sizeInBytes = parseInt(schema.slice(1)) / 8;
        this.maxValue = BigInt(2) ** BigInt(this.sizeInBytes * 8) - BigInt(1);
    }
    encode(value) {
        const newValue = BigInt(value);
        if (newValue > this.maxValue) {
            throw new errors_1.EncodeError(`Value ${value} exceeds maximum size for ${this.sizeInBytes * 8} bits`);
        }
        const bytes = new Array(this.sizeInBytes);
        let tempValue = newValue;
        for (let i = this.sizeInBytes - 1; i >= 0; i--) {
            bytes[i] = Number(tempValue & BigInt(0xff));
            tempValue >>= BigInt(8);
        }
        return Buffer.from(bytes);
    }
    decode(buff) {
        if (buff.length < this.sizeInBytes) {
            throw new errors_1.DecodeError(`Not enough bytes. Expected ${this.sizeInBytes}, got ${buff.length}`);
        }
        let value = BigInt(0);
        for (let i = 0; i < this.sizeInBytes; i++) {
            value = (value << BigInt(8)) | BigInt(buff[i]);
        }
        return [value, buff.slice(this.sizeInBytes)];
    }
}
exports.ObiInteger = ObiInteger;
class ObiBool extends ObiBase {
    static REGEX = /^bool$/;
    static encoder = new ObiInteger("u8");
    encode(value) {
        return ObiBool.encoder.encode(value ? BigInt(1) : BigInt(0));
    }
    decode(buff) {
        const [value, remaining] = ObiBool.encoder.decode(buff);
        if (value !== BigInt(0) && value !== BigInt(1)) {
            throw new errors_1.DecodeError(`Boolean value must be 0 or 1, got ${value}`);
        }
        return [value === BigInt(1), remaining];
    }
}
exports.ObiBool = ObiBool;
class ObiVector extends ObiBase {
    static REGEX = /^\[.*\]$/;
    lengthEncoder = new ObiInteger("u32");
    itemEncoder;
    constructor(schema) {
        super();
        this.itemEncoder = ObiSpec.fromSpec(schema.slice(1, -1));
    }
    encode(values) {
        const lengthBuff = this.lengthEncoder.encode(BigInt(values.length));
        const itemBuffers = values.map((item) => this.itemEncoder.encode(item));
        return Buffer.concat([lengthBuff, ...itemBuffers]);
    }
    decode(buff) {
        const [length, remaining] = this.lengthEncoder.decode(buff);
        const result = [];
        let current = remaining;
        for (let i = 0; i < Number(length); i++) {
            const [item, next] = this.itemEncoder.decode(current);
            result.push(item);
            current = next;
        }
        return [result, current];
    }
}
exports.ObiVector = ObiVector;
class ObiStruct extends ObiBase {
    static REGEX = /^{.*}$/;
    fields;
    constructor(schema) {
        super();
        this.fields = this.parseSchema(schema);
    }
    parseSchema(schema) {
        const fields = [];
        let curlyCount = 0;
        let currentKey = "";
        let currentValue = "";
        let isParsingKey = true;
        try {
            for (const char of schema.slice(1)) {
                if (char === "{") {
                    curlyCount++;
                }
                else if (char === "}") {
                    if (curlyCount === 0) {
                        if (currentKey && currentValue) {
                            fields.push({
                                key: currentKey.trim(),
                                encoder: ObiSpec.fromSpec(currentValue.trim()),
                            });
                        }
                        break;
                    }
                    curlyCount--;
                }
                else if (curlyCount === 0) {
                    if (char === ":") {
                        isParsingKey = false;
                        continue;
                    }
                    else if (char === ",") {
                        if (!currentKey || !currentValue) {
                            throw new errors_1.SchemaError("Invalid struct field format");
                        }
                        fields.push({
                            key: currentKey.trim(),
                            encoder: ObiSpec.fromSpec(currentValue.trim()),
                        });
                        currentKey = "";
                        currentValue = "";
                        isParsingKey = true;
                        continue;
                    }
                }
                if (isParsingKey) {
                    currentKey += char;
                }
                else {
                    currentValue += char;
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new errors_1.SchemaError(`Failed to parse struct schema: ${error.message}`);
            }
            throw new errors_1.SchemaError("Failed to parse struct schema: Unknown error");
        }
        if (fields.length === 0) {
            throw new errors_1.SchemaError("Struct must have at least one field");
        }
        return fields;
    }
    encode(value) {
        try {
            const buffers = this.fields.map(({ key, encoder }) => {
                if (!(key in value)) {
                    throw new errors_1.EncodeError(`Missing field "${key}" in struct`);
                }
                return encoder.encode(value[key]);
            });
            return Buffer.concat(buffers);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new errors_1.EncodeError(`Failed to encode struct: ${error.message}`);
            }
            throw new errors_1.EncodeError("Failed to encode struct: Unknown error");
        }
    }
    decode(buff) {
        try {
            const result = {};
            let remaining = buff;
            for (const { key, encoder } of this.fields) {
                const [fieldValue, nextRemaining] = encoder.decode(remaining);
                result[key] = fieldValue;
                remaining = nextRemaining;
            }
            return [result, remaining];
        }
        catch (error) {
            if (error instanceof Error) {
                throw new errors_1.DecodeError(`Failed to decode struct: ${error.message}`);
            }
            throw new errors_1.DecodeError("Failed to decode struct: Unknown error");
        }
    }
}
exports.ObiStruct = ObiStruct;
class ObiString extends ObiBase {
    static REGEX = /^string$/;
    lengthEncoder = new ObiInteger("u32");
    encode(value) {
        const stringBuffer = Buffer.from(value);
        return Buffer.concat([
            this.lengthEncoder.encode(BigInt(stringBuffer.length)),
            stringBuffer,
        ]);
    }
    decode(buff) {
        const [length, remaining] = this.lengthEncoder.decode(buff);
        const stringLength = Number(length);
        if (remaining.length < stringLength) {
            throw new errors_1.DecodeError(`Not enough bytes to decode string. Expected ${stringLength}, got ${remaining.length}`);
        }
        const value = remaining.slice(0, stringLength).toString("utf8");
        return [value, remaining.slice(stringLength)];
    }
}
exports.ObiString = ObiString;
class ObiBytes extends ObiBase {
    static REGEX = /^bytes$/;
    lengthEncoder = new ObiInteger("u32");
    encode(value) {
        return Buffer.concat([
            this.lengthEncoder.encode(BigInt(value.length)),
            value,
        ]);
    }
    decode(buff) {
        const [length, remaining] = this.lengthEncoder.decode(buff);
        const bytesLength = Number(length);
        if (remaining.length < bytesLength) {
            throw new errors_1.DecodeError(`Not enough bytes to decode bytes. Expected ${bytesLength}, got ${remaining.length}`);
        }
        return [
            Buffer.from(remaining.subarray(0, bytesLength)),
            Buffer.from(remaining.subarray(bytesLength)),
        ];
    }
}
exports.ObiBytes = ObiBytes;
class Obi {
    inputObi;
    outputObi;
    constructor(schema) {
        const [inputSchema, outputSchema] = this.parseSchema(schema);
        this.inputObi = ObiSpec.fromSpec(inputSchema);
        this.outputObi = ObiSpec.fromSpec(outputSchema);
    }
    parseSchema(schema) {
        const normalizedSchema = schema.replace(/\s+/g, "");
        const [input, output] = normalizedSchema.split("/");
        if (!input || !output) {
            throw new errors_1.SchemaError('Schema must be in the format "input/output"');
        }
        return [input, output];
    }
    encodeInput(value) {
        try {
            return this.inputObi.encode(value);
        }
        catch (error) {
            throw new errors_1.EncodeError(`Failed to encode input: ${error.message}`);
        }
    }
    decodeInput(buff) {
        const [value, remaining] = this.inputObi.decode(buff);
        if (remaining.length !== 0) {
            throw new errors_1.DecodeError("Extra bytes found after decoding input");
        }
        return value;
    }
    encodeOutput(value) {
        try {
            return this.outputObi.encode(value);
        }
        catch (error) {
            throw new errors_1.EncodeError(`Failed to encode output: ${error.message}`);
        }
    }
    decodeOutput(buff) {
        const [value, remaining] = this.outputObi.decode(buff);
        if (remaining.length !== 0) {
            throw new errors_1.DecodeError("Extra bytes found after decoding output");
        }
        return value;
    }
}
exports.Obi = Obi;
class ObiSpec {
    static impls = [
        ObiInteger,
        ObiBool,
        ObiVector,
        ObiStruct,
        ObiString,
        ObiBytes,
    ];
    static fromSpec(schema) {
        for (let impl of ObiSpec.impls) {
            if (schema.match(impl.REGEX)) {
                return new impl(schema);
            }
        }
        throw new errors_1.SchemaError(`No schema matched: <${schema}>`);
    }
}
exports.ObiSpec = ObiSpec;
