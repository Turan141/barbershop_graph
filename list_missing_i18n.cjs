const fs = require('fs');
const path = require('path');

function walk(dir){
  let out=[];
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name);
    const st=fs.statSync(p);
    if(st.isDirectory()) out=out.concat(walk(p));
    else if(/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

function flatten(obj,prefix='',out={}){
  if(obj&&typeof obj==='object'&&!Array.isArray(obj)){
    for(const [k,v] of Object.entries(obj)){
      const kk=prefix?prefix+'.'+k:k;
      if(v&&typeof v==='object'&&!Array.isArray(v)) flatten(v,kk,out);
      else out[kk]=v;
    }
  }
  return out;
}

const files = walk('src');
const re = /\bt\(\s*['\"]([^'\"]+)['\"]/g;
const used = new Set();
for(const f of files){
  const t=fs.readFileSync(f,'utf8');
  let m;
  while((m=re.exec(t))) used.add(m[1]);
}

const en = flatten(JSON.parse(fs.readFileSync('src/i18n/locales/en.json','utf8')));
const ru = flatten(JSON.parse(fs.readFileSync('src/i18n/locales/ru.json','utf8')));
const az = flatten(JSON.parse(fs.readFileSync('src/i18n/locales/az.json','utf8')));

const missingRu=[];
const missingAz=[];
for(const k of used){
  if(ru[k]===undefined) missingRu.push(k);
  if(az[k]===undefined) missingAz.push(k);
}

console.log('used', used.size);
console.log('ru missing', missingRu.length);
console.log(missingRu.sort().join('\n'));
console.log('az missing', missingAz.length);
console.log(missingAz.sort().join('\n'));
