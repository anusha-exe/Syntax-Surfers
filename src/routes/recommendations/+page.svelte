<script>
  import "../../lib/styles/recommendations.css";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { auth, getWaterUsageLogs } from "$lib/firebase";
  import { onAuthStateChanged } from "firebase/auth";
  import Chart from "chart.js/auto";
  import gsap from "gsap";

  let user = writable(null);
  let recommendations = writable([]);
  let trendInfo = writable({ message: "", recommendation: "" });
  let trendChart;

  // Generate dynamic recommendations with tip and explanation
  function generateDynamicRecommendations(avgUsage, avgPerPerson, efficiency, waterSource, activityLevel, usageType) {
    const recs = [];
    if (avgUsage > 500) {
      recs.push({
        tip: "Your total water usage is very high.",
        explanation: `With an average usage of ${avgUsage.toFixed(2)} liters per entry, you should consider drastic conservation measures.`
      });
    } else if (avgUsage > 300) {
      recs.push({
        tip: "Your water usage is above average.",
        explanation: `An average of ${avgUsage.toFixed(2)} liters per entry suggests there is significant potential for savings.`
      });
    } else if (avgUsage > 150) {
      recs.push({
        tip: "Your water usage is moderate.",
        explanation: `At ${avgUsage.toFixed(2)} liters per entry, small adjustments could improve your efficiency further.`
      });
    } else {
      recs.push({
        tip: "Excellent water efficiency!",
        explanation: `An average of ${avgUsage.toFixed(2)} liters per entry shows efficient usage. Keep up the good work!`
      });
    }
    if (avgPerPerson > 50) {
      recs.push({
        tip: "High per-person usage detected.",
        explanation: "Your water usage per person is high. Consider reducing shower durations or using water-saving fixtures."
      });
    }
    if (usageType === "shower" && avgUsage > 50) {
      recs.push({
        tip: "Shorten your showers.",
        explanation: "Long showers use a lot of water. Try to reduce your shower time to save water."
      });
    } else if (usageType === "toilet" && avgUsage > 20) {
      recs.push({
        tip: "Inspect your toilet for leaks.",
        explanation: "A leaking toilet can waste a significant amount of water. Make sure it's working properly."
      });
    }
    if (efficiency === "standard") {
      recs.push({
        tip: "Upgrade your appliances.",
        explanation: "Standard appliances typically consume more water. Upgrading to low-flow or high-efficiency appliances can help reduce usage."
      });
    } else if (efficiency === "low-flow") {
      recs.push({
        tip: "Maintain your water-efficient appliances.",
        explanation: "Your use of low-flow appliances is commendable. Keep them well-maintained to ensure continued savings."
      });
    }
    if (waterSource === "borewell" || waterSource === "tanker") {
      recs.push({
        tip: "Extra conservation measures needed.",
        explanation: "Non-municipal water sources may be limited. Implement additional water-saving strategies to secure your supply."
      });
    }
    if (activityLevel === "high") {
      recs.push({
        tip: "Monitor your water usage closely.",
        explanation: "High daily activity can lead to increased water usage. Ensure you’re not wasting water despite higher needs."
      });
    }
    recs.push({
      tip: "Regular monitoring is key.",
      explanation: "Continually track your water usage to identify trends and areas for improvement."
    });
    return recs;
  }

  function createTrendChart(logs) {
    const ctx = document.getElementById("trendChart").getContext("2d");

    const labels = logs.map((log, index) => {
  if (log.timestamp && log.timestamp.seconds !== undefined) {
    // Convert Firestore timestamp to a JavaScript Date object
    const date = new Date(log.timestamp.seconds * 1000 + log.timestamp.nanoseconds / 1_000_000);
    return date.toLocaleDateString();
  } else {
    return `Entry ${index + 1}`; // Fallback label
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
          scales: {
            x: {
              display: true,
              title: { display: true, text: "Date" }
            },
            y: {
              display: true,
              title: { display: true, text: "Water Usage (liters)" }
            }
          }
        }
      });
    }
  }

  function analyzeLogs(logs) {
    if (!logs || logs.length === 0) {
      recommendations.set([{
        tip: "No data available.",
        explanation: "Please log your water usage to receive personalized recommendations."
      }]);
      trendInfo.set({
        message: "No trend data available.",
        recommendation: "Please log your water usage to enable trend analysis."
      });
      return;
    }
    
    let totalUsage = 0;
    let totalHousehold = 0;
    let householdCount = 0;
    let efficiency = "";
    let waterSource = "";
    let activityLevel = "";
    let usageType = "";

    logs.forEach(log => {
      totalUsage += parseFloat(log.amount);
      if (log.householdSize) {
        totalHousehold += parseFloat(log.householdSize);
        householdCount++;
      }
      if (!efficiency && log.applianceEfficiency) efficiency = log.applianceEfficiency;
      if (!waterSource && log.waterSource) waterSource = log.waterSource;
      if (!activityLevel && log.activityLevel) activityLevel = log.activityLevel;
      if (!usageType && log.usageType) usageType = log.usageType;
    });

    const avgUsage = totalUsage / logs.length;
    const avgPerPerson = householdCount > 0 ? totalUsage / totalHousehold : avgUsage;

    const recs = generateDynamicRecommendations(avgUsage, avgPerPerson, efficiency, waterSource, activityLevel, usageType);
    recommendations.set(recs);

    if (logs.length >= 2) {
      const lastRecord = logs[logs.length - 1];
      const previousRecord = logs[logs.length - 2];
      const lastUsage = parseFloat(lastRecord.amount);
      const prevUsage = parseFloat(previousRecord.amount);
      const change = lastUsage - prevUsage;
      const absChange = Math.abs(change).toFixed(2);

      if (change > 0) {
        trendInfo.set({
          message: `Your recent water usage has increased by ${absChange} liters.`,
          recommendation: "Consider reviewing your habits to identify factors that may have contributed to the increase."
        });
      } else if (change < 0) {
        trendInfo.set({
          message: `Your recent water usage has decreased by ${absChange} liters.`,
          recommendation: "Great job! Keep up the water-saving efforts and continue monitoring your usage."
        });
      } else {
        trendInfo.set({
          message: "Your recent water usage is consistent.",
          recommendation: "Maintain your current habits, and continue to track your usage over time."
        });
      }
    } else {
      trendInfo.set({
        message: "Not enough data to determine a trend.",
        recommendation: "Please log more entries to compare your recent water usage."
      });
    }
    createTrendChart(logs);
  }

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      user.set(userData);
      if (userData) {
        try {
          const logs = await getWaterUsageLogs(userData.uid);
          analyzeLogs(logs);
          // Animate tip cards after data is loaded
          gsap.from(".tip-card", {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.out"
          });
        } catch (error) {
          recommendations.set([{
            tip: "Error retrieving data.",
            explanation: "We couldn't fetch your water usage logs. Please try again later."
          }]);
          trendInfo.set({
            message: "Error retrieving trend data.",
            recommendation: ""
          });
        }
      } else {
        recommendations.set([{
          tip: "Not logged in.",
          explanation: "Please log in to view your water usage recommendations."
        }]);
        trendInfo.set({
          message: "User not logged in.",
          recommendation: "Please log in to view trend analysis."
        });
      }
    });
    return () => unsubscribe();
  });
