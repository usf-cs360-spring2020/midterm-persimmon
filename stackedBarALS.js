

// var barData = d3.dataParse(await FileAttachment("J_ALS_D3.data").text(), (d, i, columns) => (d3.autoType(d), d.total = d3.sum(columns, c => d[c]), d)).sort((a, b) => b.total - a.total)
// console.log("Bar data", barData);

barSeries = null;

var barData = d3.csv("J_ALS_D3.csv", convertRow).then(stackBar);
// barSeries = d3.stack()
//     .keys(barData.columns.slice(0))
//   (data)
//     .map(d => (d.forEach(v => v.key = d.key), d));



function convertRow(row) {
 let out = {};

 for (let col in row) {
   switch (col) {
     case "WithALSUnit":
      out[col] = parseInt(row[col]);

     case "WithoutALSUnit":
        out[col] = parseInt(row[col]);
    default:
      out[col] = row[col];
   }
 } // for loop
 return out;
} // convertRow
console.log("barSeries", barSeries);

// inspiration: https://bl.ocks.org/LemoNode/5a64865728c6059ed89388b5f83d6b67
function stackBar(data) {
  var width = 960;
  var height = 500;
  var myKeys = data.columns.slice(1);
  // var myKeys = ["WithALSUnit", "WithoutALSUnit"];
  // is there a better way to grab myKeys?
  console.log("Mykeys:", myKeys);
  console.log("my data: ", data);
  //console.log("data")

	//var neighborhoods   = [...new Set(data.map(d => d.Neighborhoods))];
  let neighborhoods = data.map(row => row["Neighborhoods"]);
  console.log("neighborhoods: ", neighborhoods);
  let numWithALS = data.map(row => row["WithALSUnit"]);
  let numWithoutALS = data.map(row => row["WithoutALSUnit"]);
  console.log("numWithALS", numWithALS);
  console.log("numWithoutALS", numWithoutALS);

  // neighborhoods = [string list of all neighborhoods in SF]
  var svg = d3.select("svg#stackedBar"),
    margin = {top: 35, left: 35, bottom: 5, right: 5},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
  svg.append("g")
    .attr("transform", translate(margin.left, margin.top));
  // svg.attr("width", "30");
console.log("height", height);
console.log("width", width);

  // the x axis: Neighborhoods
  var x = d3.scaleBand()
		//.range([margin.left, width - margin.right])
    .rangeRound([0, width])
    .padding(0.1);

  var y = d3.scaleLinear()
	//.rangeRound([height - margin.bottom, margin.top]);
  .rangeRound([height, 0]);

  // xAxis
  var xAxis = svg.append("g")
		.attr("transform", translate(0, height - margin.bottom))
		.attr("class", "x-axis");
    // .orient("bottom");

  // Y Axis
  var yAxis = svg.append("g")
		.attr("transform", translate(margin.left, 0))
		.attr("class", "y-axis");
  console.log("Are we okay?");

  var colors = d3.scaleOrdinal()
		.range(["red", "yellow"])
		.domain(myKeys);
  // so red = true, yellow = false

  var g = svg.append("g")

    .attr("transform", translate(margin.left, margin.top));

  g.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", translate(0, height-margin.bottom))
  .call(d3.axisBottom(x));

  g.append("g")
     .attr("class", "axis axis--y")
     .call(d3.axisLeft(y).ticks(10, "%"))
   .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "0.71em")
     .attr("text-anchor", "end")
     .text("Number Of Cases");
 g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.Neighborhoods); }) // x(d.Neighborboods)
        .attr("y", function(d) { return y(d.WithALSUnit); })//y(d.WithALSUnit)
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.WithALSUnit); });

  //y.domain([0, d3.max(data, d => d3.sum(myKeys, k => +d[k]))]).nice();
  x.domain(data.map(function(d) { return d.Neighborboods; }));
  x.domain(neighborhoods);
  y.domain([0, d3.max(data, function(d) { return d.WithALSUnit; })]);
  // x domain is the Neighborhoods column
  //x.domain(data.map(d => d.Neighborhoods));

// Special thanks to Aditiya's help
  svg.append("g")
    .attr("class", "axis")
    .data(data)
    //.attr("transform", "translate(80, 0)") // what the heck?
    .style("stroke", "black") // check this out
    .call(d3.axisBottom(x).ticks(null, "s")) // what is this?
    .attr("transform", "rotate(0)");
    // because s = "string"?
  svg.append("g")
    .attr("class", "axis")
    .data(data)
    //.attr("transform", "translate(80, 420)")
    .style("stroke", "black")
    //.call(d3.axisLeft(y).ticks(16, "f").tickFormat(d3.formatPrefix(".0", 1e5)));
    .call(d3.axisLeft(y).ticks(16, "f"))
    .attr("transform", "rotate(-30)");


  var group = svg.selectAll("g.layer")
			.data(d3.stack().keys(myKeys)(data), d => d.key);
  // console.log(d3.stack().keys(myKeys)(data));

  group.exit().remove()

	group.enter().append("g")
		.classed("layer", true)
		.attr("fill", d => colors(d.key));

    // draw bars
  var bars = svg.selectAll("g.layer").selectAll("rect")
			.data(d => d, e => e.Neighborhoods);
console.log("bars", bars);
  bars.exit().remove();

	bars.enter().append("rect")
		.attr("width", x.bandwidth())
		.merge(bars)
	//.transition().duration(speed)
		.attr("x", d => x(d.Neighborhoods))
		.attr("y", d => y(d[1]))
		.attr("height", d => y(d[0]) - y(d[1]));

    var text = svg.selectAll(".text")
			.data(data, d => d.Neighborhoods);

		text.exit().remove();

		text.enter().append("text")
			.attr("class", "text")
			.attr("text-anchor", "middle")
			.merge(text);
		// .transition().duration(speed)
			//.attr("x", d => x(d.Neighborhoods) + x.bandwidth() / 2);
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
