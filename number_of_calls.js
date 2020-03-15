const width = 960;
const height = 500;
const margin = { top: 20, bottom: 40, left: 30, right: 30 };

const svg = d3.select("svg#vis");
svg.attr("width", width);
svg.attr("height", height);

const plot = svg.append("g").attr("id", "plot");
plot.attr("transform", translate(margin.left, margin.top));

d3.tsv("calls_no_duplicates.tsv").then(draw);

function draw(data) {
  console.log(data);
}

function translate(x, y) {
  return "translate(" + String(x) + "," + String(y) + ")";
}
