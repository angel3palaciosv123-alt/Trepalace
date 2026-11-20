/* ==========================================================
   RS · MOTOR DE CÁLCULO  (motor_rs.js)
   Todo el diseño del relleno sale de aquí, en cadena y año por año:
     proyección → caracterización → PPC y generación → metas de aprovechamiento
     → producción a disponer → celdas → lixiviados → piscinas → gases
   Cada módulo de RS solo dibuja lo que este motor calcula, así todos usan los
   mismos números. Nada está fijo: todo sale de PRO (Términos de referencia y
   tablas editables de los módulos) y de DP_RS.
   Las correcciones respecto a la hoja de cálculo de referencia (notas para el
   equipo de desarrollo) están en LEEME_RS.txt; no se muestran en la página.
   ========================================================== */

/* ==========================================================
   1. VALORES POR DEFECTO Y LISTAS
   ========================================================== */
/* ---------- Residuos por defecto (tabla de caracterización de los residuos sólidos) ----------
   n: nombre · pct: % de representatividad · hum: % de humedad · mc/mm/ml: % de metas de aprovechamiento en
   corto (1/3), mediano (2/3) y largo plazo (3/3 del tiempo de vida útil).
   ap/org/pel: aprovechable, orgánico, peligroso (1/0) · rho: peso unitario típico de la tabla RAS F.1.5 (kg/m³). */
var RESIDUOS_DEF_RS=[
  {n:"Papel",                       pct:4, hum:6, mc:10,mm:30,ml:50,ap:1,org:0,pel:0,rho:89},
  {n:"Cartón",                      pct:5, hum:5, mc:10,mm:30,ml:50,ap:1,org:0,pel:0,rho:50},
  {n:"Plásticos",                   pct:4, hum:2, mc:20,mm:40,ml:70,ap:1,org:0,pel:0,rho:65},
  {n:"Textiles",                    pct:5, hum:10,mc:0, mm:0, ml:0, ap:0,org:0,pel:0,rho:65},
  {n:"Goma",                        pct:4, hum:2, mc:0, mm:0, ml:0, ap:0,org:0,pel:0,rho:131},
  {n:"Cuero",                       pct:2, hum:10,mc:0, mm:0, ml:0, ap:0,org:0,pel:0,rho:160},
  {n:"Residuos de jardín",          pct:17,hum:60,mc:10,mm:30,ml:50,ap:1,org:1,pel:0,rho:101},
  {n:"Madera",                      pct:4, hum:20,mc:20,mm:40,ml:50,ap:1,org:1,pel:0,rho:237},
  {n:"Vidrio",                      pct:6, hum:2, mc:20,mm:40,ml:80,ap:1,org:0,pel:0,rho:196},
  {n:"Latas",                       pct:4, hum:3, mc:20,mm:40,ml:80,ap:1,org:0,pel:0,rho:89},
  {n:"Aluminio",                    pct:4, hum:2, mc:20,mm:40,ml:80,ap:1,org:0,pel:0,rho:160},
  {n:"Otros metales",               pct:5, hum:3, mc:20,mm:40,ml:80,ap:1,org:0,pel:0,rho:320},
  {n:"Suciedad, cenizas, etc.",     pct:5, hum:8, mc:0, mm:0, ml:0, ap:0,org:0,pel:0,rho:481},
  {n:"Residuos de comida (húmedos)",pct:21,hum:70,mc:20,mm:40,ml:50,ap:1,org:1,pel:0,rho:540},
  {n:"RESPEL",                      pct:3, hum:3, mc:0, mm:0, ml:0, ap:0,org:0,pel:1,rho:800},
  {n:"Residuos hospitalarios",      pct:1, hum:6, mc:0, mm:0, ml:0, ap:0,org:0,pel:1,rho:65},
  {n:"RCD",                         pct:2, hum:1, mc:10,mm:20,ml:30,ap:1,org:0,pel:0,rho:1600},
  {n:"RAEE",                        pct:2, hum:0, mc:20,mm:40,ml:70,ap:1,org:0,pel:0,rho:350},
  {n:"ACU",                         pct:2, hum:30,mc:20,mm:40,ml:60,ap:1,org:0,pel:0,rho:900}];

