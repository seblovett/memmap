'use strict';

function rerender (React) {
  const $ = React.createElement;

  return function MemMap () {
    return $('g', {});
  };
}

module.exports = rerender;
