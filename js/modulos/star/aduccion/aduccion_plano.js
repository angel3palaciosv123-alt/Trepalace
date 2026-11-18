/* ==========================================================
   VENTANA 5 — ADUCCIÓN · planos PDF/DWG  (aduccion_plano.js)
   Requiere: calcularAduccion_STAR()
   Láminas: ADU-01 canal · ADU-02 tubería · ADU-03 vistas 3D
   ========================================================== */

/* ==========================================================
   1. GEOMETRÍA DEL CANAL
   ========================================================== */

/* Sección del canal (y transversal, z desde el fondo): wb ancho de fondo, zt talud, hT altura total */
function aduSeccion_STAR(c){
  var tp=c.tp||{wb:1,z:0},e=Number(PRO.aduTmuro)||0.15,ts=Number(PRO.aduTlosa)||0.15,wb=tp.wb?c.b:0,z=tp.z||0,hT=c.h+c.BL;
  var s={e:e,ts:ts,wb:wb,z:z,hT:hT,h:c.h,BL:c.BL,
    yi:function(zz){return wb/2+z*zz;}};               // semiancho interior a la altura zz
  s.wTop=wb+2*z*hT;s.wAgua=wb+2*z*c.h;s.wExt=s.wTop+2*e;
  s.concreto=[[-s.yi(hT)-e,hT],[-s.yi(hT),hT],[-wb/2,0],[wb/2,0],[s.yi(hT),hT],[s.yi(hT)+e,hT],[wb/2+e,0],[wb/2+e,-ts],[-wb/2-e,-ts],[-wb/2-e,0]];
  s.agua=[[-wb/2,0],[wb/2,0],[s.yi(c.h),c.h],[-s.yi(c.h),c.h]];
  return s;}

/* ==========================================================
   2. PLANOS DE CONSTRUCCIÓN
   ========================================================== */

