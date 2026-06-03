// ------------------------------
// 1. Load ALL properties
// ------------------------------
async function loadAllProperties() {
  const files = [
    "data/commercial/sale.json",
    "data/commercial/lease.json",
    "data/residential/sale.json",
    "data/residential/lease.json",
    "data/industrial/sale.json",
    "data/industrial/lease.json"
  ];

  const responses = await Promise.all(files.map(f => fetch(f)));
  const jsons = await Promise.all(responses.map(r => r.json()));

  return jsons.flat();
}


// ------------------------------
// 2. Get filters from UI
// ------------------------------
function getFilters() {
  const search = document.querySelector("#search").value.toLowerCase();

  const type = [...document.querySelectorAll('input[value="commercial"], input[value="residential"], input[value="industrial"]')]
    .filter(i => i.checked)
    .map(i => i.value);

  const deal = [...document.querySelectorAll('input[value="sales"], input[value="leasing"]')]
    .filter(i => i.checked)
    .map(i => i.value);

  const category = [...document.querySelectorAll('input[value="land"], input[value="built"]')]
    .filter(i => i.checked)
    .map(i => i.value);

  const min = document.querySelectorAll("input[type='number']")[0].value;
  const max = document.querySelectorAll("input[type='number']")[1].value;

  return { search, type, deal, category, min, max };
}


// ------------------------------
// 3. Apply filters
// ------------------------------
function applyFilters(properties, filters) {
  return properties.filter(p => {
    const matchesSearch =
      !filters.search ||
      p.title.toLowerCase().includes(filters.search) ||
      p.location.toLowerCase().includes(filters.search);

    const matchesType =
      filters.type.length === 0 || filters.type.includes(p.type);

    const matchesDeal =
      filters.deal.length === 0 || filters.deal.includes(p.deal);

    const matchesCategory =
      filters.category.length === 0 || filters.category.includes(p.category);

    const matchesPrice =
      (!filters.min || p.price >= Number(filters.min)) &&
      (!filters.max || p.price <= Number(filters.max));

    return (
      matchesSearch &&
      matchesType &&
      matchesDeal &&
      matchesCategory &&
      matchesPrice
    );
  });
}


// ------------------------------
// 4. Render property cards
// ------------------------------
function renderProperties(properties) {
  const container = document.querySelector(".property-grid");

  container.innerHTML = properties.map(p => `
    <article class="property-card">

      <img src="${p.images?.[0] || 'assets/images/placeholder.jpg'}" alt="Property">

      <div class="card-content">

        <h3>${p.title}</h3>

        <p>${p.location}</p>

        <p>$${Number(p.price).toLocaleString()}</p>

        <p>${p.type} • ${p.category}</p>

        <a href="property.html?id=${p.id}&type=${p.type}&deal=${p.deal}">
          View Details
        </a>

      </div>

    </article>
  `).join("");
}


// ------------------------------
// 5. Init page
// ------------------------------
async function initListingsPage() {
  const allProperties = await loadAllProperties();

  // initial render
  renderProperties(allProperties);

  // filter button
  document.querySelector("button").addEventListener("click", () => {
    const filters = getFilters();
    const filtered = applyFilters(allProperties, filters);
    renderProperties(filtered);
  });
}


// ------------------------------
// START
// ------------------------------
initListingsPage();