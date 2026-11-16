export type SearchRecord={id:string;query:string;category:string|null;created_at:string};
export const HISTORY_CATEGORIES=['Food','Stays','Beaches','Parks','Attractions','Shopping','Fun'];
export function searchRecord(query:string,category?:string){return {query:query.trim().slice(0,200),category:category&&HISTORY_CATEGORIES.includes(category)?category:null}}
export function preferences(rows:SearchRecord[]){const counts=new Map<string,number>();for(const row of rows)if(row.category&&HISTORY_CATEGORIES.includes(row.category))counts.set(row.category,(counts.get(row.category)||0)+1);return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([category,count])=>({category,count}))}
