import * as d3 from 'd3'

/* eslint no-unused-vars: "off" */
import styles from './viewer.css';

  window.addEventListener('load', () => {
    
    var width = 800,
    height = 900,
    radius = Math.min(width, height) / 2;

    var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

    var y = d3.scale.sqrt()
    .range([0, radius]);

    var color = d3.scale.category20c();

    var svg = d3.select("#app").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

    var partition = d3.layout.partition()
    .value(function(d) { return d.statSize; });

    var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });


    var tooltip = d3.select("#app")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("opacity", 0);

    function format_name(d) {
      var name = d.label;
      return  '<b>' + name + '</b><br> (' + d.value + ')';
    }
    
    // d3.json("data.json", function(error, root) {

      var path = svg.selectAll("path")
      .data(partition.nodes(chartData[0]))
      .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color((d.children ? d : d.parent).label); })
      .on("click", click)
      .on("mouseover", function(d) {
        tooltip.html(function() {
          var name = format_name(d);
          return name;
        });
        return tooltip.transition()
        .duration(50)
        .style("opacity", 0.9);
      })
      .on("mousemove", function(d) {
        return tooltip;
      })
      .on("mouseout", function(){return tooltip.style("opacity", 0);});



      function click(d) {
        path.transition()
        .duration(750)
        .attrTween("d", arcTween(d));
      }
    // });

    d3.select(self.frameElement).style("height", height + "px");

  // Interpolate the scales!
  function arcTween(d) {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
    yd = d3.interpolate(y.domain(), [d.y, 1]),
    yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function(d, i) {
      return i
      ? function(t) { return arc(d); }
      : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
    };
  }



}, false);

