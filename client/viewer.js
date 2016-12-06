import * as d3 from 'd3';
import filesize from 'filesize';

/* eslint no-unused-vars: 'off' */
import styles from './viewer.css';

window.addEventListener('load', () => {
  const width = document.body.offsetWidth;
  const height = document.body.offsetHeight;
  const radius = Math.min(width, height) / 2;
  const x = d3.scale.linear().range([0, 2 * Math.PI]);
  const y = d3.scale.sqrt().range([0, radius]);
  const color = d3.scale.category20c();

  const svg = d3.select('#app')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${ width / 2 }, ${ (height / 2 + 10) })`);

  const partition = d3.layout.partition()
    .value(d => { return d.statSize; });

  const arc = d3.svg.arc()
    .startAngle(d => { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(d => { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(d => { return Math.max(0, y(d.y)); })
    .outerRadius(d => { return Math.max(0, y(d.y + d.dy)); });

  const tooltip = d3.select('#app')
    .append('div')
    .attr('class', 'info');

  function onClick(d) {
    path.transition()
      .duration(750)
      .attrTween('d', arcTween(d));
  }

  function onMouseOver(d) {
    tooltip.html(() => {
      return `${ d.label } (${ filesize(d.value) })`;
    });
    return tooltip;
  }

  function onMouseMove() {
    return tooltip;
  }

  function onMouseOut() {
    return tooltip.html('');
  }

  function arcTween(d) {
    const xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);
    const yd = d3.interpolate(y.domain(), [d.y, 1]);
    const yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);

    return (d, i) => {
      return i
        ? t => { return arc(d); }
        : t => {
          x.domain(xd(t));
          y.domain(yd(t)).range(yr(t));
          return arc(d);
        };
    };
  }

  const path = svg.selectAll('path')
    .data(partition.nodes(chartData[0]))
    .enter().append('path')
    .attr('d', arc)
    .style('fill', d => { return color((d.children ? d : d.parent).label); })
    .on('click', onClick)
    .on('mouseover', onMouseOver)
    .on('mousemove', onMouseMove)
    .on('mouseout', onMouseOut);

}, false);

