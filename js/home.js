(function(){
 const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let audio=[],video=[];
 async function init(){
  try{
   [audio,video]=await Promise.all([window.GZYLZ_DATA.loadSheet("audio"),window.GZYLZ_DATA.loadSheet("video")]);
   document.querySelectorAll("[data-audio-count]").forEach(e=>e.textContent=audio.length);
   document.querySelectorAll("[data-video-count]").forEach(e=>e.textContent=video.length);
  }catch(e){const r=$("#home-results");if(r)r.innerHTML='<p class="empty-state">Could not load the collection. Please refresh the page.</p>';}
 }
 function search(){
  const q=$("#home-search").value.trim().toLowerCase(),out=$("#home-results");
  if(!q){out.innerHTML="";return;}
  const matches=[...audio,...video].filter(r=>Object.entries(r).some(([k,v])=>!k.startsWith("_")&&String(v).toLowerCase().includes(q))).slice(0,30);
  out.innerHTML=matches.length?matches.map(r=>{
   const kind=r._kind,show=window.GZYLZ_DATA.get(r,"show")||"Untitled recording",prod=window.GZYLZ_DATA.get(r,"production"),date=window.GZYLZ_DATA.get(r,"date (yyyy-mm-dd)","date");
   return '<a class="search-result" href="'+(kind==="audio"?"audio.html":"video.html")+'"><strong>['+kind.toUpperCase()+'] '+esc(show)+'</strong><small>'+esc([prod,date].filter(Boolean).join(" · "))+'</small></a>';
  }).join(""):'<div class="empty-state">No matching recordings.</div>';
 }
 document.addEventListener("DOMContentLoaded",()=>{init();$("#home-search")?.addEventListener("input",search);});
})();