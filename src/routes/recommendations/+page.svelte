<script>
  import Recommendations from "../../components/Recommendations.svelte";
</script>

<div class="recommendations-page">
  <h1>Recommendations</h1>
  <Recommendations />
</div>

<style>
  .recommendations-page {
    max-width: 1000px;
    margin: 40px auto;
    padding: 20px;
    background: linear-gradient(135deg, #ffffff, #f1faff);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    font-family: 'Poppins', sans-serif;
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 20px;
  }
</style>