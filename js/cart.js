(function(){
 const KEY=window.GZYLZ_CONFIG.cartStorageKey;
 function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch{return [];}}
 function write(items){localStorage.setItem(KEY,JSON.stringify(items));update();}
 function safe(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 function update(){
  const items=read();
  document.querySelectorAll("[data-cart-count]").forEach(e=>e.textContent=items.length);
  const selected=new Set(items.map(x=>x.id));
  document.querySelectorAll("[data-select-record]").forEach(cb=>cb.checked=selected.has(cb.dataset.selectRecord));
  const contact=document.getElementById("contact-content-copy");
  if(contact)contact.textContent=window.GZYLZ_TEXT?window.GZYLZ_TEXT.getContact():"";
  const box=document.getElementById("cart-content");if(!box)return;
  if(!items.length){box.innerHTML='<p class="empty-state">Your selection is empty.</p>';return;}
  box.innerHTML=["Video","Audio"].map(kind=>{
   const group=items.filter(x=>x.kind===kind);if(!group.length)return "";
   return '<section class="cart-section"><h3>['+kind+']</h3>'+group.map(x=>'<div class="cart-item"><span>'+safe(x.line)+'</span><button type="button" data-remove="'+safe(x.id)+'" aria-label="Remove item">Remove</button></div>').join("")+'</section>';
  }).join("");
 }
 function open(){const d=document.getElementById("cart-dialog");if(d){update();d.showModal();}}
 document.addEventListener("click",e=>{
  if(e.target.closest("[data-cart-open]"))open();
  if(e.target.closest("[data-cart-close]"))document.getElementById("cart-dialog")?.close();
  if(e.target.closest("[data-cart-clear]")){write([]);const s=document.getElementById("copy-status");if(s)s.textContent="";}
  const remove=e.target.closest("[data-remove]");if(remove)write(read().filter(x=>x.id!==remove.dataset.remove));
  if(e.target.closest("[data-cart-copy]")){
   const items=read();
   const list=["Video","Audio"].map(k=>{
    const group=items.filter(x=>x.kind===k);
    return group.length?"["+k+"]\\n"+group.map(x=>"- "+x.line).join("\\n"):"";
   }).filter(Boolean).join("\\n\\n");
   const contact=window.GZYLZ_TEXT?window.GZYLZ_TEXT.getContact():"";
   const output=list+(contact?(list?"\\n\\n":"")+"Contact:\\n"+contact:"");
   const status=document.getElementById("copy-status");
   if(!output){if(status)status.textContent="Your selection is empty.";return;}
   navigator.clipboard.writeText(output).then(()=>{if(status)status.textContent="Copied!";}).catch(()=>{if(status)status.textContent="Copy is unavailable in this browser. Please use a secure connection.";});
  }
 });
 document.addEventListener("change",e=>{
  const cb=e.target.closest("[data-select-record]");if(!cb)return;
  const items=read(),id=cb.dataset.selectRecord;
  if(cb.checked){if(!items.some(x=>x.id===id))items.push({id,kind:cb.dataset.kind,line:cb.dataset.line});}
  else{const i=items.findIndex(x=>x.id===id);if(i>=0)items.splice(i,1);}
  write(items);
 });
 document.addEventListener("DOMContentLoaded",()=>{
  const selected=new Set(read().map(x=>x.id));
  document.querySelectorAll("[data-select-record]").forEach(cb=>cb.checked=selected.has(cb.dataset.selectRecord));
  update();
 });
 window.GZYLZ_CART={read,update};
})();
