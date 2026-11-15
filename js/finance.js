const nonneg=x=>Math.max(0,Number(x)||0);
/**
 * Forward-looking financial assumptions. Not booked revenue or actual invoices.
 * 12-month model: assume opening sites are onboarded and billed for all 12 months;
 * incremental monthly signups begin at month 1 and are billed from that month.
 * Pilot conversions shown separately, not added to subscribed sites unless chosen by user.
 */
export function forecast(f){
  const count=Math.floor(nonneg(f.sites)),newPerMonth=nonneg(f.newSitesPerMonth),churn=Math.min(100,nonneg(f.churn))/100;
  const monthly=nonneg(f.monthly), setup=nonneg(f.setup),pilotFee=nonneg(f.pilotFee),pilots=nonneg(f.pilots);
  let active=count;const rows=[];
  for(let i=1;i<=12;i++){
    // Existing opening sites are present from month 1; additional signups join from month 2.
    const newSites=i===1?0:newPerMonth;
    active=Math.max(0,active*(1-churn)+newSites);
    const pilotCount=i===1?pilots:0;
    const setupRevenue=(i===1?count:newSites)*setup;
    const recurring=active*monthly;
    const pilotRevenue=pilotCount*pilotFee;
    const revenue=setupRevenue+recurring+pilotRevenue;
    const direct=nonneg(f.cloudMonthly)+active*nonneg(f.supportPerSite)+(i===1?count:newSites)*nonneg(f.implementationCostPerSite)+pilotCount*nonneg(f.pilotCost);
    const fixed=nonneg(f.fixedMonthly)+nonneg(f.salesMonthly);
    const costs=direct+fixed;
    rows.push({month:i,active,recurring,setupRevenue,pilotRevenue,revenue,direct,fixed,costs,grossProfit:revenue-direct,net:revenue-costs});
  }
  const sum=k=>rows.reduce((s,r)=>s+r[k],0);
  const revenue=sum('revenue'),grossProfit=sum('grossProfit'),net=sum('net'),direct=sum('direct'),costs=sum('costs');
  const mrr=rows[11].recurring,arr=mrr*12;
  const breakEven=rows.find(r=>r.net>=0)?.month??null;
  let cumulative=0;let cashBreakEven=null;
  for(const r of rows){cumulative+=r.net;if(cashBreakEven===null&&cumulative>=0)cashBreakEven=r.month;}
  return {rows,revenue,grossProfit,net,direct,costs,grossMargin:revenue?grossProfit/revenue*100:0,netMargin:revenue?net/revenue*100:0,mrr,arr,breakEven,cashBreakEven,yearEndSites:rows[11].active,recurringTotal:sum('recurring'),setupTotal:sum('setupRevenue'),pilotTotal:sum('pilotRevenue')};
}
export function directCostShare(f,siteCount){const count=Math.max(0,Number(siteCount)||0);const cloud=nonneg(f.cloudMonthly),support=count*nonneg(f.supportPerSite),fixed=nonneg(f.fixedMonthly),sales=nonneg(f.salesMonthly);const tot=cloud+support+fixed+sales||1;return [{label:'Cloud',value:cloud/tot*100,amount:cloud,css:'a'},{label:'Dukungan pelanggan',value:support/tot*100,amount:support,css:'b'},{label:'Operasional',value:fixed/tot*100,amount:fixed,css:'c'},{label:'Akuisisi',value:sales/tot*100,amount:sales,css:'d'}]}
