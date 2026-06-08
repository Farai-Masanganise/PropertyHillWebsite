// ------------------------------
// 1. Get filters from URL
// ------------------------------
function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  return {
    type: params.get("type") || "res",    // com | res | ind
    deal: params.get("deal") || "sale"    // sale | lease
  };
}

// ------------------------------
// 2. Build JSON file path
// ------------------------------
function buildDataPath({ type, deal }) {
  const validTypes = ["res", "com", "ind"];
  const validDeals = ["sale", "lease"];

  type = validTypes.includes(type) ? type : "res";
  deal = validDeals.includes(deal) ? deal : "sale";


  return `../data/${type}/${deal}.json`;
}

// ------------------------------
// 3. Load current dataset
// ------------------------------
async function loadProperties(filters) {
  const path = buildDataPath(filters);

  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load data from ${path}`);
  }

  return await res.json();
}

// --------------------------------
// 4. Get 6 random properties
// --------------------------------
function getInitial(properties, limit = 6) {
  return [...properties]
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}
// --------------------------------
// 5. Encode for URLbuilding
// --------------------------------
function getTypeCode(type) {
  return {
    Commercial: "com",
    Residential: "res",
    Industrial: "ind"
  }[type];
}

function getDealCode(deal) {
  return {
    Sale: "sale",
    Lease: "lease"
  }[deal];
}
// ------------------------------
// 6. Render property cards
// ------------------------------
function renderProperties(properties) {
  const container = document.querySelector(".property-grid");

  container.innerHTML = properties.map(p => `
    <article class="property-card">
      <div class="card-image-wrap">
        <img src="${p.images?.[0] || '../assets/images/placeholder.jpg'}" alt="${p.title}">
        <div class="card-overlay">
          <a class="overlay-cta" href="property.html?id=${p.id}&type=${getTypeCode(p.type)}&deal=${getDealCode(p.deal)}">View Property</a>
        </div>
        <span class="card-badge ${p.deal === 'Lease' ? 'for-rent' : ''}">${p.deal === 'Lease' ? 'For Rent' : 'For Sale'}</span>
      </div>
      <div class="card-content">
        <div class="card-location">${p.location}</div>
        <h3>${p.title}</h3>
        <div class="card-price">$${Number(p.price).toLocaleString()}</div>
        <div class="card-stats">
          <span class="card-stat">${p.type}</span>
          <span class="card-stat">${p.category}</span>
        </div>
        <a href="property.html?id=${p.id}&type=${getTypeCode(p.type)}&deal=${getDealCode(p.deal)}">View Details</a>
      </div>
    </article>
  `).join("");
}


// ------------------------------
// 5. Init page
// ------------------------------
async function initListingsPage() {
  try{
    // initial load
    const filters = getFiltersFromURL();

    const properties = await loadProperties(filters);

    const firstProperties = getInitial(properties);

    // initial render
    renderProperties(firstProperties);
  } catch (err) {
    console.error(err);

    document.querySelector(".property-grid").innerHTML =
      "<p>Unable to load properties.</p>";
  }
}

// ------------------------------
// START
// ------------------------------
initListingsPage();

// ------------------------------
// User Filtering
// ------------------------------
// ------------------------------
// 1. Get filters from UI
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
// 2. Apply filters
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

async function filterListings() {

  // filter button
  document.querySelector("button").addEventListener("click", () => {
    const filters = getFilters();
    const filtered = applyFilters(allProperties, filters);
    renderProperties(filtered);
  });

}

//═══════════════════════════════════
//   SCROLL-REVEAL JS SNIPPET
//═══════════════════════════════════
  (function () {
    // Scroll-reveal for .reveal elements
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

    // View toggle (grid ↔ list)
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

    // Collapsible mobile filter
    const filterHeader = document.querySelector('.filter-header');
    const filterPanel  = document.getElementById('filters');
    if (filterHeader && filterPanel && window.innerWidth < 900) {
      filterHeader.style.cursor = 'pointer';
      filterHeader.addEventListener('click', () => {
        filterPanel.classList.toggle('collapsed');
      });
    }
  })();