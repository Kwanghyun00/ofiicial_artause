const portfolioDataCache = {
  data: null,
  promise: null,
};

const PERFORMANCE_STATUS_LABELS = {
  completed: '홍보 완료',
  ongoing: '진행 중',
  planned: '진행 예정',
};

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initAppShell();
  initHomePage();
  initSpotlightPage();
  initProjectDetailPage();
});

async function fetchPortfolioData() {
  if (portfolioDataCache.data) {
    return portfolioDataCache.data;
  }
  if (!portfolioDataCache.promise) {
    portfolioDataCache.promise = fetch('data/performances.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('공연 데이터를 불러오지 못했습니다.');
        }
        return response.json();
      })
      .then((payload) => {
        const performances = Array.isArray(payload.performances) ? payload.performances : [];
        const mapped = performances.map(adaptPerformance);
        portfolioDataCache.data = mapped;
        return mapped;
      })
      .catch((error) => {
        console.error(error);
        portfolioDataCache.data = [];
        return [];
      });
  }
  return portfolioDataCache.promise;
}

function adaptPerformance(item, index) {
  const thumbnail = item.poster_url || `images/project_placeholder_${(index % 3) + 1}.jpg`;
  const summary = buildSummary(item);
  return {
    ...item,
    thumbnail,
    headline: item.subtitle || summary,
    summary,
    scope: Array.isArray(item.tasks) ? item.tasks : [],
    outcomes: Array.isArray(item.outcomes) ? item.outcomes : [],
  };
}

function buildSummary(item) {
  const baseText = (item.synopsis || '').replace(/\s+/g, ' ').trim();
  if (baseText) {
    return baseText.length > 110 ? `${baseText.slice(0, 107)}…` : baseText;
  }
  if (Array.isArray(item.tasks) && item.tasks.length) {
    const joined = item.tasks.join(' · ');
    return joined.length > 110 ? `${joined.slice(0, 107)}…` : joined;
  }
  const fallback = [item.period, item.venue, item.region].filter(Boolean).join(' · ');
  return fallback || '공연 정보를 준비 중입니다.';
}

// === Home Page ==========================================================
async function initHomePage() {
  const gallery = document.getElementById('featured-projects-gallery');
  if (!gallery) {
    return;
  }
  const projects = await fetchPortfolioData();
  if (!projects.length) {
    gallery.innerHTML = '<p style="text-align:center; color: var(--app-text-soft);">프로젝트 데이터를 준비 중입니다.</p>';
    return;
  }
  const featured = projects.filter((project) => project.status === 'completed').slice(0, 3);
  const items = featured.length ? featured : projects.slice(0, 3);
  gallery.innerHTML = '';
  items.forEach((project) => {
    gallery.appendChild(createProjectCard(project));
  });
}

// === Spotlight Page =====================================================
function initSpotlightPage() {
  // Spotlight 섹션 데이터 렌더링은 portfolio-listing.js에서 처리합니다.
}

// === Project Detail Page ===============================================
function initProjectDetailPage() {
  // 프로젝트 상세 데이터 렌더링은 project-detail.js에서 처리합니다.
}

function createProjectCard(project, options = {}) {
  const { dense = false } = options;
  const link = document.createElement('a');
  link.href = `project-detail.html?id=${encodeURIComponent(project.id)}`;
  link.className = dense ? 'case-study-card-link' : 'project-item-link';

  const card = document.createElement('div');
  card.className = dense ? 'case-study-card' : 'project-item';

  if (dense) {
    card.innerHTML = `
      <img src="${project.thumbnail}" alt="${project.title}" class="case-study-image" />
      <div class="case-study-content">
        <h4>${project.title}</h4>
        <p>${project.summary || ''}</p>
        <div class="case-study-result">
          <span class="result-tag">${project.category || '장르 미정'}</span>
          <span class="result-tag">${PERFORMANCE_STATUS_LABELS[project.status] || '진행 예정'}</span>
        </div>
      </div>
    `;
  } else {
    card.style.backgroundImage = `url('${project.thumbnail}')`;
    card.innerHTML = `
      <div class="project-item-content">
        <span>${project.category || '장르 미정'}</span>
        <h3>${project.title}</h3>
        <p>${project.headline || ''}</p>
      </div>
    `;
  }

  link.appendChild(card);
  return link;
}

function createProjectCaseStudy(project) {
  const card = document.createElement('article');
  card.className = 'case-study-card';
  card.innerHTML = `
    <img src="${project.thumbnail}" alt="${project.title}" class="case-study-image" />
    <div class="case-study-content">
      <h4>${project.title}</h4>
      <p>${project.summary || ''}</p>
      <div class="case-study-result">
        ${(project.outcomes || []).slice(0, 2).map((outcome) => `<span class="result-tag accent">${outcome}</span>`).join('')}
      </div>
      <a href="project-detail.html?id=${encodeURIComponent(project.id)}" class="app-link-inline" style="margin-top: 1rem;">자세히 보기</a>
    </div>
  `;
  return card;
}

// === Scroll Reveal ======================================================
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

// === App Shell ==========================================================
function initAppShell() {
  const sidebar = document.querySelector('.app-sidebar');
  const menuButton = document.querySelector('.app-menu-toggle');
  if (!sidebar) {
    return;
  }

  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  const closeNav = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.classList.remove('nav-open');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', 'false');
    }
  };

  const openNav = () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    document.body.classList.add('nav-open');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', 'true');
    }
  };

  if (menuButton) {
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = sidebar.classList.contains('open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  overlay.addEventListener('click', closeNav);
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('.app-nav-link')) {
      closeNav();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });

  const mediaQuery = window.matchMedia('(min-width: 1025px)');
  const mqHandler = (mqEvent) => {
    if (mqEvent.matches) {
      closeNav();
    }
  };
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', mqHandler);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(mqHandler);
  }

  const updateActiveLinks = () => {
    const path = new URL(window.location.href).pathname.split('/').pop() || 'index.html';
    setActiveNavLinks(path);
  };

  updateActiveLinks();
  window.addEventListener('popstate', updateActiveLinks);
}

function setActiveNavLinks(currentPath) {
  const targets = document.querySelectorAll('[data-route]');
  targets.forEach((link) => {
    const routes = link.dataset.route
      ? link.dataset.route.split(',').map((route) => route.trim().toLowerCase()).filter(Boolean)
      : [];
    const isActive = routes.includes(currentPath.toLowerCase());
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
