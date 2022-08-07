# Introduction
This project is heavily influenced by [Wavedrom Bitfield](https://github.com/wavedrom/bitfield).

This project builds a memory map image from defined JSON. 
## Install

```sh
npm i memory-map
```

## Library usage

```js
const render = require('memory-map/lib/render');
const onml = require('onml');

const reg = [
  { "name": "ROM", "startAddr": "0x0000", "endAddr": "0x0FFF", "type":4 }
];

const options = {
  hspace: 888
};

const jsonml = render(reg, options);
const html = onml.stringify(jsonml);
// <svg...>
```

## CLI Usage

```sh
npx memory-map [options] > alpha.svg
```

### options

```sh
Options:
      --version     Show version number                                [boolean]
  -i, --input       path to the source                                [required]
      --vspace      vertical space                        [number] [default: 80]
      --hspace      horizontal space                     [number] [default: 640]
      --fontsize    font size                             [number] [default: 14]
      --fontfamily  font family                          [default: "sans-serif"]
      --fontweight  font weight                              [default: "normal"]
      --hflip       horizontal flip                   [boolean] [default: false]
      --vflip       vertical flip                     [boolean] [default: false]
      --help        Show help                                          [boolean]
```

### alpha.json

```json
[
  { "name": "ROM", "startAddr": "0x0000", "endAddr": "0x0FFF", "type":4 },
  { "name": "RAM", "startAddr": "0x1000", "endAddr": "0xEFFF", "type":2 },
  { "name": "Reserved", "startAddr": "0xF000", "endAddr": "0xFFFF", "type":5 }
]
```
### alpha.svg

![Basic Map](test/alpha.svg)


### gaps.svg
If gaps exist within the map, an "Unallocated" block will be inserted. 
![Basic Map](test/gaps.svg)