/* Tramos por defecto: solo la estructura típica de la red (nombre y fracción del caudal que recoge);
   longitud, pendiente y diámetro los ingresa el diseñador. */
var TRAMOS_LIX_DEF_RS=[{n:"Dren lateral",frac:0.25,L:"",S:"",D:""},{n:"Subcolector",frac:0.5,L:"",S:"",D:""},{n:"Colector principal",frac:1,L:"",S:"",D:""},{n:"Conducción a piscina",frac:1,L:"",S:"",D:""}];
var TRAMOS_GAS_DEF_RS=[{n:"Ramales",frac:0.25,L:"",S:"",D:"",v:""},{n:"Colector secundario",frac:0.5,L:"",S:"",D:"",v:""},{n:"Colector principal",frac:1,L:"",S:"",D:"",v:""}];


var METODOS_GAS_RS=["LandGEM (primer orden)","Potencial anual (hoja de referencia)"];
var PELIGROSOS_RS=["Incluir en el relleno","Gestionar aparte (no van al relleno)"];

/* ==========================================================
   2. LECTURA SEGURA DE PRO
   ========================================================== */
function rsN(k,def){var v=Number(PRO[k]);return (PRO[k]===""||PRO[k]===null||PRO[k]===undefined||!isFinite(v))?(def===undefined?NaN:def):v;}

/* ==========================================================
   3. POBLACIÓN
   ========================================================== */
/* Serie anual de población:
   - si la población proyectada de Términos de referencia es la del método adoptado en la proyección
     (o está vacía y hay proyección), se usa la serie anual de ese método;
   - si se digitó otra población (manual), se usa ese valor en todos los años del horizonte. */
function rsProyFinal(){
  var f=moduloApi("proyeccion_poblacional_RS").serieAnual,s=typeof f==="function"?f():[];
  return s;}
function rsPobDeProyeccion(){
  var s=rsProyFinal();if(!s.length)return false;
  return !esPos(PRO.rsPobProy)||Math.round(Number(PRO.rsPobProy))===Math.round(s[s.length-1].poblacion);}
function rsOrigenPobTxt(){return rsPobDeProyeccion()?"Método "+(PRO.rsMetodo||"Geométrico"):"Manual";}
function rsSerie(){
  var s=rsProyFinal();
  if(rsPobDeProyeccion())return s.map(function(r,i){return {t:i,anio:r.anio,pob:r.poblacion};});
  var a0=Number(PRO.anioIni),n=Number(PRO.duracion),P=Number(PRO.rsPobProy),out=[];
  if(!(esPos(a0)&&esPos(n)&&esPos(P)))return [];
  for(var t=0;t<=n;t++)out.push({t:t,anio:a0+t,pob:Math.round(P)});
  return out;}

/* ==========================================================
   4. CARACTERIZACIÓN
   ========================================================== */
