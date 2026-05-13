"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Skeleton } from "@/components/ui/skeleton";

interface LanguageChartProps {
  languages: Record<string, number>;
  loading?: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  React: "#61dafb",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  Assembly: "#6E4C13",
  Others: "#444444",
};

const getLanguageColor = (lang: string) => LANGUAGE_COLORS[lang] || "#8b949e";

const LanguageChart: React.FC<LanguageChartProps> = ({ languages, loading = false }) => {
  const donutRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Process data: Sort, group "Others"
  const sortedLangs = Object.entries(languages)
    .sort(([, a], [, b]) => b - a);

  let processedLangs = sortedLangs.slice(0, 6);
  const otherLangs = sortedLangs.slice(6);

  if (otherLangs.length > 0) {
    const othersTotal = otherLangs.reduce((acc, [, val]) => acc + val, 0);
    processedLangs.push(["Others", parseFloat(othersTotal.toFixed(1))]);
  }

  // Handle Resize
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // D3 Donut Chart
  useEffect(() => {
    if (loading || processedLangs.length === 0 || !donutRef.current || dimensions.width === 0) return;

    const svg = d3.select(donutRef.current);
    svg.selectAll("*").remove();

    // Bigger donut sizes
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<[string, number]>().value((d) => d[1]).sort(null);
    const arc = d3.arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(radius * 0.6) // Thicker ring
      .outerRadius(radius)
      .cornerRadius(6)
      .padAngle(0.04);

    const path = g.selectAll("path")
      .data(pie(processedLangs))
      .enter()
      .append("path")
      .attr("fill", (d) => getLanguageColor(d.data[0]))
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 0 8px rgba(0,0,0,0.5))");

    // Animation
    path.transition()
      .duration(1200)
      .ease(d3.easeElasticOut.amplitude(1).period(0.3))
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) { return arc(i(t)) || ""; };
      });

    // Center Text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.2em")
      .attr("fill", "white")
      .style("font-size", "28px")
      .style("font-weight", "800")
      .text(`${processedLangs.length}`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.6em")
      .attr("fill", "#6e7681")
      .style("font-size", "10px")
      .style("font-weight", "600")
      .style("letter-spacing", "0.05em")
      .text("LANGUAGES");

  }, [processedLangs, loading, dimensions.width]);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-10 p-6">
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full bg-white/5" />
          ))}
        </div>
        <div className="flex justify-center items-center px-6">
          <Skeleton className="h-48 w-48 rounded-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (processedLangs.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center border border-dashed border-white/10 rounded-xl">
        <p className="text-gray-500 text-sm">No language data found.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col xl:flex-row gap-10 items-center p-2">
      {/* List */}
      <div className="flex-1 w-full space-y-5">
        {processedLangs.map(([lang, percent], i) => (
          <div key={lang} className="group">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-semibold text-gray-200 flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: getLanguageColor(lang) }} 
                />
                {lang}
              </span>
              <span className="text-gray-400 font-mono font-bold">{percent}%</span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.03]">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                style={{
                  width: `${percent}%`,
                  backgroundColor: getLanguageColor(lang),
                  transitionDelay: `${i * 120}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Donut Chart */}
      <div className="shrink-0 flex justify-center items-center relative py-4 px-6">
        <svg ref={donutRef} className="w-48 h-48 md:w-56 md:h-56 overflow-visible" />
      </div>
    </div>
  );
};

export default LanguageChart;
