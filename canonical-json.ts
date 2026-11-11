// Keep the established canonical byte format without building one enormous
// UTF-16 string. Only one field and the final UTF-8 buffer are allocated at once.
function visit(value:unknown,write:(part:string)=>void,arrayItem=false):void{
 if(Array.isArray(value)){
  write('[');for(let i=0;i<value.length;i++){if(i)write(',');visit(value[i],write,true);}write(']');return;
 }
 if(value&&typeof value==='object'){
  write('{');const keys=Object.keys(value).sort();
  keys.forEach((key,i)=>{if(i)write(',');write(JSON.stringify(key));write(':');visit((value as Record<string,unknown>)[key],write);});write('}');return;
 }
 const part=JSON.stringify(value);if(part!==undefined)write(part);else if(!arrayItem)write('undefined');
}
export function canonicalBytes(value:unknown):Uint8Array{
 const encoder=new TextEncoder();let size=0;
 visit(value,part=>{size+=/[^\x00-\x7f]/.test(part)?encoder.encode(part).length:part.length;});
 const bytes=new Uint8Array(size);let offset=0;
 visit(value,part=>{
  if(part.length===1&&part.charCodeAt(0)<128){bytes[offset++]=part.charCodeAt(0);return;}
  if(typeof encoder.encodeInto==='function'){
   const result=encoder.encodeInto(part,bytes.subarray(offset));
   if(result.read!==part.length)throw Error('Canonical content encoding was incomplete.');
   offset+=result.written;
  }else{const encoded=encoder.encode(part);bytes.set(encoded,offset);offset+=encoded.length;}
 });
 if(offset!==size)throw Error('Canonical content encoding size did not match.');
 return bytes;
}
