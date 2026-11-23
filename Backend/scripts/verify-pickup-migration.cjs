require('dotenv').config({ quiet: true });
const pg = require('pg');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { resolve } = require('node:path');
const apply = process.argv.includes('--apply-local');
const tables = ['users','zones','categories','publications','reservations','reports'];
async function snapshot(db) { const result={}; for(const table of tables) result[table]=(await db.query(`SELECT to_jsonb(t) row FROM "${table}" t ORDER BY id`)).rows.map(r=>r.row); return result; }
function preserved(before, after) {
  for(const table of tables) assert.deepEqual(after[table].map(row=>Object.fromEntries(Object.keys(before[table].find(old=>old.id===row.id)??{}).map(key=>[key,row[key]]))),before[table],`Datos originales alterados: ${table}`);
}
function docker(...args) { const r=spawnSync('docker',args,{encoding:'utf8',windowsHide:true,timeout:60000}); assert.equal(r.status,0,r.stderr); return r.stdout; }
function migrate(url) { const r=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{env:{...process.env,DATABASE_URL:url},encoding:'utf8',windowsHide:true,timeout:120000}); assert.equal(r.status,0,r.stdout+r.stderr); }
(async()=>{
 const url=new URL(process.env.DATABASE_URL); assert(['localhost','127.0.0.1'].includes(url.hostname),'Este ensayo Docker requiere PostgreSQL local');
 const dbname=decodeURIComponent(url.pathname.slice(1));
 const admin=new pg.Client({connectionString:url.href}); await admin.connect();
 const before=await snapshot(admin); const own=`tapcampus_pickup_${Date.now()}`; assert.match(own,/^tapcampus_pickup_\d+$/); assert.notEqual(own,dbname);
 const containerFile=`/tmp/${own}.dump`; const backups=resolve('.local/backups');mkdirSync(backups,{recursive:true}); const file=resolve(backups,`${own}.dump`);
 let clone;
 try {
  docker('exec','backend-postgres-1','sh','-c','pg_dump -U "$POSTGRES_USER" -Fc -d "$1" -f "$2"','--',dbname,containerFile);
  docker('cp',`backend-postgres-1:${containerFile}`,file);
  await admin.query(`CREATE DATABASE "${own}"`);
  docker('exec','backend-postgres-1','sh','-c','pg_restore -U "$POSTGRES_USER" --no-owner --no-privileges -d "$1" "$2"','--',own,containerFile);
  const cloneUrl=new URL(url);cloneUrl.pathname='/'+own;clone=new pg.Client({connectionString:cloneUrl.href});await clone.connect();
  assert.deepEqual(await snapshot(clone),before,'El respaldo restaurado debe reproducir los datos de origen');
  migrate(cloneUrl.href); const after=await snapshot(clone);preserved(before,after);
  assert(after.reservations.every(r=>(r.pickup_zone_id==null)===(r.pickup_zone_name==null)));
  const live=after.publications.find(p=>p.type==='LIVE');
  if(live){await assert.rejects(clone.query('UPDATE publications SET pickup_mode=$1,zone_id=NULL WHERE id=$2',['ARRANGED',live.id]),e=>e.code==='23514');}
  if(apply){migrate(url.href);preserved(before,await snapshot(admin));}
  const evidence={date:new Date().toISOString(),result:'PASS',mode:apply?'local-applied':'rehearsal',backup:{file,sha256:createHash('sha256').update(readFileSync(file)).digest('hex'),restored:true},dataPreserved:tables.map(table=>({table,rows:before[table].length})),legacySnapshotsNotInvented:true,liveArrangedRejectedByDatabase:true,rollback:'Conservar lectores compatibles; deshabilitar nuevas escrituras ARRANGED. No convertir zona a NOT NULL con datos ARRANGED.'};
  const dir=resolve('../specs/0047-usabilidad-y-recogida/evidence');mkdirSync(dir,{recursive:true});writeFileSync(resolve(dir,apply?'migration-local.json':'migration-rehearsal.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify({result:'PASS',mode:evidence.mode,restored:true,rowsPreserved:evidence.dataPreserved}));
 } finally {
  if(clone)await clone.end();await admin.query(`DROP DATABASE IF EXISTS "${own}"`);await admin.end();
  assert.equal(containerFile,`/tmp/${own}.dump`);docker('exec','backend-postgres-1','rm','-f',containerFile);
 }
})().catch(error=>{console.error(error.message);process.exitCode=1});
