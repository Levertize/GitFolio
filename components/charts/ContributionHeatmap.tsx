"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import dayjs from "dayjs";
import { useInView } from "framer-motion";

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionHeatmapProps {
  data: ContributionDay[];
  colorScheme?: "green" | "blue" | "purple" | "orange" | "pink" | "cyan";
  color?: string; // Hex color for custom scheme
  loading?: boolean;
  range?: "3m" | "6m" | "1y";
}

const COLOR_SCHEMES = {
  green: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  blue: ["#161b22", "#113054", "#1a5fb4", "#3584e4", "#62a0ea"],
  purple: ["#161b22", "#381a54", "#613583", "#9141ac", "#c061cb"],
  orange: ["#161b22", "#542a0e", "#b45309", "#f59e0b", "#fbbf24"],
  pink: ["#161b22", "#540e2a", "#b41a5f", "#ec4899", "#f472b6"],
  cyan: ["#161b22", "#0e4a54", "#0891b2", "#06b6d4", "#22d3ee"],
};

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  data,
  colorScheme = "green",
  color,
  loading = false,
  range = "1y",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "0px" });
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setPrefersReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (loading || !data || data.length === 0 || !svgRef.current || (prefersReduced === false && !isInView)) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll("*").remove();

    const cellSize = 14;
    const gap = 3;
    const margin = { top: 25, right: 10, bottom: 0, left: 30 };
    
    // Adjust grid columns based on range
    const weeksToShow = range === "3m" ? 13 : range === "6m" ? 26 : 53;
    const gridWidth = weeksToShow * (cellSize + gap);
    const gridHeight = 7 * (cellSize + gap);
    
    const width = gridWidth + margin.left + margin.right;
    const height = gridHeight + margin.top + margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .style("width", `${(weeksToShow / 53) * 100}%`)
       .style("min-width", range === "1y" ? "100%" : "auto")
       .attr("height", "auto")
       .style("overflow", "visible")
       .style("transition", "width 0.4s ease-out");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const maxCount = d3.max(data, d => d.count) || 1;
    
    // Determine colors
    let colors = COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.green;

    const getColor = (count: number) => {
      if (count === 0) return colors[0];
      if (count <= Math.ceil(maxCount * 0.25)) return colors[1];
      if (count <= Math.ceil(maxCount * 0.5)) return colors[2];
      if (count <= Math.ceil(maxCount * 0.75)) return colors[3];
      return colors[4];
    };

    const endDate = dayjs();
    let startDate = endDate.subtract(1, 'year').startOf('week');
    if (range === "3m") startDate = endDate.subtract(3, 'month').startOf('week');
    if (range === "6m") startDate = endDate.subtract(6, 'month').startOf('week');
    
    const parsedData = data
      .map(d => ({ ...d, dayJS: dayjs(d.date) }))
      .filter(d => d.dayJS.isAfter(startDate) || d.dayJS.isSame(startDate, 'day'))
      .sort((a, b) => a.dayJS.valueOf() - b.dayJS.valueOf());

    const months: { label: string; x: number }[] = [];
    let prevMonth = -1;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    [1, 3, 5].forEach(day => {
      g.append("text")
        .attr("x", -10)
        .attr("y", day * (cellSize + gap) + cellSize / 1.5)
        .attr("text-anchor", "end")
        .attr("fill", "#6e7681")
        .style("font-size", "10px")
        .text(dayNames[day]);
    });

    const rects = g.selectAll(".day")
      .data(parsedData)
      .enter()
      .append("rect")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", d => getColor(d.count))
      .attr("x", d => {
        const weekIndex = d.dayJS.diff(startDate, 'week');
        if (d.dayJS.date() <= 7 && d.dayJS.month() !== prevMonth) {
          prevMonth = d.dayJS.month();
          months.push({ label: d.dayJS.format("MMM"), x: weekIndex * (cellSize + gap) });
        }
        return weekIndex * (cellSize + gap);
      })
      .attr("y", d => d.dayJS.day() * (cellSize + gap))
      .style("cursor", "pointer")
      .style("transform-origin", (d) => {
        const weekIndex = d.dayJS.diff(startDate, 'week');
        return `${weekIndex * (cellSize + gap) + cellSize / 2}px ${d.dayJS.day() * (cellSize + gap) + cellSize / 2}px`;
      });

    if (!prefersReduced) {
      rects.style("opacity", 0)
           .style("animation", (d) => isInView ? `cellPop 0.3s ease forwards` : "none")
           .style("animation-delay", (d) => {
             const weekIndex = d.dayJS.diff(startDate, 'week');
             return isInView ? `${weekIndex * 0.015}s` : "0s";
           });
    } else {
      rects.style("opacity", 1);
    }

    g.selectAll(".month")
      .data(months)
      .enter()
      .append("text")
      .attr("x", d => d.x)
      .attr("y", -10)
      .attr("fill", "#6e7681")
      .style("font-size", "10px")
      .text(d => d.label);

    // --- INTERACTIVITY ---
    
    rects.on("mouseover", function(event, d) {
      d3.select(this)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);

      tooltip
        .style("display", "block")
        .style("opacity", 1)
        .html(`
          <div class="font-bold text-white">${d.count} commits</div>
          <div class="text-[10px] text-gray-400">${d.dayJS.format("MMM D, YYYY")}</div>
        `);
      
      const [x, y] = d3.pointer(event, containerRef.current);
      tooltip
        .style("left", `${x + 10}px`)
        .style("top", `${y - 40}px`);
    })
    .on("mousemove", function(event) {
      const [x, y] = d3.pointer(event, containerRef.current);
      tooltip
        .style("left", `${x + 10}px`)
        .style("top", `${y - 40}px`);
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "none");
      tooltip.style("opacity", 0).style("display", "none");
    });

  }, [data, loading, colorScheme, range, isInView, prefersReduced]);


  if (loading) {
    return (
      <div className="w-full h-[140px] bg-white/[0.02] rounded-xl animate-pulse flex items-center justify-center border border-white/5">
        <div className="text-gray-600 text-xs">Loading activity heatmap...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[140px] bg-white/[0.02] rounded-xl flex items-center justify-center border border-white/5 border-dashed">
        <div className="text-gray-500 text-xs">No activity found in the last year.</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef} className="w-full h-auto" />
      
      {/* Absolute Tooltip inside container */}
      <div 
        ref={tooltipRef}
        className="absolute hidden pointer-events-none bg-[#161b22] border border-white/10 px-3 py-1.5 rounded-md shadow-2xl z-50 text-xs whitespace-nowrap transition-opacity duration-150"
        style={{ backdropFilter: "blur(4px)" }}
      />
    </div>
  );
};

export default ContributionHeatmap;
