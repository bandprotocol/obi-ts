# Band Chain Oracle Binary Interface (OBI)

<p align="center">
  <img src="https://avatars.githubusercontent.com/u/39086992?s=200&v=4" width="80"><br />
Typescript Library for encoding and decoding data according to the Oracle Binary Interface (OBI) specification.
</p>

<p align="center" width="100%">
   <a href="https://github.com/bandprotocol/bandchainjs/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
</p>

## Installation

```bash
npm install @bandprotocol/obi-ts
# or
yarn add @bandprotocol/obi-ts
```

## Usage

### Basic Example

```javascript
import { Obi } from '@bandprotocol/obi-ts'

// Create OBI object
const obi = new Obi(
  `{symbols:[string],minimum_source_count:u8}/{responses:[{symbol:string,response_code:u8,rate:u64}]}`
)

// Encode input
const input = { symbol: 'BTC', minimum_source_count: 10 }
const encodedInput = obi.encodeInput(input)

// Decode output
const output = obi.decodeOutput(encodedBytes)
console.log(output)
```

## Data Types

OBI supports the following data types:

- `string`: UTF-8 encoded string
- `bytes`: Raw bytes
- `u8`, `u16`, `u32`, `u64`, `u128`, `u256`: Unsigned integers
- `i8`, `i16`, `i32`, `i64`, `i128`, `i256`: Signed integers
- `bool`: Boolean
- `vector<T>`: Array of elements of type `T`
- `struct`: Object with named fields

## Features

- Type-safe data encoding/decoding
- Support for complex nested structures
- Compatible with Band Protocol oracle scripts
- Language-agnostic specification

## Documentation

For detailed documentation, please visit:

- [Band Chain Documentation](https://docs.bandchain.org/)
- [OBI Specification](https://docs.bandchain.org/develop/developer-guides/obi)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](https://mit-license.org/)

## Support

For support and questions, please join our [Discord community](https://discord.com/invite/3t4bsY7) or open an issue in this repository.
