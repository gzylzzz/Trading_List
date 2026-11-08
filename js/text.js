(function(){
  let content={status:"",rules:"",wants:"",contact:""};
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
        contact:get(row,"contact")
      };
      const status=document.getElementById("status-content");
      const rules=document.getElementById("rules-content");
      const wants=document.getElementById("wants-content");
      if(status)status.innerHTML=format(content.status);
      if(rules)rules.innerHTML=format(content.rules);
      if(wants)wants.innerHTML=format(content.wants);
      const contact=document.getElementById("contact-content-copy");
      if(contact)contact.innerHTML=format(content.contact);
      if(window.GZYLZ_CART)window.GZYLZ_CART.update();
    }catch(error){console.error("Unable to load text sheet:",error);}
    return content;
  }
  window.GZYLZ_TEXT={load,getContact:()=>content.contact};
  document.addEventListener("DOMContentLoaded",load);
})();
