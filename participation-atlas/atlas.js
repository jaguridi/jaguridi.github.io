'use strict';
const $ = id => document.getElementById(id);
const fold = value => String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const node = (tag, value, cls) => {
  const el = document.createElement(tag);
  if (value != null) el.textContent = value;
  if (cls) el.className = cls;
  return el;
};
const dict = {
  'Tools':'Herramientas','Sources':'Fuentes','Tool type':'Tipo de herramienta','Maturity':'Madurez',
  'Participation stage':'Etapa de participación','Scale dimension':'Dimensión de escala','Who builds it':'Quién la desarrolla',
  'Expertise needed':'Experiencia necesaria','Evidence of results':'Evidencia de resultados','Specific for Participation?':'Específica para participación',
  'Added by':'Agregada por','Checked by':'Revisada por','Review':'Revisión','Data quality':'Calidad del registro',
  'Source type':'Tipo de fuente','Contribution':'Contribución','Topics':'Temas','Developer or provider':'Desarrollador o proveedor',
  'Where it has been used':'Dónde se ha utilizado','Concerns or limits reported':'Limitaciones reportadas','Notes':'Notas',
  'How found':'Cómo se encontró','Tools found':'Herramientas mencionadas','Takeaway':'Hallazgo principal',
  'Outreach and recruitment':'Difusión y convocatoria','Information and education':'Información y educación','Collecting input':'Recolección de aportes',
  'Analyzing input':'Análisis de aportes','Deliberation and dialogue':'Deliberación y diálogo','Reporting back and decision-making':'Devolución y toma de decisiones',
  'More people (breadth)':'Más participantes (amplitud)','Deeper engagement (depth)':'Mayor profundidad',
  'Sustained engagement (duration)':'Participación sostenida','More influence on decisions (impact)':'Mayor influencia en decisiones','Unclear':'Sin determinar',
  'Packaged tool':'Herramienta disponible','Tested in a study or pilot':'Probada en estudio o piloto','Proposed (not tested)':'Propuesta sin probar',
  'Pilot':'Piloto','Single use':'Uso único','Multiple uses':'Múltiples usos','Research evaluation':'Evaluación de investigación',
  'Practitioner report':'Informe de profesionales','Vendor claims only':'Solo afirmaciones del proveedor','None found':'Sin evidencia identificada',
  'Vendor product':'Producto comercial','Research team':'Equipo de investigación','Open-source project':'Proyecto de código abierto',
  'Built by practitioners (no-code or coding agents)':'Profesionales con herramientas sin código o agentes',
  'General AI tool configured by staff':'IA general configurada por el equipo','Built by in-house tech team':'Equipo técnico interno',
  'None (ready to use)':'Ninguna (lista para usar)','Setup or configuration':'Configuración','Some coding':'Programación básica','Software development':'Desarrollo de software',
  'Yes':'Sí','No':'No','Academic paper':'Artículo académico','Report or guide':'Informe o guía','Tool directory or repository':'Directorio o repositorio',
  'Event or presentation':'Evento o presentación','Vendor or project page':'Página del proveedor o proyecto','News or blog':'Noticia o blog',
  'Analysis (no new tool)':'Análisis sin herramienta nueva','Both':'Ambas','Effects on participation':'Efectos en la participación',
  'Representation of input':'Representación de los aportes','Bias and fairness':'Sesgo y equidad','Legitimacy and accountability':'Legitimidad y rendición de cuentas',
  'Adoption by practitioners':'Adopción por profesionales','Evaluation methods and measures':'Métodos y medidas de evaluación',
  'Pending review':'Pendiente de revisión','Reviewed':'Revisada','Unclassified fields':'Clasificación incompleta','Unresolved source ID':'ID de fuente sin resolver',
  'No cited sources':'Sin fuentes citadas','Complete classification':'Clasificación completa','Not recorded':'Sin registrar'
};
const canonical = new Map(Object.keys(dict).map(k => [fold(k), k]));
let lang = navigator.language.startsWith('es') ? 'es' : 'en';
try {lang = localStorage.getItem('atlas-language') || lang;} catch {}
const tr = (es,en) => lang === 'es' ? es : en;
function label(v) { const key=canonical.get(fold(v)) || v; return lang==='es' ? dict[key] || key : key; }
const toolFilters=['Participation stage','Scale dimension','Maturity','Tool type','Review','Data quality','Evidence of results','Who builds it','Expertise needed','Specific for Participation?','Added by'];
const sourceFilters=['Source type','Contribution','Topics','Added by'];
const classFields=['Tool type','Participation stage','Scale dimension','Maturity','Expertise needed','Who builds it','Evidence of results','Specific for Participation?'];
const multi=new Set(['Participation stage','Scale dimension','Topics','Added by','Evidence of results','Who builds it']);
const stages=['Outreach and recruitment','Information and education','Collecting input','Analyzing input','Deliberation and dialogue','Reporting back and decision-making'];
const gid={Tools:102,Sources:103};
const base='https://docs.google.com/spreadsheets/d/';
const sheetID=new URLSearchParams(location.hash.slice(1)).get('sheet') || '';
const connected=/^[a-zA-Z0-9_-]{20,120}$/.test(sheetID);
let data={Tools:[],Sources:[]}, view='Tools', cap=24, busy=false, fetched=null, failed=false, detail=null;
const context=()=>({query:'',sort:'sheet',filters:{}});
const state={Tools:context(),Sources:context()};

