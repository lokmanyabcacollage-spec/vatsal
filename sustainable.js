const cloudRates = {
  aws: {
    name: "AWS",
    storage: 0.023,
    compute: 0.048,
    transfer: 0.09,
    scalability: 9.5,
    performance: 9.2
  },
  azure: {
    name: "Azure",
    storage: 0.021,
    compute: 0.05,
    transfer: 0.087,
    scalability: 9.2,
    performance: 9.0
  },
  gcp: {
    name: "Google Cloud",
    storage: 0.02,
    compute: 0.046,
    transfer: 0.085,
    scalability: 9.0,
    performance: 8.9
  }
};

const profileMultipliers = {
  balanced: { storage: 1, compute: 1, transfer: 1 },
  storageHeavy: { storage: 1.28, compute: 0.88, transfer: 0.95 },
  computeHeavy: { storage: 0.86, compute: 1.34, transfer: 0.94 },
  deliveryHeavy: { storage: 0.92, compute: 0.95, transfer: 1.35 }
};

function toUSD(value) {
  return `$${value.toFixed(2)}`;
}

function scorePricing(monthlyCost) {
  if (monthlyCost < 120) return 9.4;
  if (monthlyCost < 200) return 8.5;
  if (monthlyCost < 300) return 7.6;
  if (monthlyCost < 420) return 6.8;
  return 5.9;
}

function calculateCloudCosts() {
  const storageGb = Number(document.getElementById("storageGb").value) || 0;
  const computeHours = Number(document.getElementById("computeHours").value) || 0;
  const transferGb = Number(document.getElementById("transferGb").value) || 0;
  const profile = document.getElementById("trafficProfile").value;
  const multiplier = profileMultipliers[profile];

  const cards = document.getElementById("costCards");
  const comparisonBody = document.getElementById("comparisonBody");
  cards.innerHTML = "";
  comparisonBody.innerHTML = "";

  const computedRows = [];
  Object.values(cloudRates).forEach((cloud) => {
    const storageCost = storageGb * cloud.storage * multiplier.storage;
    const computeCost = computeHours * cloud.compute * multiplier.compute;
    const transferCost = transferGb * cloud.transfer * multiplier.transfer;
    const monthly = storageCost + computeCost + transferCost;
    const yearly = monthly * 12;
    const pricingScore = scorePricing(monthly);

    computedRows.push({
      cloud: cloud.name,
      monthly,
      yearly,
      storageCost,
      computeCost,
      transferCost,
      pricingScore,
      scalability: cloud.scalability,
      performance: cloud.performance
    });
  });

  computedRows.sort((a, b) => a.monthly - b.monthly);

  computedRows.forEach((entry, index) => {
    const winnerPill = index === 0 ? `<span class="pill good">Lowest Cost</span>` : `<span class="pill warn">+${toUSD(entry.monthly - computedRows[0].monthly)}</span>`;

    cards.insertAdjacentHTML("beforeend", `
      <article class="cost-card">
        <h3>${entry.cloud}</h3>
        <div class="metric"><span>Monthly Total</span><strong>${toUSD(entry.monthly)}</strong></div>
        <div class="metric"><span>Yearly Total</span><strong>${toUSD(entry.yearly)}</strong></div>
        <div class="metric"><span>Storage Cost</span><strong>${toUSD(entry.storageCost)}</strong></div>
        <div class="metric"><span>Compute Cost</span><strong>${toUSD(entry.computeCost)}</strong></div>
        <div class="metric"><span>Data Transfer Cost</span><strong>${toUSD(entry.transferCost)}</strong></div>
        ${winnerPill}
      </article>
    `);

    const bestFor = entry.performance > 9.05 ? "High throughput apps" : entry.pricingScore > 8.8 ? "Budget-first websites" : "General production apps";
    comparisonBody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${entry.cloud}</td>
        <td>${toUSD(entry.monthly)}</td>
        <td>${entry.pricingScore.toFixed(1)}</td>
        <td>${entry.scalability.toFixed(1)}</td>
        <td>${entry.performance.toFixed(1)}</td>
        <td>${bestFor}</td>
      </tr>
    `);
  });

  updateComparisonSummary(computedRows);
}

function updateComparisonSummary(rows) {
  if (!rows.length) return;

  const bestCost = rows[0];
  const bestScale = [...rows].sort((a, b) => b.scalability - a.scalability)[0];
  const bestPerformance = [...rows].sort((a, b) => b.performance - a.performance)[0];
  const bestBalanced = [...rows].sort((a, b) => {
    const aScore = (a.pricingScore + a.scalability + a.performance) / 3;
    const bScore = (b.pricingScore + b.scalability + b.performance) / 3;
    return bScore - aScore;
  })[0];

  document.getElementById("comparisonSummary").innerHTML = `
    <strong>Comparison Insights:</strong>
    Best cost option is <strong>${bestCost.cloud}</strong> at <strong>${toUSD(bestCost.monthly)}/month</strong>.
    Best scalability is <strong>${bestScale.cloud}</strong> (${bestScale.scalability.toFixed(1)}/10),
    top performance is <strong>${bestPerformance.cloud}</strong> (${bestPerformance.performance.toFixed(1)}/10),
    and overall balanced choice is <strong>${bestBalanced.cloud}</strong>.
  `;
}

function analyzeTokens() {
  const inputTokens = Number(document.getElementById("inputTokens").value) || 0;
  const outputTokens = Number(document.getElementById("outputTokens").value) || 0;
  const efficiency = document.getElementById("modelEfficiency").value;
  const reductionGoal = Number(document.getElementById("reductionGoal").value) || 0;
  const totalTokens = inputTokens + outputTokens;

  const baseWhPer1k = {
    high: 0.28,
    medium: 0.44,
    low: 0.7
  };

  const energyWh = (totalTokens / 1000) * baseWhPer1k[efficiency];
  const reductionFactor = Math.max(0, 1 - reductionGoal / 100);
  const optimizedEnergyWh = energyWh * reductionFactor;
  const savedWh = energyWh - optimizedEnergyWh;
  const tokenStatus = totalTokens < 2_000_000 ? "Efficient Footprint" : totalTokens < 6_000_000 ? "Moderate Footprint" : "High Footprint";

  document.getElementById("tokenResults").innerHTML = `
    <p><strong>Total monthly tokens:</strong> ${totalTokens.toLocaleString()}</p>
    <p><strong>Current AI energy estimate:</strong> ${energyWh.toFixed(1)} Wh / month</p>
    <p><strong>With ${reductionGoal}% optimization:</strong> ${optimizedEnergyWh.toFixed(1)} Wh / month</p>
    <p><strong>Potential energy saved:</strong> ${savedWh.toFixed(1)} Wh / month</p>
    <p><strong>Sustainability status:</strong> ${tokenStatus}</p>
  `;

  const tips = [
    "Use retrieval or caching to avoid sending repeated context every request.",
    "Prefer right-sized models and route simple tasks to smaller models.",
    "Cap max output tokens and use concise system prompts.",
    "Batch similar requests to reduce repeated model warm-up and overhead.",
    "Track tokens per feature and set token budgets in CI and review."
  ];

  const list = document.getElementById("tipsList");
  list.innerHTML = tips.map((tip) => `<article class="tip-item">${tip}</article>`).join("");
}

document.getElementById("calculateBtn").addEventListener("click", calculateCloudCosts);
document.getElementById("tokenBtn").addEventListener("click", analyzeTokens);

calculateCloudCosts();
analyzeTokens();
