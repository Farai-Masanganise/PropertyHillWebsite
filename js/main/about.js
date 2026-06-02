const cards = document.querySelectorAll('.feature-card');
const overlay = document.getElementById('featureOverlay');
const title = document.getElementById('overlayTitle');
const text = document.getElementById('overlayText');
const closeBtn = document.getElementById('closeOverlay');

cards.forEach(card => {
    card.addEventListener('click', () => {
        title.textContent = card.dataset.title;
        text.textContent = card.dataset.text;

        overlay.classList.add('active');
    });
});

closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
});

// close on background click
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.classList.remove('active');
    }
});