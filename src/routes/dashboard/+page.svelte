<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { auth, getWaterUsageLogs } from "$lib/firebase";
  import { onAuthStateChanged } from "firebase/auth";
  import Chart from "chart.js/auto";

  let darkMode = writable(false);

  function toggleTheme() {
    darkMode.update(value => !value);
}

  let user = writable(null);
  let recommendations = writable([]);
  let trendInfo = writable({ message: "", recommendation: "" });
  let userProfile = writable({ name: "", photoURL: "" });
  let totalUsage = writable(0);
  let maxUsageType = writable("");
  let usageChange = writable(0);

  let trendChart, usageTypeChart;

  function generateDynamicRecommendations(avgUsage) {
    const recs = [];
    let warningMessage = '';
    let safeSignal = '';
    
    if (avgUsage > 500) {
      recs.push({ tip: "High water usage!", explanation: "Consider conservation strategies." });
      warningMessage = "High water usage alert!";
      safeSignal = "High Risk";
    } else if (avgUsage > 300) {
      recs.push({ tip: "Above average usage.", explanation: "Look for ways to optimize water consumption." });
      warningMessage = "Alert: Your water usage is above average.";
      safeSignal = "Moderate Risk";
    } else {
      recs.push({ tip: "Good water efficiency!", explanation: "Keep up your conservation habits." });
      warningMessage = "Your water usage is within a safe range.";
      safeSignal = "All Good!";
    }

    return { recs, warningMessage, safeSignal };
  }

  function createTrendChart(logs) {
  const ctx = document.getElementById("trendChart").getContext("2d");
  logs.forEach(log => {
  console.log("Timestamp:", log.timestamp); // for debugging
});

  //const labels = logs.map((log, index) => log.timestamp ? new Date(log.timestamp).toLocaleDateString() : `Entry ${index + 1}`);
  const labels = logs.map((log, index) => {
  if (log.timestamp && log.timestamp.seconds !== undefined) {
    // Converts Firestore timestamp (in nanoseconds) to a JavaScript Date object
    const date = new Date(log.timestamp.seconds * 1000 + log.timestamp.nanoseconds / 1_000_000);
    return date.toLocaleDateString();
  } else {
    return `Entry ${index + 1}`; // Fallback label if timestamp isn't retrievable
  }
});



  const data = logs.map(log => parseFloat(log.amount));

  if (trendChart) {
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = data;
    trendChart.update();
  } else {
    trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Water Usage (liters)",
          data,
          borderColor: "#0077cc",
          backgroundColor: "rgba(0, 119, 204, 0.2)",
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Water Usage (liters)" } }
        }
      }
    });
  }
}

