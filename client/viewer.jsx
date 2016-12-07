/** @jsx h */
import { h, render } from 'preact';

import ModulesTreemap from './components/ModulesTreemap';
import Sunburst from './components/Sunburst';
/* eslint no-unused-vars: "off" */
import styles from './viewer.css';

window.addEventListener('load', () => {
  render((
    <div id="app">
      {window.reportType === 'voronoi' && <ModulesTreemap data={window.chartData}/>}
      {window.reportType === 'sunburst' && <Sunburst data={window.chartData}/>}
    </div>
  ), document.body);
}, false);