function planoAduccion_STAR(R,meta){
  var c=R.canal,t=R.tub,q=R.gol,hojas=3*((c?1:0)+(t?1:0));   // una vista por lámina, ajustada a toda la hoja: planta · perfil · sección
  meta.totalHojas=hojas;meta.unidad=meta.unidad||"ADUCCIÓN";
  var P=nuevoPlano(meta),f3=fmt3_STAR,f2=fmt2_STAR,niv=nivTxt_STAR;
  var Lt=1.8,G=0.5,Ld=2*Lt+G;                           // tramos dibujados a escala y hueco del quiebre

  /* ===================== ADU-01 · CANAL ===================== */
  if(c){
    var S=aduSeccion_STAR(c),e=S.e,ts=S.ts,hT=S.hT,W=S.wExt,dz=c.S*c.L;
    var esc=25,mm=function(v){return v*esc/1000;},h,hT_,hd_,est;
    var fijar=function(x){esc=x;h=mm(2.2);hT_=mm(4.2);hd_=mm(2.0);est=esc/25;};fijar(25);
    var conv=function(x){desConvenciones_STAR(P,0,0,x*0.116,x*0.002,x/25*0.8,2);};
    var tramos=[[0,Lt],[Lt+G,Ld]],X=function(x){return x;},Y=function(y){return y;};
    /* --- ADU-01 · PLANTA (dos tramos y quiebre) --- */
    P.hojaAjustada({titulo:"Canal de aducción: planta",numero:"ADU-01",ancho:Ld+0.6,alto:W,conv:conv},function(x){fijar(x);
    tramos.forEach(function(tr){
      P.agua([[tr[0],-S.wTop/2],[tr[1],-S.wTop/2],[tr[1],S.wTop/2],[tr[0],S.wTop/2]]);
      [1,-1].forEach(function(sg){P.concreto([[tr[0],sg*S.wTop/2],[tr[1],sg*S.wTop/2],[tr[1],sg*W/2],[tr[0],sg*W/2]],est);});
      if(S.z>0)[1,-1].forEach(function(sg){P.linea(tr[0],sg*S.wb/2,tr[1],sg*S.wb/2,"TRP-OCULTAS");});});
    [Lt,Lt+G].forEach(function(x){quiebre_STAR(P,x,-W/2-mm(2),x,W/2+mm(2),mm(1.6));});
    P.linea(-0.3,0,Ld+0.3,0,"TRP-EJES");
    P.linea(mm(3),W/2+mm(5),mm(15),W/2+mm(5),"TRP-TEXTOS");P.solido([[mm(15),W/2+mm(6)],[mm(15),W/2+mm(4)],[mm(18),W/2+mm(5)]],"TRP-TEXTOS");
    P.texto(mm(3),W/2+mm(7),"FLUJO",h*0.85);
    P.texto(Lt/2,W/2+mm(12),"DESDE LA REJILLA",h*0.85,{al:"c"});P.texto(Lt+G+Lt/2,W/2+mm(12),"HACIA EL DESARENADOR",h*0.85,{al:"c"});
    P.llamadaCorte(-0.3-mm(5),0,Ld+0.3+mm(5),0,"A",h*1.1,1);
    P.llamadaCorte(Lt*0.5,-W/2-mm(4),Lt*0.5,W/2+mm(4),"B",h*1.1,-1);
    P.cotaH(0,-W/2,Ld,-W/2,-W/2-mm(9),"L = "+f3(c.L)+" (DIBUJO CON QUIEBRE)",hd_);
    P.cotaV(Ld,-S.wTop/2,Ld,S.wTop/2,Ld+0.3+mm(22),(S.z>0?"T = ":"b = ")+f3(S.wTop),hd_);
    P.cotaV(Ld,-W/2,Ld,W/2,Ld+0.3+mm(30),f3(W),hd_);
    P.tituloVista(Ld/2,W/2+mm(24),"PLANTA",esc,hT_);
    });
    /* --- ADU-02 · PERFIL --- */
    P.hojaAjustada({titulo:"Canal de aducción: perfil longitudinal A-A",numero:"ADU-02",ancho:Ld+0.6,alto:hT+ts+c.S*Ld,conv:conv},function(x){fijar(x);
    /* --- PERFIL LONGITUDINAL A-A (pendiente S dibujada a escala sobre los tramos) --- */
    var y0=-W/2-mm(38)-hT,zf=function(x){return y0-c.S*x;};
    var Zp=function(x,z){return [x,zf(x)+z];};
    tramos.forEach(function(tr){
      P.agua([Zp(tr[0],0),Zp(tr[1],0),Zp(tr[1],c.h),Zp(tr[0],c.h)]);P.polilinea([Zp(tr[0],c.h),Zp(tr[1],c.h)],false,"TRP-AGUA");
      P.concreto([Zp(tr[0],0),Zp(tr[1],0),Zp(tr[1],-ts),Zp(tr[0],-ts)],est);
      P.polilinea([Zp(tr[0],0),Zp(tr[0],hT),Zp(tr[1],hT),Zp(tr[1],0)],false,"TRP-ELEVACION");});
    [Lt,Lt+G].forEach(function(x){var a=Zp(x,-ts),b=Zp(x,hT);quiebre_STAR(P,a[0],a[1]-mm(2),b[0],b[1]+mm(2),mm(1.6));});
    var n0=Zp(0,0),n1=Zp(Ld,0);
    P.linea(-mm(16),n0[1],0,n0[1],"TRP-ELEVACION");P.nivel(-mm(3),n0[1],niv(0)+" FONDO INICIO",h,{izq:true});
    P.linea(-mm(16),Zp(0,hT)[1],0,Zp(0,hT)[1],"TRP-ELEVACION");P.nivel(-mm(3),Zp(0,hT)[1],niv(hT)+" CORONA",h,{izq:true});
    P.linea(Ld,n1[1],Ld+mm(16),n1[1],"TRP-ELEVACION");P.nivel(Ld+mm(3),n1[1],niv(-dz)+" FONDO FINAL",h);
    var mS=Zp(Lt/2,c.h);P.texto(mS[0],mS[1]+mm(6),"S = "+f2(c.S*100)+" %  ·  Δh = S·L = "+f3(dz),h,{al:"c",rot:-Math.atan(c.S)*180/Math.PI});
    P.cotaH(0,Zp(0,-ts)[1],Ld,Zp(Ld,-ts)[1],Zp(Ld,-ts)[1]-mm(9),"L = "+f3(c.L),hd_);
    P.tituloVista(Ld/2,Zp(0,hT)[1]+mm(16),"PERFIL LONGITUDINAL A-A",esc,hT_);
    });
    /* --- ADU-03 · SECCIÓN B-B --- */
    P.hojaAjustada({titulo:"Canal de aducción: sección B-B",numero:"ADU-03",ancho:W,alto:hT+ts,conv:conv},function(x){fijar(x);var escS=x;
    var k=1,T=function(p){return [p[0]*k,p[1]*k];};
    P.agua(S.agua.map(T));P.polilinea([[-S.yi(c.h),c.h],[S.yi(c.h),c.h]].map(T),false,"TRP-AGUA");
    P.concreto(S.concreto.map(T),est/k*1.4);
    var pN=T([-S.yi(hT)-e,0]);
    P.nivel(T([0,c.h])[0]-mm(1),T([0,c.h])[1],"N.A.",h*0.9);
    var yb=T([0,-ts])[1]-mm(7);
    if(S.wb>0)P.cotaH(T([-S.wb/2,0])[0],T([0,0])[1],T([S.wb/2,0])[0],T([0,0])[1],yb,"b = "+f3(S.wb),hd_);
    P.cotaH(T([-S.wb/2-e,0])[0],T([0,-ts])[1],T([S.wb/2+e,0])[0],T([0,-ts])[1],yb-mm(7),f3(S.wb+2*e),hd_);
    P.cotaH(T([-S.yi(hT)-e,0])[0],T([0,hT])[1],T([-S.yi(hT),0])[0],T([0,hT])[1],T([0,hT])[1]+mm(5),f2(e),hd_);
    if(S.z>0)P.cotaH(T([-S.yi(hT),0])[0],T([0,hT])[1],T([S.yi(hT),0])[0],T([0,hT])[1],T([0,hT])[1]+mm(5),"T = "+f3(S.wTop),hd_);
    var xs=T([S.yi(hT)+e,0])[0]+mm(7);
    P.cotaV(xs,T([0,hT])[1],xs,T([0,c.h])[1],xs,"BL = "+f3(c.BL),hd_);
    P.cotaV(xs,T([0,c.h])[1],xs,T([0,0])[1],xs,"h = "+f3(c.h),hd_);
    P.cotaV(xs,T([0,0])[1],xs,T([0,-ts])[1],xs,f2(ts),hd_);
    P.cotaV(xs,T([0,hT])[1],xs,T([0,-ts])[1],xs+mm(8),f3(hT+ts),hd_);
    P.tituloVista(0,T([0,hT])[1]+mm(16),"SECCIÓN B-B",escS,hT_*0.9);
    });
  }

  /* ===================== ADU-02 · TUBERÍA ===================== */
  if(t){
    var Dn=t.D2||t.D,Din=t.D2in||t.Din,De=q&&q.De?q.De/1000:Dn,ep=q&&q.e?q.e/1000:Math.max(0.004,De*0.03),Di=De-2*ep,dzt=t.S*t.L;
    var nb=c?3:0,esc2=25,m2=function(v){return v*esc2/1000;},h2,hT2,hc2,est2,Dd;
    var fijar2=function(x){esc2=x;h2=m2(2.2);hT2=m2(4.2);hc2=m2(2.0);est2=esc2/25;Dd=Math.max(De,m2(1.2));};fijar2(25);
    var conv2=function(x){desConvenciones_STAR(P,0,0,x*0.116,x*0.002,x/25*0.8,2);};
    var tr2=[[0,Lt],[Lt+G,Ld]],valv;
    var tieneVal=(t.acc&&t.acc.lista||[]).some(function(a){return /v[áa]lvula/i.test(a.nom);});
    P.hojaAjustada({titulo:"Tubería de aducción: planta",numero:"ADU-0"+(nb+1),ancho:Ld+0.6,alto:De,conv:conv2},function(x){fijar2(x);
    /* --- PLANTA --- */
    tr2.forEach(function(tr){P.rellenar([[tr[0],-Dd/2],[tr[1],-Dd/2],[tr[1],Dd/2],[tr[0],Dd/2]],"TRP-AGUA-RELL");
      P.linea(tr[0],-Dd/2,tr[1],-Dd/2,"TRP-TUBERIA");P.linea(tr[0],Dd/2,tr[1],Dd/2,"TRP-TUBERIA");});
    [Lt,Lt+G].forEach(function(x){quiebre_STAR(P,x,-Dd/2-m2(3),x,Dd/2+m2(3),m2(1.6));});
    P.linea(-0.3,0,Ld+0.3,0,"TRP-EJES");
    valv=function(x,y,s){P.polilinea([[x-s,y-s*0.7],[x+s,y+s*0.7],[x+s,y-s*0.7],[x-s,y+s*0.7]],true,"TRP-TUBERIA");P.linea(x,y,x,y+s*1.4,"TRP-TUBERIA");P.linea(x-s*0.5,y+s*1.4,x+s*0.5,y+s*1.4,"TRP-TUBERIA");};
    if(tieneVal){valv(0.6,0,Math.max(Dd*0.8,m2(2.5)));P.texto(0.6,-Dd/2-m2(6),"VÁLVULA",h2*0.8,{al:"c"});}
    P.texto(Lt/2+0.4,Dd/2+m2(4),"TUBERÍA "+String(PRO.tubMat||"PVC")+" Ø "+f2(Din).replace(",00","")+"\"",h2,{al:"c"});
    P.texto(0,Dd/2+m2(12),"DESDE LA REJILLA",h2*0.85);P.texto(Ld,Dd/2+m2(12),"HACIA EL DESARENADOR",h2*0.85,{al:"d"});
    P.cotaH(0,-Dd/2,Ld,-Dd/2,-Dd/2-m2(12),"L = "+f3(t.L)+" (DIBUJO CON QUIEBRE)",hc2);
    P.llamadaCorte(-0.3-m2(5),0,Ld+0.3+m2(5),0,"A",h2*1.1,1);
    P.tituloVista(Ld/2,Dd/2+m2(26),"PLANTA",esc2,hT2);
    });
    P.hojaAjustada({titulo:"Tubería de aducción: perfil longitudinal A-A",numero:"ADU-0"+(nb+2),ancho:Ld+0.6,alto:t.S*Ld+De,conv:conv2},function(x){fijar2(x);
    /* --- PERFIL A-A --- */
    var yp=-Dd/2-m2(48),zc=function(x){return yp-t.S*x;};
    tr2.forEach(function(tr){var a=[[tr[0],zc(tr[0])],[tr[1],zc(tr[1])],[tr[1],zc(tr[1])+Dd],[tr[0],zc(tr[0])+Dd]];
      P.rellenar(a,"TRP-AGUA-RELL");P.linea(a[0][0],a[0][1],a[1][0],a[1][1],"TRP-TUBERIA");P.linea(a[3][0],a[3][1],a[2][0],a[2][1],"TRP-TUBERIA");
      P.linea(tr[0],zc(tr[0])+Dd/2,tr[1],zc(tr[1])+Dd/2,"TRP-EJES");});
    [Lt,Lt+G].forEach(function(x){quiebre_STAR(P,x,zc(x)-m2(3),x,zc(x)+Dd+m2(3),m2(1.6));});
    if(tieneVal)valv(0.6,zc(0.6)+Dd/2,Math.max(Dd*0.8,m2(2.5)));
    P.nivel(0.15,zc(0.15)+Dd,niv(0)+" CLAVE INICIO",h2);
    P.nivel(Ld-0.15,zc(Ld-0.15),niv(-dzt-Dn)+" BATEA FINAL",h2,{izq:true});
    var mt=[Lt/2+0.4,zc(Lt/2+0.4)+Dd];P.texto(mt[0],mt[1]+m2(4),"S = "+f2(t.S*100)+" %  ·  Δh = "+f3(dzt),h2,{al:"c",rot:-Math.atan(t.S)*180/Math.PI});
    P.cotaH(0,zc(0),Ld,zc(Ld),zc(Ld)-m2(10),"L = "+f3(t.L),hc2);
    P.cotaV(Ld,zc(0),Ld,zc(Ld),Ld+m2(9),"Δh = "+f3(dzt),hc2);
    P.linea(0,zc(0),Ld+m2(9),zc(0),"TRP-OCULTAS");
    P.tituloVista(Ld/2,zc(0)+Dd+m2(20),"PERFIL LONGITUDINAL A-A",esc2,hT2);
    });
    /* --- Sección del tubo --- */
    P.hojaAjustada({titulo:"Tubería de aducción: sección del tubo",numero:"ADU-0"+(nb+3),ancho:De,alto:De,conv:conv2},function(x){fijar2(x);var escT=x;
    var kt=1;
    circuloLleno_STAR(P,0,0,De/2*kt,"TRP-CONCRETO-RELL",48);P.circulo(0,0,De/2*kt,"TRP-TUBERIA");
    circuloLleno_STAR(P,0,0,Di/2*kt,"TRP-AGUA-RELL",48);P.circulo(0,0,Di/2*kt,"TRP-TUBERIA");
    P.linea(-De/2*kt-m2(3),0,De/2*kt+m2(3),0,"TRP-EJES");P.linea(0,-De/2*kt-m2(3),0,De/2*kt+m2(3),"TRP-EJES");
    P.cotaH(-De/2*kt,0,De/2*kt,0,-De/2*kt-m2(8),"De = "+f3(De),hc2);
    P.cotaV(0,Di/2*kt,0,-Di/2*kt,De/2*kt+m2(8),"Di = "+f3(Di),hc2);
    var pe=[(De+Di)/4*kt*0.7071,(De+Di)/4*kt*0.7071];P.linea(pe[0],pe[1],pe[0]+m2(8),pe[1]+m2(8),"TRP-COTAS");P.linea(pe[0]+m2(8),pe[1]+m2(8),pe[0]+m2(22),pe[1]+m2(8),"TRP-COTAS");
    P.texto(pe[0]+m2(9),pe[1]+m2(9),"e = "+f3(ep),hc2,{capa:"TRP-COTAS"});
    P.tituloVista(0,De/2*kt+m2(18),"SECCIÓN DEL TUBO",escT,hT2*0.9);
    });
  }
  return P;}

