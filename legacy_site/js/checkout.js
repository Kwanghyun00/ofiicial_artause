(function () {
    const PLAN_STORAGE_KEY = 'spotlightSelectedPlan';
    const SUBMISSION_STORAGE_KEY = 'spotlightLatestSubmission';
    const RECEIPT_STORAGE_KEY = 'spotlightPaymentReceipt';

    document.addEventListener('DOMContentLoaded', () => {
        const planData = readJson(PLAN_STORAGE_KEY);
        const submission = readJson(SUBMISSION_STORAGE_KEY);

        renderSummary(planData, submission);
        wirePaymentOptions();

        const completeButton = document.getElementById('completePayment');
        if (completeButton) {
            completeButton.addEventListener('click', () => handlePayment(planData, submission));
        }
    });

    function readJson(key) {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (error) {
            console.error('로컬 스토리지 데이터를 파싱하지 못했습니다.', error);
            return null;
        }
    }

    function renderSummary(plan, submission) {
        const priceEl = document.getElementById('summaryPrice');
        const descEl = document.getElementById('summaryPlanDescription');
        const featureList = document.getElementById('summaryFeatures');
        const projectEl = document.getElementById('summaryProject');

        if (!plan) {
            if (priceEl) priceEl.textContent = '-';
            if (descEl) descEl.textContent = '선택된 패키지가 없습니다. 제안서 페이지로 돌아가 패키지를 선택해주세요.';
            if (featureList) featureList.innerHTML = '';
            if (projectEl) projectEl.innerHTML = '';
            return;
        }

        if (priceEl) priceEl.textContent = plan.price || '-';
        if (descEl) descEl.textContent = plan.planName || '';
        if (featureList) {
            featureList.innerHTML = '';
            (plan.features || []).forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featureList.appendChild(li);
            });
        }
        if (projectEl && submission) {
            const title = submission.performance?.title || '미정';
            const organisation = submission.organization?.organizationName || '';
            projectEl.innerHTML = `<strong>${title}</strong><br>${organisation}`;
        }
    }

    function wirePaymentOptions() {
        const container = document.getElementById('paymentMethods');
        if (!container) return;
        container.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                container.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const input = option.querySelector('input');
                if (input) input.checked = true;
            });
        });
    }

    async function handlePayment(planData, submission) {
        const statusEl = document.getElementById('checkoutStatus');
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        const nameInput = document.getElementById('billingName');
        const emailInput = document.getElementById('billingEmail');
        const noteInput = document.getElementById('billingNote');

        if (!planData) {
            updateStatus(statusEl, '선택한 패키지 정보를 찾을 수 없습니다. 제안서 페이지에서 다시 선택해주세요.', 'error');
            return;
        }
        if (!paymentMethod) {
            updateStatus(statusEl, '결제 수단을 선택해주세요.', 'error');
            return;
        }
        if (!nameInput.value.trim() || !emailInput.value.trim()) {
            updateStatus(statusEl, '결제자 이름과 이메일을 모두 입력해주세요.', 'error');
            return;
        }

        updateStatus(statusEl, 'PortOne 결제 모듈을 호출하는 중입니다...', 'loading');
        await delay(1200);
        updateStatus(statusEl, '결제 승인 상태를 확인하고 있습니다...', 'loading');
        await delay(800);

        try {
            if (submission?.requestId) {
                await updateRequestStatus(submission.requestId, {
                    status: 'confirmed',
                    paymentStatus: 'paid'
                });
            }

            const receipt = {
                plan: planData,
                submissionId: submission?.requestId || null,
                amount: planData.price,
                method: paymentMethod.value,
                billingName: nameInput.value.trim(),
                billingEmail: emailInput.value.trim(),
                note: noteInput.value.trim(),
                issuedAt: new Date().toISOString()
            };
            localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
            updateStatus(statusEl, '결제가 완료되었습니다. 접수 완료 페이지로 이동합니다.', 'success');
            setTimeout(() => {
                window.location.href = 'request-complete.html';
            }, 1500);
        } catch (error) {
            console.error(error);
            updateStatus(statusEl, `결제 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
        }
    }

    function updateStatus(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `status-banner ${type}`;
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function updateRequestStatus(id, payload) {
        return fetch(`/api/requests/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || '서버 오류가 발생했습니다.');
                });
            }
            return response.json();
        });
    }
})();