function rsCaracterizacion(serie){
  var R=PRO.rsResiduos||[], Pm=rsN("rsPesoMuestra"), e=rsN("rsError"), p=rsN("rsP"), q=1-p;
  var nc=rsN("rsConfianza"), Z=DP_RS.zAlfa(nc);
  var anioE=esPos(PRO.rsAnioEstudio)?Number(PRO.rsAnioEstudio):(serie.length?serie[0].anio:NaN);
  var filaE=serie.filter(function(r){return r.anio===anioE;})[0]||serie[0]||null;
  var N=filaE?filaE.pob:NaN;
  var n=Math.floor(N*Z*Z*p*q/(e*e*(N-1)+Z*Z*p*q));
  var nmin=Math.floor(n-n*e), nmax=Math.floor(n+n*e);
  var pers=rsN("rsPersonas"), hv=rsN("rsHabViv"), dias=rsN("rsDiasMuestreo");
  var viv=Math.ceil(pers/hv), vmin=Math.floor(viv-viv*e), vmax=Math.floor(viv+viv*e);
  var habM=viv*hv;
  var sPct=R.reduce(function(a,r){return a+(Number(r.pct)||0);},0);
  var filas=R.map(function(r){
    var pct=Number(r.pct)||0, bruto=Pm*pct/100, hk=bruto*(Number(r.hum)||0)/100;
    return {n:r.n,pct:pct,ap:!!Number(r.ap),org:!!Number(r.org),pel:!!Number(r.pel),rho:Number(r.rho)||0,hum:Number(r.hum)||0,bruto:bruto,humKg:hk,neto:bruto-hk};});
  var tot=function(fn){return filas.reduce(function(a,f){return a+(fn(f)||0);},0);};
  var sBruto=tot(function(f){return f.bruto;}), sHum=tot(function(f){return f.humKg;});
  var rhoP=sPct>0?tot(function(f){return f.pct*f.rho;})/sPct:NaN;
  var humP=sBruto>0?sHum/sBruto:NaN;
  var cl=function(prop,val){return tot(function(f){return f[prop]===val?f.bruto:0;});};
  return {anioE:anioE,N:N,nc:nc,Z:Z,e:e,p:p,q:q,n:n,nmin:nmin,nmax:nmax,pers:pers,hv:hv,viv:viv,vmin:vmin,vmax:vmax,habM:habM,dias:dias,
    Pm:Pm,Vm:Pm/rhoP,rhoP:rhoP,humP:humP,sPct:sPct,filas:filas,sBruto:sBruto,sHum:sHum,sNeto:sBruto-sHum,
    ppcMuestra:Pm/(habM*dias),
    clas:{ap:cl("ap",true),noap:cl("ap",false),org:cl("org",true),inorg:cl("org",false),pel:cl("pel",true),nopel:cl("pel",false)}};}

/* ==========================================================
   5. PPC Y GENERACIÓN
   ========================================================== */
function rsGeneracion(serie,C){
  var ppc0=rsN("rsPPC"), v=rsN("rsVarPPC",0);
  var aG=0,aV=0,aL=0;
  return serie.map(function(r){
    var ppc=ppc0*Math.pow(1+v,r.t), Gd=r.pob*ppc, Ga=Gd*365, Vd=Gd/C.rhoP, Va=Vd*365, Ld=Gd*C.humP/1000, La=Ld*365;
    aG+=Ga;aV+=Va;aL+=La;
    return {t:r.t,anio:r.anio,pob:r.pob,ppc:ppc,Gd:Gd,Ga:Ga,Gac:aG,Vd:Vd,Va:Va,Vac:aV,Ld:Ld,La:La,Lac:aL};});}

/* ==========================================================
   6. METAS DE APROVECHAMIENTO
   ========================================================== */
/* Plazos de las metas: corto = 1/3, mediano = 2/3 y largo = 3/3 del tiempo de vida útil (T.V.U.) */
function rsLimitesPlazo(){var n=rsSerie().length?rsSerie().length-1:rsN("duracion",0);return {c:Math.round(n/3),m:Math.round(2*n/3),n:n};}
function rsPlazo(t,L){L=L||rsLimitesPlazo();return t<=L.c?"corto":t<=L.m?"mediano":"largo";}
function rsMetas(G,C){
  var excluir=PRO.rsPeligrosos===PELIGROSOS_RS[1],LP=rsLimitesPlazo();
  return C.filas.map(function(f,i){
    var r=(PRO.rsResiduos||[])[i]||{}, frac=C.sPct>0?f.pct/C.sPct:0;
    var aG=0,aA=0,aN=0,vG=0,vA=0,vN=0;
    var anios=G.map(function(g){
      var pl=rsPlazo(g.t,LP), meta=(Number(pl==="corto"?r.mc:pl==="mediano"?r.mm:r.ml)||0)/100;
      var gd=g.Gd*frac, ad=gd*meta, nd=gd-ad, rho=f.rho>0?f.rho:NaN;
      var o={t:g.t,anio:g.anio,pob:g.pob,plazo:pl,meta:meta,
        gen:{d:gd,a:gd*365,ac:(aG+=gd*365),vd:gd/rho,va:gd*365/rho,vac:(vG+=gd*365/rho)},
        apr:{d:ad,a:ad*365,ac:(aA+=ad*365),vd:ad/rho,va:ad*365/rho,vac:(vA+=ad*365/rho)},
        noa:{d:nd,a:nd*365,ac:(aN+=nd*365),vd:nd/rho,va:nd*365/rho,vac:(vN+=nd*365/rho)}};
      return o;});
    return {n:f.n,frac:frac,ap:f.ap,pel:f.pel,rho:f.rho,hum:f.hum,aparte:excluir&&f.pel,mc:Number(r.mc)||0,mm:Number(r.mm)||0,ml:Number(r.ml)||0,anios:anios};});}

