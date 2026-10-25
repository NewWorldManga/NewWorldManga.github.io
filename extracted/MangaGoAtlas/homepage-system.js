/* MangaGoAtlas catalogue: keep manga entries visible while chapter images are being uploaded. */
(async()=>{
 const app=document.getElementById('app'); if(!app)return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 try{
  const r=await fetch('/data/content.json?v='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw Error('Could not load manga catalogue');
  const data=await r.json();
  const mangas=Array.isArray(data.mangas)?data.mangas:[];
  if(!mangas.length){app.innerHTML='<p class="empty">Manga catalogue is empty.</p>';return;}
  app.innerHTML='<div class="catalog-head"><div><span>MANGA LIBRARY</span><h2>Browse Manga</h2><p>All manga stay listed. Chapters will appear when their pages are uploaded.</p></div><span class="count">'+mangas.length+' manga</span></div><div class="manga-grid">'+mangas.map(m=>{const id=m.slug||m.id||m.mangaId||'';const title=m.title||m.name||'Manga';const cover=m.cover||m.cover_url||'';return '<a class="manga-card" href="/manga.html?slug='+encodeURIComponent(id)+'">'+(cover?'<img loading="lazy" src="'+esc(cover)+'" alt="'+esc(title)+'" onerror="this.style.display=\'none\'">':'<div class="cover-fallback">M</div>')+'<div class="manga-info"><strong>'+esc(title)+'</strong><span>'+esc(m.native_title||m.nativeTitle||'Manga')+'</span></div></a>'}).join('')+'</div>';
 }catch(e){app.innerHTML='<p class="empty">Could not load manga catalogue. Please refresh.</p>';console.error(e)}
})();