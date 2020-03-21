// begin setup

// functions
let formatter = d3.format(".2f");

function classParser(d, pattern, replacement){
  new_string = d.replace(pattern, "");
  return new_string.replace(/ /g, '');
}
let hoodPattern = /\//g
let hoodReplace = "-"

function translate(x, y) {
  return 'translate(' + String(x) + ',' + String(y) + ')';
}

function midpoint(range) {
  return range[0] + (range[1] - range[0]) / 2.0;
}


// bar/line setup
const barMargin = {
  top: 85,
  bottom: 150,
  left: 50,
  right: 30
};

// plot
let barSvg = d3.select("body").select("svg#bar");
const barPlot = barSvg.append("g").attr("id", "barPlot")
  .attr("transform", translate(barMargin.left, barMargin.top));


// set scales
let barBounds = {width: 800, height: 550};
let barPlotWidth = barBounds.width - barMargin.right - barMargin.left;
let barPlotHeight = barBounds.height - barMargin.top - barMargin.bottom;

const barScales = {
  x: d3.scaleBand().range([750 - barMargin.left - barMargin.right, 0]),
  y: d3.scaleLinear().domain([0,20]).range([barPlotHeight, 0]).nice(),
};

const yAxis = d3.axisLeft(barScales.y)
  .ticks(5, 's').tickSizeOuter(0);

let yGroup = barPlot.append("g")
  .attr('class', 'y-axis axis')
  .call(yAxis);

const barGridAxis = d3.axisLeft(barScales.y)
  .tickSize(-barPlotWidth - 15).tickFormat('').ticks(0);

let barGridGroup = barPlot.append("g")
  .attr("id", "grid-axis")
  .attr('class', 'axis')
  .call(barGridAxis);


// heatmap setup
const heatMargin = {
  top: 120,
  bottom: 10,
  left: 160,
  right: 10
};

// plot
let heatSvg = d3.select("body").select("svg#heatmap");
const heatPlot = heatSvg.append("g").attr("id", "plot")
  .attr("transform", translate(heatMargin.left, heatMargin.top));

// set scales
let heatBounds = {width: 800, height: 650}
let heatPlotWidth = heatBounds.width - heatMargin.right - heatMargin.left;
let heatPlotHeight = heatBounds.height - heatMargin.top - heatMargin.bottom;

const heatScales = {
  x: d3.scaleBand().range([750 - heatMargin.left - heatMargin.right, 0]),
  y: d3.scaleBand().range([800 - heatMargin.top - heatMargin.bottom, 0]),
  color: d3.scaleSequential(d3.interpolateOranges).domain([0, 20])
};

// heatmap tooltip
let heattip = d3.tip().attr('class', 'd3-tip')
  .direction('e').offset([0,5])
  .html(function(d) {
    content = `
        <table style="margin-top: 2.5px;">
                <tr><td>Neighborhood: </td><td style="text-align: left">` + d.neighborhoods + `</td></tr>
                <tr><td>Call Type Group: </td><td style="text-align: left">` + d.callType + `</td></tr>
                <tr><td>` + d.onTime.key + `: </td><td style="text-align: left"> ` + formatter(d.onTime.value) + `</td></tr>
                <tr><td>` + d.recToDis.key + `: </td><td style="text-align: left"> ` + formatter(d.recToDis.value) + `</td></tr>
                <tr><td>` + d.disToRes.key + `: </td><td style="text-align: left"> ` + formatter(d.disToRes.value) + `</td></tr>
                <tr><td>` + d.resToOn.key + `: </td><td style="text-align: left"> ` + formatter(d.resToOn.value) + `</td></tr>
        </table>`;
    return content;
  });

// heatSvg.call(heattip);
// end setup

