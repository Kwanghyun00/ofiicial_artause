(function () {
    const RECEIPT_STORAGE_KEY = 'spotlightPaymentReceipt';
    const SUBMISSION_STORAGE_KEY = 'spotlightLatestSubmission';

    document.addEventListener('DOMContentLoaded', () => {
        const receipt = loadJson(RECEIPT_STORAGE_KEY);
        const submission = loadJson(SUBMISSION_STORAGE_KEY);
        renderSummary(receipt, submission);
    });

    function loadJson(key) {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (error) {
            console.error('저장된 데이터를 불러오지 못했습니다.', error);
            return null;
        }
    }

    function renderSummary(receipt, submission) {
        const idEl = document.getElementById('receiptId');
        const planEl = document.getElementById('receiptPlan');
        const methodEl = document.getElementById('receiptMethod');
        const amountEl = document.getElementById('receiptAmount');
        const summaryEl = document.getElementById('completeSummary');

        if (!receipt) {
            if (summaryEl) summaryEl.textContent = '제출해주신 정보를 바탕으로 담당 컨설턴트가 24시간 이내 연락드릴 예정입니다.';
            if (idEl) idEl.textContent = '-';
            if (planEl) planEl.textContent = '-';
            if (methodEl) methodEl.textContent = '-';
            if (amountEl) amountEl.textContent = '-';
            return;
        }

        if (idEl) {
            idEl.textContent = receipt.submissionId ? `REQ-${String(receipt.submissionId).padStart(4, '0')}` : '임시 저장';
        }
        if (planEl) {
            planEl.textContent = `${receipt.plan?.planName || '-'} (${receipt.plan?.price || ''})`;
        }
        if (methodEl) {
            methodEl.textContent = formatMethod(receipt.method);
        }
        if (amountEl) {
            amountEl.textContent = receipt.plan?.price || '-';
        }
        if (summaryEl && submission) {
            const orgName = submission.organization?.organizationName || '클라이언트';
            summaryEl.textContent = `${orgName} 캠페인 접수가 완료되었습니다. 제작팀이 자료를 확인한 뒤 연락드릴 예정입니다.`;
        }
    }

    function formatMethod(method) {
        switch (method) {
            case 'card':
                return '신용 / 체크카드';
            case 'kakaopay':
                return '카카오페이';
            case 'virtual':
                return '가상계좌';
            default:
                return method || '-';
        }
    }
})();
