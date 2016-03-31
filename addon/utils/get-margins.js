export default function getMargins(element) {
  let style = getComputedStyle(element);
  let result = {};

  ['top', 'right', 'bottom', 'left'].forEach(side => {
    result[side] = getPropertyValueAsNumber(style, `margin-${side}`);
  });

  return result;
}

function getPropertyValueAsNumber(style, prop) {
  let value = style.getPropertyValue(prop);
  let number = toNumber(value);

  return number;
}

function toNumber(value) {
  let match = value.match(/[\d\.]+/);
  let number = 0;

  if (match) {
    number = parseFloat(match[0]);
  }

  return number;
}
