#!/usr/bin/env node
'use strict';

var fs = require('fs-extra');
var yargs = require('yargs');
var onml = require('onml');

var lib = require('../lib');

var argv = yargs
  .option('input', {describe: 'path to the source', alias: 'i'})
  .option('vspace', {describe: 'vertical space', type: 'number', default: 1000})
  .option('hspace', {describe: 'horizontal space', type: 'number', default: 200})
  .option('fontsize', {describe: 'font size', type: 'number', default: 14})
  .option('fontfamily', {describe: 'font family', default: 'sans-serif'})
  .option('fontweight', {describe: 'font weight', default: 'normal'})
  .option('hflip', {describe: 'horizontal flip', type: 'boolean', default: false})
  .option('vflip', {describe: 'vertical flip', type: 'boolean', default: false})
  .demandOption(['input'])
  .help()
  .argv;

var fileName;

fileName = argv.input;
fs.readJson(fileName, function (err, src) {
  var res = lib.render(src, argv);
  var svg = onml.s(res, 2);
  console.log(svg);
});

/* eslint no-console: 0 */
