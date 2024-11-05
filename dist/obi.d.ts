declare abstract class ObiBase<T = any> {
    abstract encode(value: T): Buffer;
    abstract decode(buff: Buffer): [T, Buffer];
}
export declare class ObiInteger extends ObiBase<bigint> {
    static readonly REGEX: RegExp;
    private readonly isSigned;
    private readonly sizeInBytes;
    private readonly maxValue;
    constructor(schema: string);
    encode(value: bigint): Buffer;
    decode(buff: Buffer): [bigint, Buffer];
}
export declare class ObiBool extends ObiBase<boolean> {
    static readonly REGEX: RegExp;
    private static readonly encoder;
    encode(value: boolean): Buffer;
    decode(buff: Buffer): [boolean, Buffer];
}
export declare class ObiVector<T> extends ObiBase<T[]> {
    static readonly REGEX: RegExp;
    private readonly lengthEncoder;
    private readonly itemEncoder;
    constructor(schema: string);
    encode(values: T[]): Buffer;
    decode(buff: Buffer): [T[], Buffer];
}
export declare class ObiStruct extends ObiBase<Record<string, any>> {
    static readonly REGEX: RegExp;
    private readonly fields;
    constructor(schema: string);
    private parseSchema;
    encode(value: Record<string, any>): Buffer;
    decode(buff: Buffer): [Record<string, any>, Buffer];
}
export declare class ObiString extends ObiBase<string> {
    static readonly REGEX: RegExp;
    private readonly lengthEncoder;
    encode(value: string): Buffer;
    decode(buff: Buffer): [string, Buffer];
}
export declare class ObiBytes extends ObiBase<Buffer> {
    static readonly REGEX: RegExp;
    private readonly lengthEncoder;
    encode(value: Buffer): Buffer;
    decode(buff: Buffer): [Buffer, Buffer];
}
export declare class Obi {
    private readonly inputObi;
    private readonly outputObi;
    constructor(schema: string);
    private parseSchema;
    encodeInput(value: any): Buffer;
    decodeInput(buff: Buffer): any;
    encodeOutput(value: any): Buffer;
    decodeOutput(buff: Buffer): any;
}
export declare class ObiSpec {
    static impls: (typeof ObiInteger | typeof ObiBool | typeof ObiVector | typeof ObiStruct | typeof ObiString | typeof ObiBytes)[];
    static fromSpec(schema: string): ObiBase;
}
export {};