/* ==========================================================
   3. MODELO 3D
   ========================================================== */

function aduCuerpos3D_STAR(R,tramo){
  var C=[],c=R.canal,t=R.tub,yOff=0;
  if(c){
    var S=aduSeccion_STAR(c),L=Math.min(tramo||c.L,c.L),d=[L,0,-c.S*L],e=S.e,ts=S.ts,hT=S.hT,yi=S.yi;
    var sec=function(pol){return pol.map(function(p){return [0,p[0],p[1]];});};
    C.push(M3D.extruir(sec([[-S.wb/2-e,0],[S.wb/2+e,0],[S.wb/2+e,-ts],[-S.wb/2-e,-ts]]),d,"TRP-3D-CONCRETO"));
    C.push(M3D.extruir(sec([[S.wb/2,0],[yi(hT),hT],[yi(hT)+e,hT],[S.wb/2+e,0]]),d,"TRP-3D-CONCRETO"));
    C.push(M3D.extruir(sec([[-S.wb/2,0],[-S.wb/2-e,0],[-yi(hT)-e,hT],[-yi(hT),hT]]),d,"TRP-3D-CONCRETO",{muro:-1}));
    C.push(M3D.extruir(sec(S.wb>0?[[-S.wb/2,0],[S.wb/2,0],[yi(c.h),c.h],[-yi(c.h),c.h]]:[[0,0],[yi(c.h),c.h],[-yi(c.h),c.h]]),d,"TRP-3D-AGUA",{agua:true}));
    yOff=S.wExt/2+0.8;}
  if(t){
    var Dn=t.D2||t.D,q=R.gol,De=q&&q.De?q.De/1000:Dn,Lt=Math.min(tramo||t.L,t.L),y=c?yOff+De/2:0;
    C.push(M3D.cilindro([0,y,De/2],[Lt,y,De/2-t.S*Lt],De/2,20,"TRP-TUBERIA",{color:253}));}
  return C;}

