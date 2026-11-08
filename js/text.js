(function(){
  let content={status:"",rules:"",wants:"",contact:"",home:""};
  function clean(value){return String(value??"").trim();}
  function get(row,...keys){
    for(const key of keys){
      const normalized=key.toLowerCase();
      if(Object.prototype.hasOwnProperty.call(row,normalized)) return clean(row[normalized]);
    }
    return "";
  }
  function format(value){
    const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    return escape(value).replace(/\r?\n/g,"<br>");
  }
  function formatHome(value){
    let safe=String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
    safe=safe.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
    safe=safe.replace(/\{\{(#[0-9a-fA-F]{3,8})\}\}([\s\S]*?)\{\{\/color\}\}/g,'<span style="color:$1">$2</span>');
    return safe.split(/\r?\n/).map(line=>line===""?"<div class=\"home-note-blank\"></div>":line).join("<br>");
  }
  async function load(){
    try{
      const response=await fetch(window.GZYLZ_CONFIG.sheets.text,{cache:"no-store"});
      if(!response.ok) throw new Error("Text sheet returned "+response.status);
      const rows=window.GZYLZ_DATA.parseCSV(await response.text());
      if(rows.length<2) throw new Error("The text sheet has no content row.");
      const headers=rows[0].map(s=>String(s||"").replace(/\r/g,"").trim().toLowerCase());
      const row={};headers.forEach((h,i)=>row[h]=rows[1][i]??"");
      content={
        status:get(row,"statues","status"),
        rules:get(row,"rules"),
        wants:get(row,"wants"),
        contact:get(row,"contact"),
        home:get(row,"home")
      };
      const status=document.getElementById("status-content");
      const rules=document.getElementById("rules-content");
      const wants=document.getElementById("wants-content");
      if(status)status.innerHTML=format(content.status);
      const home=document.getElementById("home-note-content");
      if(home)home.innerHTML=formatHome(content.home);
      if(!content.home.trim()){const card=document.getElementById("home-note");if(card)card.hidden=true;}
      if(rules)rules.innerHTML=format(content.rules);
      if(wants)wants.innerHTML=format(content.wants);
      const contact=document.getElementById("contact-content-copy");
      if(contact)contact.innerHTML=format(content.contact);
      if(window.GZYLZ_CART)window.GZYLZ_CART.update();
    }catch(error){console.error("Unable to load text sheet:",error);}
    return content;
  }
  document.addEventListener("click",e=>{const b=e.target.closest(".home-note-toggle");if(!b)return;const card=b.closest(".home-note"),collapsed=card.classList.toggle("is-collapsed");b.setAttribute("aria-expanded",String(!collapsed));});
  window.GZYLZ_TEXT={load,getContact:()=>content.contact};
  document.addEventListener("DOMContentLoaded",load);
})();
