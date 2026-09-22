export const terms=[
 {match:/\bNAR\b/i,name:'NAR · New Appalachian Railroad',text:'98 NAR Regional is the name of a derailed-train location, not a level requirement or map coordinate. NAR identifies the New Appalachian Railroad.',url:'https://fallout.fandom.com/wiki/98_NAR_Regional'},
 {match:/\bPA\b|power armor/i,name:'PA · Power armor',text:'PA is the atlas marker abbreviation for power armor. These pins identify potential armor spawn positions, not guaranteed complete sets.'},
 {match:/C\.?A\.?M\.?P\.?/i,name:'C.A.M.P.',text:'The game’s player-built camp system. Here it is a suggested personal tag; it does not certify that building is allowed at that point.'}
];
export function termsFor(record){return terms.filter(t=>t.match.test([record.name,record.area,record.category].join(' ')));}
