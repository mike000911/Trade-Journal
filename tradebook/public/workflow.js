/* Simple entry workflow. Extra preferences/plans travel with the existing snapshot. */
function cleanWorkflowSettings(source){
 const out={lastInstrument:TradeMath.instruments[source.lastInstrument]?source.lastInstrument:'MNQ',entryMode:source.entryMode==='detailed'?'detailed':'quick',favorites:Array.isArray(source.favorites)?source.favorites.filter(x=>TradeMath.instruments[x]).slice(0,9):['MNQ','MES'],dailyPlans:{}};
 for(const [key,value] of Object.entries(source.dailyPlans||{})){
  if(!/^\d{4}-\d{2}-\d{2}\|(MNQ|NQ|MES|ES|YM|GC|MGC|CL|MCL)$/.test(key)||!value||typeof value!=='object')continue;
  out.dailyPlans[key]=Object.fromEntries(['premarket','levels','gapLow','gapHigh','willingness'].map(k=>[k,String(value[k]??'').slice(0,10000)]));
 }
 return out;
}
(() => {
 const instrument=$('instrument'),form=$('tradeForm');
 const sourceLinks={MNQ:'markets/equities/nasdaq/micro-e-mini-nasdaq-100',NQ:'markets/equities/nasdaq/e-mini-nasdaq-100',MES:'markets/equities/sp/micro-e-mini-sandp-500',ES:'markets/equities/sp/e-mini-sandp500',YM:'markets/equities/dow-jones/e-mini-dow',GC:'markets/metals/precious/gold',MGC:'markets/metals/precious/e-micro-gold',CL:'markets/energy/crude-oil/light-sweet-crude',MCL:'markets/energy/crude-oil/micro-wti-crude-oil'};
 const mode=document.createElement('div');mode.className='entry-mode';mode.innerHTML='<div><b>A little less typing.</b><p>Quick entry covers the essentials. Expand when you want more detail.</p></div><div role="group" aria-label="Entry detail"><button type="button" id="quickMode">Quick entry</button><button type="button" id="detailedMode">Detailed entry</button></div>';
 form.before(mode);
 const sections=[...form.querySelectorAll(':scope > .form-section')];
 sections[1].classList.add('entry-extra');sections[2].classList.add('entry-extra');
 for(const id of ['notes','nextAction'])$(id).closest('label').classList.add('entry-extra');
 const shortNote=document.createElement('p');shortNote.className='quick-note';shortNote.textContent='Analysis and checklist are optional here. Expand Detailed entry to review them; unreviewed rules remain unassessed.';sections[0].after(shortNote);
 window.setEntryMode=value=>{form.dataset.entryMode=value;document.querySelector('.entry-steps').hidden=value==='quick';shortNote.hidden=value!=='quick';$('quickMode').setAttribute('aria-pressed',String(value==='quick'));$('detailedMode').setAttribute('aria-pressed',String(value==='detailed'));};
 async function chooseMode(value){settings.entryMode=value;setEntryMode(value);if(ready)await commit()}
 $('quickMode').onclick=()=>chooseMode('quick');$('detailedMode').onclick=()=>chooseMode('detailed');
 const planner=document.createElement('details');planner.className='panel daily-planner';planner.innerHTML=`<summary><span>Daily plan</span><small id="planContext"></small></summary><div class="planner-body"><p class="hint">Plan once for this instrument and date. Changes save automatically. Attach a copy to each trade so later plan edits do not rewrite your history.</p><div class="two"><label>Premarket bias & scenarios<textarea id="planPremarket" maxlength="10000" placeholder="Structure, liquidity and what you want to see…"></textarea></label><label>Key levels & risk boundaries<textarea id="planLevels" maxlength="10000" placeholder="Levels to watch, invalidation, daily risk limit…"></textarea></label></div><div class="two"><label>Opening gap low<input id="planLow" type="number" step="any"></label><label>Opening gap high<input id="planHigh" type="number" step="any"></label></div><label>Evidence needed to target the midpoint<textarea id="planWillingness" maxlength="10000"></textarea></label><div class="planner-actions"><span id="planState" role="status">No plan yet</span><button type="button" id="exportPlans">Export plans CSV</button></div></div>`;
 mode.before(planner);
 const attach=document.createElement('div');attach.className='plan-attach';attach.innerHTML='<span id="attachedPlan">No daily plan attached</span><button type="button" id="attachPlan">Use daily plan</button>';
 form.querySelector('.trade-date-strip').after(attach);
 const planFields={premarket:'planPremarket',levels:'planLevels',gapLow:'planLow',gapHigh:'planHigh',willingness:'planWillingness'};
 let planKey='',planTimer;
 const currentKey=()=>$('tradeDate').value+'|'+instrument.value;
 function planStatus(){const exists=!!settings.dailyPlans?.[planKey];$('planState').textContent=exists?'Plan saved with your journal':'No plan yet';$('attachPlan').disabled=!exists;$('attachedPlan').textContent=$('planKey').value?'Attached copy · '+$('planKey').value.replace('|',' · '):'No daily plan attached';}
 function loadPlan(){planKey=currentKey();$('planContext').textContent=planKey.replace('|',' · ');const plan=settings.dailyPlans?.[planKey]||{};for(const [k,id]of Object.entries(planFields))$(id).value=plan[k]||'';planStatus()}
 async function persistPlan(){clearTimeout(planTimer);planTimer=null;if(!ready)return;const ok=await commit();$('planState').textContent=ok?'Plan saved · cloud sync follows':'Could not save — keep this page open';}
 planner.addEventListener('input',()=>{
  if(!ready||!/^\d{4}-\d{2}-\d{2}\|/.test(planKey))return;
  settings.dailyPlans={...(settings.dailyPlans||{}),[planKey]:Object.fromEntries(Object.entries(planFields).map(([k,id])=>[k,$(id).value]))};
  $('planState').textContent='Saving plan…';$('attachPlan').disabled=false;clearTimeout(planTimer);planTimer=setTimeout(persistPlan,450);
 });
 planner.addEventListener('focusout',()=>{if(planTimer)persistPlan()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&planTimer)persistPlan()});
 window.addEventListener('beforeunload',event=>{if(planTimer){event.preventDefault();event.returnValue='';}});
 $('attachPlan').onclick=()=>{
  const plan=settings.dailyPlans?.[currentKey()];if(!plan)return toast('Write a daily plan first.');
  if(['premarket','gapLow','gapHigh','willingness'].some(k=>$(k).value)&&!confirm('Replace this trade’s premarket and gap notes with the saved daily plan?'))return;
  $('premarket').value=[plan.premarket,plan.levels?'Key levels & risk boundaries:\n'+plan.levels:''].filter(Boolean).join('\n\n');
  for(const k of ['gapLow','gapHigh','willingness'])$(k).value=plan[k]||'';
  $('planKey').value=currentKey();$('planSnapshot').value=JSON.stringify(plan);planStatus();scheduleDraft();toast('Plan attached. Checklist confirmations stay yours to make.');
 };
 $('exportPlans').onclick=()=>{const keys=['date','instrument',...Object.keys(planFields)];const rows=Object.entries(settings.dailyPlans||{}).map(([key,p])=>[...key.split('|'),...Object.keys(planFields).map(k=>p[k])]);download('tradebook-daily-plans.csv','\ufeff'+[keys,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8')};
 const fav=document.createElement('details');fav.className='instrument-preferences';fav.innerHTML='<summary>Favourite instruments</summary><div class="favorite-options">'+Object.keys(TradeMath.instruments).map(k=>`<label><input type="checkbox" value="${k}">${k}</label>`).join('')+'</div><p class="hint">Your favourites appear first. New entries remember your last instrument.</p>';
 document.querySelector('.settings').append(fav);
 function refreshFavorites(){const selected=instrument.value||'MNQ',favorites=settings.favorites||['MNQ','MES'];instrument.replaceChildren();for(const [label,keys]of [['Favourites',favorites],['All instruments',Object.keys(TradeMath.instruments).filter(k=>!favorites.includes(k))]]){if(!keys.length)continue;const group=document.createElement('optgroup');group.label=label;keys.forEach(k=>{const option=document.createElement('option');option.value=k;option.textContent=k;group.append(option)});instrument.append(group)}instrument.value=selected;fav.querySelectorAll('input').forEach(x=>x.checked=favorites.includes(x.value));}
 fav.onchange=async()=>{settings.favorites=[...fav.querySelectorAll('input:checked')].map(x=>x.value);refreshFavorites();await commit()};
 window.syncInstrument=()=>{
  refreshFavorites();const symbol=instrument.value||'MNQ',spec=TradeMath.instruments[symbol];
  for(const id of ['entry','stop','target','exit','gapLow','gapHigh']){$(id).step=spec.tick;$(id).placeholder='Price in '+symbol;if(['CL','MCL'].includes(symbol))$(id).removeAttribute('min');else $(id).min=spec.tick;}
  $('instrumentHint').textContent=`${spec.name} · ${spec.tick} per tick · ${money(spec.value)} / tick / contract`;
  document.querySelector('.contract').innerHTML=`<div class="contract-top"><span>${symbol}</span><span>FUTURES · USD</span></div><h3>${spec.name}</h3><div><span>Minimum tick</span><b>${spec.tick}</b></div><div><span>Value per tick / contract</span><b>${money(spec.value)}</b></div><div><span>Value per price unit / contract</span><b>${money(spec.value/spec.tick)}</b></div><p>P&L = price movement ÷ ${spec.tick} × ${money(spec.value)} × contracts. Fees reduce the net result.</p><a target="_blank" rel="noopener" href="https://www.cmegroup.com/${sourceLinks[symbol]}.contractSpecs.html">CME contract specifications ↗</a>`;
  setEntryMode(settings.entryMode||'quick');loadPlan();
 };
 instrument.addEventListener('change',()=>{settings.lastInstrument=instrument.value;$('planKey').value='';$('planSnapshot').value='';syncInstrument();snapshot();scheduleDraft();toast('Instrument changed. Review your prices and contract size.');});
 window.refreshPlanContext=()=>{if(planKey!==currentKey())loadPlan()};
 $('tradeDate').addEventListener('change',()=>{$('planKey').value='';$('planSnapshot').value='';loadPlan();});
 // Data can arrive after the initial DOM setup or from another device.
 const oldFill=fillSettings;fillSettings=()=>{oldFill();if(window.syncInstrument)syncInstrument()};
 const oldRender=render;render=()=>{oldRender();if(planKey!==currentKey())loadPlan()};
 const comparison=document.createElement('details');comparison.className='panel settings instrument-comparison';comparison.innerHTML='<summary>Explore performance by instrument</summary><p class="hint">Compare expectancy in R alongside dollars. Uses the selected dashboard period and instrument filter.</p><div id="instrumentReport"></div>';$('dashboard').append(comparison);
 window.renderInstruments=list=>{$('instrumentReport').innerHTML=reportTable(['Instrument','Closed trades','Net P&L','Win rate','Expectancy'],TradeMath.group(list,TradeMath.symbol).map(g=>[esc(g.name),g.closed,money(g.net),pct(g.winRate),rFmt(g.expectancy)]))};
 syncInstrument();
})();
