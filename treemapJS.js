const urlJSON = [
  {name : "Video Game Sales", url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"},
  {name : "Movie", url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"},
  {name : "Kickstarter Funding", url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"}
]

const idata = 0;

document.addEventListener("DOMContentLoaded", function () {
//  ---------------  GETTING DATA   ---------------
  const req = new XMLHttpRequest();
  req.open("GET", urlJSON[idata].url, true);
  req.send();

  req.onload = function () {
    const json = JSON.parse(req.responseText);
    const keys = Object.keys(json);
    let dataset = json["children"];
    
    document.getElementById("title").textContent   = urlJSON[idata].name;

    //  ---------------  GRAPH d3  ---------------
    //  ---------------  INITIALIZATION  ---------------
    const svgChartWidth = 900;
    const svgChartHeight = 400;

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("id", "svgChart")
      .attr("width", svgChartWidth)
      .attr("height", svgChartHeight);

//  ---------------  DATA   ---------------
    let dataPlatforms = dataset.map((x) =>
      x["children"]
        .map((x) => parseFloat(x["value"]))
        .reduce((a, b) => a + b, 0)
    );
    dataset = dataset.map((obj,index) => ({ ...obj, value: dataPlatforms[index] }));
    dataset.sort((a,b) => b.value - a.value);
    dataPlatforms.sort((a,b) => b - a);

    let data_rect = treemap_1d(dataPlatforms, svg, svgChartWidth, svgChartHeight, x0=0, y0=0, only_coords = true);
    
//  ---------------  COLORS   ---------------
    let colorsRect = Array(data_rect.length).fill(0)
    .map((d,i)=>"hsl("+Math.floor(((i+Math.random()*563)%data_rect.length)*360/data_rect.length)+",60%,75%)")

   for (let pp = 0; pp<data_rect.length;pp++) {
    const dataGames = dataset[pp]["children"];
    dataGames.sort((a,b)=>parseFloat(b["value"])-parseFloat(a["value"]))
      let data_values = dataGames.map(x=>parseFloat(x["value"]));
      let data_name = dataGames.map(x=>x["name"]);
      let data_category = dataset[pp]["name"];
      treemap_1d(data_values, svg, data_rect[pp][2], data_rect[pp][3],data_rect[pp][0],data_rect[pp][1],false, data_name, data_category, colorsRect_number = colorsRect[pp]);
  }

  

    //  ---------------  LEGEND  ---------------
    const legpadding = [20, 20,20,20];
    const legRectWidth = 20;
    const legRectHeight = 20;
    const legTextWidth  = 40;
    const legTextHeight  = 30;
    const legWidth = legpadding[3] + legpadding[1] + (legTextWidth +  legRectWidth + legRectWidth * 1.5) * Math.floor(dataset.length/2) ;
    const legHeight = legpadding[0]  + legTextHeight;
    let legColumn_dx = legRectWidth + legRectWidth * 1.5 + legTextWidth;
    let legRow_dy = legTextHeight;
    
    var legend = d3
    .select("body")
    .append("svg")
    .attr("id", "legend")
    .attr("class", "legend")
    .attr("width", legWidth)
    .attr("height", legHeight  + legpadding[0] + legpadding[2])
    legend.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", (d,i)=> legpadding[3] + legColumn_dx*Math.floor(i/2))
    .attr("y",(d,i)=> legpadding[0] + legRow_dy*Math.floor(i%2))
    .attr("width", legRectWidth)
    .attr("height", legRectHeight)
    .attr("fill", (d,i)=>colorsRect[i])
    .attr("class", "legend-item")
    
    legend.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .attr("x", (d,i)=> legpadding[3]+ legRectWidth * 1.5 + legColumn_dx*Math.floor(i/2))
    .attr("y",(d,i)=> legpadding[0]+ legRectHeight*0.5 + 1 + legRow_dy*Math.floor(i%2) )
    .attr("width", legTextWidth)
    .text((d,i)=> dataset[i].name)
    .attr("dominant-baseline", "middle")


// ------------  TOOLTIP  ------------
svg // tooltip appearance on mouse bar hovering
.selectAll("rect")
.on("mouseover", function () {
  var i = this.getAttribute("index");
  const xpos = this.getAttribute("x");
  var ypos = this.getAttribute("y");
  var dataName = this.getAttribute("data-name");
  var dataCategory = this.getAttribute("data-category");
  var dataValue = this.getAttribute("data-value");

  d3.select("#tooltip") // adding text to appear in the tooltip.++ add data as props.  ++  positioning tooltip
    .html("Name : <strong>"+dataName+"</strong> <br> Category : <strong>"+dataCategory+"</strong> <br> Value : <strong>"+dataValue+"</strong>")
    .style("left",xpos +"px")
    .style("top", ypos + "px")
    .attr("data-value", dataValue)
  d3.select("#tooltip").transition().duration(200).style("opacity", 0.9);
});

svg // tooltip desappearance on mouse bar leaving hovering
.selectAll("rect")
.on("mouseout", function () {
  d3.select("#tooltip").transition().duration(200).style("opacity", 0);
});

  };
});

// function treemap_1d(data, dataIds, d3elementToTarget, w0, h0, x0=0, y0=0, only_coords=true) {
function treemap_1d(data, d3elementToTarget, w0, h0, x0=0, y0=0, only_coords=true, data_name=[], data_category=[], colorsRect_number) {
  let icol = Math.random();
  let icol2 = Math.random();
  let data_rect = Array(data.length);
  let di_max = 5;
  let i = 0;
  w0 > h0 ? (direction = "xaxis") : (direction = "yaxis");
  while (i < data.length) {
    let x1 = x0;
    let y1 = y0;
    let w1 = w0;
    let h1 = h0;

    // decide which direction, based on w0 and h0
    let diff0 = w0 - h0;

    diff0 >= 0 ? (direction = "xaxis") : (direction = "yaxis");

    let prop0;
    direction == "xaxis" ? (prop0 = diff0 / w0) : (prop0 = -diff0 / h0);
    // decide how many idata to take in the next direction (just enough idata in order to change diff_w0h0's sign)

    let tot_d = data
      .filter((x, index) => index >= i)
      .reduce((x, y) => x + y, 0);
    let di = 0;
    let tot_di;
    do {
      di++;
      tot_di = data
        .filter((x, index) => (index >= i) & (index < i + di))
        .reduce((x, y) => x + y, 0);
    } while (tot_di / tot_d < 0.3 && di < di_max);
    for (let j = i; j < i + di; j++) {
      if (only_coords) {
        data_rect[j] = [
          x1,
          y1,
          direction == "xaxis"
            ? (w1 * tot_di) / tot_d
            : (w1 * data[j]) / tot_di,
          direction == "yaxis"
            ? (h1 * tot_di) / tot_d
            : (h1 * data[j]) / tot_di,
        ];
      } else {
      d3elementToTarget
        .append("rect")
        .attr("x", x1)
        .attr("y", y1)
        .attr(
          "width",
          direction == "xaxis" ? (w1 * tot_di) / tot_d : (w1 * data[j]) / tot_di
        )
        .attr(
          "height",
          direction == "yaxis" ? (h1 * tot_di) / tot_d : (h1 * data[j]) / tot_di
        )
        .attr("fill", colorsRect_number)
        // .attr("fill", "hsl("+icol*360+","+icol2*100+"%,50%)")
        .attr("class", "tile")
        .attr("stroke", "white")
        .attr("stroke-width", "1")
        .attr("data-name", data_name[j])
        .attr("data-category",data_category)
        .attr("data-value", data[j]);
      }
      if (direction == "yaxis") {
        x1 = x1 + (w1 * data[j]) / tot_di;
      } else {
        y1 = y1 + (h1 * data[j]) / tot_di;
      }
    }

    if (direction == "xaxis") {
      x0 = x0 + (w0 * tot_di) / tot_d;
      w0 = w0 - (w0 * tot_di) / tot_d;
    } else {
      y0 = y0 + (h0 * tot_di) / tot_d;
      h0 = h0 - (h0 * tot_di) / tot_d;
    }
    i = i + di;
  }
  
  return data_rect
}
