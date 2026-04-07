// // components/ComparisonChart.js

// import React, { useRef, useEffect, useState } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import { Bar } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Tooltip,
//   Legend,
//   ChartDataLabels
// );

// const ComparisonChart = ({ utilizationLabels, labels }) => {
//   const chartContainerRef = useRef(null);
//   const [barThickness, setBarThickness] = useState(40); // default

//   useEffect(() => {
//     if (chartContainerRef.current) {
//       const width = chartContainerRef.current.offsetWidth;
//       setBarThickness(Math.floor(width / 16));
//     }
//   }, []);

//   // Create a separate array for just the percentages
//   const utilizationPercentages = utilizationLabels?.map((item) => item.y);

//   const data = {
//     labels,
//     datasets: [
//       {
//         label: "Utilization",
//         data: utilizationPercentages,
//         backgroundColor: "#b276b2",
//         barThickness,
//         maxBarThickness: barThickness,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       datalabels: {
//         color: "#000", // black text
//         anchor: "end",
//         align: "top",
//         formatter: (value) => `${value}%`,
//         font: {
//           weight: "bold",
//         },
//       },
//       tooltip: {
//         displayColors: false, // ✅ This removes the color box
//         callbacks: {
//           label: function (context) {
//             const index = context.dataIndex;
//             const info = utilizationLabels[index];
//             const percent = info.y.toFixed(2);
//             const approved = info.approvalAmount.toLocaleString();
//             const utilized = info.utilizedAmount.toLocaleString();

//             return [
//               `Approved: ₹${approved}`,
//               `Utilization: ₹${utilized}`,
//               `Percentage: ${percent}%`,
//             ];
//           },
//         },
//       },
//     },
//     scales: {
//       x: {
//         beginAtZero: true,
//       },
//       y: {
//         beginAtZero: true,
//         ticks: {
//           callback: (value) => value + "%",
//         },
//       },
//     },
//   };

//   return (
//     <div
//       ref={chartContainerRef}
//       className="relative w-full h-full"
//       style={{ height: "300px" }}
//     >
//       <Bar data={data} options={options} plugins={[ChartDataLabels]} />
//     </div>
//   );
// };

// export default ComparisonChart;








// changes by Neha
// components/ComparisonChart.js

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const ComparisonChart = ({ utilizationLabels, labels }) => {
  // Create a separate array for just the percentages
  const utilizationPercentages = utilizationLabels?.map((item) => item.y);

  const data = {
    labels,
    datasets: [
      {
        label: "Utilization",
        data: utilizationPercentages,
        backgroundColor: "#b276b2",
        // Added these two lines for automatic spacing
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: "#000", // black text
        anchor: "end",
        align: "top",
        formatter: (value) => `${value}%`,
        font: {
          weight: "bold",
          size: 10, // Smaller font for labels to fit better
        },
        offset: 2,
      },
      tooltip: {
        displayColors: false, // ✅ This removes the color box
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const info = utilizationLabels[index];
            const percent = info.y.toFixed(2);
            const approved = info.approvalAmount.toLocaleString();
            const utilized = info.utilizedAmount.toLocaleString();

            return [
              `Approved: ₹${approved}`,
              `Utilization: ₹${utilized}`,
              `Percentage: ${percent}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          maxRotation: 45, // Rotates labels to 45 degrees
          minRotation: 45,
          font: {
            size: 12, // Smaller font for x-axis labels
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value + "%",
          font: {
            size: 12,
          }
        },
      },
    },
  };

  return (
    <div className="overflow-x-auto w-full custom-scrollbar">
      <div
        className="relative"
        style={{ 
          height: "300px", 
          // This ensures each bar has enough space (50px per bar) on mobile
          minWidth: labels?.length > 8 ? `${labels.length * 50}px` : "100%" 
        }}
      >
        <Bar data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
};

export default ComparisonChart;
