document.addEventListener('DOMContentLoaded', function() {
    const promotionData = JSON.parse(localStorage.getItem('promotionData'));

    // If there's no data, redirect back to the form.
    if (!promotionData) {
        alert("제안서 정보를 찾을 수 없습니다. 다시 요청서를 작성해주세요.");
        window.location.href = 'request-promotion.html';
        return;
    }

    // --- 1. Populate Header and Summary ---
    populateSummary(promotionData);

    // --- 2. Generate and Display Marketing Strategy ---
    generateAndDisplayStrategy(promotionData);

    // --- 3. Generate and Display Channel Calendar ---
    generateAndDisplayCalendar(promotionData);

    // --- 4. Render Pricing Plans and Handle Selection ---
    renderPricingPlans();

});

function populateSummary(data) {
    document.getElementById('performance-title-header').textContent = data['performance-title'] || '공연';
    
    const summaryContent = document.getElementById('summary-content');
    summaryContent.innerHTML = `
        <div class="summary-item">
            <span>공연명</span>
            <strong>${data['performance-title']}</strong>
        </div>
        <div class="summary-item">
            <span>공연 단체</span>
            <strong>${data['performance-company']}</strong>
        </div>
        <div class="summary-item">
            <span>장르</span>
            <strong>${data['performance-genre']}</strong>
        </div>
        <div class="summary-item">
            <span>공연 기간</span>
            <strong>${data['start-date']} ~ ${data['end-date']}</strong>
        </div>
        <div class="summary-item">
            <span>홍보 목표</span>
            <strong>${data['promotion-goal']}</strong>
        </div>
    `;
}

function generateAndDisplayStrategy(data) {
    const strategyContainer = document.getElementById('marketing-strategy');
    let strategies = [];

    // Rule-based strategy generation
    const target = data['target-audience'].toLowerCase();
    const genre = data['performance-genre'];

    strategies.push({
        title: '핵심 메시지 정의',
        description: `'${data['promotion-goal']}' 목표 달성을 위해, '${target}' 관객층이 공감할 수 있는 핵심 메시지를 개발하여 모든 홍보 콘텐츠에 일관되게 적용합니다.`
    });

    if (target.includes('20') || target.includes('30') || target.includes('mz')) {
        strategies.push({
            title: '인스타그램 릴스 및 스토리 활용',
            description: '연습실 스케치, 배우 인터뷰, Q&A 등 짧고 흥미로운 영상 콘텐츠를 제작하여 젊은 관객층의 자발적인 공유와 확산을 유도합니다.'
        });
    }
    if (genre === '연극' || genre === '뮤지컬') {
        strategies.push({
            title: '네이버 블로그를 통한 깊이 있는 정보 제공',
            description: '연출가 노트, 시놉시스 심층 분석, 관람 포인트 등 전문적인 내용의 포스팅을 통해 작품에 대한 기대감을 높이고 정보 탐색 유저를 공략합니다.'
        });
    }
     if (genre === '클래식' || genre === '무용') {
        strategies.push({
            title: '고품질 사진/영상 콘텐츠 제작',
            description: '작품의 예술성을 강조할 수 있는 고품질의 사진과 영상을 촬영하여, 시각적 매력을 통해 잠재 관객의 관심을 유도합니다.'
        });
    }

    strategyContainer.innerHTML = strategies.map(s => `
        <div class="strategy-item">
            <h4>${s.title}</h4>
            <p>${s.description}</p>
        </div>
    `).join('');
}

function generateAndDisplayCalendar(data) {
    const calendarBody = document.getElementById('calendar-body');
    const startDate = new Date(data['start-date']);
    
    const calendarTemplate = [
        {
            time: 'D-30',
            instagram: '<strong>[최초 공개]</strong> 티저 포스터, 공연 컨셉 공개',
            blog: '<strong>[상세 정보]</strong> 시놉시스, 캐스팅, 공연장 정보 포스팅',
            newsletter: '<strong>[사전 예고]</strong> 구독자 대상 공연 정보 및 얼리버드 할인 예고'
        },
        {
            time: 'D-21',
            instagram: '<strong>[기대감 증폭]</strong> 연습실 스케치 영상 (릴스)',
            blog: '<strong>[깊이 있는 정보]</strong> 연출가 노트, 작품 배경 설명',
            newsletter: '<strong>[얼리버드 오픈]</strong> 얼리버드 티켓 오픈 안내'
        },
        {
            time: 'D-14',
            instagram: '<strong>[관객 참여]</strong> "기대평 남기기" 댓글 이벤트',
            blog: '<strong>[관람 팁]</strong> "공연 200% 즐기기" 포스팅',
            newsletter: '<strong>[중간 점검]</strong> 예매 현황 공유, 인기 좌석 안내'
        },
        {
            time: 'D-7',
            instagram: '<strong>[예매 독려]</strong> 카운트다운 스토리, 예매처 하이라이트',
            blog: '<strong>[미리보기]</strong> 주요 장면/대사 일부 공개',
            newsletter: '<strong>[마지막 기회]</strong> 마지막 할인 혜택 안내'
        }
    ];

    calendarBody.innerHTML = calendarTemplate.map(item => `
        <tr>
            <td><strong>${item.time}</strong></td>
            <td>${item.instagram}</td>
            <td>${item.blog}</td>
            <td>${item.newsletter}</td>
        </tr>
    `).join('');
}

function renderPricingPlans() {
    const plansContainer = document.getElementById('pricing-plans');
    const paymentButton = document.getElementById('payment-button');
    let selectedPlan = null;

    const plans = [
        {
            id: 'basic',
            name: 'Basic Plan',
            price: '500,000',
            features: ['인스타그램 채널 운영', '기본 콘텐츠 5건 제작', '주 1회 성과 리포트']
        },
        {
            id: 'standard',
            name: 'Standard Plan',
            price: '1,200,000',
            features: ['인스타그램 & 블로그 운영', '맞춤형 콘텐츠 10건 제작', '네이버 플레이스 광고', '주간 성과 분석 회의']
        },
        {
            id: 'premium',
            name: 'Premium Plan',
            price: '2,500,000',
            features: ['모든 채널(뉴스레터 포함) 운영', '영상 콘텐츠 2건 제작 포함', '인플루언서 섭외 및 협업', '정밀 타겟 광고 집행']
        }
    ];

    plansContainer.innerHTML = plans.map(plan => `
        <div class="pricing-card" data-plan-id="${plan.id}">
            <div class="pricing-card-header">
                <h3>${plan.name}</h3>
                <p class="price">₩${parseInt(plan.price).toLocaleString()}</p>
            </div>
            <div class="pricing-card-body">
                <ul>
                    ${plan.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');

    plansContainer.addEventListener('click', function(e) {
        const card = e.target.closest('.pricing-card');
        if (!card) return;

        // Remove 'selected' from all cards
        plansContainer.querySelectorAll('.pricing-card').forEach(c => c.classList.remove('selected'));
        
        // Add 'selected' to the clicked card
        card.classList.add('selected');
        
        selectedPlan = plans.find(p => p.id === card.dataset.planId);
        paymentButton.disabled = false;
    });

    paymentButton.addEventListener('click', function() {
        if (selectedPlan) {
            try {
                localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
                // For now, we simulate payment success and redirect
                window.location.href = 'request-complete.html';
            } catch (error) {
                console.error("Error saving selected plan:", error);
                alert("오류가 발생했습니다. 다시 시도해주세요.");
            }
        } else {
            alert("서비스 플랜을 선택해주세요.");
        }
    });
}
