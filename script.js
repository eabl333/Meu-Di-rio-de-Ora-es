(function(){'use strict';
const K='mdo_v1',CATS=['Família','Saúde','Trabalho','Vida espiritual','Relacionamentos','Gratidão','Outros'],ST=['Em oração','Aguardando','Respondido'];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fmt=d=>d?d.split('-').reverse().join('/'):'';
let db={items:[]};try{const r=JSON.parse(localStorage.getItem(K));if(r&&Array.isArray(r.items))db=r}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(db));return true}catch(e){toast('Não foi possível salvar. Verifique o espaço e as permissões do navegador.',1);return false}}
let tt;function toast(m,err){const t=$('#toast');t.textContent=m;t.className='show'+(err?' err':'');clearTimeout(tt);tt=setTimeout(()=>t.className='',3500)}
const T={
oracao:{h:'Nova oração',one:'oração',msg:'Não importa o tamanho da sua oração. Deus conhece o seu coração.',ok:'Sua oração foi guardada. Deus ouve cada palavra do seu coração.',f:[['title','Título da oração','in',1],['category','Categoria','cat'],['text','Escreva sua oração','ta',1],['note','Observações pessoais','ta']]},
pedido:{h:'Meus pedidos de oração',one:'pedido',msg:'Entregue a Deus aquilo que pesa em seu coração.',ok:'Pedido registrado. Continue confiando.',f:[['title','Título','in',1],['text','Descrição','ta',1],['category','Categoria','cat'],['status','Status','st']]},
gratidao:{h:'Minhas gratidões',one:'gratidão',msg:'Um coração grato encontra motivos para agradecer até nos pequenos detalhes.',ok:'Gratidão registrada. Que bom reconhecer as bênçãos!',f:[['title','Título','in',1],['text','Descrição','ta',1],['note','Reflexão (opcional)','ta']]},
resposta:{h:'Respostas das orações',one:'resposta',msg:'Registre com suas palavras como você viveu cada resposta. Apenas você decide o que anotar.',ok:'Experiência registrada com carinho.',f:[['ref','Pedido relacionado','ref',1],['date','Data da resposta','date',1],['text','Descrição','ta',1],['note','Reflexão','ta'],['mark','Marcar este pedido como "Respondido"','ck']]},
reflexao:{h:'Minhas reflexões',one:'reflexão',msg:'Escreva com liberdade. Este espaço é seu.',ok:'Reflexão salva.',f:[['title','Título','in',1],['text','Texto','ta',1]]}};
const LBL={oracao:'Oração',pedido:'Pedido',gratidao:'Gratidão',resposta:'Resposta',reflexao:'Reflexão'};
let editing={};
function opts(a,v){return a.map(x=>`<option${x===v?' selected':''}>${esc(x)}</option>`).join('')}
function fld(t,[n,l,k,req],v){v=v??'';const id=`${t}_${n}`,r=req?' required':'';
if(k==='in')return`<label for="${id}">${l}</label><input id="${id}" name="${n}" maxlength="120" value="${esc(v)}"${r}>`;
if(k==='ta')return`<label for="${id}">${l}</label><textarea id="${id}" name="${n}"${r}>${esc(v)}</textarea>`;
if(k==='cat')return`<label for="${id}">${l}</label><select id="${id}" name="${n}">${opts(CATS,v||CATS[0])}</select>`;
if(k==='st')return`<label for="${id}">${l}</label><select id="${id}" name="${n}">${opts(ST,v||ST[0])}</select>`;
if(k==='date')return`<label for="${id}">${l}</label><input type="date" id="${id}" name="${n}" value="${v||today()}"${r}>`;
if(k==='ck')return`<label><input type="checkbox" name="${n}">${l}</label>`;
if(k==='ref'){const p=db.items.filter(i=>i.type==='pedido');return p.length?`<label for="${id}">${l}</label><select id="${id}" name="${n}">${p.map(i=>`<option value="${i.id}"${i.id===v?' selected':''}>${esc(i.title)}</option>`).join('')}</select>`:`<p class="hint">Cadastre primeiro um pedido de oração para registrar uma resposta.</p>`}return''}
function build(t){const c=T[t],e=db.items.find(i=>i.id===editing[t]),hasCat=c.f.some(f=>f[2]==='cat');
$('#'+t).innerHTML=`<h2>${c.h}</h2><div class="msg">${c.msg}</div><form class="card" id="f_${t}"><h3>${e?'Editar '+c.one:'Novo registro'}</h3>${c.f.map(f=>fld(t,f,e?.[f[0]])).join('')}<div class="row"><button class="btn" type="submit">${e?'Atualizar':t==='oracao'?'Salvar minha oração':'Salvar'}</button>${e?'<button type="button" class="btn ghost" data-cancel>Cancelar</button>':''}</div></form>
<div class="filters"><input type="search" data-q placeholder="Pesquisar..." aria-label="Pesquisar"><select data-c aria-label="Categoria"><option value="">Todas as categorias</option>${CATS.map(x=>`<option>${x}</option>`).join('')}</select><input type="date" data-d aria-label="Filtrar por data"></div><div data-list></div>`;
if(!hasCat)$('#'+t+' [data-c]').hidden=true;
$('#f_'+t).onsubmit=ev=>{ev.preventDefault();submit(t,ev.target)};
const x=$('#'+t+' [data-cancel]');if(x)x.onclick=()=>{editing[t]=null;build(t)};
$$('#'+t+' .filters [data-q],#'+t+' .filters [data-c],#'+t+' .filters [data-d]').forEach(i=>i.oninput=()=>list(t));list(t)}
function submit(t,form){const fd=new FormData(form),o={};T[t].f.forEach(f=>{o[f[0]]=f[2]==='ck'?fd.has(f[0]):(fd.get(f[0])||'').toString().trim()});
if(t==='resposta'&&!o.ref){toast('Selecione um pedido antes de salvar.',1);return}
const mark=o.mark;delete o.mark;const e=db.items.find(i=>i.id===editing[t]);
if(e)Object.assign(e,o);else db.items.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),type:t,date:o.date||today(),...o});
if(mark){const p=db.items.find(i=>i.id===o.ref);if(p)p.status='Respondido'}
if(!save())return;toast(e?'Registro atualizado.':T[t].ok);editing[t]=null;build(t)}
function list(t){const w=$('#'+t+' [data-list]');if(!w)return;const q=$('#'+t+' [data-q]').value.toLowerCase(),c=$('#'+t+' [data-c]').value,d=$('#'+t+' [data-d]').value;
const a=db.items.filter(i=>i.type===t&&(!c||i.category===c)&&(!d||i.date===d)&&(!q||JSON.stringify(i).toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
w.innerHTML=a.length?a.map(i=>card(i)).join(''):`<div class="empty">Nada por aqui ainda. Que tal escrever o primeiro registro?</div>`;
w.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>del(b.dataset.del));
w.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{editing[t]=b.dataset.edit;build(t);$('#f_'+t).scrollIntoView({behavior:'smooth'})});
w.querySelectorAll('[data-st]').forEach(s=>s.onchange=()=>{const p=db.items.find(i=>i.id===s.dataset.st);p.status=s.value;if(save()){toast('Status atualizado.');list(t)}})}
function card(i,show){const ref=i.type==='resposta'?db.items.find(p=>p.id===i.ref):null;
return`<article class="item"><h4>${esc(i.title||(ref?'Resposta: '+ref.title:'Registro'))}</h4><div class="meta">${show?`<span class="tag">${LBL[i.type]}</span> `:''}${fmt(i.date)}${i.category?`<span class="tag">${esc(i.category)}</span>`:''}${i.status?`<span class="tag${i.status==='Respondido'?' ok':''}">${esc(i.status)}</span>`:''}</div>${i.text?`<p>${esc(i.text)}</p>`:''}${i.note?`<p class="note">${esc(i.note)}</p>`:''}<div class="acts">${i.type==='pedido'?`<select data-st="${i.id}" aria-label="Status">${opts(ST,i.status)}</select>`:''}<button class="btn ghost sm" data-edit="${i.id}">Editar</button><button class="btn ghost sm danger" data-del="${i.id}">Excluir</button></div></article>`}
function del(id){if(!confirm('Excluir este registro? Esta ação não pode ser desfeita.'))return;const i=db.items.find(x=>x.id===id);db.items=db.items.filter(x=>x.id!==id);if(i&&i.type==='pedido')db.items=db.items.filter(x=>!(x.type==='resposta'&&x.ref===id));if(save()){toast('Registro excluído.');refresh()}}
function dashboard(){const n=t=>db.items.filter(i=>i.type===t).length,r=db.items.filter(i=>i.type==='pedido'&&i.status==='Respondido').length;
$('#stats').innerHTML=[['Orações',n('oracao')],['Pedidos',n('pedido')],['Agradecimentos',n('gratidao')],['Respondidas',r]].map(([l,v])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('');
const l=[...db.items].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id))[0];$('#last').innerHTML=l?card(l,1).replace(/<div class="acts">.*?<\/div>/,''):'<div class="empty">Você ainda não escreveu nada. Comece quando quiser.</div>';
const d=new Date(),y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate();let h='';for(let k=1;k<=days;k++){const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(k).padStart(2,'0')}`;h+=`<span class="${db.items.some(i=>i.date===ds)?'has':''}">${k}</span>`}$('#miniCal').innerHTML='<div class="mini">'+h+'</div>'}
let cm=new Date();cm.setDate(1);let sel=null;
function calendar(){const y=cm.getFullYear(),m=cm.getMonth();$('#calTitle').textContent=cm.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
let h=['D','S','T','Q','Q','S','S'].map(x=>`<i>${x}</i>`).join('');for(let k=0;k<cm.getDay();k++)h+='<button disabled></button>';
for(let k=1;k<=new Date(y,m+1,0).getDate();k++){const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(k).padStart(2,'0')}`,c=db.items.filter(i=>i.date===ds).length;h+=`<button data-day="${ds}" class="${c?'has':''} ${sel===ds?'sel':''}">${k}${c?`<small>${c}</small>`:''}</button>`}
$('#cal').innerHTML=h;$$('#cal [data-day]').forEach(b=>b.onclick=()=>{sel=b.dataset.day;calendar()});
const a=db.items.filter(i=>i.date===sel);$('#dayList').innerHTML=sel?`<h3>${fmt(sel)}: ${a.length} registro(s)</h3>`+(a.length?a.map(i=>card(i,1).replace(/<div class="acts">.*?<\/div>/,'')).join(''):'<div class="empty">Nenhum registro neste dia.</div>'):'<p class="hint">Toque em uma data para ver os registros.</p>'}
const V=[['Fé','Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem.','Hebreus 11:1'],['Esperança','Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.','Jeremias 29:11'],['Gratidão','Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.','1 Tessalonicenses 5:18'],['Perseverança','E não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não houvermos desfalecido.','Gálatas 6:9'],['Amor','Agora, pois, permanecem a fé, a esperança e o amor, estes três, mas o maior destes é o amor.','1 Coríntios 13:13'],['Confiança em Deus','Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.','Provérbios 3:5'],['Oração','Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças.','Filipenses 4:6']];
function verses(){const o=new Date().getDate()%V.length;$('#verses').innerHTML=V.map((v,i)=>`<div class="verse"><span class="tag${i===o?' ok':''}">${v[0]}${i===o?' · hoje':''}</span><q>${esc(v[1])}</q><cite>${v[2]}</cite><div class="acts"><button class="btn ghost sm" data-share="${i}">Compartilhar</button></div></div>`).join('');
$$('[data-share]').forEach(b=>b.onclick=async()=>{const v=V[b.dataset.share],tx=`“${v[1]}” — ${v[2]}\n\nVoz do Altíssimo`;try{if(navigator.share)await navigator.share({text:tx});else{await navigator.clipboard.writeText(tx);toast('Versículo copiado. É só colar onde quiser.')}}catch(e){if(e.name!=='AbortError')toast('Não foi possível compartilhar neste navegador.',1)}})}
function refresh(){Object.keys(T).forEach(build);dashboard();calendar()}
function go(id){$$('.view').forEach(v=>v.classList.toggle('on',v.id===id));$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===id));$('#nav').classList.remove('open');if(id==='resposta')build('resposta');if(id==='painel')dashboard();if(id==='calendario')calendar();scrollTo({top:0})}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});$('#burger').onclick=()=>$('#nav').classList.toggle('open');
$('#prev').onclick=()=>{cm.setMonth(cm.getMonth()-1);calendar()};$('#next').onclick=()=>{cm.setMonth(cm.getMonth()+1);calendar()};
$('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'meu-diario-de-oracoes',v:1,...db},null,2)],{type:'application/json'}));a.download='diario-oracoes-'+today()+'.json';a.click();URL.revokeObjectURL(a.href);toast('Backup exportado. Guarde o arquivo em local seguro.')};
$('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!Array.isArray(d.items)||d.items.some(i=>!i||!T[i.type]||!i.id||!i.date))throw 0;if(!confirm('Importar substitui os registros atuais deste navegador. Continuar?'))return;db={items:d.items};if(save()){refresh();toast('Backup importado com sucesso.')}}catch(x){toast('Arquivo inválido. Escolha um backup exportado por este diário.',1)}};r.readAsText(f);e.target.value=''};
$('#prt').onclick=()=>{const a=[...db.items].sort((a,b)=>a.date.localeCompare(b.date));$('#printArea').innerHTML='<h1>Meu Diário de Orações</h1>'+(a.length?a.map(i=>`<div><b>${esc(i.title||LBL[i.type])}</b> (${LBL[i.type]}, ${fmt(i.date)}${i.category?', '+esc(i.category):''}${i.status?', '+esc(i.status):''})<br>${esc(i.text||'').replace(/\n/g,'<br>')}${i.note?'<br><i>'+esc(i.note).replace(/\n/g,'<br>')+'</i>':''}</div>`).join(''):'<p>Nenhum registro.</p>');print()};
try{if(!localStorage.getItem('mdo_welcome'))$('#welcome').hidden=false}catch(e){}
$('#start').onclick=()=>{try{localStorage.setItem('mdo_welcome','1')}catch(e){}$('#welcome').hidden=true;go('oracao')};
refresh();verses();go('inicio');
})();
