'use strict';
let literatureLens='topics', literaturePick='';
const litTopics=[
  'Representation of input','Effects on participation','Evaluation methods and measures',
  'Legitimacy and accountability','Bias and fairness','Adoption by practitioners'
];
const litViews={
  topics:['Temas del corpus','Corpus topics'],
  readings:['Lecturas comparadas','Comparative readings'],
  review:['Cobertura y revisión','Coverage and review']
};

function bibliographicKeys(record){
  const citation=record.title.trim();
  const doi=(citation+' '+(record.values.Link||'')).match(/\b10\.\d{4,9}\/[-._;()/:a-z\d]+/i)?.[0].replace(/[.,;]+$/,'').toLowerCase();
  const date=citation.match(/\(\s*((?:19|20)\d\d)[a-z]?(?:,[^)]*)?\)\s*[.,:]?\s*/i);
  const normalize=s=>fold(s).replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const title=date?normalize(citation.slice(date.index+date[0].length).split(/\.\s|[?](?:\s|$)/)[0]):'';
  const author=normalize(citation).split(' ')[0];
  return {doi,titleKey:title.length>=28 && author?author+'|'+date[1]+'|'+title:''};
}

function literatureCorpus(records){
  const papers=[],others=[],byDoi=new Map(),byTitle=new Map();
  for(const row of records){
    if(!matches(row,'Source type','Academic paper')){others.push({rows:[row]});continue;}
    const {doi,titleKey}=bibliographicKeys(row);
    let work=doi?byDoi.get(doi):null;
    if(!work && titleKey){
      const candidates=(byTitle.get(titleKey)||[]).filter(w=>!doi||!w.doi||w.doi===doi);
      if(candidates.length===1)work=candidates[0];
    }
    if(!work){work={rows:[]};papers.push(work);}
    work.rows.push(row);
    if(doi){work.doi=doi;byDoi.set(doi,work);}
    if(titleKey){
      const list=byTitle.get(titleKey)||[];
      if(!list.includes(work))list.push(work);
      byTitle.set(titleKey,list);
    }
  }
  const all=[...papers,...others];
  for(const work of all){
    work.topics=new Set(work.rows.flatMap(r=>values(r,'Topics')).filter(t=>t!=='Not recorded'));
  }
  return {papers,others,all,records};
}
function pickLiterature(key){
  literaturePick=key;renderLiterature(filtered());
  const section=$('lit-list');
  if(section){section.scrollIntoView({block:'nearest'});section.focus({preventScroll:true});}
}
function litButton(key,caption,cls){
  const b=makeButton(caption,()=>pickLiterature(key),cls);
  b.setAttribute('aria-pressed',String(literaturePick===key));
  return b;
}
function litRecords(panel,sets){
  const selection=sets.get(literaturePick);
  if(!selection)return;
  const [title,works]=selection;
  const box=node('section',null,'drill');box.id='lit-list';box.tabIndex=-1;
  const head=node('div',null,'drill-title');
  head.append(node('h3',title+' · '+works.length),makeButton(tr('Cerrar lista','Close list'),()=>{literaturePick='';renderLiterature(filtered());},'link-btn'));
  box.append(head);
  if(!works.length)box.append(node('p',tr('Ninguna ficha coincide con esta selección.','No matching records in this selection.')));
  for(const work of works){
    const line=node('article',null,'proof-row');
    const sorted=[...work.rows].sort((a,b)=>Number(Boolean(b.values.Topics))-Number(Boolean(a.values.Topics)));
    const row=sorted[0];
    line.append(makeButton(row.title,()=>showRecord(row),'record-link'));
    if(row.values.Takeaway)line.append(node('p',row.values.Takeaway));
    const refs=node('div',null,'lit-refs');
    for(const source of sorted)refs.append(makeButton(source.values.ID||tr('Abrir ficha','Open record'),()=>showRecord(source),'link-btn'));
    const link=safeLink(tr('Abrir original ↗','Open original ↗'),row.values.Link);
    if(link)refs.append(link);
    line.append(refs);box.append(line);
  }
  panel.append(box);
}
function topicComparison(panel,corpus){
  analysisHeader(panel,tr('¿Qué estudian los papers y qué cubren las otras fuentes?','What do papers study, and what do the other sources cover?'),
    tr('Compara el porcentaje de cada grupo que lleva una etiqueta temática. Selecciona una barra para leer los registros.','Compare the share of each group carrying a topic tag. Select a bar to read the underlying records.'));
  const sets=new Map(),legend=node('div',null,'lit-legend');
  const cohorts=[
    ['papers',tr('Papers distintos','Distinct papers'),corpus.papers],
    ['others',tr('Otras fichas','Other records'),corpus.others]
  ];
  for(const [key,title,works] of cohorts){
    sets.set(key,[title,works]);
    legend.append(litButton(key,title+' · '+works.length,'lit-key '+key));
  }
  panel.append(legend);
  const topics=[...new Set([...litTopics,...corpus.all.flatMap(w=>[...w.topics])])];
  if(corpus.papers.length && corpus.others.length){
    const shares=topics.map(topic=>{
      const rates=cohorts.map(([, , works])=>works.filter(w=>w.topics.has(topic)).length/works.length);
      return {topic,rates,distance:Math.abs(rates[0]-rates[1])};
    }).sort((a,b)=>b.distance-a.distance);
    const top=shares[0];
    if(top.distance>0){
      const [p,o]=top.rates.map(rate=>Math.round(100*rate));
      panel.append(node('p',tr('La mayor diferencia de cobertura está en «'+label(top.topic)+'», presente en el '+p+' % de los papers y el '+o+' % de las otras fichas.','The largest coverage gap is for “'+label(top.topic)+'”, tagged in '+p+'% of papers and '+o+'% of other records.'),'reading-implication'));
    }
  }
  for(const topic of topics){
    const block=node('section',null,'topic-line');
    block.append(node('h3',label(topic)));
    for(const [key,name,works] of cohorts){
      const tagged=works.filter(w=>w.topics.has(topic));
      const id=key+'|'+topic,share=works.length?Math.round(100*tagged.length/works.length):null;
      sets.set(id,[name+' · '+label(topic),tagged]);
      const b=litButton(id,'','topic-bar '+key);
      b.setAttribute('aria-label',name+' · '+label(topic)+' · '+tagged.length+' / '+works.length);
      const rail=node('i'),fill=node('em');fill.style.width=(share||0)+'%';rail.append(fill);
      b.append(rail,node('b',share===null?'—':share+'%'),node('span',tagged.length+' / '+works.length));
      block.append(b);
    }
    panel.append(block);
  }
  panel.append(node('p',tr('Cada trabajo cuenta una vez por tema. Se combinan fichas académicas con el mismo DOI o con primer autor, año y título coincidentes. Las proporciones incluyen los registros sin etiquetas.','Each work counts once per topic. Academic entries are grouped by DOI or matching first author, year and title. Denominators include untagged records.'),'method'));
  litRecords(panel,sets);
}

