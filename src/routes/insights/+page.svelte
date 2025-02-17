<script>
  import "../../lib/styles/insights.css";
  import { onMount, onDestroy, tick } from "svelte";
  import Chart from "chart.js/auto";
  import { auth, getWaterUsageLogs } from "$lib/firebase";
  import { onAuthStateChanged } from "firebase/auth";
  import { writable, get } from "svelte/store";
  import dayjs from "dayjs";

  let user = writable(null);
  let waterLogs = writable([]);
  let selectedTimeframe = writable("daily");

  let barChartContainer, lineChartContainer;
  let activeBarChart = null, activeLineChart = null;

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        user.set(userData);
        const logs = await getWaterUsageLogs(userData.uid);
        waterLogs.set(logs);
        updateCharts(logs, get(selectedTimeframe));
      }
    });

    return () => {
      unsubscribe();
      destroyCharts();
    };
  });

  function destroyCharts() {
    if (activeBarChart) activeBarChart.destroy();
    if (activeLineChart) activeLineChart.destroy();
    activeBarChart = null;
    activeLineChart = null;
  }

  async function updateCharts(logs, timeframe) {
    destroyCharts();
    await tick();

    const processedData = processLogs(logs);
    const chartData = processedData[timeframe];

    activeBarChart = createBarChart(barChartContainer, `${timeframe.toUpperCase()} Water Usage`, chartData);
    activeLineChart = createLineChart(lineChartContainer, `Water Usage Trend (${timeframe.toUpperCase()})`, chartData);
    analyzeTrend(chartData.totalDataset.data);
  }

  function analyzeTrend(data) {
    if (data.length < 2) {
      recommendationMessage.set("Not enough data to analyze trends.");
      return;
    }

    const lastValue = data[data.length - 1];
    const secondLastValue = data[data.length - 2];

    if (lastValue > secondLastValue) {
      recommendationMessage.set("Your water usage is increasing. Consider taking shorter showers, fixing leaks, or using water-efficient appliances!");
    } else if (lastValue < secondLastValue) {
      recommendationMessage.set("Great job! Your water usage is decreasing. Keep up the good habits to conserve water!");
    } else {
      recommendationMessage.set("Your water usage is steady. Try small changes to further reduce consumption!");
    }
  }

  function processLogs(logs) {
    let daily = {}, weekly = {}, monthly = {}, yearly = {};
    let usageTypes = new Set();
    let totalUsage = { daily: {}, weekly: {}, monthly: {}, yearly: {} };

    logs.forEach((log) => {
      const date = dayjs(log.timestamp.toDate());
      const dayKey = date.format("YYYY-MM-DD");
      const weekKey = date.format("YYYY-WW");  // Format for the week number (e.g., "2025-08")
      const monthKey = date.format("YYYY-MM");
      const yearKey = date.format("YYYY");
      const type = log.usageType || "Other";
      usageTypes.add(type);

      if (!daily[dayKey]) daily[dayKey] = {};
      if (!weekly[weekKey]) weekly[weekKey] = {};
      if (!monthly[monthKey]) monthly[monthKey] = {};
      if (!yearly[yearKey]) yearly[yearKey] = {};
      if (!totalUsage.daily[dayKey]) totalUsage.daily[dayKey] = 0;
      if (!totalUsage.weekly[weekKey]) totalUsage.weekly[weekKey] = 0;
      if (!totalUsage.monthly[monthKey]) totalUsage.monthly[monthKey] = 0;
      if (!totalUsage.yearly[yearKey]) totalUsage.yearly[yearKey] = 0;

      daily[dayKey][type] = (daily[dayKey][type] || 0) + log.amount;
      weekly[weekKey][type] = (weekly[weekKey][type] || 0) + log.amount;
      monthly[monthKey][type] = (monthly[monthKey][type] || 0) + log.amount;
      yearly[yearKey][type] = (yearly[yearKey][type] || 0) + log.amount;

      totalUsage.daily[dayKey] += log.amount;
      totalUsage.weekly[weekKey] += log.amount;
      totalUsage.monthly[monthKey] += log.amount;
      totalUsage.yearly[yearKey] += log.amount;
    });

    return {
      daily: formatChartData(daily, usageTypes, totalUsage.daily),
      weekly: formatChartData(weekly, usageTypes, totalUsage.weekly),
      monthly: formatChartData(monthly, usageTypes, totalUsage.monthly),
      yearly: formatChartData(yearly, usageTypes, totalUsage.yearly),
    };
  }

  function formatChartData(data, usageTypes, totalUsage) {
    let labels = Object.keys(data).sort();
    let datasets = Array.from(usageTypes).map((type, index) => ({
      label: type,
      data: labels.map((label) => data[label]?.[type] || 0),
      backgroundColor: getColor(type, index),
      borderRadius: 8,
    }));

    let totalDataset = {
      label: "Total Usage",
      data: labels.map((label) => totalUsage[label] || 0),
      borderColor: "rgba(255, 99, 132, 1)",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      fill: true,
      tension: 0.4,
    };

    return { labels, datasets, totalDataset };
  }

  function getColor(type, index) {
    const colors = {
      Shower: "rgba(0, 123, 255, 0.8)",  
      Drinking: "rgba(40, 167, 255, 0.8)",  
      Laundry: "rgba(63, 81, 181, 0.8)",  
      Cooking: "rgba(87, 77, 184, 0.8)",  
      Toilet: "rgba(106, 90, 205, 0.8)",  
      Gardening: "rgba(72, 161, 186, 0.8)",  
      Dishwashing: "rgba(100, 159, 242, 0.8)",  
      Other: "rgba(108, 117, 180, 0.8)",  


    };

    return colors[type] || `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.8)`;
  }

  function createBarChart(container, title, data) {
    if (!container) return;
    container.innerHTML = "<canvas></canvas>";

    const ctx = container.querySelector("canvas").getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: data.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { stacked: false }, y: { beginAtZero: true } },
        plugins: { legend: { display: true, position: "top" } },
      },
    });
  }

  function createLineChart(container, title, data) {
    if (!container) return;
    container.innerHTML = "<canvas></canvas>";

    const ctx = container.querySelector("canvas").getContext("2d");
    return new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [data.totalDataset],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: true, position: "top" } },
      },
    });
  }
</script>

<div class="bubble-container">
  {#each Array(20) as _, i}
    <div class="bubble" style="left:{Math.random()*100}%;animation-duration:{3+Math.random()*5}s;"></div>
  {/each}
</div>

<div class="insights-container">
  <h1>Water Consumption Insights</h1>
  <select class="dropdown" bind:value={$selectedTimeframe} on:change={() => updateCharts($waterLogs, $selectedTimeframe)}>
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="monthly">Monthly</option>
    <option value="yearly">Yearly</option>
  </select>
  <div class="chart-container" bind:this={barChartContainer}></div>
  <div class="chart-container" bind:this={lineChartContainer}></div>
</div>
