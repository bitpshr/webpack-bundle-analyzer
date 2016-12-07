/** @jsx h */
import { h, Component } from 'preact';
import * as d3 from 'd3';
import filesize from 'filesize';

import css from './Sunburst.css';

export default class Sunburst extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.createSunburst();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div class={css.container} ref={this.saveNode}/>
    );
  }

  saveNode = node => (this.node = node);

  onClick(d) {
    this.path.transition()
      .duration(750)
      .attrTween('d', this.arcTween(d));
  }

  onMouseOver(d) {
    this.tooltip.html(() => {
      return `
        <div class="${ css.infoInner }">
          <div class="${ css.filename }">${ d.label }</div>
          <div class="${ css.contents }">
            <div class="${ css.size }">${ filesize(d.statSize) }</div>
            <div class="${ css.type }">stat</div>
            <div class="${ css.size }">${ filesize(d.parsedSize) }</div>
            <div class="${ css.type }">parsed</div>
            <div class="${ css.size }">${ filesize(d.gzipSize) }</div>
            <div class="${ css.type }">gzip</div>
          </div>
        </div>
      `;
    });
    return this.tooltip;
  }

  onMouseMove(d) {
    return this.tooltip;
  }

  arcTween(d) {
    const xd = d3.interpolate(this.x.domain(), [d.x, d.x + d.dx]);
    const yd = d3.interpolate(this.y.domain(), [d.y, 1]);
    const yr = d3.interpolate(this.y.range(), [d.y ? 20 : 0, this.radius]);

    return (d, i) => {
      return i
        ? t => { return this.arc(d); }
        : t => {
          this.x.domain(xd(t));
          this.y.domain(yd(t)).range(yr(t));
          return this.arc(d);
        };
    };
  }

  createSunburst() {
    const sunburst = document.createElement('div');
    sunburst.classList.add(css.sunburst);
    this.node.appendChild(sunburst);

    const color = d3.scale.category20c();
    const width = Math.min(sunburst.offsetWidth, sunburst.offsetHeight);
    const height = width + 50;
    
    this.radius = Math.min(width, height) / 2;
    this.x = d3.scale.linear().range([0, 2 * Math.PI]);
    this.y = d3.scale.sqrt().range([0, this.radius]);

    const svg = d3.select(sunburst)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${ width / 2 }, ${ (height / 2 + 10) })`);

    const partition = d3.layout.partition()
      .value(d => { return d.statSize; })
      .children(d => { return d.groups; });

    this.arc = d3.svg.arc()
      .startAngle(d => { return Math.max(0, Math.min(2 * Math.PI, this.x(d.x))); })
      .endAngle(d => { return Math.max(0, Math.min(2 * Math.PI, this.x(d.x + d.dx))); })
      .innerRadius(d => { return Math.max(0, this.y(d.y)); })
      .outerRadius(d => { return Math.max(0, this.y(d.y + d.dy)); });

    this.tooltip = d3.select(this.node)
      .insert('div', ':first-child')
      .attr('class', css.info);

    this.path = svg.selectAll('path')
      .data(partition.nodes(this.props.data[0]))
      .enter().append('path')
      .attr('d', this.arc)
      .style('fill', d => { return color((d.children ? d : d.parent).label); })
      .on('click', this.onClick.bind(this))
      .on('mouseover', this.onMouseOver.bind(this))
      .on('mousemove', this.onMouseMove.bind(this));

    this.onMouseOver(this.props.data[0]);
  }
}
