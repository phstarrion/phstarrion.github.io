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

function createCard(item, type) {
  let content = '';
  let link = '';
  let label = '';

  if (type === 'music') {
    const hash = item.title.length % 3;
    const gradientClass = `placeholder-gradient-${hash + 1}`;
    link = './music.html';
    label = 'Music';
    content = `
      <div class="music-thumbnail ${gradientClass}">
        <span class="music-icon">🎵</span>
      </div>
      <div class="music-info">
        <h3>${item.title}</h3>
        <p>${item.comment}</p>
        <span class="btn-suno">▶ Listen</span>
      </div>
    `;
  } else if (type === 'image') {
    link = './images.html';
    label = 'Image';
    content = `
      <div class="image-card-inner">
        <img src="${item.url}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400?text=AI+Image'">
        <div class="image-overlay">
          <span class="tool-tag">${item.tool}</span>
          <h3>${item.title}</h3>
          <p>${item.comment}</p>
        </div>
      </div>
    `;
  } else if (type === 'app') {
    link = './apps.html';
    label = 'App';
    const techTags = item.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
    content = `
      <div class="glass-card app-card">
        <h3>${item.title}</h3>
        <p class="app-desc">${item.description}</p>
        <div class="tech-stack">${techTags}</div>
        <span class="btn-app">View App</span>
      </div>
    `;
  }

  // Wrap in anchor for Latest Works, or div for specific pages if needed
  // For simplicity, we'll make the whole card clickable or just return the inner HTML
  // But user asked for "link to the detail page" in Latest Works.

  return `
    <a href="${link}" class="card-item ${type}-item">
      ${content}
    </a>
  `;
}

// Specific card creators for category pages (reusing logic where possible or keeping distinct)
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

// --- Fetch and Render Data ---

async function initData() {
  try {
    const [songsRes, imagesRes, appsRes] = await Promise.all([
      fetch('./data/songs.json'),
      fetch('./data/images.json'),
      fetch('./data/apps.json')
    ]);

    if (!songsRes.ok || !imagesRes.ok || !appsRes.ok) {
      throw new Error('Failed to fetch data');
    }

    const songs = await songsRes.json();
    const images = await imagesRes.json();
    const apps = await appsRes.json();

    renderLatestWorks(songs, images, apps);
    renderCategoryPages(songs, images, apps);

  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function renderLatestWorks(songs, images, apps) {
  const latestWorksContainer = document.getElementById('latest-works');
  if (!latestWorksContainer) return;

  // Combine all items with type and date
  const allItems = [
    ...songs.map(item => ({ ...item, type: 'music', date: new Date(item.createdAt) })),
    ...images.map(item => ({ ...item, type: 'image', date: new Date(item.createdAt) })),
    ...apps.map(item => ({ ...item, type: 'app', date: new Date(item.createdAt) }))
  ];

  // Sort by date desc
  allItems.sort((a, b) => b.date - a.date);

  // Take top 3 (or more if desired, user said "Latest Works" list)
  // Let's show top 6 for a nice grid
  const topItems = allItems.slice(0, 6);

  latestWorksContainer.innerHTML = topItems.map(item => {
    // We can reuse specific card creators or make a generic one. 
    // For Latest Works, we want to link to the detail page.
    // Let's use a simplified card style for the home page.

    let thumbnail = '';
    let link = '';
    let categoryLabel = '';

    if (item.type === 'music') {
      const hash = item.title.length % 3;
      thumbnail = `<div class="music-thumbnail placeholder-gradient-${hash + 1}" style="aspect-ratio: 16/9;"><span class="music-icon">🎵</span></div>`;
      link = './music.html';
      categoryLabel = 'Music';
    } else if (item.type === 'image') {
      thumbnail = `<div style="aspect-ratio: 16/9; overflow: hidden;"><img src="${item.url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/400x400?text=AI+Image'"></div>`;
      link = './images.html';
      categoryLabel = 'Image';
    } else if (item.type === 'app') {
      thumbnail = `<div class="glass-card" style="aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05);"><span>📱 App</span></div>`;
      link = './apps.html';
      categoryLabel = 'App';
    }

    return `
      <a href="${link}" class="glass-card" style="display: block; text-decoration: none; color: inherit; padding: 0; overflow: hidden;">
        ${thumbnail}
        <div style="padding: 1rem;">
            <span style="font-size: 0.7rem; text-transform: uppercase; color: var(--primary-color); letter-spacing: 1px;">${categoryLabel}</span>
            <h3 style="margin: 0.5rem 0; font-size: 1.1rem;">${item.title}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.comment || item.description}</p>
        </div>
      </a>
    `;
  }).join('');
}

function renderCategoryPages(songs, images, apps) {
  // 1. Music Page
  const musicGrid = document.getElementById('music-grid');
  if (musicGrid && songs.length > 0) {
    const sorted = [...songs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    musicGrid.innerHTML = sorted.map(createMusicCard).join('');
  }

  // 2. Images Page
  const imagesGrid = document.getElementById('images-grid');
  if (imagesGrid && images.length > 0) {
    const sorted = [...images].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    imagesGrid.innerHTML = sorted.map(createImageCard).join('');
  }

  // 3. Apps Page
  const appsGrid = document.getElementById('apps-grid');
  if (appsGrid && apps.length > 0) {
    const sorted = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    appsGrid.innerHTML = sorted.map(createAppCard).join('');
  }
}

// Initialize
initData();
