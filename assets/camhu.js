/* Camhu Lab — phần dùng chung cho mọi trang:
   Camhu (logo), giao diện sáng/tối, thanh điều hướng, tài khoản, đồng bộ tiến độ English / 日本語 theo tài khoản.
   (Tiến độ phần Ôn thi N1 do n1.html tự đồng bộ; cả hai dùng chung phiên đăng nhập và máy chủ /api/lab.) */
(function(){
'use strict';
var BASE='n1road84v2:', API='/api/lab', VER='3.0.0', VDATE='11/11/2026';
var _set=Storage.prototype.setItem, _del=Storage.prototype.removeItem;
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function rawSet(k,v){try{_set.call(localStorage,k,v)}catch(e){}}
function rawDel(k){try{_del.call(localStorage,k)}catch(e){}}
function parse(s,d){if(s==null)return d;try{var v=JSON.parse(s);return v==null?d:v}catch(e){return d}}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function $(s,r){return (r||document).querySelector(s)}
function keysWhere(fn){var out=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&fn(k))out.push(k)}}catch(e){}return out}
/* Camhu (bản nữ: nơ hồng + hàng mi) — 3 màu × 7 biểu cảm: wave · think · search · happy · surprised · celebrate · sleep */
const CAMHU_COL={A:{body:'#9DCEF7',stroke:'#2F6DB8',limb:'#5E9FDD'},B:{body:'#DEE6F2',stroke:'#6F87B0',limb:'#9DB0D2'},C:{body:'#89D6CE',stroke:'#2A8C82',limb:'#4DB3A8'}};
function camhuSVG(ex,v){ const c=CAMHU_COL[v]||CAMHU_COL.A, ink='#1D2442', blush='#F9B4C8', bowF='#FF9DB8', bowS='#D4587A';
  const armL=`<path d="M22 74C11 79 9 92 15 100C20 96 23 88 25 82Z" fill="${c.limb}"/>`, armR=`<path d="M98 74C109 79 111 92 105 100C100 96 97 88 95 82Z" fill="${c.limb}"/>`;
  const armRUp=`<path class="${ex==='wave'?'wave-arm':''}" d="M97 70C109 62 112 46 107 35C100 38 96 50 94 62Z" fill="${c.limb}"/>`, armLUp=`<path d="M23 70C11 62 8 46 13 35C20 38 24 50 26 62Z" fill="${c.limb}"/>`;
  const body=`<path d="M60 28C86 28 103 45 103 69C103 93 85 105 60 105C35 105 17 93 17 69C17 45 34 28 60 28Z" fill="${c.body}" stroke="${c.stroke}" stroke-width="4"/><ellipse cx="44" cy="46" rx="8" ry="4.5" fill="#fff" opacity=".35" transform="rotate(-25 44 46)"/>`;
  const tuft=`<path transform="translate(0 ${ex==='surprised'?-7:0})" d="M49 30C47 21 54 19 55 25C55 17 63 17 62 24C64 17 71 19 69 28" fill="none" stroke="${c.limb}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const bow=`<g transform="translate(35 36) rotate(-24)"><path d="M0 0C-4-8-13-9-14-2C-15 5-5 6 0 0Z" fill="${bowF}" stroke="${bowS}" stroke-width="1.8" stroke-linejoin="round"/><path d="M0 0C4-8 13-9 14-2C15 5 5 6 0 0Z" fill="${bowF}" stroke="${bowS}" stroke-width="1.8" stroke-linejoin="round"/><circle r="3.3" fill="#FFC6D6" stroke="${bowS}" stroke-width="1.8"/></g>`;
  const lash=`<path d="M41.8 59.4L39.3 57M43.6 56.6L42.2 53.8M78.2 59.4L80.7 57M76.4 56.6L77.8 53.8" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>`;
  const lashC=`<path d="M41 65L38.4 63.8M79 65L81.6 63.8" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>`;
  const eyes=(s=1)=>`<ellipse cx="47" cy="63" rx="${5*s}" ry="${6*s}" fill="${ink}"/><ellipse cx="73" cy="63" rx="${5*s}" ry="${6*s}" fill="${ink}"/><circle cx="48.8" cy="60.5" r="1.8" fill="#fff"/><circle cx="74.8" cy="60.5" r="1.8" fill="#fff"/>${lash}`;
  const happyEyes=`<path d="M41 65Q47 57 53 65M67 65Q73 57 79 65" fill="none" stroke="${ink}" stroke-width="3.2" stroke-linecap="round"/>${lashC}`;
  const sleepEyes=`<path d="M41 63Q47 68 53 63M67 63Q73 68 79 63" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
  const blushes=`<ellipse cx="35" cy="77" rx="7" ry="4" fill="${blush}"/><ellipse cx="85" cy="77" rx="7" ry="4" fill="${blush}"/>`;
  const smile=`<path d="M54 75Q60 81 66 75" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`, open=`<path d="M52 73Q60 86 68 73Z" fill="${ink}"/>`;
  let back='', face='', front='', extra='';
  switch(ex){
    case 'think': back=armL; face=eyes()+`<path d="M55 77H64" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`; front=`<path d="M66 86C78 84 90 79 99 74" stroke="${c.limb}" stroke-width="8" stroke-linecap="round" fill="none"/>`; extra=`<circle cx="98" cy="22" r="2.6" fill="${c.stroke}"/><circle cx="106" cy="14" r="3.4" fill="${c.stroke}"/><circle cx="115" cy="6" r="4.4" fill="${c.stroke}"/>`; break;
    case 'search': back=armL+armR; face=eyes()+smile; front=`<line x1="82" y1="70" x2="95" y2="84" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><circle cx="75" cy="61" r="11" fill="rgba(255,255,255,.5)" stroke="${ink}" stroke-width="4"/><path d="M70 57a6 6 0 0 1 6-2.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`; break;
    case 'happy': back=armL+armR; face=happyEyes+open; break;
    case 'surprised': back=armL+armR; face=eyes(1.15)+`<ellipse cx="60" cy="79" rx="3.6" ry="5" fill="${ink}"/>`; break;
    case 'celebrate': back=armLUp+armRUp; face=happyEyes+open; extra=`<rect x="6" y="14" width="5" height="10" rx="2" fill="${c.stroke}" transform="rotate(-20 8 19)"/><rect x="99" y="15" width="4" height="9" rx="2" fill="${c.stroke}" transform="rotate(30 101 19)"/><circle cx="92" cy="8" r="3" fill="${c.stroke}"/><circle cx="22" cy="8" r="2.6" fill="#F59BB5"/>`; break;
    case 'sleep': back=armL+armR; face=sleepEyes+`<path d="M57 78Q60 80 63 78" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`; extra=`<text x="86" y="30" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="${c.stroke}">Z</text><text x="100" y="17" font-family="Arial,sans-serif" font-size="11" font-weight="800" fill="${c.stroke}">z</text>`; break;
    default: back=armL+armRUp; face=eyes()+smile;
  }
  return `<svg viewBox="0 0 120 112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${back}${tuft}${body}${bow}${blushes}${face}${front}${extra}</svg>`;
}

