// keep note of div elements
// group data single line graph (1)
// brush zoom in,  in detailed graph (2)
// change in rate comparision for different counties (done)

// ratio which is the highest over counties use that as maximum scale
// common script file for all the conties loop over county names and csv for each county
//test for toggle button (done)
//scale bend, scale linear,
// map of sc, heat map of sc
//zipcod eans census level map visualization

// const toggleButton = document.getElementById("toggleButton");
// const mapButton = document.getElementById("mapButton");
// let isToggled = true;
// let mapButtonClicked = false;

// toggleButton.addEventListener("click", () => {
//   if (!mapButtonClicked) {
//     isToggled = !isToggled;

//     if (isToggled) {
//       toggleButton.style.backgroundColor = "rgb(172, 147, 212)";
//       toggleButton.textContent = "TOT";
//       uploadAbsolute();
//     } else {
//       toggleButton.style.backgroundColor = "rgb(95, 102, 160)";
//       toggleButton.textContent = "AVG";
//       uploadAveraged();
//     }
//   }
// });
const toggleDropdown = document.createElement("select");
toggleDropdown.classList.add("map-button");
const mapButton = document.getElementById("mapButton");
let mapButtonClicked = false;

const option1 = document.createElement("option");
option1.classList.add("custom-option");
option1.value = "TOTAL";
option1.textContent = "TOTAL";

const option2 = document.createElement("option");
option2.classList.add("custom-option");
option2.value = "AVG";
option2.textContent = "AVG";

const option3 = document.createElement("option");
option3.classList.add("custom-option");
option3.value = "CASES/7";
option3.textContent = "CASES/7";

toggleDropdown.appendChild(option1);
toggleDropdown.appendChild(option2);
toggleDropdown.appendChild(option3);

toggleButton.appendChild(toggleDropdown);

// Event listener for the dropdown
toggleDropdown.addEventListener("change", () => {
  const selectedOption = toggleDropdown.value;
  if (selectedOption === "TOTAL") {
    uploadAbsolute();
  } else if (selectedOption === "AVG") {
    uploadAveraged();
  } else if (selectedOption === "CASES/7") {
    uploadPositiveCasesPer7Days();
  }
});

mapButton.addEventListener("click", () => {
  if (!mapButtonClicked) {
    mapButtonClicked = true;
    loadMapVisualizationData();
  } else {
    mapButtonClicked = false;

    const svg = document.getElementById("map");
    if (svg) {
      svg.parentNode.removeChild(svg);
    }
    uploadAbsolute();
  }
});

counties = [
  "abbeville",
  "aiken",
  "allendale",
  "anderson",
  "bamberg",
  "barnwell",
  "beaufort",
  "berkeley",
  "calhoun",
  "charleston",
  "cherokee",
  "chester",
  "chesterfield",
  "clarendon",
  "colleton",
  "darlington",
  "dillon",
  "dorchester",
  "edgefield",
  "fairfield",
  "florence",
  "georgetown",
  "greenville",
  "greenwood",
  "hampton",
  "horry",
  "jasper",
  "kershaw",
  "lancaster",
  "laurens",
  "lee",
  "lexington",
  "marion",
  "marlboro",
  "mcCormick",
  "newberry",
  "oconee",
  "orangeburg",
  "pickens",
  "richland",
  "saluda",
  "spartanburg",
  "sumter",
  "union",
  "williamsburg",
  "york",
];

population = [
  24527, 170872, 8688, 202558, 14066, 20866, 192122, 227907, 14553, 411406,
  57300, 32244, 45650, 33745, 37677, 66618, 30479, 162809, 27260, 22347, 138293,
  62680, 523542, 70811, 19222, 354081, 30073, 66551, 98012, 67493, 16828,
  298750, 30657, 26118, 9463, 38440, 79546, 86175, 126884, 415759, 20473,
  319785, 106721, 27316, 30368, 280979,
];

const countyPOPCsvMapping = [];

for (let i = 0; i < Math.min(counties.length); i++) {
  const mapping = {
    county: counties[i],
    countyPop: population[i],
  };
  countyPOPCsvMapping.push(mapping);
}

loadData();

