(function () {
    const DRAFT_KEY = "spotlightPromotionDraft";
    const SUBMISSION_KEY = "spotlightLatestSubmission";
    const MAX_ASSETS = 10;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const INLINE_LIMIT = 512 * 1024; // 512KB

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("promotionRequestForm");
        if (!form) return;

        const statusEl = document.getElementById("formStatus");
        const synopsisInput = document.getElementById("synopsis");
        const synopsisCounter = document.getElementById("synopsisCounter");
        const posterInput = document.getElementById("posterUpload");
        const posterPreview = document.getElementById("posterPreview");
        const assetInput = document.getElementById("assetUpload");
        const assetList = document.getElementById("assetList");
        const draftButtons = document.querySelectorAll("#saveDraft, #saveDraftTop");
        const draftTimestamp = document.getElementById("draftTimestamp");

        const state = {
            poster: null,
            assets: [],
        };

        loadDraft();
        updateCounter();
        renderPoster();
        renderAssets();

        synopsisInput?.addEventListener("input", updateCounter);
        posterInput?.addEventListener("change", handlePosterChange);
        assetInput?.addEventListener("change", handleAssetChange);
        draftButtons.forEach((btn) => btn?.addEventListener("click", onSaveDraft));

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                showStatus("error", "필수 항목을 확인해주세요.");
                form.reportValidity();
                return;
            }
            showStatus("loading", "제안 요청을 저장하는 중입니다...");
            const submission = await buildSubmission();
            localStorage.setItem(SUBMISSION_KEY, JSON.stringify(submission));
            localStorage.removeItem(DRAFT_KEY);
            showStatus("success", "제안 요청이 저장되었습니다. 완료 페이지로 이동합니다.");
            setTimeout(() => {
                window.location.href = "request-complete.html";
            }, 600);
        });

        function updateCounter() {
            if (!synopsisInput || !synopsisCounter) return;
            synopsisCounter.textContent = `${synopsisInput.value.length} / ${synopsisInput.maxLength}`;
        }

        function handlePosterChange(event) {
            const file = event.target.files?.[0];
            if (!file) {
                state.poster = null;
                renderPoster();
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                showStatus("error", "포스터 파일은 10MB 이하로 업로드해주세요.");
                posterInput.value = "";
                return;
            }
            if (!file.type.startsWith("image/")) {
                showStatus("error", "이미지 파일만 업로드할 수 있습니다.");
                posterInput.value = "";
                return;
            }
            readFile(file).then((dataUrl) => {
                state.poster = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: file.size <= INLINE_LIMIT ? dataUrl : null,
                };
                renderPoster();
            });
        }

        function renderPoster() {
            if (!posterPreview) return;
            posterPreview.innerHTML = "";
            if (!state.poster) return;
            const info = document.createElement("p");
            info.textContent = `${state.poster.name} (${formatFileSize(state.poster.size)})`;
            posterPreview.appendChild(info);
            if (state.poster.preview) {
                const img = document.createElement("img");
                img.src = state.poster.preview;
                img.alt = state.poster.name;
                posterPreview.appendChild(img);
            }
        }

        function handleAssetChange(event) {
            const files = Array.from(event.target.files || []);
            if (!files.length) return;
            const combined = [...state.assets];
            for (const file of files) {
                if (combined.length >= MAX_ASSETS) {
                    showStatus("error", "첨부 파일은 최대 10개까지 업로드할 수 있습니다.");
                    break;
                }
                if (file.size > MAX_FILE_SIZE) {
                    showStatus("error", `${file.name} 파일이 10MB를 초과했습니다.`);
                    continue;
                }
                combined.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                });
            }
            state.assets = combined;
            renderAssets();
            assetInput.value = "";
        }

        function renderAssets() {
            if (!assetList) return;
            assetList.innerHTML = "";
            const empty = assetList.previousElementSibling;
            if (!state.assets.length) {
                if (empty) empty.classList.add("empty");
                return;
            }
            if (empty) empty.classList.remove("empty");
            state.assets.forEach((asset, index) => {
                const item = document.createElement("li");
                item.className = "asset-item";
                item.innerHTML = `
                    <div class="asset-info">
                        <strong>${asset.name}</strong>
                        <span>${formatFileSize(asset.size)}</span>
                    </div>
                    <button type="button" data-index="${index}" class="btn btn-sm btn-secondary">삭제</button>
                `;
                const removeBtn = item.querySelector("button");
                removeBtn?.addEventListener("click", () => {
                    state.assets.splice(index, 1);
                    renderAssets();
                });
                assetList.appendChild(item);
            });
        }

        function onSaveDraft(event) {
            event.preventDefault();
            const draft = collectFormData();
            draft.timestamp = new Date().toISOString();
            draft.poster = state.poster;
            draft.assets = state.assets;
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            showStatus("info", "임시 저장이 완료되었습니다.");
            if (draftTimestamp) {
                const date = new Date(draft.timestamp);
                draftTimestamp.textContent = `마지막 임시 저장: ${formatDateTime(date)}`;
            }
        }

        function loadDraft() {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            try {
                const draft = JSON.parse(raw);
                applyDraft(draft);
                showStatus("info", "임시 저장된 내용을 불러왔습니다.");
                if (draft.timestamp && draftTimestamp) {
                    draftTimestamp.textContent = `마지막 임시 저장: ${formatDateTime(new Date(draft.timestamp))}`;
                }
            } catch (error) {
                console.error("임시 저장 데이터를 불러오는 중 오류가 발생했습니다.", error);
            }
        }

        function applyDraft(draft) {
            const entries = Object.entries(draft || {});
            entries.forEach(([key, value]) => {
                const field = form.querySelector(`[name="${key}"]`);
                if (!field || key === "poster" || key === "assets" || key === "timestamp") return;
                if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
                    field.value = value;
                } else if (field instanceof HTMLSelectElement) {
                    field.value = value;
                }
            });
            if (Array.isArray(draft.channels)) {
                form.querySelectorAll('input[name="channels"]').forEach((input) => {
                    input.checked = draft.channels.includes(input.value);
                });
            }
            if (state && draft.poster) {
                state.poster = draft.poster;
                renderPoster();
            }
            if (state && Array.isArray(draft.assets)) {
                state.assets = draft.assets;
                renderAssets();
            }
        }

        async function buildSubmission() {
            const data = collectFormData();
            data.timestamp = new Date().toISOString();
            data.poster = state.poster;
            data.assets = state.assets;
            return data;
        }

        function collectFormData() {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                if (key === "channels") {
                    if (!Array.isArray(data.channels)) {
                        data.channels = [];
                    }
                    data.channels.push(value);
                    return;
                }
                data[key] = value;
            });
            return data;
        }

        function showStatus(type, message) {
            if (!statusEl) return;
            statusEl.className = "form-status";
            if (type) statusEl.classList.add(type);
            statusEl.textContent = message;
        }

        function formatFileSize(size) {
            if (size >= 1024 * 1024) {
                return `${(size / (1024 * 1024)).toFixed(1)}MB`;
            }
            if (size >= 1024) {
                return `${(size / 1024).toFixed(0)}KB`;
            }
            return `${size}B`;
        }

        function formatDateTime(date) {
            return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        }

        function pad(value) {
            return String(value).padStart(2, "0");
        }

        function readFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    });
})();
