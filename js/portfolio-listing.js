
(async function(){
  const gallery = document.getElementById('portfolio-gallery');
  const filters = document.getElementById('portfolio-filters');
  if(!gallery) return;
  let items = [];
  try{
    const res = await fetch('data/portfolio.json', {cache:'no-store'});
    const data = await res.json();
    items = data.projects || [];
  }catch(e){ console.warn('portfolio.json missing'); }

  const statusRow = document.createElement('div'); statusRow.className='filter-row'; statusRow.append('상태: ');
  ['전체','진행중','종료'].forEach(s=>{const b=document.createElement('button'); b.className='filter-chip'; b.textContent=s; b.dataset.group='status'; b.dataset.value=s; statusRow.appendChild(b);});
  const tagRow = document.createElement('div'); tagRow.className='filter-row'; tagRow.append('태그: ');
  const tagSet = new Set(); items.forEach(p => (p.tags||[]).forEach(t => tagSet.add(t)));
  tagSet.forEach(t=>{const b=document.createElement('button'); b.className='filter-chip'; b.textContent=t; b.dataset.group='tag'; b.dataset.value=t; tagRow.appendChild(b);});
  const search = document.createElement('input'); search.type='search'; search.placeholder='작품명/장소/키워드 검색'; search.className='filter-search';
  filters?.append(statusRow, tagRow, search);

  const state = { status:'전체', tags:new Set(), q:'' };
  filters?.addEventListener('click', (e)=>{
    if(!(e.target instanceof HTMLButtonElement)) return;
    const g=e.target.dataset.group, v=e.target.dataset.value;
    if(g==='status'){ state.status=v; [...statusRow.querySelectorAll('.filter-chip')].forEach(c=>c.classList.toggle('active', c===e.target)); }
    else if(g==='tag'){ if(state.tags.has(v)) { state.tags.delete(v); e.target.classList.remove('active'); } else { state.tags.add(v); e.target.classList.add('active'); } }
    render();
  });
  search?.addEventListener('input', ()=>{ state.q=search.value.trim().toLowerCase(); render(); });

  function card(p){
    const a=document.createElement('a'); a.href=`project-detail.html?id=${encodeURIComponent(p.id)}`; a.className='case-study-card reveal';
    a.innerHTML=`
      <div class="case-study-thumb" style="background-image:url('${p.image||''}')"></div>
      <div class="case-study-content">
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <h4>${p.title||''}</h4>
        <p>${p.subtitle||''}</p>
        <div class="case-study-result">
          <span class="result-tag">${p.details?.period||''}</span>
          <span class="result-tag">${p.details?.venue||''}</span>
          ${p.status==='ongoing' ? '<span class="result-tag accent">Now Playing</span>' : ''}
        </div>
      </div>`;
    a.addEventListener('mousemove', (e)=>{ const r=a.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5; a.style.transform=`rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-2px)`; });
    a.addEventListener('mouseleave', ()=> a.style.transform='');
    return a;
  }

  function render(){
    gallery.innerHTML='';
    const q=state.q;
    items.filter(p=>{
      const statusOk = state.status==='전체' || (state.status==='진행중' && p.status==='ongoing') || (state.status==='종료' && p.status==='finished');
      const tagsOk = state.tags.size===0 || (p.tags||[]).some(t => state.tags.has(t));
      const qOk = !q || [p.title, p.details?.venue, p.subtitle, p.synopsis].join(' ').toLowerCase().includes(q);
      return statusOk && tagsOk && qOk;
    }).forEach(p => gallery.appendChild(card(p)));
    if (!gallery.childElementCount){ const empty=document.createElement('div'); empty.className='empty'; empty.textContent='조건에 맞는 프로젝트가 없습니다.'; gallery.appendChild(empty); }
  }

  // Initial state
  statusRow.querySelectorAll('.filter-chip')[0]?.classList.add('active');
  render();
})();