function loadData() {
  // Define colors and ranges
  const colors = ["#2E1E30", "#331427", "#A20D32", "#FF073A"];
  const quartiles = [0, 1281, 5453, 31254];
  var colorMap = d3.scaleLinear().domain(quartiles).range(colors);

  countyPOPCsvMapping.forEach(({ county }) => {
    const cont = d3.select(".container");
    const div = cont.append("div").attr("class", "quadrant");
    const svg = div.append("svg").attr("id", county);
  });

  countyPOPCsvMapping.forEach(({ county }) => {
    d3.csv("/Counties daily cases/" + county + "_case_daily.csv").then(
      function (data) {
        const chosenColumn = 0; // Change this to the column you want to display on the y-axis

        var margin = { top: 5, right: 0, bottom: 1, left: 0 },
          width = 205 - margin.left - margin.right,
          height = 120 - margin.top - margin.bottom;

        // Parse the date
        var parseDate = d3.timeParse("%Y-%m-%d");
        data.forEach(function (d) {
          d.date = parseDate(d.date);
          d[chosenColumn] = +d[chosenColumn];
        });

        const aggregate = Math.round(
          data.reduce((total, d) => total + d[chosenColumn], 0)
        );

        console.log(`Aggregate value for ${chosenColumn}th day:`, aggregate);

        const maxYValue = d3.max(data, (d) => d[chosenColumn]);
        console.log(Math.round(maxYValue));
        const maxDataPoint = data.find((d) => d[chosenColumn] === maxYValue);
        console.log("Max Data Point:", maxDataPoint);

        const x = d3
          .scaleTime()
          .domain(d3.extent(data, (d) => d.date))
          .range([0, width]);

        //   const y = d3
        //     .scaleLinear()
        //     .domain([0, d3.max(data, (d) => d[chosenColumn])])
        //     .nice()
        //     .range([height, 0]);

        const fixedMaxYValue = 2500;
        const y = d3
          .scaleLinear()
          .domain([0, fixedMaxYValue])
          .nice()
          .range([height, 0]);

        const line = d3
          .line()
          .defined((d) => !isNaN(d[chosenColumn]))
          .x((d) => x(d.date))
          .y((d) => y(d[chosenColumn]));

        svgElement = "#" + county;
        countyName = county.toUpperCase();

        const svg = d3
          .select("#" + county)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        svg
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        svg
          .append("rect")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .style("fill", colorMap(aggregate));

        // svg.append("g")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom(x));

        // svg.append("g")
        //     .call(d3.axisLeft(y));

        svg
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line)
          .style("opacity", 0)
          .transition()
          .duration(2000)
          .style("opacity", 1);

        svg
          .append("a")
          .attr("xlink:href", "./county-vis.html?county=" + county)
          .append("text")
          .attr("x", width / 2 - 55)
          .attr("y", 18)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "WHITE")
          .style("font-family", "Josefin Sans")
          .text(countyName)
          .style("cursor", "pointer")
          .on("click", () => handleSVGclick(county));

        ///// adding a circle for highest number of cases

        svg
          .append("circle")
          .attr("cx", x(maxDataPoint.date)) // x-coordinate
          .attr("cy", y(maxYValue)) // y-coordinate
          .attr("r", 2)
          .attr("fill", "#777BFF");

        svg
          .append("text")
          .attr("class", "pointlabel")
          .attr("x", x(maxDataPoint.date) + 8)
          .attr("y", y(maxYValue) - 4) // Adjust the position to be above the circle
          .attr("text-anchor", "middle")
          .text(Math.round(maxYValue))
          .style("font-size", "10px")
          .style("fill", "white");

        /////// adding total number of cases for county for that day

        svg
          .append("text")
          .attr("class", "totnumb")
          .attr("x", width / 2 - 60)
          .attr("y", 35) // Adjust the y-coordinate to position it below the existing text
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "white")
          .style("font-family", "Josefin Sans")
          .text(`(${aggregate})`)
          .attr("title", "Total cases");
      }
    );
  });
}

