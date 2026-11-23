require('dotenv').config({ quiet: true });
require('ts-node/register');
const assert = require('node:assert/strict');
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { categoryNames } = require('../prisma/catalogs');
const baseline = JSON.parse(readFileSync('../specs/0047-usabilidad-y-recogida/evidence/baseline.json','utf8'));
const configured = require('dotenv').parse(readFileSync('../Frontend/.env')).EXPO_PUBLIC_API_URL;
(async()=>{
 const checks=[];
 for(const [source,origin] of [['runningLoopback','http://localhost:3000'],['frontendConfigured',configured]]) {
  assert(origin,'El origen de la app debe ser explícito');
  const response=await fetch(new URL('/categories',origin),{signal:AbortSignal.timeout(5000)});assert.equal(response.status,200);const categories=await response.json();
  assert.deepEqual(categories.map(c=>`${c.type}:${c.name}`).sort(),Object.entries(categoryNames).flatMap(([type,names])=>names.map(name=>`${type}:${name}`)).sort());
  for(const old of baseline.databaseCategories)assert.deepEqual(categories.find(c=>c.id===old.id),old);
  const arrangedResponse=await fetch(new URL('/publications?type=STATIC&pickupMode=ARRANGED',origin));assert.equal(arrangedResponse.status,200);const arranged=await arrangedResponse.json();assert(arranged.length>=1);assert(arranged.every(p=>p.zone_id===null&&p.pickup_mode==='ARRANGED'&&!p.sellerContact&&!('availability_announced_for' in p)));
  checks.push({source,http:response.status,categories:categories.length,byType:{LIVE:categories.filter(c=>c.type==='LIVE').length,STATIC:categories.filter(c=>c.type==='STATIC').length},originalCategoryIdsPreserved:true,arrangedVisible:arranged.length});
 }
 const result={date:new Date().toISOString(),result:'PASS',scope:'GET API real; no equivale a renderizado móvil',checks};writeFileSync(resolve('../specs/0047-usabilidad-y-recogida/evidence/running-api.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.message);process.exitCode=1});
