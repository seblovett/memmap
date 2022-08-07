'use strict';

const tspan = require('tspan');

// ----- ✂ ------------------------------------------------------------

const round = Math.round;

const getSVG = (w, h) => ['svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  // TODO link ns?
  width: w,
  height: h,
  viewBox: [0, 0, w, h].join(' ')
}];

const tt = (x, y, obj) => Object.assign(
  {transform: 'translate(' + x + (y ? (',' + y) : '') + ')'},
  (typeof obj === 'object') ? obj : {}
);

const colors = { // TODO compare with WaveDrom
  2: 0,
  3: 80,
  4: 170,
  5: 45,
  6: 126,
  7: 215
};

const typeStyle = t => (colors[t] !== undefined)
  ? ';fill:hsl(' + colors[t] + ',100%,50%)'
  : '';

const norm = (obj, other) => Object.assign(
  Object
    .keys(obj)
    .reduce((prev, key) => {
      const val = Number(obj[key]);
      const valInt = isNaN(val) ? 0 : Math.round(val);
      if (valInt !== 0) { prev[key] = valInt; }
      return prev;
    }, {}),
  other
);

const text = (body, x, y, rotate) => {
  const props = {y: 6};
  if (rotate !== undefined) {
    props.transform = 'rotate(' + rotate + ')';
  }
  return ['g', tt(round(x), round(y)), ['text', props].concat(tspan.parse(body))];
};

const hline = (len, x, y) => ['line', norm({x1: x, x2: x + len, y1: y, y2: y})];
const vline = (len, x, y) => ['line', norm({x1: x, x2: x, y1: y, y2: y + len})];

const getLabel = (val, x, y, step, len, rotate) => {
  if (typeof val !== 'number') {
    return text(val, x, y, rotate);
  }
  const res = ['g', {}];
  for (let i = 0; i < len; i++) {
    res.push(text(
      (val >> i) & 1,
      x + step * (len / 2 - i - 0.5),
      y
    ));
  }
  return res;
};

const labelArr = (desc, opt) => {
  const {margin, hspace, vspace, fontsize, maxAddr, cageStart} = opt;
  const width = hspace - margin.left - margin.right - 1;
  const height = vspace - margin.top - margin.bottom;
  const step = 0;
  const blanks = ['g'];
  const addresses = ['g'];
  const names = ['g'];
  const attrs = ['g'];
  desc.map(e => {
    const end = Math.round(height * Number(e.endAddr) / maxAddr);
    const start = Math.round(height * Number(e.startAddr) / maxAddr);
    const fontstart = (e.startAddr !== undefined) ? (cageStart-((e.startAddr.length*fontsize)/2)) : 0;
    addresses.push(getLabel(
      e.startAddr,
      fontstart,
      Math.round(start+fontsize/2),
      step,
      e.bits,
      e.rotate
    ));
    addresses.push(getLabel(
      e.endAddr,
      fontstart,
      Math.round(end-fontsize/2),
      step,
      e.bits,
      e.rotate
    ));
    if (e.name !== undefined) {  
      const locy = Math.round((end+start)/2);
      const locx = Math.round((width-cageStart)/2+cageStart);
      names.push(getLabel(
        e.name,
        locx,
        locy,
        step,
        e.bits,
        e.rotate
      ));
    }

    if ((e.name === undefined) || (e.type !== undefined)) {
      blanks.push(['rect', norm({
        x: cageStart,
        y: start,
        width: (width-cageStart),
        height: end - start
      }, {
        style: 'fill-opacity:0.1' + typeStyle(e.type)
      })]);
    }
    // if (e.attr !== undefined) {
    //   attrs.push(getAttr(e, opt, step, lsbm, msbm));
    // }
  });
  return ['g', blanks, addresses, names, attrs];
};

const cage = (desc, opt) => {
  const {hspace, vspace, maxAddr, margin, cageStart} = opt;
  const width = Math.round((hspace - margin.left - margin.right - 1));
  const height = vspace - margin.top - margin.bottom;
  const res = ['g',
    {
      stroke: 'black',
      'stroke-width': 1,
      'stroke-linecap': 'round'
    }
  ];
  
  res.push(hline(width - cageStart, cageStart, 0));
  res.push(vline(height, cageStart, 0));
  res.push(vline(height, width, 0));
  desc.forEach(element => {
    const hl = Math.round(height * Number(element.endAddr) / maxAddr);
    res.push(hline(width-cageStart, cageStart, hl));
  });
  return res;
};

const lane = (desc, opt) => {
  const {index, vspace, margin, hflip, lanes, compact} = opt;
  const height = vspace - margin.top - margin.bottom;

  let tx = margin.left;
  const idx = hflip ? index : (lanes - index - 1);
  let ty = round(idx * vspace + margin.top);
  if (compact) {
    ty = round(idx * height + margin.top);
  }
  const res = ['g',
    tt(tx, ty),
    cage(desc, opt),
    labelArr(desc, opt)
  ];

  return res;
};

// Maximum number of attributes across all fields
const getMaxAttributes = desc =>
  desc.reduce((prev, field) =>
    Math.max(
      prev,
      (field.attr === undefined)
        ? 0
        : Array.isArray(field.attr)
          ? field.attr.length
          : 1
    ),
  0);

const getMaxAddr = desc =>
  desc.reduce((prev, field) => ((Number(field.endAddr) > prev) ? Number(field.endAddr) : prev), 0);

const isIntGTorDefault = opt => row => {
  const [key, min, def] = row;
  const val = Math.round(opt[key]);
  opt[key] = (typeof val === 'number' && val >= min) ? val : def;
};

// eslint-disable-next-line complexity
const render = (desc, opt) => {
  opt = (typeof opt === 'object') ? opt : {};

  [ // key         min default
    // ['vspace', 20, 60],
    ['hspace', 40, 800],
    ['lanes', 1, 1],
    ['bits', 1, undefined],
    ['fontsize', 6, 14]
  ].map(isIntGTorDefault(opt));
  const maxAttributes = getMaxAttributes(desc);

  opt.vspace = opt.vspace || ((maxAttributes + 4) * opt.fontsize);

  opt.fontfamily = opt.fontfamily || 'sans-serif';
  opt.fontweight = opt.fontweight || 'normal';
  opt.hflip = opt.hflip || false;
  opt.margin = opt.margin || {};

  if (opt.maxAddr === undefined) {
    opt.maxAddr = getMaxAddr(desc);
  }
  const {hspace, vspace, margin, fontsize, label} = opt;
  opt.cageStart = (opt.maxAddr.toString(16).length * fontsize)+20;
  
  if (margin.right === undefined) {
    if (label && label.right !== undefined) {
      margin.right = round(.1 * hspace);
    } else {
      margin.right = 4;
    }
  }

  if (margin.left === undefined) {
    if (label && label.left !== undefined) {
      margin.left = round(.1 * hspace);
    } else {
      margin.left = 4; // margin.right;
    }
  }
  if (margin.top === undefined) {
    margin.top = 1.5 * fontsize;
    if (margin.bottom === undefined) {
      margin.bottom = fontsize * (maxAttributes) + 4;
    }
  } else {
    if (margin.bottom === undefined) {
      margin.bottom = 4;
    }
  }

  let width = hspace;
  let height = vspace;

  const res = ['g',
    tt(0.5, 0.5, {
      'text-anchor': 'middle',
      'font-size': opt.fontsize,
      'font-family': opt.fontfamily,
      'font-weight': opt.fontweight
    })
  ];

  res.push(lane(desc, opt));
  return getSVG(width, height).concat([res]);
};

// ----- ✂ ------------------------------------------------------------

module.exports = render;
