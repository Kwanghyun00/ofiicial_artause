const performanceCache = {
  data: null,
  promise: null,
};

const STATUS_LABELS = {
  completed: '종료',
  ongoing: '진행 중',
  planned: '진행 예정',
};

document.addEventListener('DOMContentLoaded', initPortfolioListing);

async function initPortfolioListing() {
  const caseStudiesContainer = document.getElementById('case-studies-grid');
  const ongoingContainer = document.getElementById('ongoing-projects-grid');
  const galleryContainer = document.getElementById('portfolio-gallery');
  const filtersContainer = document.getElementById('portfolio-filters');

  if (!caseStudiesContainer && !ongoingContainer && !galleryContainer) {
    return;
  }

  let performances = [];
  try {
    performances = await loadPerformances();
  } catch (error) {
    console.error('Failed to load performances:', error);
    const message = '<div class="empty">공연 데이터를 불러오지 못했습니다.</div>';
    if (caseStudiesContainer) caseStudiesContainer.innerHTML = message;
    if (ongoingContainer) ongoingContainer.innerHTML = message;
    if (galleryContainer) galleryContainer.innerHTML = message;
    return;
  }

  if (caseStudiesContainer) {
    renderCaseStudies(caseStudiesContainer, performances);
  }

  if (ongoingContainer) {
    renderOngoing(ongoingContainer, performances);
  }

  if (galleryContainer) {
    setupGallery(galleryContainer, filtersContainer, performances);
  }
}

async function loadPerformances() {
  if (performanceCache.data) {
    return performanceCache.data;
  }
  if (!performanceCache.promise) {
    performanceCache.promise = fetch('data/performances.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('공연 데이터를 불러오지 못했습니다.');
        }
        return res.json();
      })
      .then((payload) => {
        const list = Array.isArray(payload.performances) ? payload.performances : [];
        performanceCache.data = list;
        return list;
      })
      .catch((error) => {
        performanceCache.data = [];
        throw error;
      });
  }
  return performanceCache.promise;
}

function renderCaseStudies(container, performances) {
  const completed = performances.filter((item) => item.status === 'completed').slice(0, 3);
  if (!completed.length) {
    container.innerHTML = '<div class="empty">완료된 프로젝트가 없습니다.</div>';
    return;
  }
  container.innerHTML = '';
  completed.forEach((item) => {
    container.appendChild(createCard(item));
  });
}

function renderOngoing(container, performances) {
  const items = performances.filter((item) => item.status === 'ongoing' || item.status === 'planned');
  if (!items.length) {
    container.innerHTML = '<div class="empty">현재 진행 중인 공연이 없습니다.</div>';
    return;
  }
  container.innerHTML = '';
  items.forEach((item) => {
    container.appendChild(createCard(item));
  });
}

function setupGallery(galleryContainer, filtersContainer, performances) {
  const state = {
    status: '전체',
    tags: new Set(),
    query: '',
  };

  const tagSet = new Set();
  performances.forEach((item) => {
    getTags(item).forEach((tag) => tagSet.add(tag));
  });

  if (filtersContainer) {
    filtersContainer.innerHTML = '';

    const statusRow = document.createElement('div');
    statusRow.className = 'filter-row';
    statusRow.append('상태: ');
    ['전체', '진행 중', '진행 예정', '종료'].forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `filter-chip${label === state.status ? ' active' : ''}`;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        state.status = label;
        statusRow.querySelectorAll('button').forEach((chip) => chip.classList.remove('active'));
        btn.classList.add('active');
        renderGallery();
      });
      statusRow.appendChild(btn);
    });

    const tagRow = document.createElement('div');
    tagRow.className = 'filter-row';
    tagRow.append('태그: ');
    Array.from(tagSet)
      .sort((a, b) => a.localeCompare(b, 'ko'))
      .forEach((tag) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-chip';
        btn.textContent = tag;
        btn.addEventListener('click', () => {
          if (state.tags.has(tag)) {
            state.tags.delete(tag);
            btn.classList.remove('active');
          } else {
            state.tags.add(tag);
            btn.classList.add('active');
          }
          renderGallery();
        });
        tagRow.appendChild(btn);
      });

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = '공연명/공연장/지역 검색';
    searchInput.className = 'filter-search';
    searchInput.addEventListener('input', () => {
      state.query = searchInput.value.trim().toLowerCase();
      renderGallery();
    });

    filtersContainer.append(statusRow, tagRow, searchInput);
  }

  function renderGallery() {
    galleryContainer.innerHTML = '';
    const filtered = performances.filter((item) => {
      if (!matchesStatus(state.status, item.status)) {
        return false;
      }
      if (state.tags.size > 0) {
        const itemTags = new Set(getTags(item));
        let hasMatch = false;
        state.tags.forEach((tag) => {
          if (itemTags.has(tag)) {
            hasMatch = true;
          }
        });
        if (!hasMatch) {
          return false;
        }
      }
      if (state.query) {
        const haystack = [
          item.title,
          item.subtitle,
          item.period,
          item.venue,
          item.region,
          item.organization,
          ...(Array.isArray(item.tasks) ? item.tasks : []),
          item.synopsis,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(state.query)) {
          return false;
        }
      }
      return true;
    });

    if (!filtered.length) {
      galleryContainer.innerHTML = '<div class="empty">조건에 맞는 프로젝트가 없습니다.</div>';
      return;
    }

    filtered.forEach((item) => {
      galleryContainer.appendChild(createCard(item));
    });
  }

  renderGallery();
}

