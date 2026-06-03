// ------------------------------
// 1. Get filters from URL
// ------------------------------
function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  return {
    id: params.get("id"),
    type: params.get("type"),   // com | res | ind
    deal: params.get("deal")    // sale | lease
  };
}

// ------------------------------
// 2. Build JSON file path
// ------------------------------
function buildDataPath({ type, deal }) {
  return `../data/${type}/${deal}.json`;
}

// ------------------------------
// 3. Load dataset
// ------------------------------
async function loadProperties(filters) {
  const path = buildDataPath(filters);

  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load data from ${path}`);
  }

  return await res.json();
}

// ------------------------------
// 4. Find single property
// ------------------------------
function getPropertyById(properties, id) {
  return properties.find(p => String(p.id) === String(id));
}

// ------------------------------
// 5. Get related properties
// ------------------------------
function getRelated(properties, currentId, limit = 3) {
  return properties
    .filter(p => String(p.id) !== String(currentId))
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}

// ------------------------------
// 6. Render main property
// ------------------------------
function renderProperty(p) {
  if (!p) {
    document.body.innerHTML = "<h2>Property not found</h2>";
    return;
  }

  // Title
  document.querySelector("#property-summary h1").textContent = p.title;

  // Location
  document.querySelector("#property-summary p").textContent = p.location;

  // Price
  document.querySelector("#property-summary h2").textContent =
    `$${Number(p.price).toLocaleString()}`;

  // Type + category
  document.querySelectorAll("#property-summary p")[1].textContent =
    `${p.type} • ${p.category}`;

  // Description
  document.querySelector("#description p").textContent = p.description;

  // Quick info
  document.querySelector("#quick-info ul").innerHTML = `
    <li>Property Type: ${p.type}</li>
    <li>Category: ${p.category}</li>
    <li>Location: ${p.location}</li>
    <li>Land Size: ${p.landSize}</li>
    <li>Title Deed: ${p.titleDeed}</li>
    <li>Status: ${p.status}</li>
  `;

  // Features
  document.querySelector("#features ul").innerHTML = p.features
    .map(f => `<li>${f}</li>`)
    .join("");

  // Images
  const mainImg = document.querySelector(".main-image img");
  mainImg.src = p.images?.[0] || "";

  const thumbs = document.querySelector(".thumbnails");
  thumbs.innerHTML = (p.images || [])
    .map(img => `<img src="${img}" alt="Property image">`)
    .join("");

  // Agent
  const agent = p.agent || {};

  document.querySelector("#agent .agent-card").innerHTML = `
    <h3>${agent.name || "Agent"}</h3>
    <p>${agent.role || ""}</p>
    <p>Phone: ${agent.phone || ""}</p>
    <p>Email: ${agent.email || ""}</p>
    <div class="agent-actions">
      <button>WhatsApp</button>
      <button>Send Email</button>
    </div>
  `;
}

// ------------------------------
// 7. Render related properties
// ------------------------------
function renderRelated(properties, filters) {
  const container = document.querySelector(".related-grid");

  container.innerHTML = properties.map(p => `
    <article>
      <h3>${p.title}</h3>
      <p>${p.location}</p>
      <p>$${Number(p.price).toLocaleString()}</p>
      <a href="property.html?id=${p.id}&type=${filters.type}&deal=${filters.deal}">
        View Details
      </a>
    </article>
  `).join("");
}

// ------------------------------
// 8. Init page
// ------------------------------
async function initPropertyPage() {
  try {
    const filters = getFiltersFromURL();

    const properties = await loadProperties(filters);

    const property = getPropertyById(properties, filters.id);

    renderProperty(property);

    const related = getRelated(properties, filters.id);

    renderRelated(related, filters);

  } catch (error) {
    console.error(error);
    document.body.innerHTML = "<h2>Error loading property</h2>";
  }
}

// ------------------------------
// Start
// ------------------------------
initPropertyPage();