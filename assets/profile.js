/* Hồ sơ người học: lưu trong trình duyệt của thiết bị này.
   Khi đăng nhập tài khoản Camhu Lab, hồ sơ "u_<tên đăng nhập>" được chọn tự động và đồng bộ lên máy chủ (xem assets/camhu.js). */
(function(){
  var PK="lp_profiles", AK="lp_active";
  function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function del(k){try{localStorage.removeItem(k)}catch(e){}}
  function list(){try{return JSON.parse(get(PK)||"[]")||[]}catch(e){return []}}
  function saveList(a){set(PK,JSON.stringify(a))}
  function active(){var id=get(AK);return list().filter(function(p){return p.id===id})[0]||null}
  var DEF_EN="I’m a business analyst in Vietnam working on IT projects for Japanese clients";
  var DEF_JP="ベトナム人のBA。日本語はN2+、日系のIT案件に携わっている";
  window.LP={
    list:list, saveList:saveList, active:active, get:get, set:set, del:del,
    DEF_EN:DEF_EN, DEF_JP:DEF_JP,
    setActive:function(id){set(AK,id)},
    clearActive:function(){del(AK)},
    key:function(base){var p=active();return p?base+"@"+p.id:base},
    aboutEn:function(){var p=active();return (p&&p.aboutEn)||DEF_EN},
    aboutJp:function(){var p=active();return (p&&p.aboutJp)||DEF_JP},
    ROLES:{ba:"Business Analyst (BA)",dev:"Developer",qa:"QA / Tester",pm:"Project Manager / Team lead",other:"Khác"},
    prof:function(){var a=active()||{};return {role:a.role||"ba",roleText:a.roleText||"",industry:a.industry||"",level:a.level||"B1",goal:a.goal||"Giao tiếp công việc"}},
    roleLabel:function(){var q=this.prof();return q.role==="other"?(q.roleText||"IT professional"):this.ROLES[q.role]},
    keysOf:function(id){var out=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.slice(-(id.length+1))==="@"+id)out.push(k)}}catch(e){}return out},
    /* Trang khoá học gọi hàm này ngay trong <head>: chưa chọn người học thì quay về trang chủ. */
    require:function(){
      if(active())return true;
      document.documentElement.style.visibility="hidden";
      var page=location.pathname.split("/").pop()||"";
      location.replace("index.html?next="+encodeURIComponent(page+location.hash));
      return false;
    },
    /* Thanh điều hướng chung của Camhu Lab (logo, các khóa học, tài khoản, sáng/tối) nằm trong assets/camhu.js. */
    bar:function(){ if(window.CL) CL.bar(); }
  };
})();
