/** Filter only observations explicitly extracted from user-uploaded PDFs. */
export function filterDocumentRecords(records, filters={}) {
  const norm=v=>String(v??'').trim().toLocaleLowerCase('id-ID');
  const out=(Array.isArray(records)?records:[]).filter(row=>{
    if(row?.source!=='uploaded_pdf')return false;
    if(filters.vehicle && ![row.vehicle,row.subcategory].some(v=>norm(v).includes(norm(filters.vehicle))))return false;
    if(filters.color && !norm(row.color).includes(norm(filters.color)))return false;
    if(filters.zone && !norm(row.zone).includes(norm(filters.zone)))return false;
    if(filters.date && !String(row.at||'').startsWith(filters.date))return false;
    const time=String(row.at||'').slice(11,16);
    if(filters.after && time<filters.after)return false;
    if(filters.before && time>filters.before)return false;
    return true;
  });
  return out.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
}
export function mapPointsFromDocuments(records){
  return (Array.isArray(records)?records:[]).filter(row=>row.source==='uploaded_pdf' && Number.isFinite(row.lat) && Number.isFinite(row.lon) && Math.abs(row.lat)<=90 && Math.abs(row.lon)<=180).map(row=>({lat:row.lat,lon:row.lon,kind:'pdf',id:row.id,zone:row.zone,at:row.at,vehicle:row.vehicle,color:row.color}));
}
