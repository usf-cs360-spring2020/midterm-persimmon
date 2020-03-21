// https://blockbuilder.org/sjengle/47c5c20a18ec29f4e2b82905bdb7fe95
let config = {
  'svg': {},
  'margin': {},
  'plot': {},
  'legend': {}
};

config.svg.width = 960;
config.svg.height = 500;

config.margin.top = 50;
config.margin.right = 10;
config.margin.bottom = 50;
config.margin.left = 160;

config.plot.x = config.margin.left;
config.plot.y = config.margin.top;
config.plot.width = config.svg.width - config.margin.left - config.margin.right;
config.plot.height = config.svg.height - config.margin.top - config.margin.bottom;

config.legend.x = 750;
config.legend.y = 10;
config.legend.width = 180;
config.legend.height = 10;

const svg = d3.select("svg#vis");
svg.attr('width', config.svg.width);
svg.attr('height', config.svg.height);

let plot = svg.append('g');
plot.attr('id', 'plot');
plot.attr('transform', translate(config.plot.x, config.plot.y));

let scale = {};

scale.x = d3.scaleBand();
scale.x.range([0, config.plot.width]);

scale.y = d3.scaleBand();
scale.y.range([config.plot.height, 0]);

scale.color = d3.scaleSequential(d3.interpolateOranges);

let axis = {};

axis.x = d3.axisBottom(scale.x);
axis.x.tickPadding(0);
axis.x.tickSize(5);
axis.x.tickSizeOuter(0);

axis.y = d3.axisLeft(scale.y);
axis.y.tickPadding(0);
axis.y.tickSize(3);
axis.y.tickSizeOuter(0);

let tooltipMap = {
  "CallType": "Call Type:",
  "Neighborhoood": "Neighborhoood:",
  "Count": "Number of Calls:"
};

d3.tsv("calls_no_duplicates.tsv", convertRow).then(draw);

function convertRow(row, index) {
  let out = {};

  for (let col in row) {
    switch (col) {
      case 'CallType':
        out[col] = row[col];
        break;

      case 'Neighborhoood':
        out[col] = row[col];
        break;

      default:
        out[col] = parseInt(row[col]);
    }
  }

  return out;
}

function draw(data) {
  let neighborhoods = d3.set(data.map(function( d ) { return d.Neighborhoood; } )).values();

  let callTypes = d3.set(data.map(function( d ) { return d.CallType; } )).values();
  callTypes.reverse();

  scale.x.domain(callTypes);
  scale.y.domain(neighborhoods);

  let gx = svg.append("g")
    .attr("id", "x-axis")
    .attr("class", "axis")
    .attr("transform", translate(config.plot.x, config.plot.y + config.plot.height))
    .call(axis.x);

  let gy = svg.append("g")
    .attr("id", "y-axis")
    .attr("class", "axis")
    .attr("transform", translate(config.plot.x, config.plot.y))
    .call(axis.y);

  let counts = data.map(d => d.Count);
  let min = d3.min(counts);
  let max = d3.max(counts);

  scale.color.domain([min, max]);

  let cells = plot.selectAll('rect')
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => scale.x(d.CallType))
    .attr("y", d => scale.y(d.Neighborhoood))
    .attr("width", d => scale.x.bandwidth())
    .attr("height", d => scale.y.bandwidth())
    .style("fill", d => scale.color(d.Count))
    .style("stroke", d => scale.color(d.Count));

  // https://observablehq.com/@sjengle/interactivity?collection=@sjengle/interactive-scatterplot
  cells.on("mouseover.highlight", function(d) {
    d3.select(this)
      .raise()
      .style("stroke", "grey")
      .style("stroke-width", 1);
  });

  cells.on("mouseout.highlight", function(d) {
    d3.select(this).style("stroke", null);
  });

  cells.on("mouseover.tooltip", function(d) {
    let div = d3.select("body").append("div");

    div.attr("id", "details");
    div.attr("class", "tooltip");

    let rows = div.append("table")
      .selectAll("tr")
      .data(Object.keys(d))
      .enter()
      .append("tr");

    rows.append("th").text(key => tooltipMap[key]);
    rows.append("td").text(key => d[key]);

    div.style("display", "inline");
  });

  cells.on("mousemove.tooltip", function(d) {
    let div = d3.select("div#details");

    let bbox = div.node().getBoundingClientRect();

    div.style("left", (d3.event.pageX + 8) + "px")
    div.style("top",  (d3.event.pageY - bbox.height - 8) + "px");
  });

  cells.on("mouseout.tooltip", function(d) {
    d3.selectAll("div#details").remove();
  });

  drawTitles();
  drawLegend();
}

// https://bl.ocks.org/mbostock/1086421
function drawLegend() {
  let legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", translate(config.legend.x, config.legend.y));

  legend.append("rect")
    .attr("width", config.legend.width)
    .attr("height", config.legend.height)
    .attr("fill", "url(#gradient)");

  let gradientScale = d3.scaleLinear()
    .domain([0, 100])
    .range(scale.color.domain());

  let gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")

  gradient.selectAll("stop")
    .data(d3.ticks(0, 100, 50))
    .enter()
    .append("stop")
    .attr("offset", d => d + "%")
    .attr("stop-color", d => scale.color(gradientScale(d)));

  let legendScale = d3.scaleLinear()
    .domain(scale.color.domain())
    .range([0, config.legend.width]);

  let legendAxis = d3.axisBottom(legendScale)
    .tickValues(scale.color.domain())
    .tickSize(5);

  legend.append("g")
    .call(legendAxis)
    .attr("transform", translate(0, config.legend.height))
}

function drawTitles() {
  let title = svg.append("text")
    .text("Number of Calls to the SF Fire Department in 2019")
    .attr("id", "title")
    .attr("x", 180)
    .attr("y", 26)
    .attr("font-size", "26px");

  let x = svg.append("text")
    .text("Call Type")
    .attr("id", "axisTitle")
    .attr("x", 500)
    .attr("y", 480)
    .attr("font-size", "16px")
    .attr("font-weight", "bold");

  let y = svg.append("text")
    .text("Neighborhoood")
    .attr("id", "axisTitle")
    .attr("x", 52)
    .attr("y", 45)
    .attr("font-size", "14px")
    .attr("font-weight", "bold");
}

function translate(x, y) {
  return 'translate(' + x + ',' + y + ')';
}