// Reading notes on public research. Only display a note if its publication is present
// in the selected source records. New records enter the live counts without a note.
const readingPairs=[
  {
    question:['¿Qué significa acertar al clasificar aportes?','What counts as a correct classification?'],
    implication:['Para comparar resultados, registra qué se clasifica, quién fija la respuesta de referencia y cuánto trabajo humano queda después.','To compare results, record the classification task, who defines the reference answer and how much human work remains.'],
    studies:[
      {match:/200k\+ crowdsourced political arguments/i,author:'Fierro et al. (2017)',url:'https://aclanthology.org/W17-5101/',
        summary:['En el proceso constitucional chileno, el modelo incluyó la categoría correcta entre sus cinco sugerencias en el 90 % de los casos. En otra tarea, etiquetar la estructura del argumento, obtuvo un F1 macro de 0,65. Cada cifra responde a una pregunta distinta.','In the Chilean constitutional process, the model placed the correct category among its five suggestions in 90% of cases. On a separate task, labeling argument structure, its macro F1 was 0.65. The two numbers measure different tasks.']},
      {match:/consult evaluation.*scottish government/i,author:'i.AI (2025)',url:'https://knowledgehub.dev.ai.gov.uk/tools/consult',
        summary:['En una consulta escocesa, la revisión humana mantuvo todos los temas propuestos por Consult en el 60 % de las respuestas. La mediana de revisión fue de 23 segundos por respuesta. El informe permite examinar el trabajo que queda tras automatizar el etiquetado.','In a Scottish consultation, reviewers retained all of Consult’s proposed themes for 60% of responses. Median review time was 23 seconds per response. The evaluation makes the work remaining after automated tagging visible.']}
    ]
  },{
    question:['¿Qué hace más fácil tomar la palabra?','What makes it easier to speak up?'],
    implication:['La claridad de una respuesta y la disposición a expresar una opinión sensible requieren medidas diferentes. Conviene registrar ambas cuando una herramienta promete ampliar la participación.','Clarity of responses and willingness to voice sensitive opinions call for different measures. Track both when a tool claims to broaden participation.'],
    studies:[
      {match:/communitybots: creating and evaluating/i,author:'Jiang et al. (2023)',url:'https://doi.org/10.1145/3579469',
        summary:['En una comparación con 96 participantes, quienes conversaron con varios agentes dieron respuestas más específicas y claras que quienes usaron un solo agente. La longitud de las respuestas no mostró una diferencia significativa.','In a comparison with 96 participants, responses to multiple agents were more specific and clearer than responses to a single agent. The difference in response length was not statistically significant.']},
      {match:/conversational agents to facilitate deliberation on harmful content/i,author:'Agarwal et al. (2024)',url:'https://doi.org/10.1145/3687030',
        summary:['En entrevistas con 21 usuarios de WhatsApp en India, el anonimato aparecía como condición para opinar sobre contenidos sensibles. La posibilidad de que el agente leyera los mensajes también generó inquietud. Son expectativas expresadas al explorar un prototipo.','In interviews with 21 WhatsApp users in India, anonymity mattered for voicing opinions on sensitive content. Participants also expressed concern about an agent reading messages. These were expectations elicited with a design probe.']}
    ]
  },{
    question:['¿Cambian las preferencias después de deliberar?','Do preferences change after deliberation?'],
    implication:['Al evaluar efectos, conviene registrar por separado la tecnología, el diseño de la deliberación y el grupo de comparación. Aquí el resultado corresponde al proceso completo.','When evaluating effects, record the technology, the deliberation design and the comparison group separately. Here the outcome applies to the process as a whole.'],
    studies:[
      {match:/scaling dialogue for democracy/i,author:'Fishkin et al. (2025)',url:'https://doi.org/10.1017/S1537592724001749',
        summary:['En Estados Unidos, 962 personas deliberaron sobre clima y energía y 661 integraron el grupo de comparación. En 22 de las 27 preguntas más polarizadas, el cambio observado entre encuestas difirió significativamente entre los grupos.','In the US, 962 people deliberated about climate and energy and 661 served as the comparison group. On 22 of the 27 most polarized questions, the change between surveys differed significantly between groups.']}
    ]
  }
];
function comparativeReadings(panel,corpus){
  analysisHeader(panel,tr('Qué se midió y qué se puede concluir','What was measured and what the results support'),
    tr('Lecturas seleccionadas y contrastadas con las publicaciones originales. Las fichas enlazan a los apuntes del equipo y a las herramientas relacionadas.','Selected readings checked against the original publications. Open the records for team notes and related tools.'));
  let shown=0;
  for(const pairing of readingPairs){
    const visible=pairing.studies.map(study=>({study,record:corpus.records.find(r=>study.match.test(r.title))})).filter(s=>s.record);
    if(!visible.length)continue;
    shown++;
    const article=node('article',null,'reading-set');article.append(node('h3',tr(...pairing.question)));
    for(const {study,record} of visible){
      const section=node('section',null,'reading-study');
      section.append(node('h4',study.author),node('p',tr(...study.summary)));
      const refs=node('div',null,'lit-refs');
      refs.append(makeButton(tr('Ficha ','Record ')+(record.values.ID||''),()=>showRecord(record),'link-btn'),safeLink(tr('Publicación ↗','Publication ↗'),study.url));
      section.append(refs);article.append(section);
    }
    if(visible.length===pairing.studies.length)article.append(node('p',tr(...pairing.implication),'reading-implication'));
    panel.append(article);
  }
  if(!shown)panel.append(node('p',tr('Esta selección todavía no tiene una lectura comparada. Puedes consultar sus temas y las notas de cada ficha.','This selection has no curated reading yet. Its topic coverage and record notes are available.'),'empty'));
}
function coverageReview(panel,corpus){
  analysisHeader(panel,tr('Cómo se formó esta colección','How this collection took shape'),
    tr('El tipo de fuente y la vía de búsqueda ayudan a interpretar qué evidencia llega al inventario.','Source types and discovery routes help explain what evidence enters the inventory.'));
  const sets=new Map(),counts=node('div',null,'coverage-items');
  function choice(id,title,works,container=counts){
    sets.set(id,[title,works]);container.append(litButton(id,title+' · '+works.length,'region'));
  }
  const sourceTypes=[...new Set(corpus.records.flatMap(r=>values(r,'Source type')))];
  for(const type of sourceTypes){
    const works=corpus.records.filter(r=>matches(r,'Source type',type)).map(row=>({rows:[row]}));
    choice('type|'+type,label(type),works);
  }
  panel.append(node('h3',tr('Fichas por tipo de fuente','Records by source type')),counts);
  const discovery=new Map();
  for(const source of corpus.records){
    const raw=source.values['How found']?.trim()||'';
    const key=fold(raw);if(!discovery.has(key))discovery.set(key,{name:raw||label('Not recorded'),rows:[]});
    discovery.get(key).rows.push({rows:[source]});
  }
  const routes=node('div',null,'coverage-items');
  for(const [key,g] of [...discovery].sort((a,b)=>b[1].rows.length-a[1].rows.length))choice('via|'+key,g.name,g.rows,routes);
  panel.append(node('h3',tr('Cómo se encontró cada fuente','How sources were found')),routes);
  const review=node('div',null,'coverage-items');
  choice('duplicates',tr('Papers con varias fichas','Papers with multiple records'),corpus.papers.filter(w=>w.rows.length>1),review);
  choice('no-topics',tr('Fichas sin tema','Records missing topics'),corpus.records.filter(r=>!r.values.Topics?.trim()).map(r=>({rows:[r]})),review);
  const flags=corpus.records.filter(r=>!matches(r,'Topics','Bias and fairness')&&/\b(?:bias(?:ed|es)?|fairness|unfair(?:ness)?|sesgo[s]?|equidad)\b/i.test(r.values.Takeaway||''));
  choice('fairness',tr('Posible etiqueta de sesgo y equidad','Possible bias and fairness tag'),flags.map(r=>({rows:[r]})),review);
  panel.append(node('h3',tr('Para revisar con el equipo','For team review')),review,
    node('p',tr('La sugerencia busca palabras sobre sesgo o equidad en el hallazgo de fichas que aún no llevan esa etiqueta. Abre el contexto antes de reclasificar.','The suggestion looks for bias or fairness terms in the takeaway of an untagged record. Read the context before reclassifying.'),'method'));
  litRecords(panel,sets);
}
function renderLiterature(records){
  const panel=$('analysis');panel.replaceChildren();
  const nav=node('div',null,'lenses');
  for(const [key,names] of Object.entries(litViews)){
    const b=makeButton(tr(...names),()=>{literatureLens=key;literaturePick='';renderLiterature(filtered());});
    b.setAttribute('aria-pressed',String(literatureLens===key));nav.append(b);
  }
  panel.append(nav);
  if(!records.length){panel.append(node('p',busy?tr('Cargando…','Loading…'):tr('Sin fuentes para esta selección.','No sources in this selection.'),'empty'));return;}
  const figure=node('section',null,'analysis-figure literature-figure');
  ({topics:topicComparison,readings:comparativeReadings,review:coverageReview})[literatureLens](figure,literatureCorpus(records));
  panel.append(figure);
}