function uploadAbsolute() {
  const colors = ["#2E1E30", "#331427", "#A20D32", "#FF073A"];
  const quartiles = [0, 1281, 5453, 31254];
  var colorMap = d3.scaleLinear().domain(quartiles).range(colors);

  var margin = { top: 5, right: 0, bottom: 1, left: 0},
    width = 205 - margin.left - margin.right,
    height = 120 - margin.top - margin.bottom;

  // console.log("Here");

  countyPOPCsvMapping.forEach(({ county }) => {
    d3.csv("/Counties daily cases/" + county + "_case_daily.csv").then(
      function (data) {
        const chosenColumn = 0;
        // Parse the date
        var parseDate = d3.timeParse("%Y-%m-%d");
        data.forEach(function (d) {
          d.date = parseDate(d.date);
          d[chosenColumn] = +d[chosenColumn];
        });

        const aggregate = Math.round(
          data.reduce((total, d) => total + d[chosenColumn], 0)
        );

        d3.select("#" + county)
          .select("rect")
          .transition()
          .duration(2000)
          .style("fill", colorMap(aggregate));

        const maxYValue = d3.max(data, (d) => d[chosenColumn]);

        /////data point corresponding to the maximum value
        const maxDataPoint = data.find((d) => d[chosenColumn] === maxYValue);
        // console.log("Max Data Point:", maxDataPoint);

        const x = d3
          .scaleTime()
          .domain(d3.extent(data, (d) => d.date))
          .range([0, width]);

        const fixedMaxYValue = 2500;
        const y = d3
          .scaleLinear()
          .domain([0, fixedMaxYValue])
          .nice()
          .range([height, 0]);

        const line = d3
          .line()
          .defined((d) => !isNaN(d[chosenColumn]))
          .x((d) => x(d.date))
          .y((d) => y(d[chosenColumn]));

        d3.select("#" + county)
          .select("path")
          .transition()
          .duration(2000)
          .attr("d", line);

        d3.select("#" + county)
          .select("circle")
          .transition()
          .duration(2000)
          .attr("cy", y(maxYValue)); // y-coordinate

        d3.select("#" + county)
          .select(".pointlabel")
          .transition()
          .duration(2000)
          .attr("y", y(maxYValue) - 4) // Adjust the position to be above the circle
          .text(Math.round(maxYValue));

        d3.select("#" + county)
          .select(".totnumb")
          .attr("x", width / 2 - 60)
          .attr("y", 35) // Adjust the y-coordinate to position it below the existing text
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "white")
          .style("font-family", "Josefin Sans")
          .text(aggregate)
          .attr("title", "Total cases");
      }
    );
  });
}

function uploadAveraged() {
  const colors = ["#2E1E30", "#331427", "#A20D32", "#FF073A"];
  const quartiles = [0.0515, 0.094730895, 0.18873049, 0.33771];
  var colorMap = d3.scaleLinear().domain(quartiles).range(colors);

  var margin = { top: 5, right: 0, bottom: 1, left: 0 },
    width = 205 - margin.left - margin.right,
    height = 120 - margin.top - margin.bottom;

  // console.log("Here")

  countyPOPCsvMapping.forEach(({ county, countyPop }) => {
    d3.csv("/Counties daily cases/" + county + "_case_daily.csv").then(
      function (data) {
        const chosenColumn = 0; // Change this to the column you want to display on the y-axis

        // Parse the date
        var parseDate = d3.timeParse("%Y-%m-%d");
        data.forEach(function (d) {
          d.date = parseDate(d.date);
          d[chosenColumn] = +d[chosenColumn];
        });

        const aggregate = Math.round(
          data.reduce((total, d) => total + d[chosenColumn], 0)
        );

        const ratio = aggregate / countyPop;

        d3.select("#" + county)
          .select("rect")
          .transition()
          .duration(2000)
          .style("fill", colorMap(ratio));

        const maxYValue = d3.max(data, (d) => d[chosenColumn] / countyPop);
        console.log(maxYValue, countyPop);

        /////data point corresponding to the maximum value
        const maxDataPoint = data.find((d) => d[chosenColumn] === maxYValue);
        // console.log("Max Data Point:", maxDataPoint);

        const x = d3
          .scaleTime()
          .domain(d3.extent(data, (d) => d.date))
          .range([0, width]);

        const fixedMaxYValue = 0.006;
        const y = d3
          .scaleLinear()
          .domain([0, fixedMaxYValue])
          .nice()
          .range([height, 0]);

        const line = d3
          .line()
          .defined((d) => !isNaN(d[chosenColumn]))
          .x((d) => x(d.date))
          .y((d) => y(d[chosenColumn] / countyPop));

        d3.select("#" + county)
          .select("path")
          .transition()
          .duration(2000)
          .attr("d", line);

        d3.select("#" + county)
          .select("circle")
          .transition()
          .duration(2000)
          .attr("cy", y(maxYValue)); // y-coordinate

        d3.select("#" + county)
          .select(".pointlabel")
          .transition()
          .duration(2000)
          .attr("y", y(maxYValue) - 4) // Adjust the position to be above the circle
          .text(maxYValue.toFixed(3));

        d3.select("#" + county)
          .select(".totnumb")
          .attr("x", width / 2 - 60)
          .attr("y", 35) // Adjust the y-coordinate to position it below the existing text
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "white")
          .style("font-family", "Josefin Sans")
          .text(ratio.toFixed(3))
          .attr("title", "Total cases");
      }
    );
  });
}

