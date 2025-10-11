const performanceStore = {
  cache: null,
  promise: null,
};

async function loadPerformances() {
  if (performanceStore.cache) {
    return performanceStore.cache;
  }
  if (!performanceStore.promise) {
    performanceStore.promise = fetch('data/performances.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('공연 데이터를 불러오지 못했습니다.');
        }
        return res.json();
      })
      .then((payload) => {
        const list = Array.isArray(payload.performances) ? payload.performances : [];
        performanceStore.cache = list;
        return list;
      })
      .catch((error) => {
        performanceStore.cache = [];
        throw error;
      });
  }
  return performanceStore.promise;
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  if (!projectId) {
    handleProjectNotFound();
    return;
  }

  try {
    const performances = await loadPerformances();
    const project = performances.find((item) => item.id === projectId);

    if (project) {
      populatePage(project);
    } else {
      handleProjectNotFound();
    }
  } catch (error) {
    console.error('Error loading performance data:', error);
    handleProjectNotFound();
  }
});

function populatePage(project) {
  document.title = `${project.title || 'Spotlight 프로젝트'} - Artause`;

  const statusLabels = {
    completed: '홍보 완료',
    ongoing: '진행 중',
    planned: '진행 예정',
  };

  updateText('project-status', statusLabels[project.status] || '진행 예정');
  updateText('project-category', project.category || '장르 미정');
  updateText('project-title', project.title || '제목 미정');
  updateText('project-headline', project.subtitle || project.synopsis || '');
  updateText('project-meta-period', project.period || '기간 정보 없음');
  updateText('project-meta-venue', project.venue || '공연장 정보 없음');
  updateText('project-synopsis', project.synopsis || '공연 설명을 준비 중입니다.');

  const header = document.getElementById('project-header-bg');
  if (header) {
    const poster = project.poster_url || 'images/project_placeholder_1.jpg';
    header.style.backgroundImage = `url('${poster}')`;
  }

  renderList(
    'project-scope',
    Array.isArray(project.tasks) ? project.tasks : [],
    '수행 업무 정보가 아직 정리되지 않았습니다.'
  );

  const outcomeItems = Array.isArray(project.outcomes) ? project.outcomes : [];
  renderList(
    'project-outcomes',
    outcomeItems,
    '성과 데이터를 준비하고 있습니다.'
  );
}

function updateText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

function renderList(id, items, emptyMessage) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  const list = items.filter((item) => typeof item === 'string' && item.trim().length > 0);
  if (!list.length) {
    el.innerHTML = emptyMessage ? `<li class="empty">${emptyMessage}</li>` : '';
    return;
  }
  el.innerHTML = list.map((item) => `<li>${item}</li>`).join('');
}

function handleProjectNotFound() {
  document.title = '프로젝트를 찾을 수 없습니다 - Artause';
  updateText('project-status', '데이터 없음');
  updateText('project-category', '미정');
  updateText('project-title', '프로젝트를 찾을 수 없습니다');
  updateText('project-headline', '요청하신 공연 정보를 확인할 수 없습니다.');
  updateText('project-meta-period', '-');
  updateText('project-meta-venue', '-');
  updateText(
    'project-synopsis',
    '요청하신 공연 정보를 불러오지 못했습니다. Spotlight 페이지로 돌아가 다른 사례를 확인해 주세요.'
  );
  renderList('project-scope', [], 'Spotlight 목록에서 다른 공연을 선택해 주세요.');
  renderList('project-outcomes', [], '성과 정보를 불러오지 못했습니다.');
}
