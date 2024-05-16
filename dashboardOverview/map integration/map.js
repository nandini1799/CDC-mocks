d3.csv("/test2.csv").then(function (dataset) {
  d3.json("/SCmap.geojson").then(function (mapData) {
    console.log(dataset);
    console.log(mapData);

    var countyFamilies = {};
    dataset.forEach((d) => {
      countyFamilies[d["NAME"]] = +d["FAMILIES"];
    });

    console.log(countyFamilies);

    var size = 900;
    var svg = d3
      .select("body")
      .select("svg")
      .attr("width", size)
      .attr("height", size);

    var projection = d3.geoEquirectangular().fitSize([size, size], mapData);

    var pathGenerator = d3.geoPath(projection);

    svg
      .selectAll("path")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", "steelblue")
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .style("stroke", "dashed");

    svg
      .selectAll("text")
      .data(mapData.features)
      .enter()
      .append("text")
      .attr("x", function (d) {
        return pathGenerator.centroid(d)[0];
      })
      .attr("y", function (d) {
        return pathGenerator.centroid(d)[1];
      })
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text(function (d) {
        return d.properties.NAME;
      })
      .style("fill", "black")
      .style("font-size", "10px");


  });
});
