export const easeIn = x => Math.pow(x, 2);

export const easeOut = x => 1 - easeIn(1 - x);

export const easeInOut = function(x) {
  if (x < 0.5) { return easeIn(x * 2) / 2; } else { return 0.5 + (easeOut((x - 0.5) * 2) / 2); }
};