import React, { useEffect } from 'react';
import * as d3 from 'd3';
import './DsaShit.css';

function DsaShit() {
  useEffect(() => {
    // Define the data for the nodes
    const nodes = [
      { id: 1, label: 'Node 1' ,x: 250, y: 250},
      { id: 2, label: 'Node 2' },
      { id: 3, label: 'Node 3' },
      { id: 4, label: 'Node 4' },
      { id: 5, label: 'Node 5' }
    ];

    // Define the data for the links
    var links = [
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 4, target: 5 }
    ];

    // Create a new simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id),-2)
      //.force('charge', d3.forceManyBody())
      //.force('center', d3.forceCenter(250, 250));

    // Create an SVG element
const svg = d3.select('.svg-canvas')
svg.selectAll("*").remove()

// ... (rest of the code)

    // Create the link elements
// Create the link elements
const link = svg.append('g')
  .selectAll('line')
  .data(links)
  .enter().append('line')
  .call(d3.drag()
    .on('start', Ldragstarted)
    .on('drag', Ldragged)
    .on('end', Ldragended));

function Ldragstarted(event, d) {
  d3.select(this).raise();
  d.target.fx = d.target.x;
  d.target.fy = d.target.y;
}

function Ldragged(event, d) {
  d.target.fx = event.x;
  d.target.fy = event.y;
}

function Ldragended(event, d) {
  const node = findClosestNode(event.x, event.y);
  if (node) {
    d.target = node;
  }
  d.target.fx = null;
  d.target.fy = null;
}

function findClosestNode(x, y) {
  let closestNode;
  let minDistance = Infinity;
  nodes.forEach(node => {
    const dx = x - node.x;
    const dy = y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      closestNode = node;
      minDistance = distance;
    }
  });
  return closestNode;
}
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25) // Adjust these numbers to move the arrowhead position
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', 'purple')
      .style('stroke','none');
// Create the node elements
const node = svg.append('g')
  .selectAll('rect')
  .data(nodes)
  .enter().append('rect')
  .attr('width', 40)
  .attr('height', 20)
  .attr('x', d => d.x)
  .attr('y', d => d.y)
  .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended));

// Create the label elements
const label = svg.append('g')
  .selectAll('text')
  .data(nodes)
  .enter().append('text')
  .text(d => d.id) // Changed to just the id
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'central')
  .style('fill', 'white'); // Changed the color to white

// Update the positions of the nodes, links, and labels
simulation.on('tick', () => {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  node
    .attr('x', d => d.x - 20) // Adjusted for the width of the rectangle
    .attr('y', d => d.y - 10); // Adjusted for the height of the rectangle

  label
    .attr('x', d => d.x)
    .attr('y', d => d.y);
});
svg.on('contextmenu', (event) => { event.preventDefault(); });
// Define the drag event handlers
function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;

  if (event.sourceEvent.button === 2) { // Right-click drag
    console.log('Right-click drag started');

    // Remove any existing links with this node as the source
    links = links.filter(link => link.source.id !== d.id);

    // Add a new temporary link
    links.push({ source: d.id, target: { x: event.x, y: event.y } });
  }
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;

  if (event.sourceEvent.button === 2) { // Right-click drag
    // Update the target of the temporary link
    console.log('Right-click drag in progress');

    const tempLink = links.find(link => link.source.id === d.id);
    tempLink.target.x = event.x;
    tempLink.target.y = event.y;
  }
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;

  if (event.sourceEvent.button === 2) { // Right-click drag
    // Remove the temporary link
    links = links.filter(link => link.source.id !== d.id);
    console.log('Right-click drag ended');

    // If the cursor is within 50px of another node, add a permanent link
    const targetNode = nodes.find(node => Math.hypot(node.x - event.x, node.y - event.y) <= 50);
    if (targetNode) {
      links.push({ source: d.id, target: targetNode.id });
    }
  }
}

// Add the event handlers to the nodes
node.call(d3.drag()
  .on('start', dragstarted)
  .on('drag', dragged)
  .on('end', dragended));

  });
  return (
    <div className="container">
      <svg className="svg-canvas" />
    </div>
  );
  }
export default DsaShit;