var PAGE=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
var LP_RE=/^(profile|summary|lp:[A-Za-z0-9_.-]{1,48})$/, BASE_RE=/^[A-Za-z0-9_.-]{1,48}$/, N1_RE=/^(day([1-9]|[1-7]\d|8[0-4])m?|summarym?|known|lastDay)$/;
var PF=['name','role','roleText','industry','level','goal','aboutEn','aboutJp'];

/* ---------- cài đặt chung + giao diện ---------- */
function settings(){return parse(lsGet(BASE+'settings'),{})||{}}
function variant(){var v=settings().variant;return CAMHU_COL[v]?v:'A'}
function resolveTheme(){var t=settings().theme||'auto';if(t==='auto'){try{t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){t='light'}}return t==='dark'?'dark':'light'}
function applyTheme(){var t=resolveTheme();document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',t==='dark'?'#111A24':'#EAF3FC');var b=$('#clTheme');if(b){b.innerHTML=t==='dark'?ICON.sun:ICON.moon;b.title=t==='dark'?'Chuyển sang giao diện sáng':'Chuyển sang giao diện tối';b.setAttribute('aria-label',b.title)}}
function toggleTheme(){var s=settings();s.theme=resolveTheme()==='dark'?'light':'dark';rawSet(BASE+'settings',JSON.stringify(s));applyTheme()}
var ICON={
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M5.2 18.8l1.6-1.6M17.2 6.8l1.6-1.6"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>'
};

/* ---------- phiên đăng nhập + hồ sơ ---------- */
function session(){var a=parse(lsGet(BASE+'auth'),null);return a&&a.username&&a.token?a:null}
function profiles(){var a=parse(lsGet('lp_profiles'),[]);return Array.isArray(a)?a:[]}
function activeId(){return lsGet('lp_active')}
function acctProfile(){var s=session();if(!s)return null;var id='u_'+s.username;return profiles().filter(function(p){return p.id===id})[0]||null}
function profileOf(id){return profiles().filter(function(p){return p.id===id})[0]||null}
// tài khoản đang đăng nhập ↔ hồ sơ "u_<tên>" (các trang English / 日本語 lưu tiến độ theo hồ sơ đang chọn)
function syncIdentity(){var s=session(),act=activeId();
  if(s){var id='u_'+s.username,ps=profiles();
    if(!ps.some(function(p){return p.id===id})){ps.push({id:id,name:s.name||s.username,account:s.username,created:Date.now(),aboutEn:'',aboutJp:''});rawSet('lp_profiles',JSON.stringify(ps))}
    if(act!==id)rawSet('lp_active',id)}
  else if(act&&act.indexOf('u_')===0)rawDel('lp_active')}

/* ---------- đồng bộ (English / 日本語 / hồ sơ) ---------- */
var S={ts:{},dirty:{},timer:null,busy:false,lastPush:0,lastPull:0,lastOk:0,state:'off',offset:0,backend:'unknown',invite:false,profJson:''};
function now(){return Date.now()+S.offset}
function loadTs(){var s=session();S.ts=s?(parse(lsGet('cl_ts:'+s.username),{})||{}):{};S.dirty={};S.profJson=JSON.stringify(acctProfile()||null);S.state=s?'ok':'off'}
function saveTs(){var s=session();if(s)rawSet('cl_ts:'+s.username,JSON.stringify(S.ts))}
function setState(st){S.state=st;if(st==='ok')S.lastOk=Date.now();renderUser()}
function touch(f){if(!session())return;S.ts[f]=now();saveTs();S.dirty[f]=1;schedule();renderUser()}
function schedule(ms){if(S.timer||!session())return;var w=ms!=null?ms:Math.max(4000,S.lastPush+20000-Date.now());S.timer=setTimeout(function(){S.timer=null;push()},w)}
function call(body,keepalive){var s=session();
  return fetch(API,{method:'POST',cache:'no-store',keepalive:!!keepalive,headers:Object.assign({'Content-Type':'application/json'},s?{Authorization:'Bearer '+s.token}:{}),body:JSON.stringify(body)})
    .then(function(r){return r.json().catch(function(){return null}).then(function(j){if(!r.ok||!j||!j.ok){var e=new Error((j&&j.error)||('Lỗi máy chủ (HTTP '+r.status+')'));e.status=r.status;throw e}return j})})}
function localVal(f){var s=session();if(f==='profile'){var p=acctProfile();if(!p)return null;var o={};PF.forEach(function(k){if(p[k]!=null)o[k]=p[k]});return o}return lsGet(f.slice(3)+'@u_'+s.username)}
function applyRemote(f,v){var s=session(),u=s.username;
  if(f==='profile'){if(v&&typeof v==='object'){var ps=profiles(),p=ps.filter(function(x){return x.id==='u_'+u})[0];if(p){PF.forEach(function(k){if(v[k]!=null)p[k]=String(v[k]).slice(0,2000)});rawSet('lp_profiles',JSON.stringify(ps));S.profJson=JSON.stringify(p)}}return}
  var key=f.slice(3)+'@u_'+u;if(v==null)rawDel(key);else rawSet(key,typeof v==='string'?v:JSON.stringify(v))}
function pull(){return call({a:'pull',scope:'lp'}).then(function(j){S.offset=(j.now||Date.now())-Date.now();S.lastPull=Date.now();var remote=j.data||{},applied=[],u=session().username;
  Object.keys(remote).forEach(function(f){var rv=remote[f];if(!rv||typeof rv.ts!=='number'||!LP_RE.test(f))return;
    if(f==='summary'){var tk=BASE+'u:'+u+':__ts',tm=parse(lsGet(tk),{})||{};if(rv.ts>(tm.summary||0)&&rv.v){rawSet(BASE+'u:'+u+':summary',JSON.stringify(rv.v));tm.summary=rv.ts;rawSet(tk,JSON.stringify(tm));applied.push(f)}return}   // chỉ để trang chủ hiện tiến độ N1
    var lt=S.ts[f]||0;if(rv.ts>lt){applyRemote(f,rv.v);S.ts[f]=rv.ts;delete S.dirty[f];applied.push(f)}else if(lt>rv.ts)S.dirty[f]=1});
  Object.keys(S.ts).forEach(function(f){if(!(f in remote))S.dirty[f]=1});saveTs();return applied})}
function push(keepalive){var s=session(),keys=Object.keys(S.dirty).slice(0,30);if(!s||S.busy||!keys.length)return Promise.resolve();
  S.busy=true;clearTimeout(S.timer);S.timer=null;var set={},snap={};
  keys.forEach(function(f){snap[f]=S.ts[f]||(S.ts[f]=now());set[f]={ts:snap[f],v:localVal(f)}});setState('sync');
  return call({a:'push',set:set},keepalive).then(function(j){S.lastPush=Date.now();if(j.stale&&j.stale.length)setTimeout(function(){sync(false)},60);keys.forEach(function(f){if(S.ts[f]===snap[f])delete S.dirty[f]});saveTs();S.busy=false;setState('ok');if(Object.keys(S.dirty).length)schedule()},
    function(e){S.busy=false;S.lastPush=Date.now();if(e.status===401){expired();return}setState('offline');schedule(30000)})}
function sync(manual){if(!session())return Promise.resolve([]);setState('sync');
  return pull().then(function(applied){return push().then(function(){if(S.state!=='offline')setState('ok');onApplied(applied);if(manual)toast('Đã đồng bộ xong.');return applied})},
    function(e){if(e.status===401){expired();return[]}setState('offline');if(manual)toast('Chưa kết nối được máy chủ, sẽ tự thử lại.');return[]})}
function onApplied(applied){if(!applied.length)return;
  if((PAGE==='en'||PAGE==='jp')&&applied.some(function(f){return f.indexOf('lp:')===0||f==='profile'})){var last=0;try{last=+sessionStorage.getItem('cl_reload')||0}catch(e){}
    if(Date.now()-last>8000){try{sessionStorage.setItem('cl_reload',String(Date.now()))}catch(e){}location.reload();return}}
  if(typeof CL.onChange==='function')CL.onChange()}
// mọi lần trang ghi vào localStorage: nếu là dữ liệu của tài khoản đang đăng nhập thì đánh dấu để đồng bộ
function onWrite(k){var s=session();if(!s)return;var suf='@u_'+s.username;
  if(k.length>suf.length&&k.slice(-suf.length)===suf){var b=k.slice(0,-suf.length);if(BASE_RE.test(b))touch('lp:'+b)}
  else if(k==='lp_profiles'){var pj=JSON.stringify(acctProfile()||null);if(pj!==S.profJson){S.profJson=pj;touch('profile')}}}
Storage.prototype.setItem=function(k,v){var same=false;try{same=this===localStorage&&this.getItem(k)===String(v)}catch(e){}_set.apply(this,arguments);try{if(this===localStorage&&!same)onWrite(String(k))}catch(e){}};
Storage.prototype.removeItem=function(k){_del.apply(this,arguments);try{if(this===localStorage)onWrite(String(k))}catch(e){}};

/* ---------- đăng nhập / đăng xuất ---------- */
function copyN1(src,dst){var tk=dst+'__ts',tm=parse(lsGet(tk),{})||{},n=0;
  keysWhere(function(k){return k.indexOf(src)===0&&N1_RE.test(k.slice(src.length))}).forEach(function(k){var name=k.slice(src.length);if(lsGet(dst+name)!=null)return;rawSet(dst+name,lsGet(k));tm[name]=Date.now();n++});
  if(n)rawSet(tk,JSON.stringify(tm));return n}
// gọi sau khi đã lưu phiên đăng nhập. isNew: vừa đăng ký → chép tiến độ đang có trên máy (hồ sơ prev hoặc chế độ khách) vào tài khoản
function afterLogin(isNew,prev){syncIdentity();loadTs();var s=session();if(!s)return Promise.resolve([]);
  if(isNew){var suf='@u_'+s.username;
    if(prev){keysWhere(function(k){return k.slice(-(prev.length+1))==='@'+prev}).forEach(function(k){var b=k.slice(0,-(prev.length+1));if(!BASE_RE.test(b))return;rawSet(b+suf,lsGet(k));S.ts['lp:'+b]=now();S.dirty['lp:'+b]=1});
      var ps=profiles(),src=ps.filter(function(p){return p.id===prev})[0],dst=ps.filter(function(p){return p.id==='u_'+s.username})[0];
      if(src&&dst){PF.slice(1).forEach(function(k){if(src[k]!=null)dst[k]=src[k]});rawSet('lp_profiles',JSON.stringify(ps))}}
    S.ts.profile=now();S.dirty.profile=1;S.profJson=JSON.stringify(acctProfile()||null);
    copyN1(prev?BASE+'p:'+prev+':':BASE,BASE+'u:'+s.username+':');saveTs()}
  renderUser();return sync(false)}
function afterLogout(u,clean){clearTimeout(S.timer);S.timer=null;rawDel('lp_active');
  if(u&&clean!==false&&!Object.keys(S.dirty).length){keysWhere(function(k){return k.slice(-(u.length+3))==='@u_'+u}).forEach(rawDel);rawDel('cl_ts:'+u);rawSet('lp_profiles',JSON.stringify(profiles().filter(function(p){return p.id!=='u_'+u})))}
  S.ts={};S.dirty={};S.profJson='';setState('off')}
function logout(){var s=session();if(!s)return Promise.resolve();hidePop();
  return push().then(function(){var u=s.username;rawDel(BASE+'auth');afterLogout(u);toast('Bạn đã đăng xuất.');afterIdentityChange()})}
function expired(){var s=session();rawDel(BASE+'auth');afterLogout(s&&s.username,false);if(PAGE==='n1')return;if(PAGE==='index'){afterIdentityChange();openAuth('login','Phiên đăng nhập đã hết hạn, bạn đăng nhập lại nhé.')}else location.href='index.html'}
function afterIdentityChange(){if(PAGE==='index'){renderUser();if(typeof CL.onChange==='function')CL.onChange()}else if(PAGE==='en'||PAGE==='jp'){if(activeId())location.reload();else location.href='index.html'}else location.reload()}

/* ---------- hộp thoại đăng nhập ---------- */
var authMode='login',authBusy=false;
function closeModal(){var m=$('#clModal');if(m)m.remove()}
function openAuth(mode,notice){authMode=mode||'login';closeModal();var m=authMode,ok=S.backend==='ok';
  var el=document.createElement('div');el.className='cl-modal';el.id='clModal';
  var head='<div class="cl-auth-hero">'+camhuSVG(m==='password'?'think':'wave',variant())+'<h3>'+(m==='password'?'Đổi mật khẩu':'Camhu Lab')+'</h3><p>'+(m==='password'?'Nhập mật khẩu hiện tại và mật khẩu mới.':'Đăng nhập để Camhu nhớ tiến độ của bạn trên mọi thiết bị.')+'</p></div>',body;
  if(!ok)body='<div class="cl-notice">'+(S.backend==='unconfigured'?'Máy chủ chưa được nối với cơ sở dữ liệu. Chủ trang cần tạo Upstash Redis trong Vercel rồi deploy lại (xem file HUONG_DAN.md).':'Bản đang mở không có máy chủ đăng nhập (mở trực tiếp từ file, hoặc chưa deploy thư mục /api).')+'</div><p class="cl-note">Bạn vẫn học bình thường mà không cần tài khoản: tiến độ được lưu trên máy này.</p><div class="cl-actions"><button class="cl-btn pri" data-cl-close>Đã hiểu</button></div>';
  else if(m==='password')body='<form class="cl-form" id="clForm" novalidate><label>Mật khẩu hiện tại<input type="password" name="old" autocomplete="current-password"></label><label>Mật khẩu mới (ít nhất 6 ký tự)<input type="password" name="password" autocomplete="new-password"></label><label>Nhập lại mật khẩu mới<input type="password" name="password2" autocomplete="new-password"></label><p class="cl-err" id="clErr" hidden></p><button class="cl-btn pri big" type="submit">Đổi mật khẩu</button></form><div class="cl-actions"><button class="cl-btn ghost" data-cl-close>Hủy</button></div>';
  else body='<div class="cl-seg"><button type="button" data-cl-tab="login" class="'+(m==='login'?'on':'')+'">Đăng nhập</button><button type="button" data-cl-tab="register" class="'+(m==='register'?'on':'')+'">Đăng ký</button></div>'+(notice?'<div class="cl-notice">'+esc(notice)+'</div>':'')+
    '<form class="cl-form" id="clForm" novalidate><label>Tên đăng nhập<input name="username" autocomplete="username" maxlength="20" autocapitalize="none" spellcheck="false"></label>'+
    (m==='register'?'<label>Tên hiển thị (không bắt buộc)<input name="name" maxlength="24" autocomplete="nickname"></label>':'')+
    '<label>Mật khẩu'+(m==='register'?' (ít nhất 6 ký tự)':'')+'<input type="password" name="password" autocomplete="'+(m==='register'?'new-password':'current-password')+'"></label>'+
    (m==='register'?'<label>Nhập lại mật khẩu<input type="password" name="password2" autocomplete="new-password"></label>':'')+
    (m==='register'&&S.invite?'<label>Mã mời (hỏi chủ trang)<input name="invite" autocomplete="off"></label>':'')+
    '<p class="cl-err" id="clErr" hidden></p><button class="cl-btn pri big" type="submit">'+(m==='register'?'Tạo tài khoản':'Đăng nhập')+'</button></form>'+
    '<p class="cl-note">'+(m==='register'?'Tiến độ đang có trên máy này sẽ được chép vào tài khoản mới. Không có chức năng lấy lại mật khẩu qua email, bạn nhớ giữ mật khẩu nhé.':'Không cần tài khoản vẫn học được: tiến độ khi đó chỉ lưu trên máy này.')+'</p><div class="cl-actions"><button class="cl-btn ghost" data-cl-close>Để sau</button></div>';
  el.innerHTML='<div class="cl-card" role="dialog" aria-modal="true">'+head+body+'</div>';document.body.appendChild(el);var f=$('#clForm input');if(f)setTimeout(function(){f.focus()},40)}
function submitAuth(f){if(authBusy)return;var mode=authMode,err=function(m){var e=$('#clErr');e.textContent=m;e.hidden=false};
  var username=String(f.username?f.username.value:'').trim().toLowerCase(),password=f.password.value;
  if(mode!=='password'&&!/^[a-z0-9_.-]{3,20}$/.test(username))return err('Tên đăng nhập gồm 3–20 ký tự: chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.');
  if(password.length<6)return err('Mật khẩu cần ít nhất 6 ký tự.');
  if(mode!=='login'&&f.password2.value!==password)return err('Hai lần nhập mật khẩu chưa khớp.');
  var body=mode==='password'?{a:'password',old:f.old.value,password:password}:{a:mode,username:username,password:password,name:f.name?f.name.value.trim():'',invite:f.invite?f.invite.value.trim():''};
  authBusy=true;var btn=f.querySelector('button[type=submit]');btn.disabled=true;$('#clErr').hidden=true;
  call(body).then(function(j){authBusy=false;
    if(mode==='password'){closeModal();toast('Đã đổi mật khẩu.');return}
    var prev=activeId();if(prev&&prev.indexOf('u_')===0)prev=null;
    rawSet(BASE+'auth',JSON.stringify({username:j.user.username,name:j.user.name,token:j.token}));
    return afterLogin(mode==='register',prev).then(function(){closeModal();toast(mode==='register'?'Chào mừng '+j.user.name+' đến với Camhu Lab!':'Mừng '+j.user.name+' quay lại!');
      var nx=CL.next;if(nx){CL.next=null;location.href=nx;return}afterIdentityChange()})},
  function(e){authBusy=false;btn.disabled=false;err(e.status?e.message:'Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.')})}

/* ---------- thanh điều hướng ---------- */
function syncText(){if(S.state==='sync')return 'Đang đồng bộ…';if(S.state==='offline')return 'Chưa kết nối được máy chủ — tiến độ vẫn lưu trên máy này, sẽ tự thử lại.';
  if(Object.keys(S.dirty).length)return 'Có thay đổi mới, sẽ đồng bộ trong giây lát.';var t=S.lastOk?new Date(S.lastOk):null;return 'Đã đồng bộ'+(t?' lúc '+('0'+t.getHours()).slice(-2)+':'+('0'+t.getMinutes()).slice(-2):'')+'.'}
function hidePop(){var p=$('#clPop');if(p)p.remove()}
function showPop(){hidePop();var s=session();if(!s)return;var p=document.createElement('div');p.className='cl-pop';p.id='clPop';var nm=(acctProfile()||{}).name||s.name||s.username;
  p.innerHTML='<div class="cl-pop-head"><span class="cl-ava">'+esc(nm.trim().charAt(0).toUpperCase())+'</span><div><b>'+esc(nm)+'</b><small>@'+esc(s.username)+'</small></div></div><div class="cl-status"><i class="cl-dot '+S.state+'"></i><span>'+syncText()+'</span></div><div class="cl-pop-actions"><button class="cl-btn mint" id="clSync">Đồng bộ ngay</button><button class="cl-btn" id="clPass">Đổi mật khẩu</button><button class="cl-btn peach" id="clOut">Đăng xuất</button></div>';
  document.body.appendChild(p)}
function renderUser(){var box=$('#clUser');if(!box)return;var s=session(),p=!s&&activeId()?profileOf(activeId()):null;
  if(s){var nm=(acctProfile()||{}).name||s.name||s.username;box.innerHTML='<button class="cl-userbtn in" id="clUserBtn" aria-label="Tài khoản"><span class="cl-ava">'+esc(nm.trim().charAt(0).toUpperCase())+'</span><span class="cl-lb">'+esc(nm)+'</span><i class="cl-dot '+S.state+'"></i></button>'}
  else box.innerHTML=(p?'<a class="cl-who" href="index.html?switch=1" title="Đổi người học">'+ICON.user+'<span class="cl-lb">'+esc(p.name)+'</span></a>':'')+'<button class="cl-userbtn" id="clUserBtn">'+(p?'':ICON.user)+'<span'+(p?'':' class="cl-lb"')+'>Đăng nhập</span></button>';
  var pop=$('#clPop');if(pop)showPop()}
function bar(){if($('#clBar'))return;var nav=document.createElement('nav');nav.className='cl-bar';nav.id='clBar';nav.setAttribute('aria-label','Điều hướng chung');
  var L=[['index','index.html','Trang chủ'],['n1','n1.html','Ôn thi N1'],['en','en.html','English'],['jp','jp.html','日本語']];
  nav.innerHTML='<a class="cl-brand" href="index.html"><span class="cl-logo">'+camhuSVG('happy',variant())+'</span><b>Camhu Lab</b></a><div class="cl-nav">'+L.map(function(x){return '<a href="'+x[1]+'"'+(x[0]===PAGE?' class="on" aria-current="page"':'')+'>'+x[2]+'</a>'}).join('')+'</div><div class="cl-right"><span id="clUser"></span><button class="cl-icon" id="clTheme"></button></div>';
  document.body.insertBefore(nav,document.body.firstChild);if(PAGE==='en'||PAGE==='jp')document.body.classList.add('cl-page');renderUser();applyTheme()}
var toastT;function toast(m){var t=$('#clToast');if(!t){t=document.createElement('div');t.id='clToast';t.className='cl-toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on')},2600)}

