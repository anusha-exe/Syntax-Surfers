<script>
  // Adjust the import path according to your project structure.
  import Insights from '../../components/Insights.svelte';
</script>

<style>
  .page-container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 2rem;
    background: #f9f9f9;
  }
  
  .header {
    text-align: center;
    margin-bottom: 1rem;
    color: #333;
    font-size: 2rem;
    font-weight: 600;
  }
  
  .card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 1rem;
  }
  
  .chart-container {
    height: 500px;
    position: relative;
  }
  
  .description {
    text-align: center;
    font-size: 1rem;
    color: #666;
    margin-top: 1rem;
  }
</style>

<div class="page-container">
  <h1 class="header">Water Consumption Insights</h1>
  
  <div class="card">
    <div class="chart-container">
      <!-- Insights component renders the chart here -->
      <Insights />
    </div>
  </div>
  
  <p class="description">
    Explore detailed insights into your water usage. Visualized data can help you identify trends and areas to improve water conservation.
  </p>
</div>