// Camhu Lab — máy chủ tài khoản & đồng bộ tiến độ (Vercel Function, không cần cài thư viện).
// Một địa chỉ duy nhất: /api/lab
//   GET                      → trạng thái máy chủ
//   POST {a:'register'|'login'|'pull'|'push'|'password', ...}
// Dữ liệu nằm trong Upstash Redis (gọi qua REST). Biến môi trường do Vercel tự thêm khi bạn nối database với project.
// Tùy chọn: INVITE_CODE (bắt buộc mã mời khi đăng ký), AUTH_SECRET (khóa ký phiên đăng nhập).
const crypto = require('crypto');

const VERSION = '3.0.0';
const N1_RE = /^(day([1-9]|[1-7]\d|8[0-4])m?|summarym?|known|lastDay)$/;      // tiến độ phần Ôn thi N1
const LP_RE = /^(profile|lp:[A-Za-z0-9_.-]{1,48})$/;                           // hồ sơ + tiến độ English / 日本語
const KEY_RE = {test: k => N1_RE.test(k) || LP_RE.test(k)};
const USER_RE = /^[a-z0-9_.-]{3,20}$/;
const TOKEN_DAYS = 60;

function conf(){
  const e = process.env;
  let url = e.KV_REST_API_URL || e.UPSTASH_REDIS_REST_URL, token = e.KV_REST_API_TOKEN || e.UPSTASH_REDIS_REST_TOKEN;
  if(!url || !token){                                   // tên biến có tiền tố tùy chỉnh (ví dụ MYDB_KV_REST_API_URL)
    for(const k of Object.keys(e)){
      if(!url && /(REST_API_URL|REDIS_REST_URL)$/.test(k)) url = e[k];
      if(!token && /(REST_API_TOKEN|REDIS_REST_TOKEN)$/.test(k) && !/READ_ONLY/.test(k)) token = e[k];
    }
  }
  return (url && token) ? {url: String(url).replace(/\/+$/,''), token: String(token)} : null;
}
async function redis(cmd){
  const c = conf();
  const r = await fetch(c.url, {method:'POST', headers:{Authorization:'Bearer '+c.token, 'Content-Type':'application/json'}, body:JSON.stringify(cmd)});
  let j = null; try{ j = await r.json(); }catch(e){}
  if(!r.ok || !j || j.error) throw new Error('redis '+cmd[0]+': '+((j && j.error) || r.status));
  return j.result;
}
function secret(){ return process.env.AUTH_SECRET || crypto.createHash('sha256').update('camhu-lab|'+conf().token).digest('hex'); }
function sign(payload){
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return body+'.'+crypto.createHmac('sha256', secret()).update(body).digest('base64url');
}
function verify(token){
  if(typeof token !== 'string') return null;
  const i = token.indexOf('.'); if(i < 1) return null;
  const body = token.slice(0,i), sig = Buffer.from(token.slice(i+1)), want = Buffer.from(crypto.createHmac('sha256', secret()).update(body).digest('base64url'));
  if(sig.length !== want.length || !crypto.timingSafeEqual(sig, want)) return null;
  try{ const p = JSON.parse(Buffer.from(body,'base64url').toString('utf8')); return (p && USER_RE.test(p.u||'') && p.exp > Date.now()) ? p : null; }catch(e){ return null; }
}
function hashPw(pw, salt){ return new Promise((ok, no)=>crypto.scrypt(String(pw), salt, 32, {N:16384, r:8, p:1}, (e,k)=>e ? no(e) : ok(k.toString('base64')))); }
async function checkPw(pw, rec){ const a = Buffer.from(await hashPw(pw, rec.salt)), b = Buffer.from(String(rec.hash)); return a.length === b.length && crypto.timingSafeEqual(a, b); }
function send(res, status, obj){ res.statusCode = status; res.setHeader('Content-Type','application/json; charset=utf-8'); res.setHeader('Cache-Control','no-store'); res.end(JSON.stringify(obj)); }
const fail = (res, status, error) => send(res, status, {ok:false, error});
async function readBody(req){
  let b; try{ b = req.body; }catch(e){ return {}; }                // Vercel đã phân tích sẵn JSON (nếu JSON hỏng thì getter ném lỗi)
  if(b && typeof b === 'object' && !Buffer.isBuffer(b)) return b;
  if(typeof b === 'string' || Buffer.isBuffer(b)){ try{ return JSON.parse(String(b)); }catch(e){ return {}; } }
  return await new Promise(resolve=>{                               // chạy ngoài Vercel: tự đọc luồng dữ liệu
    let d = '', done = false; const end = v => { if(!done){ done = true; resolve(v); } };
    req.on('data', c => { d += c; if(d.length > 700000) end({}); });
    req.on('end', () => { try{ end(JSON.parse(d || '{}')); }catch(e){ end({}); } });
    req.on('error', () => end({})); setTimeout(() => end({}), 4000);
  });
}
const ipOf = req => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim().replace(/[^0-9a-fA-F:.]/g,'') || 'x';
const cleanName = (s, d) => (String(s || '').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,24)) || d;
async function bump(key, ttl){ const n = await redis(['INCR', key]); if(n === 1) await redis(['EXPIRE', key, ttl]); return n; }
const session = (u, name) => ({token: sign({u, exp: Date.now() + TOKEN_DAYS*864e5}), user:{username:u, name}});

