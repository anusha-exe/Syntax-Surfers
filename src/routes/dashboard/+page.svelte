<!-- src/routes/dashboard/+page.svelte -->
<script>
  import { goto } from "$app/navigation";
</script>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: #f4f4f4;
  }

  h1 {
    text-align: center;
    margin-top: 40px;
    color: #333;
  }

  .dashboard-container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 30px;
    text-align: center;
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .card h2 {
    margin-bottom: 10px;
    color: #0056b3;
  }

  .card p {
    color: #666;
    font-size: 0.9rem;
  }
</style>

<h1>Dashboard</h1>
<div class="dashboard-container">
  <div class="card" on:click={() => goto('/auth')}>
    <h2>Authentication</h2>
    <p>Manage user login and sign up.</p>
  </div>
  <div class="card" on:click={() => goto('/data-input')}>
    <h2>Data Input</h2>
    <p>Enter and manage your water consumption data.</p>
  </div>
  <div class="card" on:click={() => goto('/insights')}>
    <h2>Insights</h2>
    <p>View analytical insights on water consumption.</p>
  </div>
  <div class="card" on:click={() => goto('/recommendations')}>
    <h2>Recommendations</h2>
    <p>Get actionable recommendations for improvement.</p>
  </div>
</div>