</script>

<div class="recommendations-page">
  <h1>Recommendations</h1>
  {#if $recommendations.length > 0}
    <div class="tips-grid">
      {#each $recommendations as rec}
        <div class="tip-card">
          <p class="tip">{rec.tip}</p>
          <p class="explanation">{rec.explanation}</p>
        </div>
      {/each}
    </div>
  {:else}
    <p>Loading recommendations...</p>
  {/if}

  <!-- Trend Analysis and Charts -->
  <section class="trend-section">
    <h2>Recent Usage Trend</h2>
    <canvas id="trendChart" width="400" height="200"></canvas>
    <p class="trend-message">{$trendInfo.message}</p>
    <p class="trend-recommendation">{$trendInfo.recommendation}</p>
  </section>
</div>

<style>
  
  .recommendations-page {
    max-width: 1500px;
    margin: 40px auto;
    padding: 40px;
    background: #f5f8fd;
    border-radius: 16px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    font-family: 'Roboto', sans-serif;
    color: #333;
  }
  
  
  .recommendations-page h1 {
    font-size: 2.4rem;
    color: #3a3a3a;
    font-weight: 600;
    margin-bottom: 30px;
    text-align: center;
  }
  
 
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  
 
  .tip-card {
    padding: 20px;
    background-color: #fff;
    border: 2px solid #f0f0f0;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
  }

  .tip-card:hover {
    transform: translateY(-10px);
  }
  
  .tip {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .explanation {
    font-size: 1rem;
    color: #555;
  }
  
  /* Trend Analysis Section */
  .trend-section {
    padding-top: 40px;
    text-align: center;
  }
  
  .trend-section canvas {
    margin-top: 20px;
  }
  
  .trend-message {
    font-size: 1.1rem;
    font-weight: 500;
    margin-top: 20px;
  }
  
  .trend-recommendation {
    font-size: 1rem;
    color: #555;
    margin-top: 10px;
  }
</style>
