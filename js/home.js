(function(){
 const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let audio=[],video=[],filter="all";
 const get=(r,...n)=>window.GZYLZ_DATA.get(r,...n),has=s=>String(s??"").trim()!=="";
 const pill=(s,c="")=>has(s)?'<span class="pill '+c+'">'+esc(s)+'</span>':"";
 const giftClass=s=>{const v=String(s??"").trim().toLowerCase();if(v.includes("never gift"))return "pill-never";if(v.includes("limited trade"))return "pill-limited";if(v.includes("only gift"))return "pill-only-gift";return "";};
 function record(r){
  const kind=r._kind,show=get(r,"show")||"Untitled recording",prod=get(r,"production"),date=get(r,"date (yyyy-mm-dd)","date"),master=get(r,"master"),cast=get(r,"cast"),notes=get(r,"notes"),my=get(r,"my notes"),nft=get(r,"nft");
  const type=get(r,"type","file type"),size=get(r,"size"),tracking=get(r,"tracked/untracked"),gift=get(r,"gift / limited trade","gift/limited trade"),concert=get(r,"concert or not"),uncertain=get(r,"uncertain");
  const id=r._id,line=[show,date,master,size].filter(has).join(" | "),disabled=has(nft);
  return '<article class="record"><div class="record-summary"><input class="record-check" type="checkbox" aria-label="Select '+esc(show)+'" data-select-record="'+id+'" data-kind="'+(kind==="audio"?"Audio":"Video")+'" data-line="'+esc(line)+'" '+(disabled?'disabled title="NFT EXCEPT THROUGH MASTER"':'')+'><button type="button" class="record-summary-button" aria-expanded="false"><div class="record-summary-main"><span class="record-show">'+esc(show)+'</span>'+pill(kind==="audio"?"Audio":"Video","pill-type")+'<span class="record-meta">'+esc([prod,date].filter(has).join(" | "))+'</span><span class="record-master">'+(has(master)?"| "+esc(master):"")+'</span></div><span class="chevron">⌄</span></button></div><div class="record-details" hidden>'+
  '<div class="detail-line"><strong>'+esc(show)+'</strong> '+pill(concert==="Concert"?"Concert":"")+'</div>'+
  (has(prod)||has(date)?'<div class="detail-line"><strong>'+esc([prod,date].filter(has).join(" | "))+'</strong> '+pill(uncertain.toLowerCase()==="yes"?"Unsure date info":"")+'</div>':'')+
  (has(master)?'<div class="detail-line"><span class="detail-label">Master:</span> '+esc(master)+'</div>':'')+
  (has(cast)?'<div class="detail-line"><span class="detail-label">Cast:</span> '+esc(cast)+'</div>':'')+
  (has(notes)?'<div class="detail-line"><span class="detail-label">Notes:</span> '+esc(notes)+'</div>':'')+
  (has(my)?'<div class="detail-line my-notes">My Notes: '+esc(my)+'</div>':'')+
  (has(get(r,"highlights"))?'<div class="detail-line"><span class="detail-label">Highlights:</span> '+esc(get(r,"highlights"))+'</div>':'')+
  (has(get(r,"language"))?'<div class="detail-line"><span class="detail-label">Language:</span> '+esc(get(r,"language"))+'</div>':'')+
  (has(get(r,"subtitles"))?'<div class="detail-line"><span class="detail-label">Subtitles:</span> '+esc(get(r,"subtitles"))+'</div>':'')+
  '<div class="record-pills">'+pill(type,"pill-type")+pill(size)+pill(tracking,"pill-tracking")+pill(gift,giftClass(gift))+pill(nft,"pill-nft")+'</div></div></article>';
 }
 function render(){
  const q=$("#home-search").value.trim().toLowerCase(),out=$("#home-results"),count=$("#home-result-count");if(!q){out.innerHTML="";if(count)count.textContent="";return;}
  const pool=filter==="audio"?audio:filter==="video"?video:[...audio,...video];
  const matches=pool.filter(r=>Object.entries(r).some(([k,v])=>!k.startsWith("_")&&String(v).toLowerCase().includes(q)));
  if(count)count.textContent=matches.length+" matching recording"+(matches.length===1?"":"s");
  matches.sort((a,b)=>String(get(a,"show")).localeCompare(String(get(b,"show")),undefined,{sensitivity:"base"}));
  const groups=new Map();matches.forEach((r,i)=>{const t=get(r,"title")||get(r,"tital"),key=has(t)?t:"Other recordings "+(i+1);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);});
  out.innerHTML=groups.size?[...groups.entries()].map(([name,items],i)=>{const action=items.length>1?'<button type="button" class="button group-detail-action" data-group-details hidden>Show all details</button>':"";return '<section class="show-group" data-group="'+i+'"><div class="group-heading"><button class="group-toggle" type="button" aria-expanded="false"><span class="group-name">'+esc(name)+'</span></button>'+action+'<span class="count-pill">'+items.length+'</span><span class="chevron">⌄</span></div><div class="record-list" hidden>'+items.map(record).join("")+'</div></section>';}).join(""):'<div class="empty-state">No matching recordings.</div>';
  const selected=new Set((window.GZYLZ_CART?.read()||[]).map(x=>x.id));out.querySelectorAll("[data-select-record]").forEach(cb=>cb.checked=selected.has(cb.dataset.selectRecord));
 }
 document.querySelector(".home-main").addEventListener("click",e=>{
  const filterButton=e.target.closest("[data-search-filter]");if(filterButton){filter=filterButton.dataset.searchFilter;document.querySelectorAll("[data-search-filter]").forEach(b=>b.classList.toggle("active",b===filterButton));render();return;}
  const local=e.target.closest("[data-group-details]");if(local){const group=local.closest(".show-group"),open=local.dataset.open!=="true";group.querySelectorAll(".record-details").forEach(d=>{d.hidden=!open;const s=d.previousElementSibling;s.querySelector(".record-summary-button").setAttribute("aria-expanded",String(open));s.classList.toggle("open",open);});local.dataset.open=String(open);local.textContent=open?"Hide all details":"Show all details";e.stopPropagation();return;}
  const group=e.target.closest(".group-toggle");if(group){const s=group.closest(".show-group"),list=s.querySelector(".record-list"),open=list.hidden;list.hidden=!open;s.classList.toggle("open",open);group.setAttribute("aria-expanded",String(open));const action=s.querySelector("[data-group-details]");if(action){action.hidden=!open;action.dataset.open="false";action.textContent="Show all details";}return;}
  const summary=e.target.closest(".record-summary-button");if(summary){const d=summary.parentElement.nextElementSibling,open=d.hidden;d.hidden=!open;summary.setAttribute("aria-expanded",String(open));summary.parentElement.classList.toggle("open",open);}
 });
 document.addEventListener("DOMContentLoaded",async()=>{
  try{[audio,video]=await Promise.all([window.GZYLZ_DATA.loadRecords("audio"),window.GZYLZ_DATA.loadRecords("video")]);document.querySelectorAll("[data-audio-count]").forEach(e=>e.textContent=audio.length);document.querySelectorAll("[data-video-count]").forEach(e=>e.textContent=video.length);$("#home-search")?.addEventListener("input",render);document.querySelectorAll("[data-search-filter]").forEach(b=>b.classList.toggle("active",b.dataset.searchFilter==="all"));if(window.GZYLZ_CART)window.GZYLZ_CART.update();}
  catch(e){const out=$("#home-results");if(out)out.innerHTML='<div class="empty-state">Something went wrong…</div>';}
 });
})();