'use strict';
let lens='time', clockBasis='use', selectedBucket=null;
const compared=['',''];
const profiles=new WeakMap();
function profile(item){
  if(!profiles.has(item))profiles.set(item,profileTool(item));
  return profiles.get(item);
}
const lensNames={
  time:['Cronología','Timeline'],features:['Funciones','Features'],
  geo:['Geografía','Geography'],evidence:['Evidencia','Evidence']
};
const unknownText=()=>tr('Sin identificar','Unidentified');
function groupRows(items,entries){
  const groups=new Map();
  for(const item of items){
    const pairs=entries(item);
    for(const [key,proof] of (pairs.length?pairs:[['?',null]])){
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push({item,proof});
    }
  }
  return groups;
}
function analysisHeader(panel,title,copy){
  panel.append(node('h2',title),node('p',copy,'analysis-note'));
}
function selectBucket(key){
  selectedBucket=key;
  renderAnalysis(filtered());
  const box=$('analysis-drill');
  if(box){box.scrollIntoView({block:'nearest'});box.focus({preventScroll:true});}
}
function bucketButton(key,text,count,cls){
  const b=makeButton(text,()=>selectBucket(key),cls);
  b.disabled=!count;
  b.setAttribute('aria-pressed',String(key===selectedBucket));
  return b;
}
function coverage(panel,groups,total){
  const unknown=groups.get('?')?.length||0;
  const row=node('div',null,'coverage');
  row.append(node('span',tr('Con dato identificable','Identifiable')+'  '+(total-unknown)+' / '+total));
  if(unknown)row.append(bucketButton('?',unknownText()+' · '+unknown,unknown,'link-btn'));
  panel.append(row);
}
function drill(panel,groups,name){
  const rows=groups.get(selectedBucket);
  const box=node('section',null,'drill');
  box.id='analysis-drill';box.tabIndex=-1;
  if(!rows){
    box.append(node('p',tr('Selecciona un valor del gráfico para examinar sus registros.','Select a chart value to inspect the underlying records.')));
  }else{
    const title=selectedBucket==='?'?unknownText():name(selectedBucket);
    const head=node('div',null,'drill-title');
    head.append(node('h3',title+' · '+rows.length),makeButton(tr('Quitar selección','Clear selection'),()=>{selectedBucket=null;renderAnalysis(filtered());},'link-btn'));
    box.append(head);
    for(const {item,proof} of rows){
      const line=node('div',null,'proof-row');
      line.append(makeButton(item.title,()=>showRecord(item),'record-link'));
      if(proof?.text)line.append(node('p',proof.text));
      if(proof?.source)line.append(makeButton(tr('Ver fuente','View source')+' '+proof.source.values.ID,()=>showRecord(proof.source),'link-btn'));
      box.append(line);
    }
  }
  panel.append(box);
}
function timeline(panel,items){
  analysisHeader(panel,tr('¿Cuándo aparecen en el inventario?','When do tools first appear in the inventory?'),
    tr('Cada herramienta cuenta una vez, en el año más antiguo identificable para el criterio elegido.','Each tool counts once, in the earliest identifiable year for the selected measure.'));
  const toggle=node('div',null,'segmented');
  for(const [key,es,en] of [['use','Aplicación fechada','Dated application'],['publication','Publicación vinculada','Linked publication']]){
    const b=makeButton(tr(es,en),()=>{clockBasis=key;selectedBucket=null;renderAnalysis(filtered());});
    b.setAttribute('aria-pressed',String(clockBasis===key));toggle.append(b);
  }
  panel.append(toggle);
  const groups=groupRows(items,item=>{
    const event=profile(item)[clockBasis];return event?[[String(event.year),event]]:[];
  });
  const years=[...groups.keys()].filter(k=>k!=='?').map(Number);
  if(years.length){
    const rail=node('div',null,'time-scroll'), plot=node('div',null,'year-plot');
    const max=Math.max(...years.map(y=>groups.get(String(y)).length));
    for(let y=Math.min(...years);y<=Math.max(...years);y++){
      const key=String(y),count=groups.get(key)?.length||0;
      const b=bucketButton(key,'',count,'year-column');
      b.setAttribute('aria-label',key+' · '+count+' '+label('Tools').toLowerCase());
      const stick=node('i',null,'year-stack');stick.style.height=(count/max*134)+'px';
      const bucket=groups.get(key)||[];
      for(const type of ['Packaged tool','Tested in a study or pilot','other']){
        const n=bucket.filter(({item})=>type==='other'?!['Packaged tool','Tested in a study or pilot'].includes(item.values['Tool type']):item.values['Tool type']===type).length;
        if(!n)continue;
        const segment=node('em');segment.dataset.type=type;segment.style.flex=String(n);
        const hint=(type==='other'?tr('Otro o sin registrar','Other or unrecorded'):label(type))+' · '+n;
        segment.title=hint;stick.append(segment);
      }
      b.append(node('b',String(count)),stick,node('span',key));plot.append(b);
    }
    rail.append(plot);panel.append(rail);
    const legend=node('div',null,'time-legend');
    for(const type of ['Packaged tool','Tested in a study or pilot','other']){
      const chip=node('span'),dot=node('i');dot.dataset.type=type;
      chip.append(dot,type==='other'?tr('Otro o sin registrar','Other or unrecorded'):label(type));legend.append(chip);
    }
    panel.append(legend);
  }
  coverage(panel,groups,items.length);
  panel.append(node('p',clockBasis==='use'?
    tr('Se buscan fechas asociadas a casos en «Dónde se ha utilizado». La fecha de lanzamiento y otros usos anteriores pueden quedar fuera del registro.','Dates are extracted from case descriptions in “Where it has been used”. Launch dates and earlier uses may fall outside the record.'):
    tr('Se toma el año bibliográfico más antiguo legible entre las fuentes vinculadas a la herramienta. La serie describe la cobertura del inventario.','Uses the earliest readable bibliographic year among the tool’s linked sources. The series describes inventory coverage.'),'method'));
  drill(panel,groups,String);
}
const featureName=id=>{const r=functionRules.find(rule=>rule[0]===id);return tr(r[1],r[2]);};
function tallyRow(key,name,count,max){
  const b=bucketButton(key,'',count,'tally');
  const track=node('i'),fill=node('em');fill.style.width=(100*count/Math.max(1,max))+'%';track.append(fill);
  b.append(node('span',name),track,node('b',String(count)));return b;
}
function features(panel,items){
  analysisHeader(panel,tr('¿Qué funciones aparecen en los flujos de trabajo?','Which features appear in the workflows?'),
    tr('Una herramienta puede figurar en varias categorías. Se detectan menciones en la descripción, incluidos pasos asistidos por personas.','A tool can appear in several categories. Mentions are detected in the description, including human-assisted steps.'));
  const groups=groupRows(items,item=>[...profile(item).features].map(([id,text])=>[id,{text}]));
  const ordered=functionRules.map(([id])=>id).sort((a,b)=>(groups.get(b)?.length||0)-(groups.get(a)?.length||0));
  const bars=node('div',null,'feature-bars');
  ordered.forEach(id=>bars.append(tallyRow(id,featureName(id),groups.get(id)?.length||0,groups.get(ordered[0])?.length||0)));
  panel.append(bars);coverage(panel,groups,items.length);
  const overlap=items.filter(item=>profile(item).features.has('group')&&profile(item).features.has('synth'));
  const pair=tr('Agrupación y síntesis en la misma ficha','Grouping and synthesis in the same record');
  if(overlap.length){
    groups.set('overlap',overlap.map(item=>({item,proof:{text:[...new Set(['group','synth'].map(k=>profile(item).features.get(k)))].join(' ')}})));
    panel.append(bucketButton('overlap',pair+' · '+overlap.length,overlap.length,'pair'));
  }
  drill(panel,groups,key=>key==='overlap'?pair:featureName(key));
  if(items.length>=2)compareTools(panel,items);
}
function compareTools(panel,items){
  const section=node('section',null,'comparison');
  section.append(node('h3',tr('Comparar dos herramientas','Compare two tools')),
    node('p',tr('Selecciona una mención para leer la frase original. Un guion indica que la descripción no contiene una mención reconocida.','Select a mention to read its original sentence. A dash means the description has no recognized mention.'),'analysis-note'));
  const picks=compared.map(name=>items.find(i=>i.title===name));
  if(!picks[0])picks[0]=items.find(i=>i!==picks[1]);
  if(!picks[1]||picks[0]===picks[1])picks[1]=items.find(i=>i!==picks[0]);
  const table=node('table',null,'compare-table');
  const header=table.createTHead().insertRow();header.append(node('th',tr('Función','Feature')));
  picks.forEach((item,i)=>{
    compared[i]=item.title;
    const sel=node('select');sel.setAttribute('aria-label',tr('Herramienta ','Tool ')+(i+1));
    for(const record of items){
      const opt=option(record.title,record.title);opt.disabled=record===picks[1-i];sel.add(opt);
    }
    sel.value=item.title;sel.onchange=()=>{compared[i]=sel.value;renderAnalysis(filtered());};
    const th=node('th');th.append(sel);header.append(th);
  });
  const body=table.createTBody();
  for(const [id] of functionRules){
    const row=body.insertRow();row.append(node('th',featureName(id)));
    picks.forEach(item=>{
      const text=profile(item).features.get(id),td=row.insertCell();
      if(!text){td.textContent='—';return;}
      const d=node('details');d.append(node('summary',tr('Mención','Mention')),node('p',text));td.append(d);
    });
  }
  for(const field of ['Maturity','Expertise needed','Evidence of results']){
    const row=body.insertRow();row.append(node('th',label(field)));
    picks.forEach(i=>row.insertCell().textContent=values(i,field).map(label).join(', '));
  }
  const row=body.insertRow();row.append(node('th',tr('Ficha','Record')));
  picks.forEach(i=>row.insertCell().append(makeButton(tr('Abrir ficha','Open record'),()=>showRecord(i),'link-btn')));
  section.append(table);panel.append(section);
}
function regionName(code){return regionNames[lang==='es'?'es':'en'].of(code);}
function geography(panel,items){
  analysisHeader(panel,tr('¿Dónde se han estudiado o aplicado?','Where have tools been studied or used?'),
    tr('Cada país o territorio suma una herramienta por ficha que lo menciona en el caso de uso, aunque aparezca varias veces. Incluye pilotos y estudios con datos locales.','Each country or territory counts a tool once per use-case record that mentions it. Includes pilots and studies using local data.'));
  const groups=groupRows(items,item=>[...profile(item).places].map(([id,text])=>[id,{text}]));
  const places=[...groups.keys()].filter(k=>k!=='?').sort((a,b)=>groups.get(b).length-groups.get(a).length||regionName(a).localeCompare(regionName(b),lang));
  const map=node('div',null,'map-frame');
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 860 390');svg.setAttribute('aria-label',tr('Mapa de herramientas por lugar','Map of tools by location'));
  const colors=['#d5dddF','#a3ded0','#5bb5a2','#227e75','#134c51'];
  for(const [code,d] of Object.entries(worldPaths)){
    const count=groups.get(code)?.length||0,path=document.createElementNS(ns,'path');
    path.setAttribute('d',d);path.setAttribute('fill',colors[count===0?0:count===1?1:count<=3?2:count<=7?3:4]);
    if(count){path.classList.add('mapped');path.onclick=()=>selectBucket(code);}
    if(code===selectedBucket)path.classList.add('map-active');
    const tip=document.createElementNS(ns,'title');tip.textContent=(supportedCodes.includes(code)?regionName(code):code)+' · '+count;
    path.append(tip);svg.append(path);
  }
  const legend=node('div',null,'map-legend');
  [tr('Sin mención','No mention'),'1','2–3','4–7','8+'].forEach((v,i)=>{const s=node('span'),dot=node('i');dot.style.background=colors[i];s.append(dot,v);legend.append(s);});
  map.append(svg,legend);panel.append(map);coverage(panel,groups,items.length);
  const area=node('div',null,'region-list');
  for(const key of places){area.append(bucketButton(key,regionName(key)+' · '+groups.get(key).length,groups.get(key).length,'region'));}
  panel.append(area,node('p',tr('Los lugares se reconocen por nombre de país, territorio o ciudad. Los casos supranacionales se listan aparte. Cartografía de Natural Earth.','Locations are matched by country, territory or city name. Supranational cases are listed separately. Map data from Natural Earth.'),'method'));
  drill(panel,groups,regionName);
}
function evidence(panel,items){
  analysisHeader(panel,tr('¿Qué evidencia respalda cada nivel de madurez?','What evidence supports each maturity level?'),
    tr('Las filas indican cuánto se ha utilizado la herramienta. Las columnas muestran la evidencia registrada sobre sus resultados. Selecciona una celda para ver las fichas.','Rows show how widely a tool has been used. Columns show the recorded evidence of its results. Select a cell to see its records.'));
  const both=(a,b)=>JSON.stringify([a,b]);
  const groups=groupRows(items,i=>values(i,'Maturity').flatMap(a=>values(i,'Evidence of results').map(b=>[both(a,b),{text:i.values['Where it has been used']}])));
  const axis=(field,order)=>{const observed=new Set(items.flatMap(i=>values(i,field)));return [...new Set([...order,...observed])].filter(x=>observed.has(x));};
  const rows=axis('Maturity',['Proposed (not tested)','Pilot','Single use','Multiple uses']);
  const cols=axis('Evidence of results',['Research evaluation','Practitioner report','Vendor claims only','None found']);
  const wrap=node('div',null,'matrix-wrap'),table=node('table',null,'heatmap');
  const h=table.createTHead().insertRow();h.append(node('th',label('Maturity')),...cols.map(c=>node('th',label(c))));
  const tbody=table.createTBody(),max=Math.max(1,...[...groups.values()].map(r=>r.length));
  for(const a of rows){
    const row=tbody.insertRow();row.append(node('th',label(a)));
    for(const b of cols){
      const key=both(a,b),n=groups.get(key)?.length||0;
      const btn=bucketButton(key,String(n),n,'heat');
      btn.style.setProperty('--strength',String(n/max));
      btn.setAttribute('aria-label',label(a)+' · '+label(b)+' · '+n);row.insertCell().append(btn);
    }
  }
  wrap.append(table);panel.append(wrap);
  drill(panel,groups,k=>JSON.parse(k).map(label).join(' · '));
}
function renderAnalysis(items){
  const panel=$('analysis');panel.replaceChildren();
  const nav=node('div',null,'lenses');
  for(const [key,title] of Object.entries(lensNames)){
    const b=makeButton(tr(...title),()=>{lens=key;selectedBucket=null;renderAnalysis(filtered());});
    b.setAttribute('aria-pressed',String(lens===key));nav.append(b);
  }
  panel.append(nav);
  if(!items.length){panel.append(node('p',busy?tr('Cargando…','Loading…'):tr('Sin herramientas para esta selección.','No tools in this selection.'),'empty'));return;}
  const figure=node('section',null,'analysis-figure');
  ({time:timeline,features,geo:geography,evidence})[lens](figure,items);
  panel.append(figure);
}
