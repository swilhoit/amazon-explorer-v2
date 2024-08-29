import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../contexts/ThemeContext';

import { chartColors } from '../utils/ChartjsConfig';
import {
    Chart, ScatterController, Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { utils } from '../utils/Utils';

Chart.register(ScatterController, Tooltip);

function ScatterChart({
                      data,
                      width,
                      height
                  }) {

    const [chart, setChart] = useState(null)
    const canvas = useRef(null);
    const legend = useRef(null);
    const { currentTheme } = useThemeProvider();
    const darkMode = currentTheme === 'dark';
    const { tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

    console.log(data, data)

    useEffect(() => {
        const ctx = canvas.current;
        // eslint-disable-next-line no-unused-vars
        const newChart = new Chart(ctx, {
            type: 'scatter',
            data: data,
            options: {
                layout: {
                    padding: {
                        top: 4,
                        bottom: 4,
                        left: 24,
                        right: 24,
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
                        bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
                        backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
                        borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
                        // callbacks: {
                        //     footer: (tooltipItems) => {
                        //         tooltipItems.forEach((titem) => {
                        //             return (
                        //                 <div
                        //                     className="rounded-[8px] p-2"
                        //                     style={{
                        //                         backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
                        //                         border: `1px solid ${darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light}`
                        //                     }}
                        //                 >
                        //                     <p className="font-bold text-[12px]">{data.title}</p>
                        //                     <p className="text-gray-500 text-[12px]">Price: ${data.price.toFixed(2)}</p>
                        //                     <p className="text-gray-500 text-[12px]">Sales: {data.sales.toLocaleString()}</p>
                        //                     <img src={data.imageUrl} alt={data.title} style={{ width: 50, height: 50, objectFit: 'cover' }} />
                        //                 </div>
                        //             )
                        //         })
                        //     }
                        // }
                    },
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest',
                },
                animation: {
                    duration: 200,
                },
                maintainAspectRatio: false,
            },
            plugins: [
                {
                    id: 'htmlLegend',
                    afterUpdate(c, args, options) {
                        const ul = legend.current;
                        if (!ul) return;
                        // Remove old legend items
                        while (ul.firstChild) {
                            ul.firstChild.remove();
                        }
                        // Reuse the built-in legendItems generator
                        const items = c.options.plugins.legend.labels.generateLabels(c);
                        items.forEach((item) => {
                            const li = document.createElement('li');
                            li.style.margin = utils().theme.margin[1.5];
                            // Button element
                            const button = document.createElement('button');
                            button.style.display = 'inline-flex';
                            button.style.alignItems = 'center';
                            button.style.opacity = item.hidden ? '.3' : '';
                            button.onclick = () => {
                                c.toggleDataVisibility(item.index, !item.index);
                                c.update();
                            };
                            // Color box
                            const box = document.createElement('span');
                            box.style.display = 'block';
                            box.style.width = utils().theme.width[3];
                            box.style.height = utils().theme.height[3];
                            box.style.borderRadius = utils().theme.borderRadius.full;
                            box.style.marginRight = utils().theme.margin[1.5];
                            box.style.borderWidth = '3px';
                            box.style.borderColor = item.fillStyle;
                            box.style.pointerEvents = 'none';
                            // Label
                            const label = document.createElement('span');
                            label.classList.add('text-gray-500', 'dark:text-gray-400');
                            label.style.fontSize = utils().theme.fontSize.sm[0];
                            label.style.lineHeight = utils().theme.fontSize.sm[1].lineHeight;
                            const labelText = document.createTextNode(item.text);
                            label.appendChild(labelText);
                            li.appendChild(button);
                            button.appendChild(box);
                            button.appendChild(label);
                            ul.appendChild(li);
                        });
                    },
                },
            ],
        });
        setChart(newChart);
        return () => newChart.destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!chart) return;

        if (darkMode) {
            chart.options.plugins.tooltip.titleColor = tooltipTitleColor.dark
            chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.dark
            chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.dark
            chart.options.plugins.tooltip.borderColor = tooltipBorderColor.dark
        } else {
            chart.options.plugins.tooltip.titleColor = tooltipTitleColor.light
            chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.light
            chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.light
            chart.options.plugins.tooltip.borderColor = tooltipBorderColor.light
        }
        chart.update('none');
    }, [currentTheme]);

    return (
        <div className="grow flex flex-col justify-start">
            <div>
                <canvas ref={canvas} width={width} height={height}></canvas>
            </div>
        </div>
    );
}

export default ScatterChart;