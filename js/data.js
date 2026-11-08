(function(){
  function parseCSV(text){
    const rows=[];let row=[],cell="",quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i],n=text[i+1];
      if(quoted){if(c==='"'&&n==='"'){cell+='"';i++;}else if(c==='"'){quoted=false;}else{cell+=c;}}
      else if(c==='"'){quoted=true;}
      else if(c===","){row.push(cell);cell="";}
      else if(c==="\n"){row.push(cell.replace(/\r$/,""));rows.push(row);row=[];cell="";}
      else{cell+=c;}
    }
    if(cell.length||row.length){row.push(cell.replace(/\r$/,""));rows.push(row);}
    return rows.filter(r=>r.some(v=>String(v).trim()!==""));
  }
  function normalizeHeader(s){return String(s||"").replace(/\r/g,"").replace(/\n/g," ").trim().toLowerCase();}
  async function loadSheet(kind){
    const response=await fetch(window.GZYLZ_CONFIG.sheets[kind],{cache:"no-store"});
    if(!response.ok)throw new Error("Google Sheets returned "+response.status);
    const rows=parseCSV(await response.text());if(!rows.length)return [];
    const headers=rows[0].map(normalizeHeader);
    return rows.slice(1).map((cells,index)=>{
      const item={_id:kind+"-"+index,_kind:kind};
      headers.forEach((h,i)=>item[h]=String(cells[i]??"").trim());
      return item;
    });
  }
  function get(row,...names){for(const n of names){if(row[n]!==undefined)return row[n]||"";}return "";}
  window.GZYLZ_DATA={parseCSV,loadSheet,get};
})();