/* ==========================================================
   4. EXPORTAR (lo llama exportar.js)
   ========================================================== */

function aduEtiquetas_STAR(R,corte){
  var E=[],c=R.canal,t=R.tub,yOff=0;
  if(c){var S=aduSeccion_STAR(c);
    E.push(corte?{p:[1.5,0,c.h-c.S*1.5],t:"LÁMINA DE AGUA h = "+fmt3_STAR(c.h)}:{p:[1.0,S.wExt/2,S.hT-c.S*1.0],t:"CANAL "+String(c.tipo||"").toUpperCase()+" "+fmt3_STAR(S.wb||c.b)+" × "+fmt3_STAR(S.hT)});
    if(!corte)E.push({p:[3.0,0,-S.ts-c.S*3.0],t:"PENDIENTE S = "+fmt2_STAR(c.S*100)+" %"});
    yOff=S.wExt/2+0.8;}
  if(t&&!corte){var De=(R.gol&&R.gol.De?R.gol.De/1000:(t.D2||t.D)),y=c?yOff+De/2:0;
    E.push({p:[2.0,y,De-t.S*2.0],t:"TUBERÍA "+String(PRO.tubMat||"PVC")+" Ø "+fmt2_STAR(t.D2in||t.Din).replace(",00","")+"\""});}
  return E;}