/* ==========================================================
   7. PRODUCCIÓN A DISPONER
   ========================================================== */
function rsProduccion(G,M){
  var aR=0,aRv=0,aA=0,aAv=0,aP=0;
  return G.map(function(g,j){
    var rel=0,relV=0,apr=0,aprV=0,parte=0,relHum=0;
    M.forEach(function(m){var y=m.anios[j];
      apr+=y.apr.d;aprV+=isFinite(y.apr.vd)?y.apr.vd:0;
      if(m.aparte){parte+=y.noa.d;}
      else{rel+=y.noa.d;relV+=isFinite(y.noa.vd)?y.noa.vd:0;relHum+=y.noa.d*m.hum/100;}});
    aR+=rel*365;aRv+=relV*365;aA+=apr*365;aAv+=aprV*365;aP+=parte*365;
    return {t:g.t,anio:g.anio,pob:g.pob,Gd:g.Gd,relD:rel,relTd:rel/1000,relA:rel*365,relAc:aR,relVd:relV,relVa:relV*365,relVac:aRv,
      relHumD:relHum,aprD:apr,aprA:apr*365,aprAc:aA,aprVd:aprV,aprVa:aprV*365,aprVac:aAv,parteD:parte,parteAc:aP,
      pctApr:g.Gd>0?apr/g.Gd:0};});}

/* ==========================================================
   8. CELDAS Y TRINCHERAS
   ========================================================== */
function rsCeldas(P){
  var H=rsN("rsHCelda"),hA=rsN("rsHAmort",0),hB=rsN("rsHBent",0),hI=rsN("rsHInter",0),hF=rsN("rsHFinal",0),nv=rsN("rsNiveles",1);
  var rc=rsN("rsDensComp"),rb=rsN("rsRhoBent"),rollo=rsN("rsRollo"),Ad=rsN("rsArea"),prof=rsN("rsProfTrinchera");
  var huI=H-hI-hB-hA, huF=H-hF-hB-hA, cap=(nv-1)*huI+huF;
  var ac={cel:0,area:0,vol:0,bent:0,amort:0,inter:0,fin:0,geo:0},vida=null,excede=null;
  var filas=P.map(function(p){
    var Vd=p.relTd/rc, L=Math.sqrt(Vd/huI), Ac=L*L, Va=Vd*365, At=Va/cap;
    ac.cel+=365;ac.vol+=Va;ac.area+=At/10000;
    var bd=Ac*hB*rb, amd=Ac*hA, id=Ac*hI, fa=At*hF, gd=Ac/rollo;
    ac.bent+=bd*365;ac.amort+=amd*365;ac.inter+=id*365;ac.fin+=fa;ac.geo+=gd*365;
    var pct=Ad>0?ac.area/Ad:NaN, est=ac.area<=Ad?"OK":ac.area<=Ad*1.1?"LÍMITE":"EXCEDE";
    if(est==="OK")vida=p.anio;else if(excede===null)excede=p.anio;
    return {t:p.t,anio:p.anio,Td:p.relTd,Vd:Vd,L:L,Ac:Ac,celD:1,celA:365,celAc:ac.cel,Va:Va,At:At,AtHa:At/10000,AreaAc:ac.area,VolAc:ac.vol,pct:pct,est:est,
      bentD:bd,bentA:bd*365,bentAc:ac.bent,amortD:amd,amortA:amd*365,amortAc:ac.amort,interD:id,interA:id*365,interAc:ac.inter,finA:fa,finAc:ac.fin,geoD:gd,geoA:gd*365,geoAc:ac.geo};});
  return {H:H,hA:hA,hB:hB,hI:hI,hF:hF,nv:nv,rc:rc,rb:rb,rollo:rollo,Ad:Ad,prof:prof,huI:huI,huF:huF,cap:cap,filas:filas,vida:vida,excede:excede,
    total:{cel:ac.cel,area:ac.area,vol:ac.vol,bent:ac.bent,amort:ac.amort,inter:ac.inter,fin:ac.fin,geo:ac.geo}};}

