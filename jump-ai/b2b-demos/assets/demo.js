(function(){
'use strict';
var LINE_GROUP='https://line.me/ti/g2/7qQim1WtxNfE2pEp_WWH5THJNdgmu-qiC3qByg';

function h(tag,attrs,kids){
  var el=document.createElement(tag);
  if(attrs)Object.keys(attrs).forEach(function(k){
    if(k==='class')el.className=attrs[k];
    else if(k==='text')el.textContent=attrs[k];
    else if(k.slice(0,2)==='on')el.addEventListener(k.slice(2),attrs[k]);
    else el.setAttribute(k,attrs[k]);
  });
  (kids||[]).forEach(function(c){if(c!=null)el.append(typeof c==='string'?document.createTextNode(c):c)});
  return el;
}
function money(n){return 'NT$'+Math.round(n).toLocaleString('en-US')}
function secHead(eyebrow,title,desc){
  return h('div',{class:'sec-head'},[h('span',{class:'eyebrow',text:eyebrow}),h('h2',{text:title}),desc?h('p',{text:desc}):null]);
}
var ST={'正常':'','達標':'','已收款':'','已完成':'','進行中':'','注意':'warn','待追蹤':'warn','待確認':'warn','即將到期':'warn','逾期':'bad','警示':'bad','滯銷':'bad','落後':'bad','高風險':'bad'};
function cell(v,isNum){
  var td=h('td',isNum?{class:'num'}:null);
  if(typeof v==='string'&&ST.hasOwnProperty(v)){td.append(h('span',{class:'st '+ST[v],text:v}))}else td.textContent=v;
  return td;
}

function renderTable(m){
  var wrap=h('div');
  var tbody=h('tbody');
  var nums=m.num||[];
  function fill(val){
    tbody.textContent='';
    m.rows.forEach(function(r){
      if(m.filter&&val&&val!=='全部'&&r[m.filter.col]!==val)return;
      tbody.append(h('tr',null,r.map(function(v,i){return cell(v,nums.indexOf(i)>-1)})));
    });
  }
  if(m.filter){
    var opts=['全部'].concat(m.rows.map(function(r){return r[m.filter.col]}).filter(function(v,i,a){return a.indexOf(v)===i}));
    var sel=h('select',{id:m.id+'-f','aria-label':m.filter.label,onchange:function(){fill(sel.value)}},opts.map(function(o){return h('option',{value:o,text:o})}));
    wrap.append(h('div',{class:'toolbar'},[h('label',{for:m.id+'-f',text:m.filter.label}),sel]));
  }
  wrap.append(h('div',{class:'tbl'},[h('table',null,[h('thead',null,[h('tr',null,m.cols.map(function(c,i){return h('th',nums.indexOf(i)>-1?{class:'num',text:c}:{text:c})}))]),tbody])]));
  fill('全部');
  return wrap;
}

function renderCalc(m){
  var inputs={};
  var outs=m.outputs.map(function(o){var v=h('div',{class:'value',text:'-'});return {o:o,v:v,card:h('div',{class:'card kpi'},[h('div',{class:'label',text:o.label}),v,h('div',{class:'delta',text:o.hint||''})])}});
  function run(){
    var val={};Object.keys(inputs).forEach(function(k){val[k]=parseFloat(inputs[k].value)||0});
    outs.forEach(function(x){x.v.textContent=x.o.calc(val)});
  }
  var grid=h('div',{class:'calc'},m.inputs.map(function(f){
    var inp=h('input',{type:'number',min:'0',step:f.step||'1',value:String(f.value),id:m.id+'-'+f.key,inputmode:'numeric',oninput:run});
    inputs[f.key]=inp;
    return h('label',{for:m.id+'-'+f.key},[f.label,inp]);
  }));
  var wrap=h('div',null,[grid,h('div',{class:'calc-out'},outs.map(function(x){return x.card})),m.note?h('p',{class:'note',text:m.note}):null]);
  run();
  return wrap;
}

function renderModule(m){
  var body=h('div',{class:'card'},[h('h3',{text:m.heading}),h('p',{class:'note',text:m.desc})]);
  body.append(m.type==='calc'?renderCalc(m):renderTable(m));
  if(m.action){
    var out=h('div',{class:'ai-out',role:'status','aria-live':'polite'},[h('b',{text:m.action.title}),h('ol',null,m.action.lines.map(function(l){return h('li',{text:l})}))]);
    var btn=h('button',{class:'btn',type:'button',onclick:function(){out.classList.add('on');btn.textContent='已產出 AI 建議';}},[m.action.label]);
    body.append(h('div',{class:'toolbar'},[btn]),out);
  }
  return body;
}

function renderChat(c){
  var log=h('div',{class:'log','aria-live':'polite'},[h('div',{class:'msg a',text:c.hello})]);
  var timer;
  var chips=h('div',{class:'chips'},c.qa.map(function(p){
    var b=h('button',{class:'chip',type:'button',onclick:function(){
      Array.prototype.forEach.call(chips.children,function(x){x.classList.remove('on')});b.classList.add('on');
      clearInterval(timer);log.textContent='';
      log.append(h('div',{class:'msg q',text:p[0]}));
      var a=h('div',{class:'msg a'});log.append(a);
      var i=0;timer=setInterval(function(){i+=3;a.textContent=p[1].slice(0,i);if(i>=p[1].length)clearInterval(timer)},18);
    }},[p[0]]);
    return b;
  }));
  return h('div',{class:'chat'},[h('div',{class:'card'},[h('h3',{text:c.name+'｜點選提問'}),h('p',{class:'note',text:'以下為預設示範問題，正式版可串接貴公司實際資料即時回答。'}),h('div',{style:'margin-top:12px'},[chips])]),log]);
}

function renderCTA(target,from){
  var plans=[
    {tier:'LITE',name:'輕量版',price:'定價 NT$30,000',items:['1 個核心流程 AI 自動化','戰情室儀表板 1 式','交付教學與操作手冊']},
    {tier:'FLAGSHIP',name:'旗艦版',price:'定價 NT$58,000',promo:'會後 48 小時專案價 NT$48,000',items:['3 個部門流程 AI 自動化','AI 董秘問答串接公司資料','員工內訓 1 場']},
    {tier:'PARTNER',name:'陪跑版',price:'定價 NT$88,000',items:['旗艦版全部內容','90 天陪跑優化與月度檢討','跨部門 AI 團隊建置']}
  ];
  var q=from?('?from='+encodeURIComponent(from)):'';
  target.append(h('section',{class:'cta',id:'cta'},[h('div',{class:'wrap'},[
    secHead('Next Step','預約 Podcast 專訪與企業 AI 團隊代建置','高雄市青年局 Podcast 錄音室專訪（執董個人 VIP 特邀名額，破例開放體驗），並可搭配政府「小型企業人力提升計畫」（小人提）最高 NT$100,000 內訓補助規劃導入。'),
    h('div',{class:'grid g3'},plans.map(function(p){
      return h('div',{class:'card plan'+(p.promo?' gold':'')},[h('span',{class:'tier',text:p.tier}),h('h3',{text:'企業 AI 團隊代建置｜'+p.name}),h('div',{class:'price',text:p.price}),p.promo?h('div',{class:'promo',text:p.promo}):null,h('ul',null,p.items.map(function(i){return h('li',{text:i})}))]);
    })),
    h('div',{class:'cta-actions'},[
      h('a',{class:'btn',href:LINE_GROUP,target:'_blank',rel:'noopener'},['加入 LINE 商業社群（入群密碼 bnc888）']),
      h('a',{class:'btn ghost',href:'quick-screen.html'+q},['免費補助快篩表單・預約專訪與代建置'])
    ]),
    h('p',{class:'legal',text:'補助資格、比例與金額以勞動部勞動力發展署當年度公告及核定結果為準。涉及金錢、分潤、授權一律留存書面確認。'})
  ])]));
}

function render(D){
  var app=document.getElementById('app');
  var main=h('main',null,[
    h('header',{class:'hero'},[h('div',{class:'wrap'},[
      h('span',{class:'badge',text:D.badge}),
      h('h1',{text:D.person}),
      h('p',{class:'sub',text:D.title}),
      h('p',{class:'lead',text:D.lead}),
    ])]),
    h('section',null,[h('div',{class:'wrap'},[secHead('Live Overview','今日戰情總覽','以下數據為示範用模擬資料，正式導入後改接貴公司實際系統。'),h('div',{class:'grid g4'},D.kpis.map(function(k){return h('div',{class:'card kpi'},[h('div',{class:'label',text:k[0]}),h('div',{class:'value',text:k[1]}),h('div',{class:'delta',text:k[2]})])}))])])
  ]);
  var tabs=h('div',{class:'tabs',role:'tablist'});
  var panels=h('div');
  D.modules.forEach(function(m,i){
    m.id='m'+i;
    var p=h('div',{class:'panel'+(i?'':' on'),id:'p'+i,role:'tabpanel','aria-labelledby':'t'+i},[renderModule(m)]);
    var t=h('button',{class:'tab',type:'button',role:'tab',id:'t'+i,'aria-controls':'p'+i,'aria-selected':i?'false':'true',onclick:function(){
      Array.prototype.forEach.call(tabs.children,function(x){x.setAttribute('aria-selected','false')});
      Array.prototype.forEach.call(panels.children,function(x){x.classList.remove('on')});
      t.setAttribute('aria-selected','true');p.classList.add('on');
    }},[m.tab]);
    tabs.append(t);panels.append(p);
  });
  main.append(h('section',null,[h('div',{class:'wrap'},[secHead('Modules','三大模組互動預覽','點選分頁切換模組，按下按鈕即可看到 AI 產出的建議。'),tabs,panels])]));
  main.append(h('section',null,[h('div',{class:'wrap'},[secHead('AI Assistant',D.chat.name+'即時問答','老闆用一句話問，AI 直接回報重點與下一步。'),renderChat(D.chat)])]));
  app.append(main);
  renderCTA(app,D.id);
  app.append(h('footer',null,[h('div',{class:'wrap'},['建橋雲智｜陳執董（Jump）企業 AI 戰情室示範　本頁為互動預覽，所有數字皆為模擬示意，不代表貴公司實際營運資料。'])]));
}

window.B2B={h:h,money:money,renderCTA:renderCTA,LINE_GROUP:LINE_GROUP};
if(window.DEMO)document.addEventListener('DOMContentLoaded',function(){render(window.DEMO)});
})();