document.addEventListener('click',function(e){var t=e.target.closest?e.target.closest('button,a,[data-cl-close]'):null,pop=$('#clPop');
  if(pop&&!e.target.closest('#clPop')&&!e.target.closest('#clUserBtn'))hidePop();
  if(e.target.id==='clModal'){closeModal();return}
  if(!t)return;
  if(t.hasAttribute&&t.hasAttribute('data-cl-close')){closeModal();return}
  if(t.id==='clTheme'){toggleTheme();return}
  if(t.id==='clUserBtn'){if(session()){if($('#clPop'))hidePop();else showPop()}else openAuth('login');return}
  if(t.dataset&&t.dataset.clTab){openAuth(t.dataset.clTab);return}
  if(t.id==='clSync'){sync(true);return}
  if(t.id==='clPass'){hidePop();openAuth('password');return}
  if(t.id==='clOut'){logout();return}});
document.addEventListener('submit',function(e){if(e.target.id==='clForm'){e.preventDefault();submitAuth(e.target)}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();hidePop()}});
document.addEventListener('visibilitychange',function(){if(!session())return;if(document.hidden){if(Object.keys(S.dirty).length)push(true)}else if(S.backend==='ok'&&Date.now()-S.lastPull>60000)sync(false)});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme)}catch(e){}

