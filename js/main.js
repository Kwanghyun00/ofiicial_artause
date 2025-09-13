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
    const isIndexPage = document.getElementById('featured-projects-gallery') !== null;
    const isSpotlightPage = document.getElementById('portfolio-gallery') !== null;
    const isProjectDetailPage = document.querySelector('.project-header') !== null && window.location.pathname.includes('project-detail.html');
    const promotionForm = document.getElementById('promotionRequestForm');

    if (isIndexPage) {
        initializeIndexPage();
    }

    if (isSpotlightPage) {
        initializeSpotlightPage();
    }

    if (isProjectDetailPage) {
        initializeProjectDetailPage();
    }

    if (promotionForm) {
        initializePromotionRequestPage();
    }


    // --- Index Page Logic ---
    async function initializeIndexPage() {
        const portfolioData = await getPortfolioData();
        const gallery = document.getElementById('featured-projects-gallery');
        if (!gallery || !portfolioData.length) return;

        const featuredProjects = portfolioData
            .filter(item => item['진행 상황'] === '완료')
            .slice(0, 3); // Get the first 3 completed projects

        featuredProjects.forEach(item => {
            const cardLink = document.createElement('a');
            cardLink.href = `project-detail.html?id=${item['프로젝트 넘버']}`;
            cardLink.className = 'project-item-link';

            const placeholderIndex = (parseInt(item['프로젝트 넘버']) % 3) + 1;

            const cardItem = document.createElement('div');
            cardItem.className = 'project-item';
            cardItem.style.backgroundImage = `url('images/project_placeholder_${placeholderIndex}.jpg')`;
            
            cardItem.innerHTML = `
                <div class="project-item-content">
                    <span>${item['장르'] || '공연'}</span>
                    <h3>${item['프로젝트명']}</h3>
                </div>
            `;
            cardLink.appendChild(cardItem);
            gallery.appendChild(cardLink);
        });
    }


    // --- Promotion Request Page Logic ---
    function initializePromotionRequestPage() {
        const promotionForm = document.getElementById('promotionRequestForm');
        promotionForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(promotionForm);
            const promotionData = {};
            for (const [key, value] of formData.entries()) {
                promotionData[key] = value;
            }

            // Password validation if account creation is checked
            if (promotionData['create-account']) {
                if (promotionData['password'] !== promotionData['password-confirm']) {
                    alert("비밀번호가 일치하지 않습니다.");
                    return;
                }
            }

            try {
                // Save data to localStorage to be used on the next page
                localStorage.setItem('promotionData', JSON.stringify(promotionData));
                
                // Redirect based on whether the user chose to create an account
                if (promotionData['create-account']) {
                    // Set initial state for the dashboard
                    localStorage.setItem('projectState', 'proposal');
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'proposal.html';
                }

            } catch (error) {
                console.error("Error saving to localStorage:", error);
                alert("오류가 발생하여 제안서를 생성할 수 없습니다. 다시 시도해주세요.");
            }
        });
    }


    // --- Spotlight Page Logic ---
    async function initializeSpotlightPage() {
        const portfolioData = await getPortfolioData();
        const caseStudiesGrid = document.getElementById('case-studies-grid');
        const ongoingGallery = document.getElementById('ongoing-projects-grid'); 
        const filtersContainer = document.getElementById('portfolio-filters');

        if (!portfolioGallery || !portfolioData.length) return;

        // --- Populate Case Studies (3 most recent completed) ---
        if (caseStudiesGrid) {
            const completedProjects = portfolioData
                .filter(item => item['진행 상황'] === '완료')
                .slice(0, 3); // Get the first 3
            completedProjects.forEach(item => {
                caseStudiesGrid.appendChild(createProjectCard(item));
            });
        }

        // --- Populate "Now Playing" section ---
        if (ongoingGallery) {
            const ongoingProjects = portfolioData.filter(item => item['진행 상황'] === '진행중');
            if (ongoingProjects.length > 0) {
                ongoingProjects.forEach(item => {
                    ongoingGallery.appendChild(createProjectCard(item));
                });
            } else {
                ongoingGallery.innerHTML = '<p style="text-align: center; width: 100%;">현재 진행 중인 공연이 없습니다.</p>';
            }
        }
        
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
                statusHTML = `<a href="contact.html?type=booking&project=${encodeURIComponent(project['프로젝트명'])}" class="btn btn-primary btn-block">프로젝트 문의/예매</a>`;
            } else {
                statusHTML = `<div class="status-tag">완료된 프로젝트</div>`;
            }

            sidebar.innerHTML = `
                <div class="sidebar-block">
                    <h3>공연 단체</h3>
                    <p>${project['공연 단체'] || '정보 없음'}</p>
                </div>
                <div class="sidebar-block">
                    <h3>지역</h3>
                    <p>${project['지역'] || '정보 없음'}</p>
                </div>
                <div class="sidebar-block">
                    <h3>진행 기간</h3>
                    <p>${project['진행기간'] || '정보 없음'}</p>
                </div>
                <div class="sidebar-block">
                    ${statusHTML}
                </div>
            `;
        } else {
            displayProjectNotFoundError();
        }
    }

    function displayProjectNotFoundError() {
        const mainContent = document.querySelector('.project-detail-main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="content-block" style="text-align: center;">
                    <h2>프로젝트를 찾을 수 없습니다.</h2>
                    <p>요청하신 프로젝트 정보가 존재하지 않거나, 잘못된 주소입니다.</p>
                    <a href="spotlight.html" class="btn btn-primary">포트폴리오 목록으로 돌아가기</a>
                </div>
            `;
        }
        // Hide sidebar and potentially header info
        const sidebar = document.getElementById('project-sidebar');
        if(sidebar) sidebar.style.display = 'none';
    }
});


// === UX Enhancements (scroll reveal, mobile nav overlay) ===
document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal
  const io = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.18 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Mobile Navigation
  const hamburger = document.querySelector('.hamburger-menu');
  const navLinks = document.querySelector('.nav-links');
  let overlay = document.querySelector('.nav-overlay');

  // Create overlay if it doesn't exist
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  if (hamburger && navLinks && overlay) {
    const toggleNav = () => {
      const isActive = navLinks.classList.contains('nav-active');
      
      // Toggle classes
      navLinks.classList.toggle('nav-active');
      overlay.classList.toggle('show');
      document.body.classList.toggle('nav-open');
      hamburger.classList.toggle('active');
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from bubbling up to the document
      toggleNav();
    });

    overlay.addEventListener('click', toggleNav);

    // Close nav if a link is clicked
    navLinks.addEventListener('click', (e) => {
        if (navLinks.classList.contains('nav-active')) {
            // We only toggle if the click is on a link and the nav is open
            if (e.target.tagName === 'A') {
                toggleNav();
            }
        }
    });
  }
});
