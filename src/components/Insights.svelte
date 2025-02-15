<script>
  import { onMount, onDestroy, tick } from "svelte";
  import Chart from "chart.js/auto";

  let chartContainer;
  let chartInstance = null;

  async function createChart() {
    if (!chartContainer) return;

    // Ensure old canvas is removed and replaced
    chartContainer.innerHTML = "<canvas></canvas>";
    await tick(); // Wait for the new canvas to be added

    let chartCanvas = chartContainer.querySelector("canvas");
    let ctx = chartCanvas.getContext("2d");

    // Destroy the previous chart if it exists
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    // Create gradient colors
    let gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient1.addColorStop(0, "rgba(0, 123, 255, 0.8)");
    gradient1.addColorStop(1, "rgba(0, 123, 255, 0.2)");

    let gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient2.addColorStop(0, "rgba(40, 167, 69, 0.8)");
    gradient2.addColorStop(1, "rgba(40, 167, 69, 0.2)");

    let gradient3 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient3.addColorStop(0, "rgba(220, 53, 69, 0.8)");
    gradient3.addColorStop(1, "rgba(220, 53, 69, 0.2)");

    let gradient4 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient4.addColorStop(0, "rgba(102, 16, 242, 0.8)");
    gradient4.addColorStop(1, "rgba(102, 16, 242, 0.2)");

    let gradient5 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient5.addColorStop(0, "rgba(255, 193, 7, 0.8)");
    gradient5.addColorStop(1, "rgba(255, 193, 7, 0.2)");

    // Create the new chart
    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Shower", "Toilet", "Dishwashing", "Laundry", "Other"],
        datasets: [
          {
            label: "Water Usage (Liters)",
            data: [40, 30, 20, 50, 15], // Sample Data
            backgroundColor: [gradient1, gradient2, gradient3, gradient4, gradient5],
            borderRadius: 8, // Rounded bars
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // Hide legend for a cleaner look
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
          },
        },
        scales: {
          y: {
            ticks: {
              color: "#555", // Dark gray labels
              font: {
                size: 14,
                weight: "bold",
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)", // Light grid lines
            },
          },
          x: {
            ticks: {
              color: "#555",
              font: {
                size: 14,
                weight: "bold",
              },
            },
            grid: {
              display: false, // Hide x-axis grid
            },
          },
        },
        animation: {
          duration: 1200,
          easing: "easeInOutQuart",
        },
      },
    });
  }

  onMount(() => {
    createChart();
  });

  onDestroy(() => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });
</script>

<style>
  .chart-card {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .chart-container {
    height: 400px;
  }

  h2 {
    text-align: center;
    color: #333;
    font-size: 1.8rem;
    margin-bottom: 10px;
  }
</style>

<div class="chart-card">
  <h2>Water Usage Insights</h2>
  <div class="chart-container" bind:this={chartContainer}></div>
</div>