function createUsageTypeChart(logs) {
  const ctx = document.getElementById("usageTypeChart").getContext("2d");
  const usageTypes = logs.reduce((acc, log) => {
    acc[log.usageType] = (acc[log.usageType] || 0) + parseFloat(log.amount);
    return acc;
  }, {});
 
  const labels = Object.keys(usageTypes);
  
  const data = Object.values(usageTypes);
 
  if (usageTypeChart) {
    usageTypeChart.data.labels = labels;
    usageTypeChart.data.datasets[0].data = data;
    usageTypeChart.update();
  } else {
    usageTypeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Water Usage by Type (liters)",
          data,
          borderColor: "#FF5733",
          backgroundColor: "rgba(255, 87, 51, 0.2)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Usage Type" } },
          y: { title: { display: true, text: "Water Usage (liters)" } }
        }
      }
    });
  }
}

  function analyzeLogs(logs) {
    if (!logs || logs.length === 0) {
      recommendations.set([{ tip: "No data available.", explanation: "Please log your water usage." }]);
      trendInfo.set({ message: "No trend data.", recommendation: "Log more entries." });
      return;
    }

    let total = logs.reduce((sum, log) => sum + parseFloat(log.amount), 0);
    totalUsage.set(total);
    let avgUsage = total / logs.length;
    
    const { recs, warningMessage, safeSignal } = generateDynamicRecommendations(avgUsage);
    recommendations.set(recs);
    trendInfo.set({
      message: warningMessage,
      recommendation: safeSignal
    });

    // Calculate total usage per type
    const usageTypes = logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + parseFloat(log.amount);
      return acc;
    }, {});

    // Get the maximum usage type and update the store
    const maxUsage = calculateMaximumUsageType(logs);
    maxUsageType.set(maxUsage.type);  

    if (logs.length >= 2) {
      let lastUsage = parseFloat(logs[logs.length - 1].amount);
      let prevUsage = parseFloat(logs[logs.length - 2].amount);
      let change = lastUsage - prevUsage;
      usageChange.set(change);
      trendInfo.set({
        message: change > 0 ? `Usage increased by ${change} liters.` : `Usage decreased by ${Math.abs(change)} liters.`,
        recommendation: change > 0 ? "Try reducing usage." : "Great job! Keep it up."
      });
    } else {
      trendInfo.set({ message: "Not enough data.", recommendation: "Log more entries." });
    }

    createTrendChart(logs);
    createUsageTypeChart(logs);
  }


  function calculateMaximumUsageType(logs) {
    const usageTotals = {};

    logs.forEach(log => {
        const type = log.usageType;
        if (!usageTotals[type]) {
            usageTotals[type] = 0;
        }
        usageTotals[type] += log.amount; 
    });

    let maxUsageType = { type: null, total: 0 };
    for (const type in usageTotals) {
        if (usageTotals[type] > maxUsageType.total) {
            maxUsageType = { type, total: usageTotals[type] };
        }
    }

    return maxUsageType;
}

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      user.set(userData);
      if (userData) {
        userProfile.set({ name: userData.displayName, photoURL: userData.photoURL });
        try {
          const logs = await getWaterUsageLogs(userData.uid);
          analyzeLogs(logs);
          logs.forEach(log => {
          console.log(log.usageType); // Check if this is correct
          const maxUsageType = calculateMaximumUsageType(logs);
          //maxUsageType.set(maxUsage.type);
console.log("Max usage type:", maxUsageType.type, "Total usage:", maxUsageType.total);


});

        } catch (error) {
          console.error("Error retrieving logs:", error);
        }
      }
    });
    return () => unsubscribe();
  });
</script>

<style>
  .dashboard-container {
    max-width: 1200px;
    margin: auto;
    padding: 30px;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
  }

  .profile img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
  }

  .profile h2 {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }

  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }

  .card {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .card h3 {
    font-size: 18px;
    color: #333;
  }

  .card p {
    font-size: 16px;
    font-weight: bold;
    color: #0077cc;
  }

  .charts-container {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    margin-top: 40px;
  }

  .chart-container {
    flex: 1;
    height: 400px;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .warning-message {
    padding: 20px;
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
    border-radius: 8px;
    margin-top: 20px;
  }

  .warning-message strong {
    font-size: 18px;
    color: #d9534f;
  }

  .warning-message em {
    font-size: 16px;
  }



</style>

<div class="dashboard-container">
  <div class="profile">
    <img src="{$userProfile.photoURL || 'https://via.placeholder.com/80'}" alt="Profile Picture">
    <h2>{$userProfile.name || 'User'}</h2>
  </div>

  <h1>Welcome to Your Dashboard</h1>

  <div class="card-container">
    <div class="card">
      <h3>Total Water Usage</h3>
      <p>{$totalUsage}</p>
    </div>
    <div class="card">
      <h3>Most Usage Type</h3>
      <p>{$maxUsageType}</p>
    </div>
    <div class="card">
      <h3>Usage Change</h3>
      <p>{$trendInfo.message}</p>
    </div>
    <div class="card">
      <h3>Usage Tip</h3>
      <p>{$trendInfo.recommendation}</p>
    </div>
  </div>

  <div class="charts-container">
    <div class="chart-container">
      <canvas id="trendChart"></canvas>
    </div>
    <div class="chart-container">
      <canvas id="usageTypeChart"></canvas>
    </div>
  </div>

  <div class="warning-message">
    <strong>{$trendInfo.message}</strong>
    <br><em>{$trendInfo.recommendation}</em>
  </div>
</div>