function uploadPositiveCasesPer7Days() {
  // percent_test_results_reported_positive_last_7_days

  const colors = ["#2E1E30", "#331427", "#A20D32", "#FF073A"];
  const quartiles = [0.0515, 0.094730895, 0.18873049, 0.33771];
  var colorMap = d3.scaleLinear().domain(quartiles).range(colors);

  var margin = { top: 5, right: 0, bottom: 1, left: 0 },
    width = 205 - margin.left - margin.right,
    height = 120 - margin.top - margin.bottom;

  console.log("Here");

  countyPOPCsvMapping.forEach(({ county, countyPop }) => {
    currentCounty = county[0].toUpperCase() + county.slice(1);
    console.log(currentCounty);

    d3.csv("/RealDataCounties/" + currentCounty + "covid19.csv").then(function (
      data
    ) {
      const chosenColumn = "percent_test_results_reported_positive_last_7_days";

      // Parse the date
      var parseDate = d3.timeParse("%Y-%m-%d");
      data.forEach(function (d) {
        d.date = parseDate(d.date);
        d[chosenColumn] = +d[chosenColumn];
      });

      const aggregate = Math.round(
        data.reduce((total, d) => total + d[chosenColumn], 0)
      );

      const ratio = aggregate / countyPop;

      d3.select("#" + county)
        .select("rect")
        .transition()
        .duration(2000)
        .style("fill", colorMap(ratio));

      const maxYValue = d3.max(data, (d) => d[chosenColumn]);
      console.log(currentCounty, maxYValue);

      /////data point corresponding to the maximum value
      const maxDataPoint = data.find((d) => d[chosenColumn] === maxYValue);
      console.log("Max Data Point:", maxDataPoint);

      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.date))
        .range([0, width]);

      const fixedMaxYValue = 70;
      const y = d3
        .scaleLinear()
        .domain([0, fixedMaxYValue])
        .nice()
        .range([height, 0]);

      const line = d3
        .line()
        .defined((d) => !isNaN(d[chosenColumn]))
        .x((d) => x(d.date))
        .y((d) => y(d[chosenColumn]));

      d3.select("#" + county)
        .select("path")
        .transition()
        .duration(2000)
        .attr("d", line(data));

      d3.select("#" + county)
        .select("circle")
        .transition()
        .duration(2000)
        .attr("cy", y(maxYValue)); // y-coordinate

      d3.select("#" + county)
        .select(".pointlabel")
        .transition()
        .duration(2000)
        .attr("y", y(maxYValue) - 4) // Adjust the position to be above the circle
        .text(maxYValue.toFixed(3));

      d3.select("#" + county)
        .select(".totnumb")
        .attr("x", width / 2 - 60)
        .attr("y", 35) // Adjust the y-coordinate to position it below the existing text
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "white")
        .style("font-family", "Josefin Sans")
        .text(ratio.toFixed(3))
        .attr("title", "Total cases");
    });
  });
}