function exportarAduccion_STAR(modo,parte){
  var R=null;try{if(PRO.Q&&PRO.REJ)R=calcularAduccion_STAR();}catch(_){R=null;}
  if(!R||R.distErr.length)return {error:"Primero completa el cálculo de la aducción."};
  if(R.canalErr.length)R.canal=null;
  if(R.tubErr.length)R.tub=null;
  if(parte==='canal'){R.tub=null;R.gol=null;}else if(parte==='tuberia')R.canal=null;
  if(!R.canal&&!R.tub)return {error:parte==="tuberia"?"La tubería de aducción todavía tiene errores o datos incompletos.":parte==="canal"?"El canal de aducción todavía tiene errores o datos incompletos.":"La aducción no tiene resultados sin errores (ni canal ni tubería) para dibujar."};
  var meta=metaPlano_STAR("ADUCCIÓN"),nombre=nombreArchivo_STAR("Aduccion"),
      res=(R.canal?"Canal "+fmt3_STAR(R.canal.b)+" × "+fmt3_STAR(R.canal.h)+" m":"")+(R.canal&&R.tub?" · ":"")+(R.tub?"Tubería Ø "+fmt2_STAR(R.tub.D2in||R.tub.Din)+"\"":"");
  if(modo==="3d"){
    var cuL=aduCuerpos3D_STAR(R,3.0),cuM=aduCuerpos3D_STAR(R,null),datos=[];
    if(R.canal)datos.push(["b","Ancho del canal",fmt3_STAR(R.canal.b)+" m"],["h","Lámina de agua",fmt3_STAR(R.canal.h)+" m"],["BL","Borde libre",fmt3_STAR(R.canal.BL)+" m"],
      ["L","Longitud del canal",fmt2_STAR(R.canal.L)+" m"],["S","Pendiente",fmt2_STAR(R.canal.S*100)+" %"]);
    if(R.tub)datos.push(["D","Diámetro de la tubería",fmt2_STAR(R.tub.D2in||R.tub.Din)+" in"],["Lt","Longitud de la tubería",fmt2_STAR(R.tub.L)+" m"]);
    datos.push(["—","Lámina: tramo típico de 3,0 m",""]);
    return {nombre:nombre,resumen:res,lamina3D:lamina3D_STAR(meta,cuL,{numero:"ADU-0"+(3*((R.canal?1:0)+(R.tub?1:0))+1),titulo:"Vistas isométricas (tramo típico)",datos:datos,etiquetas:aduEtiquetas_STAR(R),etiquetas2:aduEtiquetas_STAR(R,true)}),
      modelo3D:modelo3DAuto_STAR(cuM,meta)};}
  return {nombre:nombre,resumen:res,planos:planoAduccion_STAR(R,meta)};}
