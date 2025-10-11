document.addEventListener('DOMContentLoaded', function() {

    // --- Helper function to fetch and parse CSV data ---
    async function getPortfolioData() {
        // Use a cache to avoid re-fetching the CSV on the same page load
        if (window.portfolioDataCache) {
            return window.portfolioDataCache;
        }
        try {
            const response = await fetch('data/공연DB.csv');
            const csvText = await response.text();
            
            // Simple CSV parsing
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const data = lines.slice(1).map(line => {
                // This simple split won't handle commas within quotes.
                // For this specific CSV, it should be okay.
                const values = line.split(',').map(v => v.trim());
                let entry = {};
                headers.forEach((header, index) => {
                    entry[header] = values[index];
                });
                return entry;
            });

            // Filter out empty or invalid rows
            const validData = data.filter(d => d['프로젝트 넘버'] && d['프로젝트명']);
            window.portfolioDataCache = validData;
            return validData;

        } catch (error) {
            console.error("Error fetching or parsing CSV:", error);
            return []; // Return empty array on error
        }
    }


    // --- Sitewide Logic ---
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('active');
        });
    }

    // --- Page Specific Initializations ---

    // Check which page we are on
    const isSpotlightPage = document.getElementById('portfolio-gallery') !== null;
    const isProjectDetailPage = document.querySelector('.project-header') !== null && window.location.pathname.includes('project-detail.html');

    if (isSpotlightPage) {
        initializeSpotlightPage();
    }

    if (isProjectDetailPage) {
        initializeProjectDetailPage();
    }


    // --- Spotlight Page Logic ---
    async function initializeSpotlightPage() {
        const portfolioData = await getPortfolioData();
        const portfolioGallery = document.getElementById('portfolio-gallery');
        const ongoingGallery = document.getElementById('ongoing-projects-grid'); // Assuming this ID exists
        const filtersContainer = document.getElementById('portfolio-filters');

        if (!portfolioGallery || !portfolioData.length) return;

        // --- Function to create a project card ---
        const createProjectCard = (item) => {
            const cardLink = document.createElement('a');
            // Link to detail page using the project number as a unique ID
            cardLink.href = `project-detail.html?id=${item['프로젝트 넘버']}`;
            cardLink.className = 'case-study-card-link'; // Use a wrapper for styling if needed

            const card = document.createElement('div');
            card.className = 'case-study-card';
            card.dataset.genre = item['장르'] || '기타';
            card.dataset.region = item['지역'] || '전국';

            // Use a placeholder image for now
            const placeholderIndex = (parseInt(item['프로젝트 넘버']) % 3) + 1;
            card.innerHTML = `
                <img src="images/project_placeholder_${placeholderIndex}.jpg" alt="${item['프로젝트명']}" class="case-study-image">
                <div class="case-study-content">
                    <h4>${item['프로젝트명']}</h4>
                    <p>${item['공연 단체'] || ''} / ${item['장르'] || '공연'}</p>
                    <div class="case-study-result">
                        <span class="result-tag">${item['지역']}</span>
                        <span class="result-tag">${item['진행 상황']}</span>
                    </div>
                </div>
            `;
            cardLink.appendChild(card);
            return cardLink;
        };

        // --- Populate Grids ---
        const ongoingProjects = portfolioData.filter(item => item['진행 상황'] === '진행중'); // Assuming '진행중' status
        
        // Populate the "Now Playing" section if it exists
        if (ongoingGallery) {
            // For now, let's populate it with the first 3 "완료" projects as placeholders
            const placeholderOngoing = portfolioData.filter(item => item['진행 상황'] === '완료').slice(0, 3);
            placeholderOngoing.forEach(item => {
                ongoingGallery.appendChild(createProjectCard(item));
            });
        }

        // Populate the "All Projects" gallery
        portfolioData.forEach(item => {
            portfolioGallery.appendChild(createProjectCard(item));
        });

        // --- Create and render filter buttons ---
        const genres = [...new Set(portfolioData.map(item => item['장르']).filter(Boolean))];
        const regions = [...new Set(portfolioData.map(item => item['지역']).filter(Boolean))];
        const filterTags = ['All', ...genres, ...regions];

        if (filtersContainer) {
            filtersContainer.innerHTML = ''; // Clear existing filters
            filterTags.forEach(tag => {
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.textContent = tag;
                if (tag === 'All') button.classList.add('active');
                
                button.addEventListener('click', () => {
                    document.querySelector('#portfolio-filters .filter-btn.active').classList.remove('active');
                    button.classList.add('active');
                    
                    document.querySelectorAll('#portfolio-gallery .case-study-card-link').forEach(link => {
                        const card = link.querySelector('.case-study-card');
                        const matchesGenre = card.dataset.genre === tag;
                        const matchesRegion = card.dataset.region === tag;

                        if (tag === 'All' || matchesGenre || matchesRegion) {
                            link.style.display = 'block';
                        } else {
                            link.style.display = 'none';
                        }
                    });
                });
                filtersContainer.appendChild(button);
            });
        }
    }


    // --- Project Detail Page Logic ---
    async function initializeProjectDetailPage() {
        const portfolioData = await getPortfolioData();
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('id');
        
        if (!projectId || !portfolioData.length) {
            displayProjectNotFoundError();
            return;
        }

        const project = portfolioData.find(p => p['프로젝트 넘버'] === projectId);

        if (project) {
            // --- Populate Head ---
            document.title = `${project['프로젝트명']} - Artause`;

            // --- Populate Header ---
            const placeholderIndex = (parseInt(project['프로젝트 넘버']) % 3) + 1;
            document.getElementById('project-header-bg').style.backgroundImage = `url('images/project_placeholder_${placeholderIndex}.jpg')`;
            document.getElementById('project-category').textContent = project['장르'] || '공연';
            document.getElementById('project-title').textContent = project['프로젝트명'];
            document.getElementById('project-subtitle').textContent = project['공연 단체'] || '';

            // --- Populate Main Content ---
            const mainInfo = document.getElementById('project-main-info');
            mainInfo.innerHTML = `
                <div class="content-block">
                    <h2>시놉시스</h2>
                    <p>${project['시놉시스'] || '시놉시스 정보가 없습니다.'}</p>
                </div>
                <div class="content-block">
                    <h2>수행 업무</h2>
                    <p>${project['수행업무'] || '수행 업무 정보가 없습니다.'}</p>
                </div>
                 <div class="content-block">
                    <h2>핵심 성과</h2>
                    <p>${project['핵심성과'] || '핵심 성과 정보가 없습니다.'}</p>
                </div>
            `;

            // --- Populate Sidebar ---
            const sidebar = document.getElementById('project-sidebar');
            let statusHTML = '';
            if (project['진행 상황'] === '진행중') {
                statusHTML = `<a href="contact.html?type=booking&project=${encodeURIComponent(project['프로젝트명'])}


// === Artause Pro: micro-interactions & UX helpers ===

// 1) Mobile nav overlay + scroll lock
(function(){
  const burger = document.querySelector('.hamburger-menu');
  const nav = document.querySelector('.nav-links');
  if (!burger || !nav) return;
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay){
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }
  function closeNav(){
    nav.classList.remove('nav-active'); burger.classList.remove('active');
    overlay.classList.remove('show'); document.body.classList.remove('nav-open');
  }
  burger.addEventListener('click', ()=>{
    nav.classList.toggle('nav-active');
    const open = nav.classList.contains('nav-active');
    burger.classList.toggle('active', open);
    overlay.classList.toggle('show', open);
    document.body.classList.toggle('nav-open', open);
  });
  overlay.addEventListener('click', closeNav);
})();

// 2) Reveal on scroll (apply to sections/cards automatically)
(function(){
  const els = Array.from(document.querySelectorAll('section, .service-card, .case-study-card, .venue-card, .portfolio-item, .timeline-item'));
  els.forEach(el=>el.classList.add('reveal'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if (e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
  },{threshold: .15});
  els.forEach(el=>io.observe(el));
})();

// 3) Smooth anchor scroll
document.addEventListener('click', (e)=>{
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if(!el) return;
  e.preventDefault();
  el.scrollIntoView({behavior:'smooth', block:'start'});
});

// 4) Contact form tab + prefill (if markup exists)
(function(){
  const sel = document.getElementById('inquiry-type-selector');
  if(!sel) return;
  const sections = document.querySelectorAll('.form-section');
  const btns = sel.querySelectorAll('.type-btn');
  function activate(type){
    btns.forEach(b=>b.classList.toggle('active', b.dataset.form===type));
    sections.forEach(s=>s.classList.toggle('active', s.id===`form-${type}`));
  }
  const params = new URLSearchParams(location.search);
  let t = params.get('type');
  if(t === 'booking') t = 'studio';
  if(t){ activate(t); }
  sel.addEventListener('click', (e)=>{
    const b = e.target.closest('.type-btn'); if(!b) return; activate(b.dataset.form);
  });
  const subject = params.get('subject');
  if(subject){
    const ta = document.querySelector('#form-studio textarea, #form-spotlight textarea, #form-other textarea');
    if(ta && !ta.value) ta.value = subject + '\\n\\n';
  }
})();

// 5) Studio cards link to booking (if markup exists)
(function(){
  document.querySelectorAll('.venue-card').forEach(card=>{
    card.style.cursor='pointer';
    card.addEventListener('click', ()=>{
      const id = card.dataset.venueId;
      if(id) location.href = `studio-booking.html?venue=${encodeURIComponent(id)}`;
    });
  });
})();

// 6) Progressive enhancement: lazy load images if not set by HTML
(function(){
  document.querySelectorAll('img:not([loading])').forEach(img=> img.setAttribute('loading','lazy'));
})();
