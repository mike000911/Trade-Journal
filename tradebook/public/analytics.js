/* Pure calculation functions; no storage or UI dependencies. */
const TradeMath = (() => {
  const instruments=Object.freeze({
    MNQ:{name:'Micro E-mini Nasdaq-100',tick:.25,value:.5},
    NQ:{name:'E-mini Nasdaq-100',tick:.25,value:5},
    MES:{name:'Micro E-mini S&P 500',tick:.25,value:1.25},
    ES:{name:'E-mini S&P 500',tick:.25,value:12.5},
    YM:{name:'E-mini Dow',tick:1,value:5},
    GC:{name:'Gold',tick:.1,value:10},
    MGC:{name:'Micro Gold',tick:.1,value:1},
    CL:{name:'WTI Crude Oil',tick:.01,value:10},
    MCL:{name:'Micro WTI Crude Oil',tick:.01,value:1}
  });
  const symbol=t=>t.instrument||'MNQ';
  function specification(t){const spec=instruments[symbol(t)];if(!spec)throw Error('Unsupported instrument');return spec;}
  function validPrice(value,t){const spec=specification(t);return Number.isFinite(value)&&(value>0||['CL','MCL'].includes(symbol(t)))&&Math.abs(value/spec.tick-Math.round(value/spec.tick))<1e-7;}
  const round=n=>Math.round((n+Number.EPSILON)*100)/100;
  function duration(t){
    if(t.status!=='closed')return null;
    const start=Date.parse(t.entryISO||t.entryTime||''),end=Date.parse(t.exitISO||t.exitTime||'');
    return Number.isFinite(start)&&Number.isFinite(end)&&end>=start?(end-start)/60000:null;
  }
  const durationBand=t=>{const n=duration(t);return n===null?'Unknown':n<5?'Under 5 min':n<15?'5–15 min':n<30?'15–30 min':n<60?'30–60 min':'60+ min'};
  function result(t){
    const sign=t.direction==='short'?-1:1, spec=specification(t), point=spec.value/spec.tick;
    const risk=(Number(t.entry)-Number(t.stop))*sign*point*Number(t.contracts);
    const reward=(Number(t.target)-Number(t.entry))*sign*point*Number(t.contracts);
    const closed=t.status==='closed';
    const ticks=closed?(Number(t.exit)-Number(t.entry))*sign/spec.tick:null;
    const gross=closed?round(ticks*spec.value*Number(t.contracts)):null;
    const net=closed?round(gross-Number(t.fees||0)):null;
    return{risk:round(risk),reward:round(reward),ticks,gross,net,durationMinutes:duration(t),r:closed&&risk>0?net/risk:null,outcome:t.status==='draft'?'Draft':!closed?'Open':net>0?'Win':net<0?'Loss':'Breakeven'};
  }
  function adherent(t){const checks=Object.values(t.checks||{});return checks.length===7&&checks.some(x=>x==='done')&&checks.every(x=>x==='done'||x==='na')&&t.allRules==='yes'}
  const when=(t,kind='entry')=>Date.parse(t[kind+'ISO']||t[kind+'Time']||'')||0;
  function summary(records,balance=null,prior=0){
    const executed=records.filter(t=>t.status!=='draft'),closed=executed.filter(t=>t.status==='closed').sort((a,b)=>when(a,'exit')-when(b,'exit')||a.id.localeCompare(b.id));
    const rs=closed.map(result),wins=rs.filter(r=>r.net>0),losses=rs.filter(r=>r.net<0),grossProfit=rs.reduce((a,r)=>a+Math.max(0,r.gross),0),grossLoss=rs.reduce((a,r)=>a-Math.min(0,r.gross),0);
    const validR=rs.filter(r=>Number.isFinite(r.r));let equity=(balance||0)+prior,peak=equity,maxDD=0,maxDDPct=0,pctValid=balance>0,curve=[equity];
    for(const r of rs){equity+=r.net;peak=Math.max(peak,equity);maxDD=Math.max(maxDD,peak-equity);if(pctValid&&peak>0)maxDDPct=Math.max(maxDDPct,(peak-equity)/peak*100);else if(peak<=0)pctValid=false;curve.push(equity)}
    const avgWin=wins.length?wins.reduce((a,r)=>a+r.net,0)/wins.length:null,avgLoss=losses.length?-losses.reduce((a,r)=>a+r.net,0)/losses.length:null;
    const timed=rs.filter(r=>r.durationMinutes!==null),avgDurationOf=rows=>rows.length?rows.reduce((sum,r)=>sum+r.durationMinutes,0)/rows.length:null;
    return{avgDuration:avgDurationOf(timed),avgWinDuration:avgDurationOf(timed.filter(r=>r.net>0)),avgLossDuration:avgDurationOf(timed.filter(r=>r.net<0)),timedCount:timed.length,executed:executed.length,closed:closed.length,open:executed.length-closed.length,wins:wins.length,losses:losses.length,net:rs.reduce((a,r)=>a+r.net,0),winRate:closed.length?wins.length/closed.length*100:null,expectancy:validR.length?validR.reduce((a,r)=>a+r.r,0)/validR.length:null,rCount:validR.length,pf:grossLoss?grossProfit/grossLoss:grossProfit?Infinity:null,avgWin,avgLoss,payoff:avgWin!==null&&avgLoss?avgWin/avgLoss:null,maxDD,maxDDPct:pctValid?maxDDPct:null,adherence:executed.length?executed.filter(adherent).length/executed.length*100:null,unassessed:executed.filter(t=>!t.allRules||Object.values(t.checks||{}).length!==7||Object.values(t.checks||{}).includes('pending')).length,curve};
  }
  function group(records,key){const groups=new Map();for(const t of records){if(t.status==='draft')continue;const k=key(t)||'Unspecified';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(t)}return [...groups.entries()].map(([name,rows])=>({name,...summary(rows)}))}
  return{instruments,symbol,specification,validPrice,result,summary,adherent,when,group,duration,durationBand};
})();
if(typeof module!=='undefined')module.exports=TradeMath;
