import { useState } from 'react';
import { X, Check, Pencil, Trash2, Copy, List } from 'lucide-react';
import type { StylePreset } from '../../utils/presets';
import { makePrompt, type Option } from '../../utils/promptBuilder';
interface Props { presets: StylePreset[]; catalog: Option[]; rename: (id: string, name: string) => boolean; remove: (id: string) => void; copy: (prompt: string) => void }
export default function Presets(p: Props) {
 const [editing,setEditing]=useState<string|null>(null);
 const [editName,setEditName]=useState('');
 const [deleting,setDeleting]=useState<string|null>(null);
 return <section className="presets-page" aria-label="Saved style sets"><div className="section-heading"><h2>Prompts<span>{p.presets.length}</span></h2></div><div className="preset-list">{p.presets.length===0?<div className="preset-empty"><List size={22} aria-hidden="true"/><p>No saved style sets</p></div>:p.presets.map(preset=>{
  // Rebuild from saved settings and the canonical catalog; never duplicate prompt bodies in storage.
  const prompt=makePrompt(p.catalog,preset.selection,preset.complexity,preset.fields,preset.photo);
  return <article className="preset-item" key={preset.id} aria-label={preset.name}>
   {editing===preset.id?<form className="preset-rename" onSubmit={e=>{e.preventDefault();if(editName.trim()&&p.rename(preset.id,editName.trim()))setEditing(null)}}><input aria-label="Rename style set" maxLength={80} value={editName} onChange={e=>setEditName(e.target.value)} autoFocus required/><button className="icon-button" aria-label="Confirm rename" type="submit"><Check size={16} aria-hidden="true"/></button><button className="icon-button" aria-label="Cancel rename" type="button" onClick={()=>setEditing(null)}><X size={16} aria-hidden="true"/></button></form>:<div className="preset-item-heading"><div className="preset-name"><h3>{preset.name}</h3><button className="icon-button" aria-label={`Edit ${preset.name} name`} onClick={()=>{setEditing(preset.id);setEditName(preset.name)}}><Pencil size={13} aria-hidden="true"/></button></div><button className="icon-button" aria-label={`Delete ${preset.name}`} onClick={()=>setDeleting(preset.id)}><Trash2 size={13} aria-hidden="true"/></button></div>}
   <p className="preset-prompt" aria-label={`${preset.name} prompt`}>{prompt}</p>
   {deleting===preset.id?<div className="preset-confirm"><span>Delete this style set?</span><button className="secondary" onClick={()=>setDeleting(null)}>Cancel</button><button className="primary" onClick={()=>{p.remove(preset.id);setDeleting(null)}}>Delete</button></div>:<div className="preset-item-actions"><button className="primary" aria-label={`Copy ${preset.name} prompt`} onClick={()=>p.copy(prompt)}><Copy size={14} aria-hidden="true"/>Copy</button></div>}
  </article>;
 })}</div></section>;
}
