(function(){
 const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const val=(r,...n)=>window.GZYLZ_DATA.get(r,...n);
 const has=s=>String(s||"").trim()!=="";
 function pill(text,cls=""){return has(text)?'<span class="pill '+cls+'">'+esc(text)+'</span>':"";}
 function renderRecord(r){
  const show=val(r,"show"),production=val(r,"production"),date=val(r,"date (yyyy-mm-dd)","date"),master=val(r,"master"),cast=val(r,"cast"),notes=val(r,"notes"),myNotes=val(r,"my notes"),type=val(r,"type"),tracking=val(r,"tracked/untracked"),size=val(r,"size"),gift=val(r,"gift / limited trade"),nft=val(r,"nft"),concert=val(r,"concert or not"),uncertain=val(r,"uncertain");
  const disabled=has(nft),id=r._id;
  const line=[show,date,master,size].filter(has).join(" | ");
  return '<article class="record"><div class="record-summary" role="button" tabindex="0" aria-expanded="false"><input class="record-check" type="checkbox" aria-label="Select '+esc(show)+'" data-select-record="'+id+'" data-kind="Audio" data-line="'+esc(line)+'" '+(disabled?'disabled title="NFT — unavailable for selection"':'')+'><div class="record-summary-main"><span class="record-show">'+esc(show||"Untitled recording")+'</span><span class="record-meta">'+[production,date].filter(has).map(esc).join(" · ")+'</span><span class="record-master">'+(has(master)?"| "+esc(master):"")+'</span></div><span class="chevron">⌄</span></div><div class="record-details" hidden>'+
  (has(show)?'<div class="detail-line"><strong>'+esc(show)+'</strong> '+pill(concert==="Concert"?"Concert":"", "pill-concert")+'</div>':'')+
  (has(production)||has(date)?'<div class="detail-line"><strong>'+esc([production,date].filter(has).join(" | "))+'</strong> '+pill(uncertain.toLowerCase()==="yes"?"Unsure date info":"","pill-uncertain")+'</div>':'')+
  (has(master)?'<div class="detail-line"><span class="detail-label">Master:</span> '+esc(master)+'</div>':'')+
  (has(cast)?'<div class="detail-line"><span class="detail-label">Cast:</span> '+esc(cast)+'</div>':'')+
  (has(notes)?'<div class="detail-line"><span class="detail-label">Notes:</span> '+esc(notes)+'</div>':'')+
  (has(myNotes)?'<div class="detail-line my-notes">My Notes: '+esc(myNotes)+'</div>':'')+
  '<div class="record-pills">'+pill(type,"pill-type")+pill(size)+pill(tracking,"pill-tracking")+pill(gift,gift.toLowerCase().includes("never gift")?"pill-never":"")+pill(nft,"pill-nft")+'</div></div></article>';
 }
 function groupKey(r,i){const title=val(r,"title");return has(title)?title:"__blank_"+i;}
 function render(rows){
  const container=$("#audio-groups");if(!rows.length){container.innerHTML='<div class="empty-state">No audio recordings found.</div>';return;}
  const groups=new Map();rows.forEach((r,i)=>{const k=groupKey(r,i);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);});
  container.innerHTML=Array.from(groups.entries()).map(([name,items],i)=>'<section class="show-group" data-group="'+i+'"><button class="group-toggle" type="button" aria-expanded="false"><span class="group-name">'+esc(name.startsWith("__blank_")?"Other recordings":name)+'</span><span class="count-pill">'+items.length+'</span><span class="chevron">⌄</span></button><div class="record-list" hidden>'+(items.length>1?'<div class="group-actions"><button type="button" class="button" data-group-details>Show all details</button></div>':"")+items.map(renderRecord).join("")+'</div>'</section>').join("");
 }
 document.addEventListener("click",e=>{
  const localDetails=e.target.closest("[data-group-details]");if(localDetails){const list=localDetails.closest(".record-list"),open=localDetails.dataset.open!=="true";list.querySelectorAll(".record-details").forEach(d=>{d.hidden=!open;const summary=d.previousElementSibling;summary.setAttribute("aria-expanded",String(open));summary.classList.toggle("open",open);});localDetails.dataset.open=String(open);localDetails.textContent=open?"Hide all details":"Show all details";e.stopPropagation();return;}\n  const allDetails=e.target.closest("[data-expand-details]");
  if(allDetails){const open=allDetails.dataset.open!=="true";document.querySelectorAll(".show-group").forEach(s=>{const list=s.querySelector(".record-list");list.hidden=!open;s.classList.toggle("open",open);s.querySelector(".group-toggle").setAttribute("aria-expanded",String(open));s.querySelectorAll(".record-details").forEach(d=>{d.hidden=!open;const summary=d.previousElementSibling;summary.setAttribute("aria-expanded",String(open));summary.classList.toggle("open",open);});});allDetails.dataset.open=String(open);allDetails.textContent=open?"Hide all details":"Show all details";return;}
  const group=e.target.closest(".group-toggle");if(group){const section=group.closest(".show-group"),list=section.querySelector(".record-list"),open=list.hidden;list.hidden=!open;section.classList.toggle("open",open);group.setAttribute("aria-expanded",String(open));return;}
  const summary=e.target.closest(".record-summary");if(summary&&!e.target.closest("input")){const detail=summary.nextElementSibling,open=detail.hidden;detail.hidden=!open;summary.setAttribute("aria-expanded",String(open));summary.classList.toggle("open",open);}
  if(e.target.closest("[data-expand-all]")){const open=e.target.closest("[data-expand-all]").dataset.expandAll==="true";document.querySelectorAll(".show-group").forEach(s=>{s.querySelector(".record-list").hidden=!open;s.classList.toggle("open",open);s.querySelector(".group-toggle").setAttribute("aria-expanded",String(open));});e.target.closest("[data-expand-all]").textContent=open?"Collapse groups":"Expand groups";e.target.closest("[data-expand-all]").dataset.expandAll=String(!open);}
 });
 document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".record-summary")){e.preventDefault();e.target.click();}});
 async function init(){
  try{const rows=await window.GZYLZ_DATA.loadSheet("audio");$("#audio-count").textContent=rows.length;render(rows);if(window.GZYLZ_CART)window.GZYLZ_CART.update();}
  catch(err){$("#audio-groups").innerHTML='<div class="empty-state">Unable to load the Google Sheet right now. Please refresh and try again.<br><small>'+esc(err.message)+'</small></div>';}
 }
 document.addEventListener("DOMContentLoaded",init);
})();