function loadMapVisualizationData() {
  const cont = d3.select(".container");
  const div = cont.append("div").attr("class", "map");
  const svg = div.append("svg").attr("id", "map");
  const legendSvg = div.append("svg").attr("class", "legend");
  let mapData;

  d3.json("/map integration/SCmap.geojson").then(function (SCmapdata) {
    mapData = SCmapdata;

    const colors = ["#2E1E30", "#331427", "#A20D32", "#FF073A"];
    const quartiles = [0, 1281, 5453, 31254];
    var colorMap = d3.scaleLinear().domain(quartiles).range(colors);

    var margin = { top: 0, right: 0, bottom: 10, left: 20 },
      width = 700 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

    const promises = [];

    ////// Iterates over each feature in the GeoJSON data
    mapData.features.forEach((feature) => {
      const county = feature.properties.NAME;

      const countyData = countyPOPCsvMapping.find(
        (data) => data.county === county
      );

      if (countyData) {
        const promise = d3
          .csv("/Counties daily cases/" + county + "_case_daily.csv")
          .then(function (data) {
            const chosenColumn = 0;
            var parseDate = d3.timeParse("%Y-%m-%d");
            data.forEach(function (d) {
              d.date = parseDate(d.date);
              d[chosenColumn] = +d[chosenColumn];
            });

            const aggregate = Math.round(
              data.reduce((total, d) => total + d[chosenColumn], 0)
            );

            feature.properties.aggregate = aggregate;
          });
        promises.push(promise);
      } else {
        feature.properties.aggregate = null;
      }
    });

    Promise.all(promises).then(() => {
      var projection = d3
        .geoEquirectangular()
        .fitSize([height, width], mapData);

      var pathGenerator = d3.geoPath(projection);

      svg
        .selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("fill", (d) => colorMap(d.properties.aggregate))
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .style("stroke", "dashed");

        svg
          .selectAll("text")
          .data(mapData.features)
          .enter()
          .append("text")
          .text((d) => d.properties.NAME.toUpperCase())
          .attr("x", (d) => pathGenerator.centroid(d)[0])
          .attr("y", (d) => pathGenerator.centroid(d)[1])
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .style("fill", "white")
          .style("font-size", "8px");

          
          
          var legendMargin = { top: 0, right: 0, bottom: 0, left: 100 };
          
          // Legend for state map
          const legendWidth = 150;
          const legendHeight = 20;
          const legend = legendSvg
          .append("g")
          .attr(
            "transform",
            `translate(${legendMargin.left}, ${legendMargin.top})`
          );
          
          const legendScale = d3
          .scaleLinear()
          .domain([0, quartiles.length - 1])
          .range([0, legendWidth]);
          
          const legendAxis = d3
          .axisBottom(legendScale)
          .tickSize(10)
          .tickValues(quartiles)
          .tickFormat((d, i) =>
            i === quartiles.length - 1 ? "≥" + d : d3.format(".0f")(d)
        );
        
        legend
        .append("g")
        .attr("class", "legend-axis")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);
        
        const legendColorScale = d3
        .scaleOrdinal()
        .domain(quartiles)
        .range(colors);
        
        legend
        .selectAll(".legend-color")
        .data(quartiles.slice(0, -1))
        .enter()
        .append("rect")
        .attr("class", "legend-color")
        .attr("x", (d, i) => i * (legendWidth / (quartiles.length - 1)))
        .attr("y", 0)
        .attr("width", legendWidth / (quartiles.length - 1))
        .attr("height", legendHeight)
        .attr("fill", (d, i) => legendColorScale(d))
        .attr("opacity", 1); // Initialize opacity to 1
        
        // Add legend text
        legend
        .selectAll(".legend-text")
        .data(quartiles.slice(0, -1))
          .enter()
          .append("text")
          .attr("class", "legend-text")
          .attr(
            "x",
            (d, i) =>
              i * (legendWidth / (quartiles.length - 1)) +
              legendWidth / (quartiles.length - 1) / 2
            )
            .attr("y", legendHeight + 15)
            .attr("text-anchor", "middle")
            .text((d, i) =>
              i === quartiles.length - 2
            ? d3.format(".0f")(d) + "+"
            : d3.format(".0f")(d)
          )
          .style("fill", "white")
          .style("size", "8px");
          
          // Function to toggle visibility of paths based on legend interaction
          function togglePathVisibility(legendIndex) {
            svg.selectAll("path").style("visibility", (d) => {
              const aggregate = d.properties.aggregate;
              return aggregate >= quartiles[legendIndex] &&
              aggregate < quartiles[legendIndex + 1]
              ? "visible"
              : "hidden";
            });
          }
          
          const legendTiles = legend.selectAll(".legend-color").nodes();
          const paths = svg.selectAll("path").nodes();
          legend.selectAll(".legend-color").attr("data-index", (_, i) => i);
          
          svg.selectAll("path").attr("data-index", (_, i) => i);
          legend.selectAll(".legend-color").on("click", function () {
            const currentTile = d3.select(this);
            const index = currentTile.attr("data-index");
            
            // Toggle opacity of legend item
            const currentOpacity = currentTile.attr("opacity");
            const newOpacity = currentOpacity === "0" ? "1" : "0";
            currentTile.attr("opacity", newOpacity);
            
            // Toggle visibility of corresponding SVG paths
            svg.selectAll("path").each(function (d) {
              const aggregate = d.properties.aggregate;
              const legendIndex = parseInt(index);
              
              if (
                aggregate >= quartiles[legendIndex] &&
                aggregate < quartiles[legendIndex + 1]
              ) {
                const correspondingPath = d3.select(this);
                correspondingPath.style(
                  "visibility",
                  newOpacity === "1" ? "visible" : "hidden"
                );
              }
            });
          });
          svg.selectAll("path").on("click", function (event, d) {
            if (d && d.properties && d.properties.NAME.toUpperCase()) {
              const countyName = d.properties.NAME.toUpperCase();
              loadCountyMapVisualization(countyName);
            } else {
              console.error("County name not found.");
            }

        // console.log(mapData);
      });
    });
  });
}

