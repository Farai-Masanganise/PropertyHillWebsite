// ==============================
// STATE
// ==============================
let currentProperties = [];

const TYPE_MAP = {
  commercial: "com",
  residential: "res",
  industrial: "ind"
};

const DEAL_MAP = {
  sales: "sale",
  leasing: "lease"
};


// ==============================
// URL → INITIAL FILTERS
// ==============================
function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  return {
    type: params.get("type") ? params.get("type").split(",") : ["res"],
    deal: params.get("deal") ? params.get("deal").split(",") : ["sale"]
  };
}


// ==============================
// BUILD FILE LIST (CARTESIAN)
// ==============================
function buildFileList(types, deals) {
  const files = [];

  types.forEach(t => {
    deals.forEach(d => {
      files.push(`../data/${t}/${d}.json`);
    });
  });

  return files;
}


// ==============================
// LOAD MULTIPLE DATASETS
// ==============================
async function loadMultipleDatasets(types, deals) {
  const files = buildFileList(types, deals);

  const results = await Promise.all(
    files.map(f =>
      fetch(f)
        .then(r => {
          if (!r.ok) throw new Error(`Failed: ${f}`);
          return r.json();
        })
    )
  );

  currentProperties = results.flat();

  renderProperties(getInitial(currentProperties));
}


// ==============================
// INIT PAGE
// ==============================
async function initListingsPage() {
  try {
    const url = getFiltersFromURL();

    let types = url.type;
    let deals = url.deal;

    // enforce minimum 1 selection
    if (!types.length) types = ["res"];
    if (!deals.length) deals = ["sale"];

    await loadMultipleDatasets(types, deals);

    bindDatasetControls();

  } catch (err) {
    console.error(err);
    document.querySelector(".property-grid").innerHTML =
      "<p>Unable to load properties.</p>";
  }
}

initListingsPage();


// ==============================
// RANDOM INITIAL ITEMS
// ==============================
function getInitial(properties, limit = 6) {
  return [...properties]
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}


// ==============================
// GET UI FILTERS (LOCAL ONLY)
// ==============================
function getFilters() {
  const search = document.querySelector("#search").value.toLowerCase();

  const category = [...document.querySelectorAll('input[value="land"], input[value="built"]')]
    .filter(i => i.checked)
    .map(i => i.value);

  const min = document.querySelectorAll("input[type='number']")[0].value;
  const max = document.querySelectorAll("input[type='number']")[1].value;

  return {
    search,
    category,
    min,
    max
  };
}


// ==============================
// APPLY FILTERS
// ==============================
function applyFilters(properties, filters) {
  return properties.filter(p => {
    const matchesSearch =
      !filters.search ||
      p.title.toLowerCase().includes(filters.search) ||
      p.location.toLowerCase().includes(filters.search);

    const matchesCategory =
      filters.category.length === 0 ||
      filters.category.includes(p.category);

    const matchesPrice =
      (!filters.min || p.price >= Number(filters.min)) &&
      (!filters.max || p.price <= Number(filters.max));

    return matchesSearch && matchesCategory && matchesPrice;
  });
}


// ==============================
// APPLY BUTTON
// ==============================
document.querySelector(".filter-actions button")
  .addEventListener("click", async () => {
    const filters = getFilters();

    const filtered = applyFilters(currentProperties, filters);

    renderProperties(filtered);
  });


// ==============================
// TYPE + DEAL CONTROLS (MULTI)
// ==============================
function bindDatasetControls() {
  const typeInputs = document.querySelectorAll('input[name="type"]');
  const dealInputs = document.querySelectorAll('input[name="deal"]');

  const reload = async () => {
    let types = [...typeInputs]
      .filter(i => i.checked)
      .map(i => TYPE_MAP[i.value]);

    let deals = [...dealInputs]
      .filter(i => i.checked)
      .map(i => DEAL_MAP[i.value]);

    // enforce at least 1
    if (!types.length) types = ["res"];
    if (!deals.length) deals = ["sale"];

    await loadMultipleDatasets(types, deals);
  };

  typeInputs.forEach(i => i.addEventListener("change", reload));
  dealInputs.forEach(i => i.addEventListener("change", reload));
}


// ==============================
// RENDER
// ==============================
function renderProperties(properties) {
  const container = document.querySelector(".property-grid");

  container.innerHTML = properties.map(p => `
    <article class="property-card">
      <div class="card-image-wrap">
        <img src="${p.images?.[0] || '../assets/images/placeholder.jpg'}" alt="${p.title}">
        <div class="card-overlay">
          <a class="overlay-cta"
             href="property.html?id=${p.id}">
             View Property
          </a>
        </div>

        <span class="card-badge ${p.deal === 'Lease' ? 'for-rent' : ''}">
          ${p.deal === 'Lease' ? 'For Rent' : 'For Sale'}
        </span>
      </div>

      <div class="card-content">
        <div class="card-location">${p.location}</div>
        <h3>${p.title}</h3>
        <div class="card-price">$${Number(p.price).toLocaleString()}</div>

        <div class="card-stats">
          <span class="card-stat">${p.type}</span>
          <span class="card-stat">${p.category}</span>
        </div>

        <a href="property.html?id=${p.id}">
          View Details
        </a>
      </div>
    </article>
  `).join("");
}


// ==============================
// UI HELPERS
// ==============================
(function () {
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const gridBtn = document.querySelector('[data-view="grid"]');
  const listBtn = document.querySelector('[data-view="list"]');
  const panel   = document.getElementById('properties');

  if (gridBtn && listBtn && panel) {
    gridBtn.addEventListener('click', () => {
      panel.classList.remove('list-view');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    });

    listBtn.addEventListener('click', () => {
      panel.classList.add('list-view');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    });
  }

  const filterHeader = document.querySelector('.filter-header');
  const filterPanel  = document.getElementById('filters');

  if (filterHeader && filterPanel && window.innerWidth < 900) {
    filterHeader.style.cursor = 'pointer';

    filterHeader.addEventListener('click', () => {
      filterPanel.classList.toggle('collapsed');
    });
  }
})();