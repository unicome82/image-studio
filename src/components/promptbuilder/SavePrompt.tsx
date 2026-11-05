import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
export default function SavePrompt({save}:{save:(name:string)=>boolean}) {
 const [open,setOpen]=useState(false);
 const [name,setName]=useState('');
 const ref=useRef<HTMLDivElement>(null);
 const button=useRef<HTMLButtonElement>(null);
 function close(){setOpen(false);button.current?.focus()}
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!ref.current?.contains(event.target as Node))setOpen(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[open]);
 return <div className="save-prompt-control" ref={ref}><button ref={button} className="secondary save-prompt-button" aria-expanded={open} onClick={()=>setOpen(!open)}>Save</button>{open&&<form className="save-prompt-form" aria-label="Save style" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}}} onSubmit={e=>{e.preventDefault();if(name.trim()&&save(name.trim())){close();setName('')}}}><label>Style name<input aria-label="Style name" value={name} maxLength={80} placeholder="Style name" autoFocus required onChange={e=>setName(e.target.value)}/></label><div><button type="submit" className="primary" disabled={!name.trim()}>Save</button><button type="button" className="icon-button" aria-label="Cancel save style" onClick={close}><X size={15}/></button></div></form>}</div>;
}