// function loadMapVisualizationData() {
//   const cont = d3.select(".container");
//   const div = cont.append("div").attr("class", "map");
//   const svg = div.append("svg").attr("id", "map");
//   const legendSvg = div.append("svg").attr("class", "legend");
//   let mapData;

//   d3.json("/map integration/SCmap.geojson").then(function (SCmapdata) {
//     mapData = SCmapdata;
//     console.log(mapData);
//     const colors = ["#2E1E30", "#331427", "#A20D32", "#FF073A"];
//     const quartiles = [0, 1281, 5453, 31254];
//     var colorMap = d3.scaleLinear().domain(quartiles).range(colors);

//     var margin = { top: 1, right: 0, bottom: 20, left: 10 },
//       width = 700 - margin.left - margin.right,
//       height = 700 - margin.top - margin.bottom;

//     const promises = [];

//     ////// Iterates over each feature in the GeoJSON data
//     mapData.features.forEach((feature) => {
//       const county = feature.properties.NAME;

//       const countyData = countyPOPCsvMapping.find(
//         (data) => data.county === county
//       );

//       if (countyData) {
//         const promise = d3
//           .csv("/Counties daily cases/" + county + "_case_daily.csv")
//           .then(function (data) {
//             const chosenColumn = 0;
//             var parseDate = d3.timeParse("%Y-%m-%d");
//             data.forEach(function (d) {
//               d.date = parseDate(d.date);
//               d[chosenColumn] = +d[chosenColumn];
//             });

//             const aggregate = Math.round(
//               data.reduce((total, d) => total + d[chosenColumn], 0)
//             );

//             feature.properties.aggregate = aggregate;
//           });
//         promises.push(promise);
//       } else {
//         feature.properties.aggregate = null;
//       }
//     });

//     Promise.all(promises).then(() => {
//       var projection = d3
//         .geoEquirectangular()
//         .fitSize([height, width], mapData);

//       var pathGenerator = d3.geoPath(projection);

//       svg
//         .selectAll("path")
//         .data(mapData.features)
//         .enter()
//         .append("path")
//         .attr("d", pathGenerator)
//         .attr("fill", (d) => colorMap(d.properties.aggregate))
//         .attr("stroke", "white")
//         .attr("stroke-width", 0.5)
//         .style("stroke", "dashed")
//         .on("click", function (event, d) {
//           if (d && d.properties && d.properties.NAME.toUpperCase()) {
//             const countyName = d.properties.NAME.toUpperCase();
//             loadCountyMapVisualization(countyName);
//           } else {
//             console.error("County name not found.");
//           }
//         });

//       svg
//         .selectAll("text")
//         .data(mapData.features)
//         .enter()
//         .append("text")
//         .attr("x", (d) => pathGenerator.centroid(d)[0])
//         .attr("y", (d) => pathGenerator.centroid(d)[1])
//         .attr("text-anchor", "middle")
//         .attr("dy", ".35em")
//         .text((d) => d.properties.NAME.toUpperCase())
//         .style("fill", "white")
//         .style("font-size", "8px");

//       var legendMargin = { top: 0, right: 0, bottom: 0, left: 100 };

//       // Legend
//       const legendWidth = 150;
//       const legendHeight = 20;
//       const legend = legendSvg
//         .append("g")
//         .attr(
//           "transform",
//           `translate(${legendMargin.left}, ${legendMargin.top})`
//         );

//       const legendScale = d3
//         .scaleLinear()
//         .domain([0, quartiles.length - 1])
//         .range([0, legendWidth]);

