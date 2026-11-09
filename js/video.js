(function(){
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const val=(r,...n)=>window.GZYLZ_DATA.get(r,...n);
 const has=s=>String(s??"").trim()!=="";
 const giftClass=s=>{const v=String(s??"").trim().toLowerCase();if(v.includes("never gift"))return "pill-never";if(v.includes("limited trade"))return "pill-limited";if(v.includes("only gift"))return "pill-only-gift";return "";};
 const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\{\{(#[0-9a-fA-F]{3,8})\}\}([\s\S]*?)\{\{\/color\}\}/g,'<span style="color:$1">$2</span>').replace(/\r\n?/g,"\n").replace(/\n/g,"<br>");
 const rich=s=>String(s??"").replace(/\r\n?/g,"\n").split(/\n{2,}/).map(p=>'<p>'+inline(p)+'</p>').join("");
 function pill(t,c=""){return has(t)?'<span class="pill '+c+'">'+inline(t)+'</span>':"";}
 function detail(label,value){return has(value)?'<div class="detail-line"><span class="detail-label">'+label+':</span><div class="detail-value">'+rich(value)+'</div></div>':"";}
 function record(r){
  const show=val(r,"show"),prod=val(r,"production"),date=val(r,"date"),master=val(r,"master"),cast=val(r,"cast"),notes=val(r,"notes"),type=val(r,"file type"),size=val(r,"size"),gift=val(r,"gift/limited trade","gift / limited trade"),nft=val(r,"nft"),highlights=val(r,"highlights"),concert=val(r,"concert or not"),subs=val(r,"subtitles"),language=val(r,"language");
  const id=r._id,disabled=has(nft),line=[show,date,master,size].filter(has).join(" | ");
  return '<article class="record"><div class="record-summary"><input class="record-check" type="checkbox" aria-label="Select '+esc(show)+'" data-select-record="'+id+'" data-kind="Video" data-line="'+esc(line)+'" data-show="'+esc(show)+'" data-date="'+esc(date)+'" data-master="'+esc(master)+'" data-size="'+esc(size)+'" '+(disabled?'disabled title="NFT EXCEPT THROUGH MASTER"':'')+'><button type="button" class="record-summary-button" aria-expanded="false"><div class="record-summary-main"><span class="record-show">'+inline(show||"Untitled recording")+'</span><span class="record-submeta">'+[ [prod,date].filter(has).map(inline).join(" • "), has(master)?inline(master):"" ].filter(has).join(" | ")+'</span></div><span class="chevron">⌄</span></button></div><div class="record-details" hidden>'+
  detail("Cast",cast)+detail("Notes",notes)+detail("Highlights",highlights)+detail("Language",language)+detail("Subtitles",subs)+
  '<div class="record-pills">'+pill(type,"pill-type")+pill(size)+pill(gift,giftClass(gift))+pill(nft,"pill-nft")+(concert==="Concert"?pill("Concert","pill-concert"):"")+'</div></div></article>';
 }
 function render(rows){
  const box=$("#video-records");$("#video-count").textContent=rows.length;
  const groups=new Map();
  rows.forEach((r,i)=>{const t=val(r,"tital","title"),key=has(t)?t:"Other recordings "+(i+1);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);});
  box.innerHTML=groups.size?Array.from(groups.entries()).map(([name,items],i)=>{
   const action=items.length>1?'<button type="button" class="button group-detail-action" data-group-details hidden>Show all details</button>':"";
   return '<section class="show-group" data-group="'+i+'"><div class="group-heading"><button class="group-toggle" type="button" aria-expanded="false"><span class="group-name">'+esc(name)+'</span></button>'+action+'<span class="count-pill">'+items.length+'</span><span class="chevron">⌄</span></div><div class="record-list" hidden>'+items.map(record).join("")+'</div></section>';
  }).join(""):'<div class="empty-state">0 video</div>';
  if(window.GZYLZ_CART){const selected=new Set(window.GZYLZ_CART.read().map(x=>x.id));box.querySelectorAll("[data-select-record]").forEach(cb=>cb.checked=selected.has(cb.dataset.selectRecord));window.GZYLZ_CART.update();}
 }
 function setGroup(group,open,withDetails){
  const list=group.querySelector(".record-list"),toggle=group.querySelector(".group-toggle"),action=group.querySelector("[data-group-details]");
  list.hidden=!open;group.classList.toggle("open",open);toggle.setAttribute("aria-expanded",String(open));
  if(action){action.hidden=!open;action.dataset.open=String(!!withDetails);action.textContent=withDetails?"Hide all details":"Show all details";}
  if(withDetails!==undefined)group.querySelectorAll(".record-details").forEach(d=>{d.hidden=!withDetails;const s=d.previousElementSibling;s.querySelector(".record-summary-button").setAttribute("aria-expanded",String(!withDetails?false:true));s.classList.toggle("open",!!withDetails);});
 }
 document.addEventListener("click",e=>{
  const local=e.target.closest("[data-group-details]");
  if(local){const group=local.closest(".show-group"),open=local.dataset.open!=="true";group.querySelectorAll(".record-details").forEach(d=>{d.hidden=!open;const s=d.previousElementSibling;s.querySelector(".record-summary-button").setAttribute("aria-expanded",String(open));s.classList.toggle("open",open);});local.dataset.open=String(open);local.textContent=open?"Hide all details":"Show all details";e.stopPropagation();return;}
  const allDetails=e.target.closest("[data-expand-details]");
  if(allDetails){const open=allDetails.dataset.open!=="true";document.querySelectorAll(".show-group").forEach(g=>setGroup(g,true,open));allDetails.dataset.open=String(open);allDetails.textContent=open?"Hide all details":"Show all details";return;}
  const expand=e.target.closest("[data-expand-all]");
  if(expand){const open=expand.dataset.expandAll==="true";document.querySelectorAll(".show-group").forEach(g=>setGroup(g,open,undefined));expand.textContent=open?"Collapse groups":"Expand groups";expand.dataset.expandAll=String(!open);return;}
  const groupToggle=e.target.closest(".group-toggle");
  if(groupToggle){const g=groupToggle.closest(".show-group"),open=g.querySelector(".record-list").hidden;setGroup(g,open,undefined);return;}
  const summary=e.target.closest(".record-summary-button");
  if(summary){const d=summary.parentElement.nextElementSibling,open=d.hidden;d.hidden=!open;summary.setAttribute("aria-expanded",String(open));summary.parentElement.classList.toggle("open",open);}
 });
 async function init(){
  try{const rows=await window.GZYLZ_DATA.loadRecords("video");render(rows);if(window.GZYLZ_CART)window.GZYLZ_CART.update();}
  catch(err){$("#video-records").innerHTML='<div class="empty-state">Something went wrong…</div>';}
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();