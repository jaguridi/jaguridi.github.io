// Match mentions within a description of the workflow, including human-assisted steps.
const functionRules = [
  ['group','Agrupación y etiquetado','Grouping and tagging',/\b(?:cluster\w*|classif\w*|categori[sz]\w*|tags?|tagging|topic model\w*|topic tagging|theme taxonomy|label(?:ing|ling)?|group(?:s|ed|ing)? (?:similar|key phrases|them into themes)|sort\w* [^.;]{0,55} (?:topics?|categories))\b/i],
  ['synth','Síntesis y redacción','Synthesis and drafting',/\b(?:summar\w*|synthesi[sz]\w*|synthesis|condens\w*|draft(?:s|ed|ing)? (?:a |the |an? )?(?:sourced |community-input )?(?:responses?|report|summary)|generat\w* minutes|structured, time-stamped minutes)\b/i],
  ['talk','Conversación y facilitación','Conversation and facilitation',/\b(?:chatbots?|virtual agent|virtual interviewer|socratic dialogue|follow-up questions|follow-up interviewing|moderated digital dialogues|automated moderator|ai moderator|question-answering interface|answers resident questions)\b/i],
  ['voice','Transcripción e interpretación','Transcription and interpreting',/\b(?:transcrib\w*|transcriptions?|captioning|speech translation|speech recognition|speech into text|handwriting-recognition)\b/i],
  ['sentiment','Análisis de sentimiento','Sentiment analysis',/\b(?:sentiment|positive\/negative\/neutral)\b/i],
  ['visual','Mapas y visualización','Mapping and visualization',/\b(?:visuali[sz]\w*|on-the-spot map|interactive map|mind maps?|realistic images|opinion maps?)\b/i],
  ['trace','Trazabilidad al aporte original','Tracing outputs to original input',/\b(?:verbatim|direct citations|linked to (?:the )?source|traces? each insight|tracing summary findings|original citizen submissions)\b/i]
];
functionRules.push(['language','Traducción y uso multilingüe','Translation and multilingual support',/\b(?:translat\w*|multilingual|cross-language|[0-9]+ (?:EU )?languages|in Indian languages)\b/i]);
// Match locations in the use-case field. Cities supply a country when it is omitted.
const placeAliases = {
  US: ['united states','u.s.','u.s.a.','usa','us','new york city','nyc','boston','madison, wi','durham, nc','bowling green','kentucky','san juan island','st. louis','baltimore','washington, dc','gilroy','north las vegas','san francisco','california','fort worth','atlanta public schools'],
  GB: ['uk','u.k.','united kingdom','scotland','scottish government','england','wales','west oxfordshire','plymouth city council','south cambridgeshire','greater cambridge','west devon','kirklees'],
  NZ: ['new zealand','nz ministry'], DE:['german cities','hamburg','germany'], KR:['seoul','south korea'],
  FR:['french government','france'], AU:['australian government','australian aviation','australia'],
  JP:['iwate prefecture','japan'], FI:['helsinki','jyväskylä','finland'], LU:['esch-sur-alzette','luxembourg'],
  CA:['toronto','canada'], TW:['vtaiwan','taiwan'], AT:['austrian climate assembly','austria'],
  CL:['chilean','chile'], ES:['decide madrid','spain'], HK:['hong kong'], EU:['european parliament','european union']
};
const supportedCodes = [...new Set([...Object.keys(worldPaths).filter(k=>/^[A-Z]{2}$/.test(k)),...Object.keys(placeAliases)])];
const regionNames = Object.fromEntries(['en','es'].map(l=>[l,new Intl.DisplayNames([l],{type:'region'})]));
const geoRules = supportedCodes.map(code=>{
  const names=new Set([regionNames.en.of(code),regionNames.es.of(code),...(placeAliases[code]||[])]);
  const words=[...names].filter(n=>n.length>2 || ['us','uk'].includes(n)).map(n=>n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[.*+?^{}$()|[\]\\]/g,'\\$&'));
  return [code,new RegExp('(?:^|[^a-z])(?:'+words.join('|')+')(?=$|[^a-z])','i')];
});
const month='(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const useDates=[
  /\(\s*(?:(?:from|since|by|c\.|fall|spring|summer|winter|pilot from|deployed|operational)\s+)?((?:19|20)\d\d)(?=[\s)+,:–-])/gi,
  new RegExp('\\b'+month+'\\s+((?:19|20)\\d\\d)\\b','gi'),
  /\b(?:FY\s*|consultation\s+|consultations\s+|klimarat\s+)((?:19|20)\d\d)\b/gi,
  /\b((?:19|20)\d\d)\s+consultation\b/gi,
  /,\s*((?:19|20)\d\d)(?=-\d\d\s*\(S\d+)/g
];
function profileTool(tool){
  const description=(tool.values['What it does']||'').split(/also a research paper:/i)[0].replace(/https?:\/\/\S+/g,'');
  const sentences=description.match(/[^.!?\n]+(?:[.!?]+|$)/g)||[];
  const features=new Map();
  for(const [id,,,pattern] of functionRules){
    const sentence=sentences.find(s=>{
      const cleaned=s.replace(/synthesi[sz]ed audio|clusters of pothole complaints/gi,'');
      return pattern.test(cleaned);
    });
    if(sentence)features.set(id,sentence.trim());
  }
  const places=new Map(), dates=[];
  const currentYear=new Date().getFullYear();
  const clauses=(tool.values['Where it has been used']||'').split(/;|\n/).map(s=>s.trim()).filter(Boolean);
  for(const clause of clauses){
    if(/^(?:presented |cited as |co-developer |vendor says|.*discussed at TICTeC)/i.test(clause))continue;
    const text=fold(clause).replace(/\buk fcdo\b/g,'').replace(/\bof [a-z -]+ background\b/g,'');
    for(const [code,pattern] of geoRules)if(pattern.test(text) && !places.has(code))places.set(code,clause);
    const relevant=clause.split(/\b(?:report (?:april|published)|planning from|planned for|informing LOIP|strategic plan|strategy 20\d\d|held 20\d\d)\b/i)[0];
    for(const pattern of useDates){
      for(const m of relevant.matchAll(pattern)){
        const year=Number(m[1]);
        if(year<=currentYear)dates.push({year,text:clause});
      }
    }
  }
  const publications=[];
  for(const source of tool.related){
    // Accept a year in bibliographic position, e.g. Author (2024, July). Title.
    const m=source.title.match(/^[^()]{1,700}\(\s*((?:19|20)\d{2})[a-z]?(?:\s*,[^)]*)?\s*\)\s*[.,:]?/i)
      ||source.title.match(/\)\s*[.,]?\s*\(\s*((?:19|20)\d{2})(?:\s*,[^)]*)?\s*\)\s*\./);
    if(m && Number(m[1])<=currentYear)publications.push({year:Number(m[1]),text:(source.values.ID||'')+' · '+source.title,source});
  }
  const earliest=rows=>rows.sort((a,b)=>a.year-b.year)[0];
  return {features,places,use:earliest(dates),publication:earliest(publications)};
}