// load data and then charts
// d3.csv("data/avg_wait_times_by_call_type_neighborhood.csv", parseData).then(sortByNeighborhood).then(drawCharts);
d3.csv("data/avg_wait_times_by_call_type_neighborhood.csv",
  (d, i, columns) => (d3.autoType(d))).then((data) => { return data.sort((a, b) => b['"Neighborhoods"'] - a['"Neighborhoods"']); })
  .then((data) => { return d3.nest().key(function(d) { return d['Call Type Group']; }).entries(data) ;})
  .then(groupData)
  .then(drawCharts);


function groupData(data) {
  let new_data = data.map(_groupData);
  // console.log("new_data", new_data);
  function _groupData(callGroup,i) {
    let new_d = {key: callGroup.key, values: d3.stack().keys(Object.keys(callGroup.values[0]).slice(-4))(callGroup.values).map(d => (d.forEach(v => v.key = d.key), d))};
    // console.log("new_d", new_d);
    return new_d;
  }
  // console.log("new_data", new_data);
  return new_data;
}

function stackedBars(series) {
  // stacked barchart inspired by: https://observablehq.com/@d3/stacked-bar-chart
  // console.log(series.filter());
  // console.log(series[0].values[3].map((d) => d.data['Avg On Scene Wait Time']));
  // console.log(d3.max(series[0].values[0].map((d) => d.data['Avg On Scene Wait Time'])));
  // console.log("series", series);
  let data = series.find(function(d) { return d.key == 'Alarm' });
  // console.log("data", data);
  // console.log("series[0].values[0]", series[0].values[0]);
  let x = d3.scaleBand()
    .domain(series[0].values[0].map((d) => d.data['Neighborhoods']))
    .range([barMargin.left, barBounds.width - barMargin.right])
    .padding(0.1);

  let y = d3.scaleLinear()
    .domain([0, d3.max(data.values, d => d3.max(d, d => d[1]))])
    .rangeRound([barBounds.height - barMargin.bottom, barMargin.top]);

  let color = d3.scaleOrdinal()
    .domain(data.values.map(d => d.key))
    .range(d3.schemeSpectral[data.values.length])
    .unknown("#ccc")

  let formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en");

  let xAxis = g => g
    .attr("transform", `translate(0,${barBounds.height - barMargin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
      .attr("y", 0)
      .attr("x", -5)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

  let yAxis = g => g
    .attr("transform", `translate(${barMargin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"));

  const stackedsvg = d3.select("#barcharts").append("svg")
    .attr("width", barBounds.width)
    .attr("height", barBounds.height);

  stackedsvg.append("g")
    .selectAll("g")
    .data(data.values)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", (d, i) => x(d.data['Neighborhoods']))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
    .append("title")
      .text(d => `${d.data['Neighborhoods']} ${d.key}: ${formatValue(d.data[d.key])}`);

  stackedsvg.append("g")
      .call(xAxis);

  stackedsvg.append("g")
      .call(yAxis);

}



function processData(data) {

};

// axis
function drawbarTitles() {

  let yMiddle = barMargin.top + midpoint(barScales.y.range());

  let xTitle = barSvg.append('text')
    .text('Neighborhoods')
      .attr('class', 'axis-title')
      .attr('id', 'axis-title')
      .attr('x', midpoint(barScales.x.range())-10)
      .attr('y', 85)
      .attr('dy', 400)
      .style('text-anchor', 'center');

  let yTitleGroup = barSvg.append('g');
  yTitleGroup.attr('transform', translate(4, yMiddle));

  let yTitle = yTitleGroup.append('text')
    .attr('class', 'axis-title')
    .attr('id', 'axis-title')
    .text('Minutes')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', 15)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)');
}

// legend
function drawbarLegend(){

  let legendGroup = barSvg.append('g').attr('id', 'legend');
  legendGroup.attr('transform', translate(barMargin.left - 10, 5));

  let legendbox = legendGroup.append('rect')
    .attr('x', 0)
    .attr('y', 20)
    .attr('width', 140)
    .attr('height', 75)
    .style('fill', 'none');

  legendGroup.append('text')
      .attr('class', 'legend-title')
      .attr('id', 'legend-title')
      .attr('x', 30)
      .attr('y', 62)
      .style('font-size', 14)
      .text('Avg. Received Call to Dispatch Wait Time');
}


// draw charts
function drawCharts(data) {
  // setup
  stackedBars(data);
  drawHeatmap(data);
}


function drawbarCharts(data) {
  // axis
  let neighborhoods = data.map(row => row.neighborhoods);
  barScales.x.domain(neighborhoods);

  let xAxis = d3.axisBottom(barScales.x).tickPadding(0).tickSizeOuter(0);
  let xGroup = barPlot.append("g").attr('class', 'xgroup');

  xGroup.attr('transform', translate(0, barPlotHeight));
  xGroup.call(xAxis)
    .selectAll("text")
      .attr("y", 4)
      .attr("x", -5)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");


  drawbarTitles();
  drawbarLegend();

  const barGroup = barPlot.append('g').attr('id', 'bar');

  // group data by call type group
  let nest = d3.nest()
    .key(function(d) { return d['Call Type Group']; })
    .entries(data);

  // array of call type group data
  let callTypes = nest.map(function(d) { return d.key; });
  let currentCallType = 0;

  // // create location dropdown menu
  let callTypeMenu = d3.select("#locationDropdown");
  callTypeMenu
    .append("select")
    .attr("id", "locationMenu")
    .selectAll("option")
    .data(callTypes).enter()
    .append("option")
      .attr("value", function(d, i) { return i; })
      .text(function(d) { return d; });

  // run update when dropdown selection changes
  callTypeMenu.on("change", function() {
    // find which location was selected from the dropdown
    let selectedCallType = d3.select(this)
      .select("select")
      .property("value");
      currentCallType = selectedCallType;
    // run update function with selected location
    _updateBarChart(callTypes[currentCallType]);
  });

  // filter the data to return object of location of interest
  let selectedCallType = nest.find(function(d) { return d.key == 'Alarm' });
  let rects = barGroup.selectAll('.bars')
    .data(selectedCallType.values).enter()
    .append('g')
      .attr("class", function(d) { return classParser(d.neighborhoods, hoodPattern, hoodReplace);})
    .append('rect')
      .attr("x", d => (barScales.x(d.neighborhoods) + (barScales.x.bandwidth() / 2)))
      .attr("y", d => barScales.y(d.recToDis.value))
      .attr("width", barScales.x.bandwidth() - 2)
      .attr("height", d => barPlotHeight - barScales.y(d.recToDis.value))
      .style("fill", d => heatScales.color(d.recToDis.value));

  // rect.on('mouseover', handleMouseOver)
  //   .on('mouseout', handleMouseOut);

  function _updateBarChart(callType) {
    // filter data to return object of location of interest
    let selectedCallType = nest.find(function(d) { return d.key == callType; });

    rects.data(selectedCallType.values)
      .transition().delay(function(d, i) { return i*40; })
        .attr("x", d => (barScales.x(d.neighborhoods) + (barScales.x.bandwidth() / 2)))
        .attr("y", d => barScales.y(d.recToDis.value))
        .attr("width", barScales.x.bandwidth() - 2)
        .attr("height", d => barPlotHeight - barScales.y(d.recToDis.value))
        .style("fill", "#9BC7E4")
        .style('opacity', 0.9)
      .transition().duration(30)
        .style("fill", "#FDAF6E")
        .style('opacity', 0.9);

    rects.exit().remove();
  }

  d3.selectAll(".nav").on("click", function() {
    if(d3.select(this).classed("left")) {
      if(currentCallType == 0) {
        currentCallType = callTypes.length-1;
      } else {
        currentCallType--;
      }
    } else if(d3.select(this).classed("right")) {
      if(currentCallType == callTypes.length-1) {
        currentCallType = 0;
      } else {
        currentCallType++;
      }
    }
    d3.select("#locationMenu").property("value", currentCallType);
    _updateBarChart(callTypes[currentCallType]);
  });

}
// end bar/line chart section

// axis labels
function drawHeatTitles() {

  const xMiddle = heatMargin.left + midpoint(heatScales.x.range());
  const yMiddle = heatMargin.top + midpoint(heatScales.y.range());

  const xTitleGroup = heatSvg.append('g');
  const xTitle = xTitleGroup.append('text')
    .attr('class', 'axis-title')
    .attr("id", "axis-title")
    .text('Call Type Groups');

  xTitle.attr('x', xMiddle);
  xTitle.attr('y', 0 + heatMargin.top - 18);
  xTitle.attr('dy', -4);
  xTitle.attr('text-anchor', 'middle');

  const yTitleGroup = heatSvg.append('g');
  yTitleGroup.attr('transform', translate(4, yMiddle));

  const yTitle = yTitleGroup.append('text')
    .attr('class', 'axis-title')
    .attr("id", "axis-title")
    .text('Neighborhoods')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', -350)
    .attr('dx', 0);
}

// legend
function drawHeatLegend(){

  const legendWidth = 250;
  const legendHeight = 25;

  const colorGroup = heatSvg.append('g').attr('id', 'color-legend')
    .attr('transform', translate(18, heatMargin.top - 110));

  const title = colorGroup.append('text')
    .attr('class', 'legend-title')
    .attr('id', 'legend-title')
    .text('Avg On Scene Wait Time (minutes)')
    .attr('dy', 12);

  const colorDomain = [d3.min(heatScales.color.domain()), d3.max(heatScales.color.domain())];

  heatScales.percent = d3.scaleLinear()
    .range([0, 100])
    .domain(colorDomain);

  const defs = heatSvg.append('defs')
    .append('linearGradient')
    .attr('id', 'gradient')
    .selectAll('stop')
    .data(heatScales.color.ticks())
    .enter()
    .append('stop')
    .attr('offset', d => heatScales.percent(d) + '%')
    .attr('stop-color', d => heatScales.color(d));

  const colorbox = colorGroup.append('rect')
    .attr('x', 0)
    .attr('y', 12 + 6)
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('fill', 'url(#gradient)');

  heatScales.legend = d3.scaleLinear()
    .domain(colorDomain)
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(heatScales.legend)
    .tickValues(heatScales.color.domain())
    .tickSize(legendHeight)
    .tickSizeOuter(0);

  const axisGroup = colorGroup.append('g')
    .attr('id', 'color-axis')
    .attr('transform', translate(0, 12 + 6))
    .call(legendAxis);
}


// draw heatmap
function drawHeatmap(series) {

  let data = series.find(function(d) { return d.key == 'Alarm' });
  console.log(series);

  let x = d3.scaleBand()
    .domain(series[0].values[0].map((d) => d.data['Neighborhoods']))
    .range([heatMargin.left, heatBounds.width - heatMargin.right])
    .padding(0.1);

  let y = d3.scaleLinear()
    .domain([0, d3.max(data.values, d => d3.max(d, d => d[1]))])
    .rangeRound([heatBounds.height - heatMargin.bottom, heatMargin.top]);

  let color = d3.scaleSequential(d3.interpolateOranges)
    .domain([0, 20]);

  let formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en");

  let xAxis = g => g
    .attr("transform", `translate(0,${heatBounds.height - heatMargin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
      .attr("y", 0)
      .attr("x", -5)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

  let yAxis = g => g
    .attr("transform", `translate(${barMargin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"));

  const heatsvg = d3.select("#heatmap").append("svg")
    .attr("width", heatBounds.width)
    .attr("height", heatBounds.height);

  heatsvg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .selectAll("rect")
    .data()
    .join('rect')
      .attr('class', 'heatcells bordered')
      .attr("x", d => heatScales.x(d.callType))
      .attr("y", d => heatScales.y(d.neighborhoods))
      .attr("width", heatScales.x.bandwidth())
      .attr("height", heatScales.y.bandwidth())
      .style("fill", d => heatScales.color(d.onTime.value))
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut);






  // axis
  // let callTypeGroups = data.map(row => row.callType);
  // heatScales.x.domain(callTypeGroups);

  // let neighborhoods = data.map(row => row.neighborhoods);
  // heatScales.y.domain(neighborhoods);

  // let xAxis = d3.axisTop(heatScales.x).tickPadding(0).tickSizeOuter(0);
  // let yAxis = d3.axisRight(heatScales.y).tickPadding(0).tickSizeOuter(0);

  // let xGroup = heatPlot.append("g")
  //   .attr('class', 'x-axis axis')
  //   .attr('transform', translate(0, heatMargin.top - 120))
  //   .call(xAxis);

  // let yGroup = heatPlot.append("g")
  //   .attr('class', 'y-axis axis')
  //   .attr('transform', translate(-160, 0))
  //   .call(yAxis);

  // drawHeatTitles();
  // drawHeatLegend();
  // // d3.select(this).classed("cell-hover",true);

  // heatSvg.call(heattip);

  // let cells = heatPlot.selectAll('.heatcells')
  //   .data(data, function(d) { return d; });

  // cells.append('title');

  // cells.enter()
  //   .append('g')
  //     .attr("class", d => classParser(d.neighborhoods, hoodPattern, hoodReplace))
  //   .append("rect")
  //     .attr('class', 'heatcells bordered')
  //     .attr("x", d => heatScales.x(d.callType))
  //     .attr("y", d => heatScales.y(d.neighborhoods))
  //     .attr("width", heatScales.x.bandwidth())
  //     .attr("height", heatScales.y.bandwidth())
  //     .style("fill", d => heatScales.color(d.onTime.value))
  //   .on('mouseover', handleMouseOver)
  //   .on('mouseout', handleMouseOut);

  // cells.transition().duration(1000)
  //   .style('fill', d => heatScales.color(d.onTime.value));

  // cells.select('title')
  //   .text(d => d.neighborhoods);

  // cells.exit().remove();
}


// Create Event Handlers for mouse
function handleMouseOver(d, i) {  // Add interactivity
  heattip.show(d);

  // Use D3 to select element, change color and size
  d3.selectAll('.' + classParser(d.neighborhoods, hoodPattern, hoodReplace))
    .selectAll('rect')
    .transition().duration(5)
      .style('stroke', 'blue');

}

// Create Event Handlers for mouse
function handleMouseOut(d, i) {  // Add interactivity
  heattip.hide(d);
  // Use D3 to select element, change color and size
  d3.selectAll('.' + classParser(d.neighborhoods, hoodPattern, hoodReplace))
    .selectAll('rect')
    .transition().duration(5)
      .style('stroke', '#E6E6E6');
}


function sortByNeighborhood(data) {
  return data.sort(function(a, b) {
    return d3.descending(a.neighborhoods, b.neighborhoods)
  });
}

// parse data for charts
function parseData(row){

  let values = {};
  values.recToDis = {key: 'Avg Received to Dispatch Wait Time', value: parseFloat(row["Avg Received to Dispatch Wait Time"])};
  values.disToRes = {key: 'Avg Dispatch to Response Wait Time', value: parseFloat(row["Avg Dispatch to Response Wait Time"])};
  values.resToOn = {key: 'Avg Response to On Scene Wait Time', value: parseFloat(row["Avg Response to On Scene Wait Time"])};
  values.onTime = {key: 'Avg On Scene Wait Time', value: parseFloat(row["Avg On Scene Wait Time"])};
  values.neighborhoods = row["Neighborhoods"];
  values.callType = row["Call Type Group"];

  return values;
}