/* ==========================================================
   9. RED DE LIXIVIADOS
   ========================================================== */
function rsQllenoMan(n,D,S){var A=Math.PI*D*D/4,R=D/4;return (1/n)*A*Math.pow(R,2/3)*Math.sqrt(S);}
function rsLixiviados(P){
  var pe=rsN("rsProdEsp"),fp=rsN("rsFpLix"),n=rsN("rsN"),vmin=rsN("rsVmin"),vmax=rsN("rsVmax"),Dmin=rsN("rsDmin"),Smin=rsN("rsSmin");
  var filas=P.map(function(p){var Qm=p.relTd*pe,Qd=Qm*fp;return {t:p.t,anio:p.anio,Td:p.relTd,pe:pe,Qm:Qm,fp:fp,Qd:Qd,Qds:Qd/86400,Qhum:p.relHumD/1000};});
  var Qmax=filas.reduce(function(a,f){return Math.max(a,f.Qds);},0);
  var tramos=(PRO.rsTramosLix||[]).map(function(t){
    var frac=Number(t.frac)||0,L=Number(t.L)||0,S=Number(t.S)||0,D=Number(t.D)||0,Q=Qmax*frac;
    var A=Math.PI*D*D/4,R=D/4,Qll=rsQllenoMan(n,D,S),V=Qll/A;
    var Dreq=Math.pow(Q*n/(0.3117*Math.sqrt(S)),3/8), Dsug=DP_RS.diametroComercial(Math.max(Dreq,Dmin));
    return {n:t.n,frac:frac,Q:Q,L:L,S:S,D:D,A:A,R:R,Qll:Qll,V:V,rel:Qll>0?Q/Qll:NaN,Dreq:Dreq,Dsug:Dsug,
      okQ:Qll>=Q,okV:V>=vmin&&V<=vmax,okD:D>=Dmin-1e-9,okS:S>=Smin-1e-12};});
  return {pe:pe,fp:fp,n:n,vmin:vmin,vmax:vmax,Dmin:Dmin,Smin:Smin,filas:filas,Qmax:Qmax,tramos:tramos};}

/* ==========================================================
   10. PISCINAS DE LIXIVIADOS
   ========================================================== */
function rsPiscinas(X){
  var dias=rsN("rsDias"),res=rsN("rsReserva",0),bl=rsN("rsBL"),h=rsN("rsHPis"),z=rsN("rsTalud"),r=rsN("rsRelLA"),Pp=rsN("rsPrecip",0),Ev=rsN("rsEvap",0),cap=rsN("rsCapTrat",0);
  var ult=X.filas[X.filas.length-1]||{Qm:NaN};
  var Q=ult.Qm, Vaut=Q*dias, Vres=Vaut*res, Vreq=Vaut+Vres, Am=Vreq/h, Lm=Math.sqrt(Am*r), Wm=Lm/r;
  var Lf=Lm-z*h,Wf=Wm-z*h,Le=Lm+z*h,We=Wm+z*h,Lc=Le+2*z*bl,Wc=We+2*z*bl;
  var Af=Lf*Wf,Ae=Le*We,V=h/6*(Af+Ae+4*Lm*Wm);
  var ac=0;
  var bal=X.filas.map(function(f){var ent=f.Qm*365,tr=cap*365,pr=Ae*Pp/1000,ev=Ae*Ev/1000,net=ent-tr+pr-ev;ac+=net;
    return {anio:f.anio,Qm:f.Qm,ent:ent,tr:tr,pr:pr,ev:ev,net:net,ac:ac};});
  return {anio:ult.anio,Q:Q,dias:dias,res:res,bl:bl,h:h,z:z,r:r,Pp:Pp,Ev:Ev,cap:cap,Vaut:Vaut,Vres:Vres,Vreq:Vreq,Am:Am,Lm:Lm,Wm:Wm,
    Lf:Lf,Wf:Wf,Le:Le,We:We,Lc:Lc,Wc:Wc,Af:Af,Ae:Ae,V:V,okV:V>=Vreq-1e-6,okF:Lf>0&&Wf>0,Htot:h+bl,bal:bal};}

