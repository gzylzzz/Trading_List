(function(){
  let content={status:"",rules:"",wants:"",contact:"",readMe:"",footer:""};
  const clean=value=>String(value??"").trim();
  const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function format(value){
    return escapeHTML(value)
      .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
      .replace(/\{\{(#[0-9a-fA-F]{3,8})\}\}([\s\S]*?)\{\{\/color\}\}/g,'<span style="color:$1">$2</span>')
      .replace(/\r?\n/g,"<br>");
  }
  function cell(row,key){return clean(row[key]);}
  async function load(){
    try{
      const response=await fetch(window.GZYLZ_CONFIG.sheets.text,{cache:"no-store"});
      if(!response.ok)throw new Error("Text sheet returned "+response.status);
      const rows=window.GZYLZ_DATA.parseCSV(await response.text());
      if(rows.length<2)throw new Error("The text sheet has no content row.");
      const headers=rows[0].map(s=>String(s||"").replace(/\r/g,"").trim().toLowerCase());
      const data=rows.slice(1).map(cells=>{
        const row={};headers.forEach((h,i)=>{if(h)row[h]=cells[i]??"";});return row;
      });
      const first=data[0]||{};
      const collect=(...keys)=>data.map(row=>{for(const key of keys){if(Object.prototype.hasOwnProperty.call(row,key))return cell(row,key);}return "";}).filter(Boolean);
      content={
        status:collect("statues","status").join("\n\n"),
        rules:collect("rules").join("\n\n"),
        wants:collect("wants").join("\n\n"),
        contact:collect("contact").join("\n\n"),
        readMe:cell(first,"read me")||cell(first,"home"),
        footer:collect("footer").join("\n\n")
      };
      const status=document.getElementById("status-content");
      const rules=document.getElementById("rules-content");
      const wants=document.getElementById("wants-content");
      if(status)status.innerHTML=format(content.status);
      if(rules)rules.innerHTML=format(content.rules);
      if(wants){
        const cards=data.map(row=>{
          const body=cell(row,"wants");
          if(!body)return "";
          const title=cell(row,"wants title")||cell(row,"want title");
          return '<section class="wants-card">'+(title?'<h2>'+format(title)+'</h2>':"")+'<div class="wants-card-content">'+format(body)+'</div></section>';
        }).filter(Boolean);
        wants.innerHTML=cards.length?cards.join(""):'<div class="empty-state">No wants added yet.</div>';
      }
      const readMe=document.getElementById("home-note-content");
      if(readMe)readMe.innerHTML=format(content.readMe);
      if(!content.readMe){const card=document.getElementById("home-note");if(card)card.hidden=true;}
      const footer=document.getElementById("site-footer");
      if(footer)footer.innerHTML=content.footer?format(content.footer):"gzylz";
      const contact=document.getElementById("contact-content-copy");
      if(contact)contact.innerHTML=format(content.contact);
      if(window.GZYLZ_CART)window.GZYLZ_CART.update();
    }catch(error){console.error("Unable to load text sheet:",error);}
    return content;
  }
  window.GZYLZ_TEXT={load,getContact:()=>content.contact,getContactHTML:()=>format(content.contact)};
  document.addEventListener("DOMContentLoaded",load);
})();