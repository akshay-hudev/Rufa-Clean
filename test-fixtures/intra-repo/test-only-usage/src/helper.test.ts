import { computeThing } from "./helper";

const actual = computeThing(3);
if (actual !== 10) {
  throw new Error(`Expected computeThing(3) to equal 10, received ${actual}`);
}
