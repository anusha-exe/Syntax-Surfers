<script>
  let tips = [
    "💧 Turn off the tap while brushing to save up to 10 liters per minute.",
    "🔧 Fixing a small leak can save hundreds of liters per day.",
    "🚿 Use a bucket instead of a shower to reduce water usage by 50%.",
    "🌱 Water your plants early in the morning or late in the evening to minimize evaporation.",
    "🧺 Run your washing machine and dishwasher only with full loads to conserve water."
  ];
</script>

<div class="tips-wrapper">
  <h2>💡 Water-Saving Tips 💡</h2>
  <div class="tips-grid">
    {#each tips as tip}
      <div class="tip-card">
        <p>{tip}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  /* Overall Wrapper */
  .tips-wrapper {
    max-width: 960px;
    margin: 2rem auto;
    padding: 2rem;
    background: linear-gradient(145deg, #f5f7fa, #c3cfe2);
    border-radius: 20px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    text-align: center;
    animation: fadeIn 1s ease-out;
  }

  .tips-wrapper h2 {
    font-family: 'Poppins', sans-serif;
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.1);
  }

  /* Grid Layout */
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  /* Card Styling */
  .tip-card {
    background: #fff;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  /* Subtle overlay effect on hover */
  .tip-card:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(255,255,255,0.25), rgba(0,0,0,0));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .tip-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  .tip-card:hover:before {
    opacity: 1;
  }

  .tip-card p {
    font-family: 'Roboto', sans-serif;
    font-size: 1.1rem;
    color: #34495e;
    line-height: 1.5;
    margin: 0;
  }

  /* Fade-in Animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>