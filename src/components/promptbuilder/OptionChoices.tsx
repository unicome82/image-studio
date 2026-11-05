import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
interface Choice { id: string; label: string }
interface Props { title: string; options: Choice[]; selected: string[]; choose: (id:string)=>void; disabled?: boolean }
export default function OptionChoices({title,options,selected,choose,disabled=false}:Props) {
 const rowId=useId();
 const [expanded,setExpanded]=useState(false);
 const [count,setCount]=useState(options.length);
 const row=useRef<HTMLDivElement>(null);
 const measures=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const measure=()=>{
   if(!row.current||!measures.current)return;
   const width=row.current.clientWidth;
   const gap=parseFloat(getComputedStyle(row.current).columnGap)||0;
   const widths=Array.from(measures.current.querySelectorAll<HTMLElement>('[data-choice]')).map(el=>el.getBoundingClientRect().width);
   if(widths.reduce((total,value)=>total+value,0)+Math.max(0,widths.length-1)*gap<=width){setCount(widths.length);return}
   let used=0,fit=0;
   for(const value of widths){const next=used+(fit?gap:0)+value;if(next>width)break;used=next;fit++}
   setCount(fit);
  };
  measure();
  const observer=new ResizeObserver(measure);
  if(row.current)observer.observe(row.current);
  let active=true;
  document.fonts.ready.then(()=>{if(active)measure()});
  return()=>{active=false;observer.disconnect()};
 },[options]);
 const overflow=count<options.length;
 return <><h3 className="option-heading" aria-label={title}>{title}{overflow&&<button className="option-expand" aria-label={`${expanded?'Collapse':'Expand'} ${title} options`} aria-expanded={expanded} aria-controls={rowId} onClick={()=>setExpanded(!expanded)}>{expanded?<Minus size={12} aria-hidden="true"/>:<Plus size={12} aria-hidden="true"/>}</button>}</h3><div className="option-choices" title={disabled?'Enter Text: followed by your lettering in Your direction to use Typography.':undefined}><div id={rowId} className={'pills choice-row '+(expanded?'expanded':'collapsed')} ref={row}>{(expanded?options:options.slice(0,count)).map(option=><button className="option-choice" key={option.id} aria-pressed={selected.includes(option.id)} disabled={disabled} onClick={()=>choose(option.id)}>{option.label}</button>)}</div><div className="option-measurements" aria-hidden="true"><div className="pills" ref={measures}>{options.map(option=><span className="option-choice" data-choice key={option.id}>{option.label}</span>)}</div></div></div></>;
}
