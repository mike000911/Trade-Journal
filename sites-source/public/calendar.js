/* Calendar-led entry and duration analysis. Dates are shown in device local time. */
(() => {
const localDay=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=()=>localDay(new Date());
let selectedDay=today(),month=new Date(new Date().getFullYear(),new Date().getMonth(),1);
const dateTitle=day=>new Date(day+'T12:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
window.durationLabel=n=>n===null||!Number.isFinite(n)?'—':n<1?(n===0?'0 min':'<1 min'):n<60?`${Math.round(n*10)/10} min`:`${Math.floor(n/60)}h ${Math.round(n%60)}m`;
const addDays=(day,offset)=>{const date=new Date(day+'T12:00');date.setDate(date.getDate()+offset);return Number.isFinite(+date)?localDay(date):''};
window.composeTradeTimes=()=>{
  const day=$('tradeDate').value,entry=$('entryClock').value,exit=$('exitClock').value;
  $('entryTime').value=day&&entry?day+'T'+entry:'';
  const exitDate=$('exitDay').value==='next'?addDays(day,1):$('exitDay').value==='custom'?$('exitDate').value:day;
  $('exitTime').value=exitDate&&exit?exitDate+'T'+exit:'';
  $('exitDateLabel').hidden=$('exitDay').value!=='custom';
  $('exitDate').required=$('status').value==='closed'&&$('exitDay').value==='custom';
  $('durationHint').textContent=day&&entry&&exit&&$('exitTime').value<$('entryTime').value?'Exit is before entry. Choose Next day for an overnight trade.':'Times use your device timezone. Choose Next day for an overnight trade.';
};
window.syncTimeControls=()=>{
  const entry=$('entryTime').value,exit=$('exitTime').value;
  $('tradeDate').value=entry.slice(0,10)||$('tradeDate').value||selectedDay;
  $('entryClock').value=entry.slice(11,16);$('exitClock').value=exit.slice(11,16);
  const day=$('tradeDate').value,exitDate=exit.slice(0,10);
  $('exitDay').value=!exitDate||exitDate===day?'same':exitDate===addDays(day,1)?'next':'custom';
  $('exitDate').value=exitDate||day;
  window.composeTradeTimes();
};
const calendar=document.createElement('section');calendar.className='calendar-section';calendar.setAttribute('aria-label','Trading calendar');
calendar.innerHTML=`<div class="calendar-intro"><div><span class="eyebrow">YOUR DAILY RECORD</span><h2>A date. A plan. A lesson.</h2></div><span class="calendar-zone">Calendar · ${esc(Intl.DateTimeFormat().resolvedOptions().timeZone)}</span></div><div class="calendar-layout"><section class="panel calendar-panel"><div class="calendar-toolbar"><div><h3 id="calendarMonth"></h3><span id="monthSummary"></span></div><div class="month-controls"><button id="previousMonth" aria-label="Previous month">‹</button><button id="calendarToday">Today</button><button id="nextMonth" aria-label="Next month">›</button><label class="month-jump">Jump to month<input type="month" id="calendarJump" aria-label="Jump to month"></label></div></div><div class="calendar-weekdays" aria-hidden="true">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span>${d}</span>`).join('')}</div><div id="calendarDays" class="calendar-days" aria-label="Select a journal date"></div><div class="calendar-legend"><span><i class="profit-dot"></i>Positive net</span><span><i class="loss-dot"></i>Negative net</span><span>Entry date · net realized P&L · drafts excluded from count</span></div></section><section class="panel selected-day"><div class="day-heading"><span class="eyebrow">SELECTED DAY</span><h3 id="selectedDateTitle"></h3><p id="selectedDaySummary"></p></div><button class="primary" id="addCalendarTrade"><span aria-hidden="true">＋</span> Add journal entry</button><div id="dayTrades" class="day-trades"></div></section></div></section>`;
const dashboard=$('dashboard');dashboard.insertBefore(calendar,dashboard.querySelector('.analytics-grid'));
const durations=document.createElement('section');durations.className='panel duration-panel';durations.innerHTML=`<div class="panelhead"><div><h2>Time in the market</h2><span class="badge">DURATION × WIN RATE</span></div><span class="duration-period">Uses dashboard period</span></div><div class="duration-content"><div class="duration-kpis"><article><span>AVG TRADE DURATION</span><strong id="averageDuration">—</strong><small id="durationSample">No closed trades yet</small></article><article><span>WINNING TRADES</span><strong id="winDuration">—</strong><small>Average duration · net winners</small></article><article><span>LOSING TRADES</span><strong id="lossDuration">—</strong><small>Average duration · net losers</small></article></div><div id="durationReport"></div><p class="hint">Closed trades with valid entry and exit times only. Win rate uses net P&L and includes breakeven trades in the denominator. Bands include the lower limit and exclude the upper limit. Small samples are descriptive, not evidence of an edge.</p></div>`;
calendar.after(durations);
function recordDay(t){const date=new Date(t.entryISO||t.entryTime||(t.tradeDate?t.tradeDate+'T12:00':''));return Number.isFinite(+date)?localDay(date):''}
window.renderCalendar=()=>{
 const year=month.getFullYear(),mon=month.getMonth(),prefix=localDay(month).slice(0,7),byDay=new Map();
 for(const t of trades){const day=recordDay(t);if(day){if(!byDay.has(day))byDay.set(day,[]);byDay.get(day).push(t)}}
 const monthly=trades.filter(t=>recordDay(t).startsWith(prefix)),m=TradeMath.summary(monthly);
 $('calendarMonth').textContent=month.toLocaleDateString(undefined,{month:'long',year:'numeric'});$('calendarJump').value=prefix;
 $('monthSummary').textContent=`${m.executed} trades · ${m.closed} closed · ${money(m.net)} net`;
 const first=(new Date(year,mon,1).getDay()+6)%7,count=new Date(year,mon+1,0).getDate(),cells=[];
 for(let i=0;i<first;i++)cells.push('<span class="calendar-spacer" aria-hidden="true"></span>');
 for(let day=1;day<=count;day++){
  const key=localDay(new Date(year,mon,day)),items=byDay.get(key)||[],m=TradeMath.summary(items),cls=m.closed?(m.net>0?'day-profit':m.net<0?'day-loss':'day-flat'):'';
  const drafts=items.filter(t=>t.status==='draft').length;
  cells.push(`<button type="button" class="calendar-day ${cls} ${key===selectedDay?'selected':''} ${key===today()?'is-today':''}" data-date="${key}" aria-pressed="${key===selectedDay}" ${key===today()?'aria-current="date"':''} title="${m.executed} trades taken · ${esc(money(m.net))} realized net P&L${drafts?' · '+drafts+' drafts':''}" aria-label="${esc(dateTitle(key))}, ${m.executed} trades taken, ${esc(money(m.net))} realized net P&L${drafts?', '+drafts+' drafts':''}"><span class="day-number">${day}${drafts?'<i class="draft-dot" aria-hidden="true"></i>':''}</span><b class="day-pnl">${esc(money(m.net))}</b><small class="day-count">${m.executed} ${m.executed===1?'trade':'trades'}</small></button>`);
 }
 $('calendarDays').innerHTML=cells.join('');
 const dayTrades=(byDay.get(selectedDay)||[]).sort((a,b)=>TradeMath.when(a)-TradeMath.when(b)),stats=TradeMath.summary(dayTrades);
 $('selectedDateTitle').textContent=dateTitle(selectedDay);$('selectedDaySummary').innerHTML=`<span class="day-total"><small>TRADES TAKEN</small><b>${stats.executed}</b></span><span class="day-total"><small>DAILY NET P&L</small><b class="${stats.net>0?'positive':stats.net<0?'negative':''}">${money(stats.net)}</b></span><span class="day-detail">${stats.closed} closed · ${stats.open} open · ${dayTrades.length-stats.executed} drafts · ${pct(stats.winRate)} win rate</span>`;
 $('dayTrades').innerHTML=dayTrades.length?dayTrades.map(t=>{const r=result(t),time=new Date(t.entryISO||t.entryTime||'');return `<button class="day-trade" data-calendar-edit="${esc(t.id)}"><span><b>${esc(t.setup||'MNQ trade')}</b><small>${Number.isFinite(+time)?time.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}):'Time not set'} · ${esc(r.outcome)} · ${durationLabel(r.durationMinutes)}</small></span><strong class="${r.net===null?'':r.net>=0?'positive':'negative'}">${r.net===null?'Review ↗':money(r.net)}</strong></button>`}).join(''):'<div class="calendar-empty"><span aria-hidden="true">＋</span><h4>No entries for this day</h4><p>Add your thesis and trade details. The date is already taken care of.</p></div>';
};
window.renderDuration=(list,m)=>{
 $('averageDuration').textContent=durationLabel(m.avgDuration);$('winDuration').textContent=durationLabel(m.avgWinDuration);$('lossDuration').textContent=durationLabel(m.avgLossDuration);$('durationSample').textContent=`${m.timedCount} measured / ${m.closed} closed trades`;
 const timed=list.filter(t=>TradeMath.duration(t)!==null),groups=TradeMath.group(timed,TradeMath.durationBand),bands=['Under 5 min','5–15 min','15–30 min','30–60 min','60+ min'];
 $('durationReport').innerHTML=reportTable(['Time in trade','Closed','Win rate','Net P&L','Expectancy'],bands.map(name=>{const g=groups.find(x=>x.name===name);return [name,g?.closed||0,`<div class="duration-win"><span>${pct(g?.winRate??null)}</span><i><b style="width:${g?.winRate||0}%"></b></i></div>`,g?money(g.net):'—',rFmt(g?.expectancy??null)]}));
};
$('calendarDays').onclick=e=>{const button=e.target.closest('[data-date]');if(!button)return;selectedDay=button.dataset.date;renderCalendar();$('calendarDays').querySelector(`[data-date="${selectedDay}"]`).focus({preventScroll:true})};
$('previousMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);renderCalendar()};
$('nextMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);renderCalendar()};
$('calendarToday').onclick=()=>{selectedDay=today();month=new Date(new Date().getFullYear(),new Date().getMonth(),1);renderCalendar()};
$('calendarJump').onchange=e=>{if(/^\d{4}-\d{2}$/.test(e.target.value)){const [y,m]=e.target.value.split('-').map(Number);month=new Date(y,m-1,1);renderCalendar()}};
$('addCalendarTrade').onclick=async()=>{if(!ready){toast('Your journal is still loading. Please try again.');return}await $('newTrade').onclick();$('tradeDate').value=selectedDay;$('entryClock').value='';$('exitClock').value='';$('exitDay').value='same';$('exitDate').value=selectedDay;composeTradeTimes();scheduleDraft();$('reason').focus({preventScroll:true});$('tradeDate').scrollIntoView({behavior:'smooth',block:'center'})};
$('dayTrades').onclick=e=>{const button=e.target.closest('[data-calendar-edit]');if(button)editTrade(button.dataset.calendarEdit)};
syncTimeControls();renderCalendar();const {list,cutoff}=filtered();renderDuration(list,TradeMath.summary(list,settings.balance));
})();
