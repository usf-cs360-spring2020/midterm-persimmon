var width = 960;
var height = 500;
d3.csv("J_ALS_D3.csv").then(d => stackBar(d));

function stackBar(csv) {
  // var myKeys = csv.columns.slice(1);
  var myKeys = ["True", "False"];
  // is there a better way to grab myKeys?
  // myKeys = ["ALS Unit", "Frequency"]. Length = 2
  console.log("Mykeys:", myKeys);
  console.log("my csv: ", csv);

	var neighborhoods   = [...new Set(csv.map(d => d.Neighborhoods))];

  var svg = d3.select("svg#stackedBar"),
  margin = {top: 35, left: 35, bottom: 5, right: 5},
  width = width - margin.left - margin.right,
  height = height - margin.top - margin.bottom;

  // the x axis: Neighborhoods
  var x = d3.scaleBand()
		.range([margin.left, width - margin.right])
		.padding(0.1);

  var y = d3.scaleLinear()
	.rangeRound([height - margin.bottom, margin.top]);

  // xAxis
  var xAxis = svg.append("g")
		.attr("transform", translate(0, height - margin.bottom))
		.attr("class", "x-axis");

  // Y Axis
  var yAxis = svg.append("g")
		.attr("transform", translate(margin.left, 0))
		.attr("class", "y-axis");
  console.log("Are we okay?");

  var colors = d3.scaleOrdinal()
		.range(["red", "yellow"])
		.domain(myKeys);
  // so red = true, yellow = false

  y.domain([0, d3.max(csv, d => d3.sum(myKeys, k => +d[k]))]).nice();
}

/*
 * returns a translate string for the transform attribute
 */
function translate(x, y) {
  return 'translate(' + String(x) + ',' + String(y) + ')';
}
