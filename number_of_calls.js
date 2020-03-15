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

let rect = plot.append('rect');
rect.attr('id', 'background');

rect.attr('x', 0);
rect.attr('y', 0);
rect.attr('width', config.plot.width);
rect.attr('height', config.plot.height);

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

d3.tsv("calls_no_duplicates.tsv").then(draw);

function draw(data) {
  console.log(data);

  let sortColumn = 'Number of Records';

  data = data.sort(function(a, b) {
    return b[sortColumn] - a[sortColumn];
  });

  let neighborhoods = ['Bayview Hunters Point', 'Bernal Heights', 'Castro/Upper Market', 'Chinatown', 'Excelsior', 'Financial District/South Beach', 'Glen Park', 'Golden Gate Park', 'Haight Ashbury', 'Hayes Valley', 'Inner Richmond', 'Inner Sunset', 'Japantown', 'Lakeshore', 'Lincoln Park', 'Lone Mountain/USF', 'Marina', 'McLaren Park', 'Mission', 'Mission Bay', 'Nob Hill', 'Noe Valley', 'North Beach', 'Oceanview/Merced/Ingleside', 'Outer Mission', 'Outer Richmond', 'Pacific Heights', 'Portola', 'Potrero Hill', 'Presidio', 'Presidio Heights', 'Russian Hill', 'Seacliff', 'South of Market', 'Sunset/Parkside', 'Tenderloin', 'Treasure Island', 'Twin Peaks', 'Visitacion Valley', 'West of Twin Peaks', 'Western Addition'];

  neighborhoods.reverse();

  let callTypes = ['Potentially Life-Threatening', 'Non Life-threatening', 'Fire', 'Alarm'];
  callTypes.reverse();

  scale.x.domain(callTypes);
  scale.y.domain(neighborhoods);

  let gx = svg.append("g");
  gx.attr("id", "x-axis");
  gx.attr("class", "axis");
  gx.attr("transform", translate(config.plot.x, config.plot.y + config.plot.height));
  gx.call(axis.x);

  let gy = svg.append("g");
  gy.attr("id", "y-axis");
  gy.attr("class", "axis");
  gy.attr("transform", translate(config.plot.x, config.plot.y));
  gy.call(axis.y);
}

function translate(x, y) {
  return "translate(" + String(x) + "," + String(y) + ")";
}
