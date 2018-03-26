/** @jsx h */
import { h, render } from 'preact';

import ModulesTreemap from './components/ModulesTreemap';
import Sunburst from './components/Sunburst';
/* eslint no-unused-vars: "off" */
import styles from './viewer.css';

// Initializing WebSocket for live treemap updates
let ws;
try {
  ws = new WebSocket(`ws://${location.host}`);
} catch (err) {
  console.warn(
    "Couldn't connect to analyzer websocket server so you'll have to reload page manually to see updates in the treemap"
  );
}

window.addEventListener('load', () => {
  renderApp(window.chartData);

  if (ws) {
    ws.addEventListener('message', event => {
      const msg = JSON.parse(event.data);

      if (msg.event === 'chartDataUpdated') {
        renderApp(msg.data);
      }
    });
  }
}, false);

let app;
function renderApp(chartData) {
  app = render(
    <div id="app">
      {window.reportType === 'treemap' && <ModulesTreemap data={chartData} defaultSizes={window.defaultSizes}/>}
      {window.reportType === 'sunburst' && <Sunburst data={chartData}/>}
    </div>,
    document.body,
    app
  );
}
