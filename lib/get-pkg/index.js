const fs=require("fs"),path=require("path"),{promisify:promisify}=require("util"),fsStat=promisify(fs.stat),fsLStat=promisify(fs.lstat),pAccess=promisify(fs.access),stop=Symbol("findUp.stop"),typeMappings={directory:"isDirectory",file:"isFile"};function checkType({type:t}){if(!(t in typeMappings))throw new Error(`Invalid type specified: ${t}`)}const matchType=(t,e)=>void 0===t||e[typeMappings[t]](),pTry=(t,...e)=>new Promise(r=>{r(t(...e))}),pLimit=t=>{if(!Number.isInteger(t)&&t!==1/0||!(t>0))return Promise.reject(new TypeError("Expected `concurrency` to be a number from 1 and up"));const e=[];let r=0;const s=()=>{r--,e.length>0&&e.shift()()},n=(t,e,...n)=>{r++;const c=pTry(t,...n);e(c),c.then(s,s)},c=(s,...c)=>new Promise(i=>((s,c,...i)=>{r<t?n(s,c,...i):e.push(n.bind(null,s,c,...i))})(s,i,...c));return Object.defineProperties(c,{activeCount:{get:()=>r},pendingCount:{get:()=>e.length}}),c};class EndError extends Error{constructor(t){super(),this.value=t}}const testElement=async(t,e)=>e(await t),finder=async t=>{const e=await Promise.all(t);if(!0===e[1])throw new EndError(e[0]);return!1},pLocate=async(t,e,r)=>{r={concurrency:1/0,preserveOrder:!0,...r};const s=pLimit(r.concurrency),n=[...t].map(t=>[t,s(testElement,t,e)]),c=pLimit(r.preserveOrder?1:1/0);try{await Promise.all(n.map(t=>c(finder,t)))}catch(t){if(t instanceof EndError)return t.value;throw t}},locatePath=async(t,e)=>{checkType(e={cwd:process.cwd(),type:"file",allowSymlinks:!0,...e});const r=e.allowSymlinks?fsStat:fsLStat;return pLocate(t,async t=>{try{const s=await r(path.resolve(e.cwd,t));return matchType(e.type,s)}catch(t){return!1}},e)},pathExists=async t=>{try{return await pAccess(t),!0}catch(t){return!1}},findUp=async(t,e={})=>{let r=path.resolve(e.cwd||"");const{root:s}=path.parse(r),n=[].concat(t),c=async e=>{if("function"!=typeof t)return locatePath(n,e);const r=await t(e.cwd);return"string"==typeof r?locatePath([r],e):r};for(;;){const t=await c({...e,cwd:r});if(t===stop)return;if(t)return path.resolve(r,t);if(r===s)return;r=path.dirname(r)}};pathExists.exists=pathExists;

const getPkg=async({cwd:t}={})=>findUp("package.json",{cwd:t});

// example: 
// (async()=>{console.log(await getPkg())})();

export {getPkg};