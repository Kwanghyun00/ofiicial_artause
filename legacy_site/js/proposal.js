(function () {
    const SUBMISSION_STORAGE_KEY = 'spotlightLatestSubmission';
    const PLAN_STORAGE_KEY = 'spotlightSelectedPlan';

    document.addEventListener('DOMContentLoaded', () => {
        const submission = loadSubmission();
        if (!submission) {
            renderEmptyState();
            return;
        }

        populateTitle(submission);
        renderOverview(submission);
        renderStrategies(submission);
        renderSchedule(submission);
        renderSummary(submission);
        renderAssets(submission);
        renderPlans(submission);
    });

    function loadSubmission() {
        const raw = localStorage.getItem(SUBMISSION_STORAGE_KEY) || localStorage.getItem('promotionData');
        if (!raw) return null;
        try {
            const data = JSON.parse(raw);
            if (!data.performance || !data.marketing) return null;
            return data;
        } catch (error) {
            console.error('제출 데이터를 불러오지 못했습니다.', error);
            return null;
        }
    }

    function renderEmptyState() {
        const main = document.getElementById('proposalMain');
        if (!main) return;
        main.innerHTML = `
            <div class="empty-state">
                <h3>제안서를 생성할 수 없습니다.</h3>
                <p>Spotlight 홍보 요청 폼을 다시 작성해주세요.</p>
                <a class="btn btn-primary" href="request-promotion.html" style="margin-top:1.5rem;">홍보 요청하기</a>
            </div>
        `;
        const sidebar = document.querySelector('.proposal-sidebar');
        if (sidebar) sidebar.style.display = 'none';
    }

    function populateTitle(submission) {
        const titleEl = document.getElementById('proposalTitle');
        const subtitleEl = document.getElementById('proposalSubtitle');
        const title = submission.performance?.title || 'Spotlight 제안서';
        const org = submission.organization?.organizationName;
        if (titleEl) titleEl.textContent = `${title} · Spotlight 제안서`;
        if (subtitleEl) {
            subtitleEl.textContent = org
                ? `${org} 캠페인을 위한 맞춤 초안 전략입니다.`
                : '접수된 정보를 바탕으로 자동 생성된 초안 전략과 채널 스케줄입니다.';
        }
    }

    function renderOverview(submission) {
        const container = document.getElementById('campaignOverview');
        if (!container) return;
        container.innerHTML = '';
        const blocks = buildOverviewBlocks(submission);
        blocks.forEach(block => {
            const card = document.createElement('div');
            card.className = 'overview-card';
            card.innerHTML = `<h4>${block.title}</h4><p>${block.body}</p>`;
            container.appendChild(card);
        });
    }

    function buildOverviewBlocks(submission) {
        const { organization, performance, marketing } = submission;
        const channels = (marketing.channels || []).map(formatChannelLabel).join(', ');
        const target = performance.targetAudience || '추가 정보 필요';
        const budget = formatBudget(marketing.budgetRange);
        const runInfo = parseRunDates(performance.dates);
        return [
            { title: '캠페인 목표', body: formatMarketingGoal(marketing.goal) },
            { title: '타깃 관객', body: sanitizeText(target) },
            { title: '운영 채널', body: channels || '선택된 채널 없음' },
            { title: '예상 운영 기간', body: runInfo.summary },
            { title: '예산 범위', body: budget },
            { title: '운영 메모', body: buildOperationsNote(organization, marketing) }
        ];
    }

    function renderStrategies(submission) {
        const listEl = document.getElementById('strategyList');
        if (!listEl) return;
        listEl.innerHTML = '';
        const strategies = buildStrategies(submission);
        strategies.forEach(item => {
            const div = document.createElement('div');
            div.className = 'strategy-item';
            div.innerHTML = `<h4>${item.title}</h4><p>${item.description}</p>`;
            listEl.appendChild(div);
        });
    }

    function buildStrategies(submission) {
        const result = [];
        const { marketing, performance, assets } = submission;
        const channels = marketing.channels || [];
        const goal = marketing.goal;
        const genre = performance.genre;
        const assetCount = assets?.files?.length || 0;

        result.push({
            title: '핵심 메시지 구조화',
            description: `캠페인 목표(${formatMarketingGoal(goal)})를 기반으로 감정 몰입, 관람 동기, 사회적 증거의 세 축을 구성하여 전 채널에 일관되게 적용합니다.`
        });

        if (channels.includes('instagram_reels')) {
            result.push({
                title: '숏폼 콘텐츠 집중 전략',
                description: '리허설·하이라이트 영상과 배우 인터뷰를 결합한 30초 이내 릴스를 제작해 자연 도달을 극대화하고, 오프닝 2주 전부터 주 2회 업로드를 권장합니다.'
            });
        }
        if (channels.includes('naver_blog')) {
            result.push({
                title: '검색형 블로그 콘텐츠',
                description: '시놉시스, 캐스팅, 관람 포인트를 구조화한 롱폼 글을 제작해 검색 유입과 브랜드 검색 전환을 동시에 확보합니다.'
            });
        }
        if (channels.includes('newsletter')) {
            result.push({
                title: '뉴스레터 리마인드 플로우',
                description: '캠페인 시작 → 조기 예매 마감 → D-3 리마인드의 3단계 발송 전략으로 구독자별 맞춤 CTA를 제공합니다.'
            });
        }
        if (genre && ['무용','클래식','국악'].includes(genre)) {
            result.push({
                title: '비주얼 큐레이션 강화',
                description: '장르 특성을 살린 스틸컷과 모션 이미지를 활용하여 시각적 일관성을 유지하고, 브랜드 가이드를 반영한 컬러 레이아웃을 구성합니다.'
            });
        }
        if (assetCount < 3) {
            result.push({
                title: '추가 에셋 확보 필요',
                description: '고해상도 이미지 또는 20초 이상 영상이 부족합니다. 프레스킷 또는 드라마트라이브 클립 확보를 권장 드립니다.'
            });
        }
        return result;
    }

    function renderSchedule(submission) {
        const bodyEl = document.getElementById('scheduleBody');
        if (!bodyEl) return;
        bodyEl.innerHTML = '';
        const schedule = buildSchedule(submission);
        if (!schedule.length) {
            bodyEl.innerHTML = '<tr><td colspan="4" style="text-align:center;">생성된 스케줄이 없습니다.</td></tr>';
            return;
        }
        schedule.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.timing}</td>
                <td>${formatChannelLabel(item.channel)}</td>
                <td>${item.content}</td>
                <td>${item.objective}</td>
            `;
            bodyEl.appendChild(row);
        });
    }

    function buildSchedule(submission) {
        const { marketing, performance } = submission;
        const channels = marketing.channels || [];
        if (!channels.length) return [];
        const milestones = parseRunDates(performance.dates).milestones;
        const templates = [
            { timing: milestones.d30, channel: pickChannel(channels, ['naver_blog','newsletter','instagram_feed']), content: '티저 공개 · 핵심 관람 포인트 소개', objective: '인지 확보' },
            { timing: milestones.d21, channel: pickChannel(channels, ['instagram_reels','instagram_feed']), content: '리허설/현장 스케치 숏폼 업로드', objective: '관심 증폭' },
            { timing: milestones.d14, channel: pickChannel(channels, ['newsletter','naver_blog']), content: '조기 예매 마감 리마인더', objective: '예매 전환' },
            { timing: milestones.d7, channel: pickChannel(channels, ['instagram_story','instagram_feed']), content: '관객 참여형 스토리 Q&A', objective: '커뮤니티 활성화' },
            { timing: milestones.d3, channel: pickChannel(channels, ['newsletter','instagram_story']), content: 'D-3 카운트다운 및 혜택 안내', objective: '최종 리마인드' },
            { timing: milestones.day, channel: pickChannel(channels, ['instagram_reels','instagram_feed','youtube']), content: '오프닝 데이 하이라이트 공유', objective: 'UGC 확산' }
        ];
        return templates.filter(item => item.channel);
    }

    function pickChannel(selected, priority) {
        for (const channel of priority) {
            if (selected.includes(channel)) return channel;
        }
        return selected[0];
    }

    function renderSummary(submission) {
        const listEl = document.getElementById('summaryList');
        if (!listEl) return;
        listEl.innerHTML = '';
        const { organization, performance, marketing } = submission;
        const runInfo = parseRunDates(performance.dates);
        const entries = [
            { label: '공연명', value: performance.title || '-' },
            { label: '단체명', value: organization.organizationName || '-' },
            { label: '담당자', value: `${organization.contactName || '-'} / ${organization.contactEmail || '-'}` },
            { label: '전화', value: organization.contactPhone || '-' },
            { label: '공연 기간', value: runInfo.rangeLabel },
            { label: '공연 장소', value: performance.venue || '-' },
            { label: '선택 채널', value: (marketing.channels || []).map(formatChannelLabel).join(', ') || '없음' }
        ];
        entries.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${entry.label}</strong><span>${sanitizeText(entry.value)}</span>`;
            listEl.appendChild(li);
        });
    }

    function renderAssets(submission) {
        const container = document.getElementById('assetOverview');
        if (!container) return;
        container.innerHTML = '';
        const files = submission.assets?.files || [];
        const scope = formatUsageScope(submission.assets?.usageScope);
        const guide = submission.assets?.brandGuidelines ? sanitizeText(submission.assets.brandGuidelines) : '제출된 가이드 없음';
        const poster = submission.performance?.poster ? '제공됨' : '추가 요청 필요';
        const blocks = [
            { title: '업로드 자산 수', body: `${files.length}개` },
            { title: '사용 허가 범위', body: scope },
            { title: '브랜드 가이드', body: guide },
            { title: '포스터/키비주얼', body: poster }
        ];
        blocks.forEach(block => {
            const card = document.createElement('div');
            card.className = 'overview-card';
            card.innerHTML = `<h4>${block.title}</h4><p>${block.body}</p>`;
            container.appendChild(card);
        });
    }

    function renderPlans(submission) {
        const selector = document.getElementById('planSelector');
        const button = document.getElementById('proceedCheckout');
        if (!selector || !button) return;
        const plans = buildPlans(submission);
        selector.innerHTML = '';
        let selectedId = null;
        plans.forEach(plan => {
            const option = document.createElement('label');
            option.className = 'plan-option';
            option.dataset.planId = plan.id;
            option.innerHTML = `
                <div style="display:flex; justify-content:space-between; gap:1rem;">
                    <div>
                        <strong>${plan.name}</strong>
                        ${plan.recommended ? '<span class="channel-tag" style="margin-left:0.6rem;">추천</span>' : ''}
                    </div>
                    <span class="plan-price">${plan.price}</span>
                </div>
                <p style="margin:0.6rem 0 0; color: var(--text-muted); font-size:0.9rem;">${plan.subtitle}</p>
                <ul class="plan-feature-list">${plan.features.map(item => `<li>${item}</li>`).join('')}</ul>
            `;
            option.addEventListener('click', () => {
                selector.querySelectorAll('.plan-option').forEach(el => el.classList.remove('selected'));
                option.classList.add('selected');
                selectedId = plan.id;
                button.disabled = false;
            });
            selector.appendChild(option);
        });
        button.addEventListener('click', () => {
            if (!selectedId) return;
            const plan = plans.find(p => p.id === selectedId);
            localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({
                planId: plan.id,
                planName: plan.name,
                price: plan.price,
                features: plan.features,
                requestId: submission.requestId,
                submittedAt: submission.submittedAt,
                createdAt: new Date().toISOString()
            }));
            window.location.href = 'checkout.html';
        });
    }

    function buildPlans(submission) {
        const goal = submission.marketing?.goal;
        const channels = submission.marketing?.channels || [];
        const hasVideo = channels.includes('instagram_reels') || channels.includes('youtube');
        return [
            {
                id: 'starter',
                name: 'Starter',
                price: '₩550,000',
                subtitle: 'SNS 기본 운영과 카드뉴스 제작이 필요한 경우',
                features: ['인스타그램 6회 운영', '카드뉴스 4종 제작', '공연 DB 등록 & SEO 정비', '캠페인 종료 리포트'],
                recommended: goal === 'awareness'
            },
            {
                id: 'growth',
                name: 'Growth',
                price: '₩1,280,000',
                subtitle: '예매 전환과 도달 증대를 동시에 노리는 경우',
                features: ['인스타그램 & 블로그 동시 운영', '릴스 2종 + 카드뉴스 6종', '티켓 프로모션/유료 광고 집행', '주간 성과 리포트'],
                recommended: goal === 'conversion' || hasVideo
            },
            {
                id: 'premium',
                name: 'Premium',
                price: '₩2,550,000',
                subtitle: '장기 캠페인과 인플루언서 협업이 필요한 경우',
                features: ['전 채널 통합 운영', '인플루언서 매칭 & 공동 프로모션', '전담 PM 및 촬영 디렉션', '실시간 대시보드 제공'],
                recommended: goal === 'community' || goal === 'review'
            }
        ];
    }

    function formatChannelLabel(channel) {
        const map = {
            instagram_feed: '인스타그램 피드',
            instagram_reels: '인스타그램 릴스',
            instagram_story: '인스타그램 스토리',
            naver_blog: '네이버 블로그',
            newsletter: '뉴스레터',
            youtube: '유튜브',
            etc: '기타'
        };
        return map[channel] || channel;
    }

    function formatBudget(range) {
        switch (range) {
            case 'under_1m': return '500만 원 미만';
            case '1m_2m': return '500만 ~ 1,000만 원';
            case '2m_5m': return '1,000만 ~ 2,000만 원';
            case 'over_5m': return '2,000만 원 이상';
            default: return '협의 필요';
        }
    }

    function formatMarketingGoal(goal) {
        const map = {
            awareness: '인지도 확장',
            conversion: '예매/매출 증대',
            review: '후기/UGC 축적',
            community: '커뮤니티 확장'
        };
        return map[goal] || '목표 미정';
    }

    function formatUsageScope(scope) {
        switch (scope) {
            case 'internal': return '내부 검토용';
            case 'online': return '온라인 게시 허용';
            case 'secondary': return '2차 활용 동의';
            default: return '미확인';
        }
    }

    function buildOperationsNote(organization, marketing) {
        const billing = organization?.billingType === 'business' ? '세금계산서 발행 가능' : '개인 결제 (현금영수증)';
        const ticket = marketing.ticketEvent === 'yes' ? '티켓 프로모션 예정' : '티켓 프로모션 미진행';
        return `${billing} · ${ticket}`;
    }

    function parseRunDates(raw) {
        if (!raw) {
            return { rangeLabel: '미정', summary: '운영 기간 정보가 필요합니다.', milestones: defaultMilestones() };
        }
        const match = raw.match(/(20\d{2})[.\-](\d{1,2})[.\-](\d{1,2})/);
        const endMatch = raw.match(/~\s*(20\d{2}[.\-]\d{1,2}[.\-]\d{1,2})/);
        let start = match ? new Date(`${match[1]}-${match[2]}-${match[3]}`) : null;
        let end = null;
        if (endMatch && endMatch[1]) {
            const parts = endMatch[1].split(/[.\-]/);
            end = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
        }
        if (!start || isNaN(start)) start = new Date();
        if (!end || isNaN(end)) end = new Date(start.getTime() + 21 * 24 * 60 * 60 * 1000);
        const weeks = Math.max(1, Math.round((end - start) / (7 * 24 * 60 * 60 * 1000)));
        const summary = `${formatDate(start)} 시작 · 약 ${weeks}주 운영 예상`;
        return {
            startDate: start,
            endDate: end,
            summary,
            rangeLabel: `${formatDate(start)} ~ ${formatDate(end)}`,
            milestones: buildMilestones(start)
        };
    }

    function buildMilestones(start) {
        return {
            d30: `D-30 (${formatDate(shiftDate(start, -30))})`,
            d21: `D-21 (${formatDate(shiftDate(start, -21))})`,
            d14: `D-14 (${formatDate(shiftDate(start, -14))})`,
            d7: `D-7 (${formatDate(shiftDate(start, -7))})`,
            d3: `D-3 (${formatDate(shiftDate(start, -3))})`,
            day: `Day (${formatDate(start)})`
        };
    }

    function defaultMilestones() {
        return { d30: 'D-30', d21: 'D-21', d14: 'D-14', d7: 'D-7', d3: 'D-3', day: 'Day' };
    }

    function shiftDate(date, offset) {
        const copy = new Date(date);
        copy.setDate(copy.getDate() + offset);
        return copy;
    }

    function formatDate(date) {
        if (!(date instanceof Date) || isNaN(date)) return '미정';
        const y = date.getFullYear();
        const m = `${date.getMonth() + 1}`.padStart(2, '0');
        const d = `${date.getDate()}`.padStart(2, '0');
        return `${y}.${m}.${d}`;
    }

    function sanitizeText(value) {
        if (typeof value !== 'string') return value;
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
})();
