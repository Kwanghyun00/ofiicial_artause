document.addEventListener('DOMContentLoaded', function() {
    // --- Initial Setup ---
    const promotionData = JSON.parse(localStorage.getItem('promotionData'));
    let projectState = localStorage.getItem('projectState') || 'proposal'; // Default state is 'proposal'

    // If there's no core data, the user shouldn't be here.
    if (!promotionData) {
        alert("프로젝트 정보를 찾을 수 없습니다. 요청서를 다시 작성해주세요.");
        window.location.href = 'request-promotion.html';
        return;
    }

    // --- Main Render Function ---
    function renderDashboard() {
        updateStatusTracker(projectState);
        populateSidebar(promotionData);

        const dashboardContent = document.getElementById('proposal-content');
        
        if (projectState === 'proposal') {
            dashboardContent.innerHTML = getProposalHTML();
            renderPricingPlans(); // Attach event listeners for pricing cards
        } else if (projectState === 'progress') {
            dashboardContent.innerHTML = getProgressHTML();
        } else if (projectState === 'report') {
            dashboardContent.innerHTML = getReportHTML(promotionData);
        }
    }

    // --- State Updaters ---
    function updateStatusTracker(state) {
        document.querySelectorAll('.status-step').forEach(step => step.classList.remove('active'));
        if (state === 'proposal') {
            document.getElementById('step-proposal').classList.add('active');
        } else if (state === 'payment' || state === 'progress') {
            ['step-proposal', 'step-payment', 'step-progress'].forEach(id => document.getElementById(id)?.classList.add('active'));
        } else if (state === 'report') {
            ['step-proposal', 'step-payment', 'step-progress', 'step-report'].forEach(id => document.getElementById(id)?.classList.add('active'));
        }
    }

    // --- Content Population ---
    function populateSidebar(data) {
        const summaryContent = document.getElementById('summary-content');
        summaryContent.innerHTML = `
            <div class="summary-item"><span>공연명</span><strong>${data['performance-title']}</strong></div>
            <div class="summary-item"><span>공연 단체</span><strong>${data['performance-company']}</strong></div>
            <div class="summary-item"><span>공연 기간</span><strong>${data['start-date']} ~ ${data['end-date']}</strong></div>
        `;
    }

    // --- HTML Template Generators ---

    function getProposalHTML() {
        const strategy = generateStrategy(promotionData);
        const calendar = generateCalendar(promotionData);
        return `
            <div class="dashboard-block">
                <h2>마케팅 전략 제안</h2>
                ${strategy}
            </div>
            <div class="dashboard-block">
                <h2>채널별 홍보 캘린더</h2>
                ${calendar}
            </div>
            <div class="dashboard-block">
                <h2>서비스 플랜 선택</h2>
                <div id="pricing-plans"></div>
                <button id="payment-button" class="btn btn-primary btn-lg btn-block" disabled>선택 완료 및 결제 진행</button>
            </div>
        `;
    }

    function getProgressHTML() {
        // In a real app, this would show real-time updates.
        return `
            <div class="dashboard-block">
                <h2>프로젝트 진행 상황</h2>
                <p>프로젝트가 진행 중입니다. 채널별 홍보 캘린더에 따라 콘텐츠가 순차적으로 발행될 예정입니다.</p>
                <p>담당자와의 커뮤니케이션은 사이드바의 메시지 기능을 이용해주세요.</p>
                <br>
                <button onclick="viewReport()" class="btn btn-secondary">최종 성과 리포트 보기 (시뮬레이션)</button>
            </div>
        `;
    }

    function getReportHTML(data) {
        // Dummy data for the report
        const reach = Math.floor(Math.random() * 20000) + 50000;
        const engagement = Math.floor(Math.random() * 1500) + 2500;
        const clicks = Math.floor(Math.random() * 800) + 1000;

        return `
            <div class="dashboard-block">
                <h2>'${data['performance-title']}' 최종 성과 리포트</h2>
                <p><strong>프로젝트 기간:</strong> ${data['start-date']} ~ ${data['end-date']}</p>
                <div class="report-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2rem;">
                    <div class="report-kpi" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: center;">
                        <h4 style="margin-top: 0;">총 도달 수</h4>
                        <p style="font-size: 2rem; font-weight: bold; color: #e91e63; margin-bottom: 0;">${reach.toLocaleString()}</p>
                    </div>
                    <div class="report-kpi" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: center;">
                        <h4 style="margin-top: 0;">총 참여/반응</h4>
                        <p style="font-size: 2rem; font-weight: bold; color: #e91e63; margin-bottom: 0;">${engagement.toLocaleString()}</p>
                    </div>
                    <div class="report-kpi" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: center;">
                        <h4 style="margin-top: 0;">예매처 클릭</h4>
                        <p style="font-size: 2rem; font-weight: bold; color: #e91e63; margin-bottom: 0;">${clicks.toLocaleString()}</p>
                    </div>
                </div>
                <div class="report-summary" style="margin-top: 2rem;">
                    <h4>종합 분석</h4>
                    <p>'${data['target-audience']}'를 타겟으로 한 인스타그램 콘텐츠가 높은 참여율을 보였으며, 특히 '${data['performance-genre']}' 장르에 관심 있는 사용자들에게 효과적으로 도달했습니다. 블로그를 통한 정보성 콘텐츠는 꾸준한 예매처 클릭을 유도하여 성공적인 결과를 얻었습니다.</p>
                </div>
            </div>
        `;
    }

    // --- Component Rendering & Event Handling ---

    function renderPricingPlans() {
        const plansContainer = document.getElementById('pricing-plans');
        if (!plansContainer) return;
        // This function is similar to the one in proposal.js
        // ... (It would render plans and handle selection)
        // For brevity, the core logic is simulated in the payment button listener.
        
        const paymentButton = document.getElementById('payment-button');
        // Dummy pricing plan rendering for selection logic
        plansContainer.innerHTML = `
            <div class="pricing-card" data-plan-id="standard">
                <div class="pricing-card-header"><h3>Standard Plan</h3><p class="price">₩1,200,000</p></div>
            </div>`;
        
        plansContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.pricing-card');
            if(card) {
                document.querySelectorAll('.pricing-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                paymentButton.disabled = false;
            }
        });

        paymentButton.addEventListener('click', () => {
            if (document.querySelector('.pricing-card.selected')) {
                alert("결제가 완료되었습니다. 프로젝트가 '진행' 상태로 변경됩니다.");
                projectState = 'progress';
                localStorage.setItem('projectState', projectState);
                renderDashboard();
            } else {
                alert("서비스 플랜을 선택해주세요.");
            }
        });
    }

    // --- Global Functions for State Change (for simulation) ---
    window.viewReport = function() {
        projectState = 'report';
        localStorage.setItem('projectState', projectState);
        renderDashboard();
    }

    // --- Initial Call ---
    renderDashboard();
});

// --- Helper functions for content generation (can be expanded) ---
function generateStrategy(data) {
    return `<p>'${data['target-audience']}' 관객층을 공략하기 위한 맞춤형 디지털 마케팅 전략입니다...</p>`;
}

function generateCalendar(data) {
    return `
        <table class="calendar-table">
            <thead><tr><th>시점</th><th>Instagram</th><th>블로그</th></tr></thead>
            <tbody><tr><td>D-30</td><td>티저 포스터 공개</td><td>시놉시스 포스팅</td></tr></tbody>
        </table>
    `;
}