async function register(req, res, b){
  const u = String(b.username || '').trim().toLowerCase(), pw = b.password;
  if(!USER_RE.test(u)) return fail(res, 400, 'Tên đăng nhập gồm 3–20 ký tự: chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.');
  if(typeof pw !== 'string' || pw.length < 6 || pw.length > 100) return fail(res, 400, 'Mật khẩu cần từ 6 đến 100 ký tự.');
  if(process.env.INVITE_CODE && String(b.invite || '').trim() !== process.env.INVITE_CODE) return fail(res, 403, 'Mã mời chưa đúng. Bạn hỏi lại chủ trang nhé.');
  if(await bump('rr:'+ipOf(req), 3600) > 10) return fail(res, 429, 'Bạn tạo tài khoản hơi nhiều rồi, thử lại sau một giờ nhé.');
  const salt = crypto.randomBytes(16).toString('base64'), name = cleanName(b.name, u);
  const rec = {name, salt, hash: await hashPw(pw, salt), created: Date.now()};
  const r = await redis(['SET', 'u:'+u, JSON.stringify(rec), 'NX']);
  if(r !== 'OK') return fail(res, 409, 'Tên đăng nhập này đã có người dùng, bạn chọn tên khác nhé.');
  return send(res, 200, Object.assign({ok:true}, session(u, name)));
}
async function login(req, res, b){
  const u = String(b.username || '').trim().toLowerCase(), pw = String(b.password || '');
  const bad = () => fail(res, 401, 'Sai tên đăng nhập hoặc mật khẩu.');
  if(!USER_RE.test(u) || !pw) return bad();
  if((Number(await redis(['GET', 'rl:'+u])) || 0) >= 8) return fail(res, 429, 'Sai mật khẩu nhiều lần. Bạn thử lại sau 15 phút nhé.');
  const raw = await redis(['GET', 'u:'+u]); let rec = null; try{ rec = raw ? JSON.parse(raw) : null; }catch(e){}
  if(!rec || !(await checkPw(pw, rec))){ await bump('rl:'+u, 900); return bad(); }
  await redis(['DEL', 'rl:'+u]);
  return send(res, 200, Object.assign({ok:true}, session(u, rec.name || u)));
}
async function password(res, who, b){
  const pw = b.password; if(typeof pw !== 'string' || pw.length < 6 || pw.length > 100) return fail(res, 400, 'Mật khẩu mới cần từ 6 đến 100 ký tự.');
  if((Number(await redis(['GET', 'rl:'+who.u])) || 0) >= 8) return fail(res, 429, 'Sai mật khẩu nhiều lần. Bạn thử lại sau 15 phút nhé.');
  const raw = await redis(['GET', 'u:'+who.u]); let rec = null; try{ rec = raw ? JSON.parse(raw) : null; }catch(e){}
  if(!rec) return fail(res, 401, 'Tài khoản không còn tồn tại.');
  if(!(await checkPw(String(b.old || ''), rec))){ await bump('rl:'+who.u, 900); return fail(res, 403, 'Mật khẩu hiện tại chưa đúng.'); }
  rec.salt = crypto.randomBytes(16).toString('base64'); rec.hash = await hashPw(pw, rec.salt);
  await redis(['SET', 'u:'+who.u, JSON.stringify(rec)]);
  return send(res, 200, {ok:true});
}
async function pull(res, who, b){
  const r = await redis(['HGETALL', 'd:'+who.u]); const data = {};
  const scope = String((b && b.scope) || '');        // 'n1' = phần Ôn thi N1 · 'lp' = English/日本語/hồ sơ (+ tóm tắt N1 cho trang chủ)
  const want = k => scope === 'n1' ? N1_RE.test(k) : scope === 'lp' ? (LP_RE.test(k) || k === 'summary') : KEY_RE.test(k);
  const put = (k, v) => { if(want(k)){ try{ data[k] = JSON.parse(v); }catch(e){} } };
  if(Array.isArray(r)){ for(let i = 0; i+1 < r.length; i += 2) put(r[i], r[i+1]); }
  else if(r && typeof r === 'object') Object.keys(r).forEach(k => put(k, typeof r[k] === 'string' ? r[k] : JSON.stringify(r[k])));
  return send(res, 200, {ok:true, data, now: Date.now()});
}
async function push(res, who, b){
  const set = b.set; if(!set || typeof set !== 'object' || Array.isArray(set)) return fail(res, 400, 'Thiếu dữ liệu.');
  const keys = Object.keys(set); if(!keys.length) return send(res, 200, {ok:true, now: Date.now()});
  if(keys.length > 60) return fail(res, 413, 'Quá nhiều mục trong một lần đồng bộ.');
  const cur = await redis(['HMGET', 'd:'+who.u].concat(keys));          // bản đang có trên máy chủ
  const args = ['HSET', 'd:'+who.u], stale = []; let total = 0, i = -1;
  for(const k of keys){
    i++; const it = set[k]; if(!KEY_RE.test(k) || !it || typeof it.ts !== 'number' || !isFinite(it.ts)) return fail(res, 400, 'Dữ liệu không hợp lệ: '+k.slice(0,20));
    const v = JSON.stringify({ts: Math.round(it.ts), v: it.v === undefined ? null : it.v});
    if(v.length > (N1_RE.test(k) ? 80000 : 400000)) return fail(res, 413, 'Một mục dữ liệu quá lớn.');
    total += v.length; if(total > 900000) return fail(res, 413, 'Lần đồng bộ này quá lớn.');
    let old = null; try{ old = Array.isArray(cur) && cur[i] ? JSON.parse(cur[i]) : null; }catch(e){}
    if(old && typeof old.ts === 'number' && old.ts > it.ts){ stale.push(k); continue; }   // thiết bị khác đã lưu bản mới hơn → bỏ qua, báo lại để thiết bị này tải về
    args.push(k, v);
  }
  if(args.length > 2) await redis(args);
  return send(res, 200, {ok:true, now: Date.now(), stale});
}

