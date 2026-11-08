(function(){
 const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const val=(r,...n)=>window.GZYLZ_DATA.get(r,...n),has=s=>String(s||"").trim()!=="";
 function pill(t,c=""){return has(t)?'<span class="pill '+c+'">'+esc(t)+'</span>':"";}
 function record(r){
  const show=val(r,"show"),prod=val(r,"production"),date=val(r,"date"),master=val(r,"master"),cast=val(r,"cast"),notes=val(r,"notes"),type=val(r,"file type"),size=val(r,"size"),gift=val(r,"gift/limited trade","gift / limited trade"),nft=val(r,"nft"),highlights=val(r,"highlights"),concert=val(r,"concert or not"),subs=val(r,"subtitles"),language=val(r,"language");
  const id=r._id,disabled=has(nft),line=[show,date,master,size].filter(has).join(" | ");
  return '<article class="record"><div class="record-summary" role="button" tabindex="0" aria-expanded="false"><input class="record-check" type="checkbox" aria-label="Select '+esc(show)+'" data-select-record="'+id+'" data-kind="Video" data-line="'+esc(line)+'" '+(disabled?'disabled title="NFT — unavailable for selection"':'')+'><div class="record-summary-main"><span class="record-show">'+esc(show||"Untitled recording")+'</span><span class="record-meta">'+esc([prod,date].filter(has).join(" · "))+'</span><span class="record-master">'+(has(master)?"| "+esc(master):"")+'</span></div><span class="chevron">⌄</span></div><div class="record-details" hidden>'+
  (has(show)?'<div class="detail-line"><strong>'+esc(show)+'</strong> '+pill(concert==="Concert"?"Concert":"")+'</div>':'')+
  (has(prod)||has(date)?'<div class="detail-line">'+esc([prod,date].filter(has).join(" | "))+'</div>':'')+
  (has(master)?'<div class="detail-line"><span class="detail-label">Master:</span> '+esc(master)+'</div>':'')+
  (has(cast)?'<div class="detail-line"><span class="detail-label">Cast:</span> '+esc(cast)+'</div>':'')+
  (has(notes)?'<div class="detail-line"><span class="detail-label">Notes:</span> '+esc(notes)+'</div>':'')+
  (has(highlights)?'<div class="detail-line"><span class="detail-label">Highlights:</span> '+esc(highlights)+'</div>':'')+
  (has(language)?'<div class="detail-line"><span class="detail-label">Language:</span> '+esc(language)+'</div>':'')+
  (has(subs)?'<div class="detail-line"><span class="detail-label">Subtitles:</span> '+esc(subs)+'</div>':'')+
  '<div class="record-pills">'+pill(type,"pill-type")+pill(size)+pill(gift,gift.toLowerCase().includes("never gift")?"pill-never":"")+pill(nft,"pill-nft")+'</div></div></article>';
 }
 function render(rows){
  const box=$("#video-records");$("#video-count").textContent=rows.length;
  const groups=new Map();rows.forEach((r,i)=>{const t=val(r,"tital","title"),key=has(t)?t:"Other recordings "+(i+1);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);});
  box.innerHTML=groups.size?[...groups.entries()].map(([name,items],i)=>'<section class="show-group" data-group="'+i+'"><button class="group-toggle" type="button" aria-expanded="false"><span class="group-name">'+esc(name)+'</span><span class="count-pill">'+items.length+'</span><span class="chevron">⌄</span></button><div class="record-list" hidden>'+(items.length>1?'<div class="group-actions"><button type="button" class="button" data-group-details>Show all details</button></div>':"")+items.map(record).join("")+'</div>'</section>').join(""):'<div class="empty-state">No video recordings found.</div>';
  if(window.GZYLZ_CART){const selected=new Set(window.GZYLZ_CART.read().map(x=>x.id));box.querySelectorAll("[data-select-record]").forEach(cb=>cb.checked=selected.has(cb.dataset.selectRecord));window.GZYLZ_CART.update();}
 }
 document.addEventListener("click",e=>{
  const localDetails=e.target.closest("[data-group-details]");if(localDetails){const list=localDetails.closest(".record-list"),open=localDetails.dataset.open!=="true";list.querySelectorAll(".record-details").forEach(d=>{d.hidden=!open;const summary=d.previousElementSibling;summary.setAttribute("aria-expanded",String(open));summary.classList.toggle("open",open);});localDetails.dataset.open=String(open);localDetails.textContent=open?"Hide all details":"Show all details";e.stopPropagation();return;}
  const allDetails=e.target.closest("[data-expand-details]");
  if(allDetails){const open=allDetails.dataset.open!=="true";document.querySelectorAll(".show-group").forEach(s=>{const list=s.querySelector(".record-list");list.hidden=!open;s.classList.toggle("open",open);s.querySelector(".group-toggle").setAttribute("aria-expanded",String(open));s.querySelectorAll(".record-details").forEach(d=>{d.hidden=!open;const summary=d.previousElementSibling;summary.setAttribute("aria-expanded",String(open));summary.classList.toggle("open",open);});});allDetails.dataset.open=String(open);allDetails.textContent=open?"Hide all details":"Show all details";return;}
  const expand=e.target.closest("[data-expand-all]");if(expand){const open=expand.dataset.expandAll==="true";document.querySelectorAll(".show-group").forEach(s=>{s.querySelector(".record-list").hidden=!open;s.classList.toggle("open",open);s.querySelector(".group-toggle").setAttribute("aria-expanded",String(open));});expand.textContent=open?"Collapse groups":"Expand groups";expand.dataset.expandAll=String(!open);return;}
  const group=e.target.closest(".group-toggle");if(group){const s=group.closest(".show-group"),list=s.querySelector(".record-list"),open=list.hidden;list.hidden=!open;s.classList.toggle("open",open);group.setAttribute("aria-expanded",String(open));return;}
  const summary=e.target.closest(".record-summary");if(summary&&!e.target.closest("input")){const d=summary.nextElementSibling,o=d.hidden;d.hidden=!o;summary.setAttribute("aria-expanded",String(o));summary.classList.toggle("open",o);}
 });
 document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".record-summary")){e.preventDefault();e.target.click();}});
 async function init(){try{render(await window.GZYLZ_DATA.loadSheet("video"));}catch(e){$("#video-records").innerHTML='<div class="empty-state">Unable to load the Google Sheet right now. Please refresh and try again.<br><small>'+esc(e.message)+'</small></div>'; }}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();