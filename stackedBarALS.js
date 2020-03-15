

// var barData = d3.csvParse(await FileAttachment("J_ALS_D3.csv").text(), (d, i, columns) => (d3.autoType(d), d.total = d3.sum(columns, c => d[c]), d)).sort((a, b) => b.total - a.total)
// console.log("Bar data", barData);

barSeries = null;

var barData = d3.csv("J_ALS_D3.csv").then(d => stackBar(d));
barSeries = d3.stack()
    .keys(barData.columns.slice(0))
  (data)
    .map(d => (d.forEach(v => v.key = d.key), d));
console.log("barSeries", barSeries);
function stackBar(csv) {
  var width = 960;
  var height = 500;
  var myKeys = csv.columns.slice(1);
  // var myKeys = ["WithALSUnit", "WithoutALSUnit"];
  // is there a better way to grab myKeys?
  console.log("Mykeys:", myKeys);
  console.log("my csv: ", csv);

	var neighborhoods   = [...new Set(csv.map(d => d.Neighborhoods))];
  // neighborhoods = [string list of all neighborhoods in SF]
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

  // x domain is the Neighborhoods column
  x.domain(csv.map(d => d.Neighberhoods));

  var group = svg.selectAll("g.layer")
			.data(d3.stack().keys(myKeys)(csv), d => d.key);

  group.exit().remove()

	group.enter().append("g")
		.classed("layer", true)
		.attr("fill", d => colors(d.key));

    // draw bars
  var bars = svg.selectAll("g.layer").selectAll("rect")
			.data(d => d, e => e.Neighborhoods);

  bars.exit().remove();

	bars.enter().append("rect")
		.attr("width", x.bandwidth())
		.merge(bars)
	//.transition().duration(speed)
		.attr("x", d => x(d.Neighborhoods))
		.attr("y", d => y(d[1]))
		.attr("height", d => y(d[0]) - y(d[1]));

    var text = svg.selectAll(".text")
			.data(csv, d => d.Neighborhoods);

		text.exit().remove();

		text.enter().append("text")
			.attr("class", "text")
			.attr("text-anchor", "middle")
			.merge(text)
		// .transition().duration(speed)
			.attr("x", d => x(d.Neighborhoods) + x.bandwidth() / 2);
			// .attr("y", d => y(d.total) - 5)
			// .text(d => d.total)
console.log("text", text);

}

/*
 * returns a translate string for the transform attribute
 */
function translate(x, y) {
  return 'translate(' + String(x) + ',' + String(y) + ')';
}