module.exports = async (req, res) => {
  try{
    if(req.method === 'GET') return send(res, 200, {ok:true, app:'Camhu Lab', version:VERSION, configured:!!conf(), invite:!!process.env.INVITE_CODE});
    if(req.method !== 'POST') return fail(res, 405, 'Phương thức không được hỗ trợ.');
    if(!conf()) return fail(res, 503, 'Máy chủ chưa được nối với cơ sở dữ liệu.');
    const b = await readBody(req), a = String((b && b.a) || '');
    if(a === 'register') return await register(req, res, b);
    if(a === 'login') return await login(req, res, b);
    const h = String(req.headers['authorization'] || ''), who = verify(h.indexOf('Bearer ') === 0 ? h.slice(7) : null);
    if(!who) return fail(res, 401, 'Phiên đăng nhập đã hết hạn, bạn đăng nhập lại nhé.');
    if(a === 'pull') return await pull(res, who, b);
    if(a === 'push') return await push(res, who, b);
    if(a === 'password') return await password(res, who, b);
    return fail(res, 400, 'Yêu cầu không hợp lệ.');
  }catch(e){
    console.error('[lab]', e && e.message);
    return fail(res, 500, 'Máy chủ đang gặp lỗi, bạn thử lại sau nhé.');
  }
};