/* ==========================================================
   11. RED DE GASES
   ========================================================== */
function rsGases(P,Cel){
  var met=METODOS_GAS_RS.indexOf(PRO.rsMetGas)>=0?PRO.rsMetGas:METODOS_GAS_RS[0], land=met===METODOS_GAS_RS[0];
  var fb=rsN("rsFb"),L0=rsN("rsL0"),k=rsN("rsK"),ch4=rsN("rsCH4"),ef=rsN("rsEfCap"),fp=rsN("rsFpGas"),sep=rsN("rsSepPozos"),qp=rsN("rsQPozo"),sc=rsN("rsSepCond");
  var M=P.map(function(p){return p.relA/1000;});
  var filas=P.map(function(p,j){
    var Q=0;
    if(land){for(var i=0;i<=j;i++)Q+=k*L0*fb*M[i]*Math.exp(-k*(j-i));}
    else Q=M[j]*fb*L0;
    var bio=Q/ch4, cap=bio*ef, Qd=cap*fp/8760, area=Cel&&Cel.filas[j]?Cel.filas[j].AreaAc*10000:0;
    var pq=Math.ceil(Qd/qp), pa=Math.ceil(area/(sep*sep)), pz=Math.max(pq,pa);
    return {t:p.t,anio:p.anio,M:M[j],ch4:Q,bio:bio,cap:cap,Qd:Qd,pq:pq,pa:pa,pozos:pz};});
  var Qmax=filas.reduce(function(a,f){return Math.max(a,f.Qd);},0);
  var tramos=(PRO.rsTramosGas||[]).map(function(t){
    var frac=Number(t.frac)||0,L=Number(t.L)||0,S=Number(t.S)||0,D=Number(t.D)||0,vo=Number(t.v)||0,Q=Qmax*frac,Qs=Q/3600;
    var A=Math.PI*D*D/4,V=A>0?Qs/A:NaN,Dreq=vo>0?Math.sqrt(4*Qs/(Math.PI*vo)):NaN,nc=sc>0?Math.ceil(L/sc):0;
    return {n:t.n,frac:frac,Q:Q,Qs:Qs,L:L,S:S,D:D,vo:vo,A:A,V:V,Dreq:Dreq,Dsug:DP_RS.diametroComercial(Dreq||0),nc:nc,okV:V<=vo+1e-9,okS:S>=0.01-1e-12};});
  return {met:met,land:land,fb:fb,L0:L0,k:k,ch4:ch4,ef:ef,fp:fp,sep:sep,qp:qp,sc:sc,filas:filas,Qmax:Qmax,tramos:tramos};}

/* ==========================================================
   12. DISEÑO COMPLETO Y AÑO DE LA MEMORIA
   ========================================================== */
function rsTodo(){
  var S=rsSerie(); if(!S.length)return {ok:false,serie:S};
  var C=rsCaracterizacion(S), G=rsGeneracion(S,C), M=rsMetas(G,C), P=rsProduccion(G,M), Cel=rsCeldas(P), X=rsLixiviados(P), Pi=rsPiscinas(X), Ga=rsGases(P,Cel);
  return {ok:true,serie:S,C:C,G:G,M:M,P:P,Cel:Cel,X:X,Pi:Pi,Ga:Ga,
    nivel:DP_RS.nivelComplejidad(S[S.length-1].pob),anioIni:S[0].anio,anioFin:S[S.length-1].anio};}

/* Año que se detalla en las memorias de cálculo (común a todos los módulos) */
function rsAnioMemo(D){
  var a=Number(PRO.rsAnioMemo);
  if(!D||!D.ok)return null;
  if(!(a>=D.anioIni&&a<=D.anioFin))a=D.anioFin;
  return a;}
function rsIdx(D,anio){return D.serie.findIndex(function(r){return r.anio===anio;});}
