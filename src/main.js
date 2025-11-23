import songs from './data/songs.json';
import images from './data/images.json';
import apps from './data/apps.json';

// --- Mobile Menu Toggle ---
const menuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    const spans = menuToggle.querySelectorAll('span');
    if (mainNav.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
}

// --- Scroll Animations ---
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  observer.observe(section);
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
  sectionObserver.observe(section);
});

// --- Data Rendering Functions ---

function createMusicCard(song) {
  const hash = song.title.length % 3;
  const gradientClass = `placeholder-gradient-${hash + 1}`;
  return `
    <article class="music-card">
      <div class="music-thumbnail ${gradientClass}">
        <span class="music-icon">🎵</span>
      </div>
      <div class="music-info">
        <h3>${song.title}</h3>
        <p>${song.comment}</p>
        <a href="${song.url}" target="_blank" rel="noopener noreferrer" class="btn-suno">▶ Listen on SUNO</a>
      </div>
    </article>
  `;
}

function createImageCard(image) {
  return `
    <article class="image-card">
      <img src="${image.url}" alt="${image.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400?text=AI+Image'">
      <div class="image-overlay">
        <span class="tool-tag">${image.tool}</span>
        <h3>${image.title}</h3>
        <p>${image.comment}</p>
      </div>
    </article>
  `;
}

function createAppCard(app) {
  const techTags = app.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
  return `
    <div class="glass-card app-card">
      <h3>${app.title}</h3>
      <p class="app-desc">${app.description}</p>
      <div class="tech-stack">${techTags}</div>
      <a href="${app.url}" target="_blank" class="btn-app">View App</a>
    </div>
  `;
}

// --- Page Specific Rendering ---

// 1. Music Page
const musicList = document.getElementById('music-list');
if (musicList && songs.length > 0) {
  const sorted = [...songs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  musicList.innerHTML = sorted.map(createMusicCard).join('');
}

// 2. Images Page
const imagesList = document.getElementById('images-list');
if (imagesList && images.length > 0) {
  const sorted = [...images].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  imagesList.innerHTML = sorted.map(createImageCard).join('');
}

// 3. Apps Page
const appsList = document.getElementById('apps-list');
if (appsList && apps.length > 0) {
  const sorted = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  appsList.innerHTML = sorted.map(createAppCard).join('');
}

// 4. Home Page (Latest Works)
const latestWorksGrid = document.getElementById('latest-works-grid');
if (latestWorksGrid) {
  // Get latest 1 from each category
  const latestMusic = [...songs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const latestImage = [...images].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const latestApp = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  let html = '';
  if (latestMusic) html += createMusicCard(latestMusic);
  if (latestImage) html += createImageCard(latestImage);
  if (latestApp) html += createAppCard(latestApp);

  latestWorksGrid.innerHTML = html;
}
