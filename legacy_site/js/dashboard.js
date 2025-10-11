(function () {
    const STORAGE_KEY = 'promotionRequests';

    let allRequests = [];
    let filtered = [];
    let currentFilter = 'all';
    let selectedDate = null;
    let selectedId = null;

    document.addEventListener('DOMContentLoaded', () => {
        allRequests = readRequests();
        wireEvents();
        render();
    });

    function readRequests() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('저장된 요청 데이터를 불러오지 못했습니다.', error);
            return [];
        }
    }

    function persistRequests() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allRequests));
    }

    function wireEvents() {
        const filterGroup = document.querySelector('.filter-buttons');
        if (filterGroup) {
            filterGroup.addEventListener('click', (event) => {
                const button = event.target.closest('button[data-filter]');
                if (!button) return;
                currentFilter = button.dataset.filter;
                selectedDate = null;
                filterGroup.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                render();
            });
        }

        const exportButton = document.getElementById('export-csv-btn');
        if (exportButton) {
            exportButton.addEventListener('click', exportCsv);
        }

        const listBody = document.getElementById('request-list-body');
        if (listBody) {
            listBody.addEventListener('change', (event) => {
                const select = event.target.closest('.status-select');
                if (!select) return;
                const row = select.closest('tr');
                if (!row) return;
                const id = Number(row.dataset.id);
                updateStatus(id, select.value);
            });

            listBody.addEventListener('click', (event) => {
                const deleteBtn = event.target.closest('.btn-danger');
                const row = event.target.closest('tr[data-id]');
                if (!row) return;
                const id = Number(row.dataset.id);
                if (deleteBtn) {
                    deleteRequest(id);
                } else {
                    selectedId = id;
                    renderDetail();
                    highlightSelectedRow();
                }
            });
        }
    }

    function updateStatus(id, status) {
        const index = allRequests.findIndex(req => req.id === id);
        if (index === -1) return;
        allRequests[index].status = status;
        persistRequests();
        render();
    }

    function deleteRequest(id) {
        if (!confirm('해당 요청을 삭제하시겠습니까?')) return;
        allRequests = allRequests.filter(req => req.id !== id);
        if (selectedId === id) {
            selectedId = null;
        }
        persistRequests();
        render();
    }

    function exportCsv() {
        if (!allRequests.length) {
            alert('내보낼 요청 데이터가 없습니다.');
            return;
        }
        const headers = ['id','performanceTitle','companyName','contactName','email','status','uploadDate'];
        const lines = [headers.join(',')];
        allRequests.forEach(req => {
            const row = [
                req.id,
                quote(req.performanceTitle),
                quote(req.companyName),
                quote(req.contactName),
                quote(req.email),
                quote(req.status),
                quote(req.uploadDate || '')
            ];
            lines.push(row.join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `spotlight_requests_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function quote(value) {
        if (value == null) return '';
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
    }

    function applyFilters() {
        filtered = [...allRequests];
        if (currentFilter !== 'all') {
            filtered = filtered.filter(req => req.status === currentFilter);
        }
        if (selectedDate) {
            filtered = filtered.filter(req => req.uploadDate === selectedDate);
        }
    }

    function render() {
        applyFilters();
        renderList();
        renderDetail();
        renderCalendar();
    }

    function renderList() {
        const body = document.getElementById('request-list-body');
        if (!body) return;
        body.innerHTML = '';
        if (!filtered.length) {
            body.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2.5rem 0; color: var(--text-muted);">조건에 맞는 요청이 없습니다.</td></tr>';
            return;
        }
        filtered.forEach(req => {
            const tr = document.createElement('tr');
            tr.dataset.id = req.id;
            if (req.id === selectedId) {
                tr.classList.add('selected');
            }
            tr.innerHTML = `
                <td>${req.id}</td>
                <td>${escapeHtml(req.performanceTitle)}</td>
                <td>${escapeHtml(req.companyName)}</td>
                <td>${req.uploadDate || '-'}</td>
                <td>
                    <select class="status-select form-select form-select-sm">
                        <option value="pending" ${req.status === 'pending' ? 'selected' : ''}>검토 대기</option>
                        <option value="working" ${req.status === 'working' ? 'selected' : ''}>제작 진행</option>
                        <option value="completed" ${req.status === 'completed' ? 'selected' : ''}>발행 완료</option>
                    </select>
                </td>
                <td><button class="btn btn-danger btn-sm" type="button">삭제</button></td>
            `;
            body.appendChild(tr);
        });
    }

    function renderDetail() {
        const container = document.getElementById('detail-view-content');
        if (!container) return;
        if (!selectedId) {
            container.innerHTML = '<p>좌측 목록에서 요청을 선택하면 상세 정보가 표시됩니다.</p>';
            return;
        }
        const request = allRequests.find(req => req.id === selectedId);
        if (!request) {
            container.innerHTML = '<p>선택한 요청을 찾을 수 없습니다.</p>';
            return;
        }
        container.innerHTML = `
            <div class="detail-item"><strong>공연명</strong><span>${escapeHtml(request.performanceTitle)}</span></div>
            <div class="detail-item"><strong>단체명</strong><span>${escapeHtml(request.companyName)}</span></div>
            <div class="detail-item"><strong>담당자</strong><span>${escapeHtml(request.contactName)}</span></div>
            <div class="detail-item"><strong>이메일</strong><span><a href="mailto:${escapeHtml(request.email)}">${escapeHtml(request.email)}</a></span></div>
            <div class="detail-item"><strong>접수일</strong><span>${request.uploadDate || '-'}</span></div>
            <div class="detail-item"><strong>프로모션 메모</strong><span>${escapeHtml(request.promotionPoints || '입력된 메모가 없습니다.')}</span></div>
        `;
    }

    function highlightSelectedRow() {
        document.querySelectorAll('#request-list-body tr').forEach(row => {
            row.classList.toggle('selected', Number(row.dataset.id) === selectedId);
        });
    }

    function renderCalendar() {
        const container = document.getElementById('calendar-container');
        if (!container) return;
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let html = `<div style="text-align:center; margin-bottom:1rem;"><strong>${year}년 ${month + 1}월</strong></div>`;
        html += '<table class="calendar-table"><thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead><tbody>';

        let date = 1;
        for (let i = 0; i < 6; i++) {
            let row = '<tr>';
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDay.getDay()) || date > lastDay.getDate()) {
                    row += '<td></td>';
                } else {
                    const current = new Date(year, month, date);
                    const dateString = current.toISOString().split('T')[0];
                    const events = allRequests.filter(req => req.uploadDate === dateString);
                    const classes = [];
                    if (events.length) classes.push('has-event');
                    if (selectedDate === dateString) classes.push('selected-date');
                    row += `<td class="${classes.join(' ')}" data-date="${dateString}">
                        <div>${date}</div>
                        ${events.length ? '<div class="event-dot"></div>' : ''}
                    </td>`;
                    date++;
                }
            }
            row += '</tr>';
            html += row;
            if (date > lastDay.getDate()) break;
        }
        html += '</tbody></table>';
        container.innerHTML = html;

        container.querySelectorAll('td[data-date]').forEach(cell => {
            cell.addEventListener('click', () => {
                selectedDate = cell.dataset.date === selectedDate ? null : cell.dataset.date;
                render();
            });
        });
    }

    function escapeHtml(value) {
        if (value == null) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
})();
