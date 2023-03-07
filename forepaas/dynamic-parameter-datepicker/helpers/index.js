import { createStaticRanges } from "react-date-range";
import day from "./day";
import days from "./days";
import month from "./month";
import months from "./months";

const helpers = {
  default: days,
  months,
  days,
  day,
  month,
  createStaticRanges,
  listAll: require
    .context(".", true, /\.jsx$/)
    .keys()
    .map(key => key.replace(/.\//g, "").replace(/.jsx/g, ""))
};

export default helpers;
