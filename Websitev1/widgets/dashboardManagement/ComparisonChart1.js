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
//   const [barThickness, setBarThickness] = useState(40);

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
//         color: "#000",
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
//             const planned = info.plannedAmount.toLocaleString();
//             const utilized = info.utilizedAmount.toLocaleString();

//             return [
//               `Planned: ₹${planned}`,
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











//changes by Neha
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
        // Using percentages instead of fixed thickness to create even gaps
        barPercentage: 0.8,      // Controls the width of the individual bars
        categoryPercentage: 0.9, // Controls the space between categories
      },
    ],
  };

  const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      color: "#000",
      anchor: "end",
      align: "top",
      formatter: (value) => `${value}%`,
      font: {
        weight: "bold",
        size: 10, // Reduce font size slightly for better fit
      },
      offset: 2, // Add a small gap between bar and label
    },
    // ... existing tooltip code ...
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        maxRotation: 45, // Rotate city names if they are too long
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
  <div className="overflow-x-auto w-full">
    <div
      className="relative"
      style={{ 
        height: "300px", 
        minWidth: labels?.length > 8 ? `${labels.length * 50}px` : "100%" 
      }}
    >
      <Bar data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  </div>
);

};

export default ComparisonChart;