function matchesStatus(filterLabel, statusValue) {
  if (filterLabel === '전체') {
    return true;
  }
  if (filterLabel === '진행 중') {
    return statusValue === 'ongoing';
  }
  if (filterLabel === '진행 예정') {
    return statusValue === 'planned';
  }
  if (filterLabel === '종료') {
    return statusValue === 'completed';
  }
  return true;
}

function getTags(item) {
  const tags = new Set();
  if (Array.isArray(item.tags)) {
    item.tags.filter(Boolean).forEach((tag) => tags.add(tag));
  }
  if (item.category) {
    tags.add(item.category);
  }
  if (item.region) {
    tags.add(item.region);
  }
  return Array.from(tags);
}

function createCard(item) {
  const link = document.createElement('a');
  link.href = `project-detail.html?id=${encodeURIComponent(item.id)}`;
  link.className = 'case-study-card reveal';

  const thumb = document.createElement('div');
  thumb.className = 'case-study-thumb';
  thumb.style.backgroundImage = `url('${item.poster_url || 'images/project_placeholder_1.jpg'}')`;

  const content = document.createElement('div');
  content.className = 'case-study-content';

  const tagWrap = document.createElement('div');
  tagWrap.className = 'tags';
  getTags(item).forEach((tag) => {
    const badge = document.createElement('span');
    badge.className = 'tag';
    badge.textContent = tag;
    tagWrap.appendChild(badge);
  });

  const title = document.createElement('h4');
  title.textContent = item.title || '프로젝트';

  const subtitle = document.createElement('p');
  subtitle.textContent = item.subtitle || buildSubtitle(item);

  const meta = document.createElement('div');
  meta.className = 'case-study-result';

  if (item.period) {
    const periodTag = document.createElement('span');
    periodTag.className = 'result-tag';
    periodTag.textContent = item.period;
    meta.appendChild(periodTag);
  }

  if (item.venue) {
    const venueTag = document.createElement('span');
    venueTag.className = 'result-tag';
    venueTag.textContent = item.venue;
    meta.appendChild(venueTag);
  }

  const statusTag = document.createElement('span');
  statusTag.className = `result-tag ${item.status === 'completed' ? '' : 'accent'}`.trim();
  statusTag.textContent = STATUS_LABELS[item.status] || '진행 예정';
  meta.appendChild(statusTag);

  content.append(tagWrap, title, subtitle, meta);
  link.append(thumb, content);

  link.addEventListener('mousemove', (event) => {
    const rect = link.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    link.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-2px)`;
  });

  link.addEventListener('mouseleave', () => {
    link.style.transform = '';
  });

  return link;
}

function buildSubtitle(item) {
  const parts = [];
  if (item.region) {
    parts.push(item.region);
  }
  if (item.organization) {
    parts.push(item.organization);
  }
  if (item.venue) {
    parts.push(item.venue);
  }
  return parts.join(' · ');
}
