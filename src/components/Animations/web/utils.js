
const INITIAL_POSITION_POSITIVE = 20;
const INITIAL_POSITION_NEGATIVE = -INITIAL_POSITION_POSITIVE;

const initialPositionByAppearFrom = {
  ["left"]: INITIAL_POSITION_NEGATIVE,
  ["up"]: INITIAL_POSITION_NEGATIVE,
  ["right"]: INITIAL_POSITION_POSITIVE,
  ["down"]: INITIAL_POSITION_POSITIVE,
};

const inputRangeByAppearFrom = {
  ["left"]: [INITIAL_POSITION_NEGATIVE, 0],
  ["up"]: [INITIAL_POSITION_NEGATIVE, 0],
  ["right"]: [0, INITIAL_POSITION_POSITIVE],
  ["down"]: [0, INITIAL_POSITION_POSITIVE],
};

const outputRangeByAppearFrom = {
  ["left"]: [0, 1],
  ["up"]: [0, 1],
  ["right"]: [1, 0],
  ["down"]: [1, 0],
};

const translateByAppearFrom = {
  ["left"]: "translateX",
  ["up"]: "translateY",
  ["right"]: "translateX",
  ["down"]: "translateY",
};

export {
  inputRangeByAppearFrom,
  outputRangeByAppearFrom,
  translateByAppearFrom,
  initialPositionByAppearFrom,
};