//       const legendAxis = d3
//         .axisBottom(legendScale)
//         .tickSize(10)
//         .tickValues(quartiles)
//         .tickFormat((d, i) =>
//           i === quartiles.length - 1 ? "≥" + d : d3.format(".0f")(d)
//         );

//       legend
//         .append("g")
//         .attr("class", "legend-axis")
//         .attr("transform", `translate(0, ${legendHeight})`)
//         .call(legendAxis);

//       const legendColorScale = d3
//         .scaleOrdinal()
//         .domain(quartiles)
//         .range(colors);

//       legend
//         .selectAll(".legend-color")
//         .data(quartiles.slice(0, -1))
//         .enter()
//         .append("rect")
//         .attr("class", "legend-color")
//         .attr("x", (d, i) => i * (legendWidth / (quartiles.length - 1)))
//         .attr("y", 0)
//         .attr("width", legendWidth / (quartiles.length - 1))
//         .attr("height", legendHeight)
//         .attr("fill", (d, i) => legendColorScale(d))
//         .attr("opacity", 1); // Initialize opacity to 1

//       // Add legend text
//       legend
//         .selectAll(".legend-text")
//         .data(quartiles.slice(0, -1))
//         .enter()
//         .append("text")
//         .attr("class", "legend-text")
//         .attr(
//           "x",
//           (d, i) =>
//             i * (legendWidth / (quartiles.length - 1)) +
//             legendWidth / (quartiles.length - 1) / 2
//         )
//         .attr("y", legendHeight + 15)
//         .attr("text-anchor", "middle")
//         .text((d, i) =>
//           i === quartiles.length - 2
//             ? d3.format(".0f")(d) + "+"
//             : d3.format(".0f")(d)
//         )
//         .style("fill", "white")
//         .style("size", "8px");
//     });
//   });
// }

function loadCountyMapVisualization(selectedCounty) {
  const cont = d3.select(".container");
  const div = cont.append("div").attr("class", "map");
  const svg = div.append("svg").attr("id", "map");
  // const legendSvg = div.append("svg").attr("class", "legend");
  let mapData;

  d3.json("./map integration/countySCgeo.json").then(function (countyMapData) {
    mapData = countyMapData;

    const colors = ["#2E1E30", "#331427", "#A20D32", "#FF073A"];
    const quartiles = [0, 1281, 5453, 31254];
    var colorMap = d3.scaleLinear().domain(quartiles).range(colors);

    var margin = { top: 0, right: 0, bottom: 10, left: 20 },
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    console.log(mapData);
    const promises = [];
    const filteredCountyFeatures = mapData.features.filter(
      (feature) => feature.properties.COUNTY === selectedCounty
    );
    console.log(
      "Filtered features for",
      selectedCounty,
      ":",
      filteredCountyFeatures
    );

    // console.log("req data", filteredCountyFeatures);

    ////// Iterates over each feature in the GeoJSON data
    mapData.features.forEach((feature) => {
      const county = feature.properties.ZCTA5CE10;

      const countyData = countyPOPCsvMapping.find(
        (data) => data.county === county
      );

      if (countyData) {
        const promise = d3
          .csv("/Counties daily cases/" + county + "_case_daily.csv")
          .then(function (data) {
            const chosenColumn = 0;
            var parseDate = d3.timeParse("%Y-%m-%d");
            data.forEach(function (d) {
              d.date = parseDate(d.date);
              d[chosenColumn] = +d[chosenColumn];
            });

            const aggregate = Math.round(
              data.reduce((total, d) => total + d[chosenColumn], 0)
            );

            feature.properties.aggregate = aggregate;
          });
        promises.push(promise);
      } else {
        feature.properties.aggregate = null;
      }
    });

    const projection = d3
      .geoEquirectangular()
      .fitSize([height, width], {
        type: "FeatureCollection",
        features: filteredCountyFeatures,
      });
    const pathGenerator = d3.geoPath(projection);

    svg
      .selectAll("path")
      .data(filteredCountyFeatures)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", (d) => colorMap(d.properties.aggregate))
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .style("stroke", "dashed");

    svg
      .selectAll("text")
      .data(filteredCountyFeatures)
      .enter()
      .append("text")
      .attr("x", (d) => pathGenerator.centroid(d)[0])
      .attr("y", (d) => pathGenerator.centroid(d)[1])
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text((d) => d.properties.ZCTA5CE10)
      .style("fill", "white")
      .style("font-size", "8px");

    console.log("loading map for county", pathGenerator);
  });
}
