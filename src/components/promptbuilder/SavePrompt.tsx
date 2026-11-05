import { useState } from 'react';
import { Save, X } from 'lucide-react';
export default function SavePrompt({save}:{save:(name:string)=>boolean}) {
 const [open,setOpen]=useState(false);
 const [name,setName]=useState('');
 return open?<form className="save-prompt-form" onSubmit={e=>{e.preventDefault();if(name.trim()&&save(name.trim())){setOpen(false);setName('')}}}><input aria-label="Prompt name" value={name} maxLength={80} placeholder="Prompt name" autoFocus required onChange={e=>setName(e.target.value)}/><div><button type="submit" className="primary" disabled={!name.trim()}><Save size={13}/>Save</button><button type="button" className="icon-button" aria-label="Cancel save prompt" onClick={()=>setOpen(false)}><X size={15}/></button></div></form>:<button className="secondary full save-prompt-button" onClick={()=>setOpen(true)}><Save size={14}/>Save Prompt</button>;
}
