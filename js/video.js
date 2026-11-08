(function(){
 const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const val=(r,...n)=>window.GZYLZ_DATA.get(r,...n),has=s=>String(s||"").trim()!=="";
 function pill(t,c=""){return has(t)?'<span class="pill '+c+'">'+esc(t)+'</span>':"";}
 function record(r){
  const show=val(r,"show"),prod=val(r,"production"),date=val(r,"date"),master=val(r,"master"),cast=val(r,"cast"),notes=val(r,"notes"),type=val(r,"file type"),size=val(r,"size"),gift=val(r,"gift/limited trade","gift / limited trade"),nft=val(r,"nft"),highlights=val(r,"highlights"),concert=val(r,"concert or not"),subs=val(r,"subtitles");
  const id=r._id,disabled=has(nft),line=[show,date,master,size].filter(has).join(" | ");
  return '<article class="record"><div class="record-summary" role="button" tabindex="0" aria-expanded="false"><input class="record-check" type="checkbox" aria-label="Select '+esc(show)+'" data-select-record="'+id+'" data-kind="Video" data-line="'+esc(line)+'" '+(disabled?'disabled title="NFT — unavailable for selection"':'')+'><div class="record-summary-main"><span class="record-show">'+esc(show||"Untitled recording")+'</span><span class="record-meta">'+esc([prod,date].filter(has).join(" · "))+'</span><span class="record-master">'+(has(master)?"| "+esc(master):"")+'</span></div><span class="chevron">⌄</span></div><div class="record-details" hidden>'+
  (has(show)?'<div class="detail-line"><strong>'+esc(show)+'</strong> '+pill(concert==="Concert"?"Concert":"")+'</div>':'')+
  (has(prod)||has(date)?'<div class="detail-line">'+esc([prod,date].filter(has).join(" | "))+'</div>':'')+
  (has(master)?'<div class="detail-line"><span class="detail-label">Master:</span> '+esc(master)+'</div>':'')+
  (has(cast)?'<div class="detail-line"><span class="detail-label">Cast:</span> '+esc(cast)+'</div>':'')+
  (has(notes)?'<div class="detail-line"><span class="detail-label">Notes:</span> '+esc(notes)+'</div>':'')+
  (has(highlights)?'<div class="detail-line"><span class="detail-label">Highlights:</span> '+esc(highlights)+'</div>':'')+
  (has(subs)?'<div class="detail-line"><span class="detail-label">Subtitles:</span> '+esc(subs)+'</div>':'')+
  '<div class="record-pills">'+pill(type,"pill-type")+pill(size)+pill(gift)+pill(nft,"pill-nft")+'</div></div></article>';
 }
 function render(rows){
  const box=$("#video-records");$("#video-count").textContent=rows.length;
  box.innerHTML=rows.length?rows.map(record).join(""):'<div class="empty-state">No video recordings found.</div>';
  if(window.GZYLZ_CART)window.GZYLZ_CART.update();
 }
 document.addEventListener("click",e=>{
  const s=e.target.closest(".record-summary");if(s&&!e.target.closest("input")){const d=s.nextElementSibling,o=d.hidden;d.hidden=!o;s.setAttribute("aria-expanded",String(o));s.classList.toggle("open",o);}
 });
 document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".record-summary")){e.preventDefault();e.target.click();}});
 document.addEventListener("DOMContentLoaded",async()=>{try{render(await window.GZYLZ_DATA.loadSheet("video"));}catch(e){$("#video-records").innerHTML='<div class="empty-state">Unable to load the Google Sheet right now. Please refresh and try again.<br><small>'+esc(e.message)+'</small></div>'; }});
})();