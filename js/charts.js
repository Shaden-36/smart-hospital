/**
 * Interactive health trend chart (Blood Pressure / Blood Sugar / Pulse).
 * Renders on <canvas id="healthChart"> using Chart.js.
 */

const chartInstances = {};

function renderHealthChart(lang, canvasId = "healthChart") {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;

  const labelBP = lang === "ar" ? "ضغط الدم" : "Blood Pressure";
  const labelSugar = lang === "ar" ? "سكر الدم" : "Blood Sugar";
  const labelPulse = lang === "ar" ? "النبض" : "Pulse Rate";

  const datasets = [
    {
      label: labelBP,
      data: MOCK_CHART_SERIES.bloodPressure,
      borderColor: "#0288D1",
      backgroundColor: "#0288D1",
      tension: 0.35,
      pointRadius: 3,
      borderWidth: 2,
    },
    {
      label: labelSugar,
      data: MOCK_CHART_SERIES.bloodSugar,
      borderColor: "#4FC3F7",
      backgroundColor: "#4FC3F7",
      tension: 0.35,
      pointRadius: 3,
      borderWidth: 2,
    },
    {
      label: labelPulse,
      data: MOCK_CHART_SERIES.pulse,
      borderColor: "#00BCD4",
      backgroundColor: "#00BCD4",
      tension: 0.35,
      pointRadius: 3,
      borderWidth: 2,
    },
  ];

  if (chartInstances[canvasId]) {
    chartInstances[canvasId].data.labels = MOCK_CHART_LABELS;
    chartInstances[canvasId].data.datasets = datasets;
    chartInstances[canvasId].update();
    return;
  }

  chartInstances[canvasId] = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: { labels: MOCK_CHART_LABELS, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#0A192F", usePointStyle: true, boxWidth: 8 },
        },
        tooltip: {
          backgroundColor: "#FFFFFF",
          titleColor: "#0A192F",
          bodyColor: "#0A192F",
          borderColor: "#E1F5FE",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: "#E1F5FE" },
          ticks: { color: "#0A192F" },
        },
        y: {
          grid: { color: "#E1F5FE" },
          ticks: { color: "#0A192F" },
        },
      },
    },
  });
}
