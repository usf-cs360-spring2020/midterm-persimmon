let config = {
  'svg': {},
  'margin': {},
  'plot': {}
};

config.svg.width = 960;
config.svg.height = 500;

config.margin.top = 10;
config.margin.right = 10;
config.margin.bottom = 20;
config.margin.left = 140;

config.plot.x = config.margin.left;
config.plot.y = config.margin.top;
config.plot.width = config.svg.width - config.margin.left - config.margin.right;
config.plot.height = config.svg.height - config.margin.top - config.margin.bottom;

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

axis.y = d3.axisLeft(scale.y);
axis.y.tickPadding(0);

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
}

function translate(x, y) {
  return 'translate(' + x + ',' + y + ')';
}
