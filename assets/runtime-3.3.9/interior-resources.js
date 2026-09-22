export const RESOURCE_CATEGORIES=['bobblehead','magazine','caps','armor','fusion','lunchbox','cooler'];
export function displayedRecords(records,spaces,entrances,{space,overworld=true,interiors=true}) {
 return records.flatMap(record=>{
  const interior=!spaces[record.space]?.world;
  if(interior&&!interiors||!interior&&!overworld)return [];
  const entrance=entrances[record.space];
  if(space==='2480661'&&interior&&entrance&&RESOURCE_CATEGORIES.includes(record.category))
   return [{...record,space:'2480661',x:entrance.x,y:entrance.y,z:entrance.z,interiorProxy:true,interiorSpace:record.space,entrance}];
  return [record];
 });
}