// Google CSV escapes a quote by doubling it. Preserve multiline cells and blank rows.
function csv(text) {
  const rows=[]; let row=[], field='', quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted && text[i+1]==='"'){field+='"';i++;} else quoted=!quoted;
    }else if(!quoted && c===','){row.push(field);field='';}
    else if(!quoted && (c==='\n'||c==='\r')){
      if(c==='\r' && text[i+1]==='\n')i++;
      row.push(field);rows.push(row);row=[];field='';
    }else field+=c;
  }
  if(quoted)throw Error('Incomplete CSV');
  if(field || row.length){row.push(field);rows.push(row);}
  return rows;
}
async function readSheet(name) {
  const url=new URL(base+sheetID+'/gviz/tq');
  url.search=new URLSearchParams({gid:gid[name],headers:1,tqx:'out:csv',t:Date.now()});
  const response=await fetch(url,{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw Error(name);
  const [headers,...rows]=csv(await response.text());
  const title=name==='Tools'?'Tool':'Title or citation';
  if(!headers?.includes(title) || !headers.includes(name==='Tools'?'Sources':'ID'))throw Error('Headers');
  return rows.map((cells,index)=>{
    const values=Object.fromEntries(headers.map((h,i)=>[h.trim(),(cells[i]||'').trim()]));
    return {values,row:index+2,name, title:values[title] || values.ID,related:[],bad:[]};
  }).filter(item=>item.title);
}
function connectRecords(db){
  const ids=new Map(), names=new Map();
  for(const s of db.Sources){const id=fold(s.values.ID);if(id)ids.set(id,[...(ids.get(id)||[]),s]);}
  for(const t of db.Tools){const k=fold(t.title);names.set(k,[...(names.get(k)||[]),t]);}
  const link=(t,s)=>{if(!t.related.includes(s)){t.related.push(s);s.related.push(t);}};
  for(const t of db.Tools){
    for(const token of t.values.Sources.split(/[,;\s]+/).filter(Boolean)){
      const found=ids.get(fold(token));
      if(found?.length===1)link(t,found[0]);else t.bad.push(token);
    }
  }
  for(const s of db.Sources){
    const raw=s.values['Tools found']||'';
    for(const token of [raw,...raw.split(/[,;\n]/)]){
      const found=names.get(fold(token));
      if(found?.length===1)link(found[0],s);
    }
  }
}
function values(item,field){
  const v=item.values;
  if(field==='Review')return [v['Checked by']?'Reviewed':'Pending review'];
  if(field==='Data quality'){
    const a=[classFields.some(k=>!v[k])?'Unclassified fields':'Complete classification'];
    if(!v.Sources)a.push('No cited sources');
    if(item.bad.length)a.push('Unresolved source ID');
    return a;
  }
  if(!v[field])return ['Not recorded'];
  const parts=multi.has(field)?v[field].split(field==='Added by'?/[,;\/+\n]/:/[,;\n]/):[v[field]];
  return [...new Set(parts.map(x=>canonical.get(fold(x)) || x.trim()).filter(Boolean))];
}
function matches(item, field, value){return values(item,field).some(x=>fold(x)===fold(value));}
function filtered(){
  const ctx=state[view], words=fold(ctx.query).split(/\s+/).filter(Boolean);
  const items=data[view].filter(item=>{
    if(!Object.entries(ctx.filters).every(([k,v])=>matches(item,k,v)))return false;
    if(!words.length)return true;
    const hay=fold([...Object.values(item.values),...(view==='Tools'?toolFilters:sourceFilters).flatMap(k=>values(item,k).map(label))].join(' '));
    return words.every(w=>hay.includes(w));
  });
  if(ctx.sort==='az')items.sort((a,b)=>a.title.localeCompare(b.title,lang));
  if(ctx.sort==='last')items.reverse();
  if(ctx.sort==='refs')items.sort((a,b)=>b.related.length-a.related.length);
  return items;
}
function option(value,title){return new Option(title,value);}
function makeButton(title,action,cls){const el=node('button',title,cls);el.type='button';el.onclick=action;return el;}
function safeLink(title,href){
  try{const u=new URL(href);if(!['https:','http:'].includes(u.protocol))return null;
    const a=node('a',title);a.href=u.href;a.target='_blank';a.rel='noreferrer noopener';return a;
  } catch{return null;}
}
function filterBy(key,value){
  const filters=state[view].filters;
  if(value)filters[key]=value;else delete filters[key];
  cap=24;render();
}
let extraOpen=false;
function renderFilters(){
  const panel=$('filters');panel.replaceChildren();
  const extra=node('details'),inner=node('div',null,'fields-extra');
  extra.open=extraOpen;
  extra.ontoggle=()=>{if(extra.isConnected)extraOpen=extra.open;};
  const fields=view==='Tools'?toolFilters:sourceFilters;
  const extraCount=fields.slice(6).filter(k=>state[view].filters[k]).length;
  extra.append(node('summary',tr('Más filtros','More filters')+(extraCount?' ('+extraCount+')':'')),inner);
  fields.forEach((key,i)=>{
    const wrap=node('label',label(key),'field'),select=node('select');
    select.setAttribute('aria-label',label(key));
    const unique=new Map();
    data[view].forEach(item=>values(item,key).forEach(v=>unique.set(fold(v),v)));
    select.add(option('',tr('Todos','All')));
    const selected=state[view].filters[key];
    if(selected)unique.set(fold(selected),selected);
    [...unique.values()].sort((a,b)=>label(a).localeCompare(label(b),lang)).forEach(v=>select.add(option(v,label(v))));
    select.value=selected||'';select.onchange=()=>filterBy(key,select.value);
    wrap.append(select);(i<6?panel:inner).append(wrap);
  });
  if(fields.length>6)panel.append(extra);
}
function chart(items){
  const panel=$('chart'), isTool=view==='Tools', field=isTool?'Participation stage':'Contribution';
  panel.replaceChildren(node('h2',isTool?tr('Herramientas por etapa','Tools by participation stage'):tr('Fuentes por contribución','Sources by contribution')));
  const categories=isTool?stages:[...new Set(data.Sources.flatMap(s=>values(s,field)))];
  const counts=categories.map(v=>items.filter(r=>matches(r,field,v)).length);
  categories.forEach((v,i)=>{
    const b=makeButton('',()=>filterBy(field,state[view].filters[field]===v?'':v),'bar');
    const track=node('i'),fill=node('em');fill.style.width=(counts[i]*100/Math.max(1,...counts))+'%';track.append(fill);
    b.setAttribute('aria-pressed',String(state[view].filters[field]===v));
    b.append(node('span',label(v)),track,node('b',String(counts[i])));panel.append(b);
  });
}
function card(item){
  const t=item.name==='Tools',v=item.values;
  const b=makeButton('',()=>showRecord(item),'card');
  const tag=t?label(values(item,'Tool type')[0]):[v.ID,label(values(item,'Source type')[0])].filter(Boolean).join(' · ');
  b.append(node('span',tag,'meta'),node('h3',item.title),node('p',v[t?'What it does':'Takeaway']||''));
  const chips=node('div',null,'chips');
  chips.append(node('span',label(values(item,t?'Maturity':'Contribution')[0]),'chip'));
  chips.append(node('span',String(item.related.length)+' '+label(t?'Sources':'Tools').toLowerCase(),'chip'));
  if(item.bad.length)chips.append(node('span',tr('Revisar ID','Check ID'),'chip warn'));
  b.append(chips);return b;
}
function renderList(){
  const items=filtered(),all=data[view].length;
  chart(items);
  $('result-info').textContent=items.length+tr(' de ',' of ')+all+' '+label(view).toLowerCase();
  const panel=$('results');panel.replaceChildren();
  items.slice(0,cap).forEach(item=>panel.append(card(item)));
  if(!items.length)panel.append(node('div',busy?tr('Cargando…','Loading…'):!fetched?tr('Conecta la planilla para explorar el inventario.','Connect the spreadsheet to explore the inventory.'):tr('Sin resultados. Prueba otra búsqueda o quita un filtro.','No matches. Try another search or clear a filter.'),'empty'));
  $('more').hidden=items.length<=cap;
  $('more').textContent=tr('Mostrar más','Show more')+' ('+(items.length-Math.min(cap,items.length))+')';
}
function render(){
  document.documentElement.lang=lang;
  $('heading').textContent=tr('IA para la participación pública','AI for public participation');
  $('subtitle').textContent=tr('Explora las herramientas que amplían la participación y la evidencia sobre cómo se usan.','Explore tools for scaling public participation and the evidence behind their use.');
  $('totals').replaceChildren(...['Tools','Sources'].map(k=>{const s=node('span');s.append(node('b',fetched?data[k].length:'—'),label(k).toLowerCase());return s;}));
  $('language').textContent=tr('English','Español');
  $('refresh').textContent=tr('Actualizar','Refresh');$('refresh').disabled=busy||!connected;
  $('connect').hidden=connected && !failed;
  $('url-label').textContent=tr('Enlace de Google Sheets','Google Sheets link');
  $('load').textContent=tr('Conectar','Connect');
  $('sheet').hidden=!connected;$('sheet').textContent=tr('Abrir planilla ↗','Open spreadsheet ↗');$('sheet').href=base+sheetID+'/edit';
  const last=fetched?tr('Última lectura ','Last loaded ')+fetched.toLocaleTimeString(lang,{hour:'2-digit',minute:'2-digit'}):'';
  $('status').textContent=busy?tr('Leyendo Google Sheets…','Reading Google Sheets…'):failed?tr('Falló la lectura. Revisa la conexión y el acceso por enlace. ','Could not load. Check your connection and link access. ')+last:connected?last:tr('Abre el enlace completo del equipo o pega la URL de la planilla.','Open the full team link or paste the spreadsheet URL.');
  $('tabs').replaceChildren(...['Tools','Sources'].map(k=>{const b=makeButton(label(k),()=>{view=k;cap=24;render();},view===k?'active':'');b.setAttribute('aria-pressed',String(view===k));return b;}));
  $('filters-label').textContent=tr('Filtros','Filters');$('clear').textContent=tr('Limpiar','Clear');
  const search=tr('Buscar en ','Search ')+label(view).toLowerCase();
  $('search').placeholder=search;$('search').setAttribute('aria-label',search);$('search').value=state[view].query;
  $('sort-label').textContent=tr('Ordenar por','Sort by');
  $('sort').replaceChildren(option('sheet',tr('Orden de planilla','Sheet order')),option('last',tr('Últimas filas','Last rows first')),option('az','A–Z'),option('refs',tr('Más vínculos','Most links')));
  $('sort').value=state[view].sort;renderFilters();renderList();
}
function showRecord(item){
  detail=item;const t=item.name==='Tools',v=item.values;
  $('kind').textContent=t?tr('Ficha de herramienta','Tool record'):tr('Ficha de fuente','Source record')+' '+(v.ID||'');
  $('close').setAttribute('aria-label',tr('Cerrar','Close'));
  const r=$('record');r.replaceChildren(node('h2',item.title),node('p',v[t?'What it does':'Takeaway']||''));
  const actions=node('div',null,'actions');
  const external=safeLink(t?tr('Visitar herramienta ↗','Visit tool ↗'):tr('Leer fuente ↗','Read source ↗'),v.Link);
  if(external)actions.append(external);
  actions.append(safeLink(tr('Editar clasificación en Sheets ↗','Edit classification in Sheets ↗'),base+sheetID+'/edit#gid='+gid[item.name]+'&range=A'+item.row+':'+(t?'R':'J')+item.row));
  r.append(actions);
  const dl=node('dl');
  const fields=t?['Developer or provider',...classFields,'Where it has been used','Concerns or limits reported','Added by','Checked by','Notes']:['Source type','Contribution','Topics','How found','Tools found','Added by'];
  for(const k of fields){
    if(!v[k] && ['Notes','Concerns or limits reported'].includes(k))continue;
    const categorical=[...toolFilters,...sourceFilters].includes(k);
    const val=categorical?values(item,k).map(label).join(', '):v[k]||label('Not recorded');
    dl.append(node('dt',label(k)),node('dd',val));
  }
  r.append(dl,node('h3',label(t?'Sources':'Tools')+' ('+item.related.length+')'));
  if(item.bad.length)r.append(node('p',tr('Revisar referencias sin correspondencia única en Sources: ','Check references without a unique match in Sources: ')+item.bad.join(', ')));
  if(!item.related.length)r.append(node('p',tr('Sin vínculos identificados.','No linked records found.')));
  item.related.forEach(other=>r.append(makeButton((other.values.ID?other.values.ID+' · ':'')+other.title,()=>showRecord(other),'related')));
  if(!$('detail').open)$('detail').showModal();
  $('detail').scrollTop=0;$('close').focus();
}
async function refresh(){
  if(busy||!connected)return;
  busy=true;render();
  try {
    const [Tools,Sources]=await Promise.all([readSheet('Tools'),readSheet('Sources')]);
    const next={Tools,Sources};connectRecords(next);data=next;fetched=new Date();failed=false;
    if(detail && $('detail').open){
      const match=data[detail.name].find(item=>item.title===detail.title && item.values.ID===detail.values.ID);
      if(match)showRecord(match);else $('detail').close();
    }
  }catch{failed=true;}finally{busy=false;render();}
}
$('connect').onsubmit=e=>{
  e.preventDefault();const input=$('url'),m=input.value.trim().match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,120})(?:\/|$)/);
  if(!m){input.setCustomValidity(tr('Usa el enlace de la planilla de Google Sheets.','Enter the Google Sheets spreadsheet link.'));input.reportValidity();return;}
  location.hash=new URLSearchParams({sheet:m[1]});location.reload();
};
$('url').oninput=()=>$('url').setCustomValidity('');
$('refresh').onclick=refresh;
$('clear').onclick=()=>{state[view].query='';state[view].filters={};cap=24;render();};
$('search').oninput=e=>{state[view].query=e.target.value;cap=24;renderList();};
$('sort').onchange=e=>{state[view].sort=e.target.value;cap=24;renderList();};
$('more').onclick=()=>{cap+=24;renderList();};
$('close').onclick=()=>$('detail').close();
$('detail').onclose=()=>{detail=null;};
$('language').onclick=()=>{lang=tr('en','es');try{localStorage.setItem('atlas-language',lang);}catch{}render();};
render();refresh();
setInterval(()=>{if(!document.hidden && !$('detail').open)refresh();},300000);