/* ---------- khởi động ---------- */
function boot(){var go=function(){renderUser();if(typeof CL.onChange==='function')CL.onChange();if(session()&&S.backend==='ok')sync(false)};
  if(location.protocol==='file:'){S.backend='none';go();return}
  fetch(API,{cache:'no-store'}).then(function(r){return r.json().then(function(j){if(r.ok&&j&&j.ok){S.backend=j.configured?'ok':'unconfigured';S.invite=!!j.invite}else S.backend='none'})}).catch(function(){S.backend=session()?'offline':'none'}).then(go)}
function n1Progress(){var s=session(),act=activeId(),ns=s?'u:'+s.username+':':(act?'p:'+act+':':''),sm=parse(lsGet(BASE+ns+'summary'),{})||{},done=0,last=null;
  Object.keys(sm).forEach(function(k){var x=sm[k];if(x&&x.done){done++;if(last==null||+k>last.day)last={day:+k,total:x.total,pass:x.pass}}});return {done:done,last:last}}

syncIdentity();loadTs();applyTheme();
var CL=window.CL={VER:VER,VDATE:VDATE,PAGE:PAGE,mascot:camhuSVG,variant:variant,applyTheme:applyTheme,toggleTheme:toggleTheme,session:session,state:S,
  bar:bar,toast:toast,openAuth:openAuth,logout:logout,sync:sync,afterLogin:afterLogin,afterLogout:afterLogout,flush:function(){return push()},n1Progress:n1Progress,refresh:renderUser,onChange:null,next:null,boot:boot};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
