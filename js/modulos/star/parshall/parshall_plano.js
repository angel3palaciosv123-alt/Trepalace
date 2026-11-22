/* ##########################################################
   STAR · SISTEMAS DE TRATAMIENTO DE AGUA RESIDUAL
   MÓDULO CANALETA PARSHALL — parshall_plano.js
   Planos de construcción en AutoCAD (DXF) a partir de los resultados del módulo:
     PAR-01  Planta general y corte longitudinal A-A, cuadro de dimensiones
     PAR-02  Cortes transversales B-B, C-C, D-D y E-E, cuadro de secciones
     PAR-03  Vistas isométricas
     Archivo aparte: modelo 3D (abre en vista isométrica)
   Botón EXPORTAR: exportarParshall_STAR() (registrado en parshall.js → exportar.generar).
   Sufijo: las funciones y variables globales de este archivo terminan en _STAR.
   ########################################################## */

/* Datos del plano a partir del análisis de la plataforma (a = parAnalizar_STAR()) */
function parDatosPlano_STAR(a){
  var f=a.sel.f,r=a.sel.r;
  return {lab:f.lab,W:f.W,D:f.D/100,C:f.C/100,B:f.B/100,F:f.F/100,G:f.G/100,E:f.E/100,A:f.A/100,
    N:r.N,K:r.Kd,X:r.X,ha:r.ha,h2:r.h2,h3:r.h3,h4:r.h4,h5:r.h5,BL:r.BL,E1:r.E1,Wa:r.Wa,Fr:r.Fr,tipo:r.tipo,Q:r.Q,
    t:Number(PRO.parTmuro)||0.15,ts:Number(PRO.parTlosa)||0.15,Lent:Number(PRO.parLent)||0.30,Lsal:Number(PRO.parLsal)||0.60};}

/* ---------- Geometría (x = flujo, y = transversal, z = cota; z = 0 en la cresta) ---------- */
function parGeometria_STAR(d){
  var g={},x1=0,xg=d.B,x2=d.B+d.F,x4=d.B+d.F+d.G;
  g.x0=-d.Lent;g.x1=x1;g.xg=xg;g.x2=x2;g.x3=x2+0.4*d.G;g.x4=x4;g.xs=x4+d.Lsal;
  g.zsal=-(d.K+d.X);g.zmuroSal=g.zsal+d.h5+d.BL;g.zagua2=-d.N+d.h3;
  g.ancho=function(x){if(x<=x1)return d.D/2;if(x<=xg)return d.D/2+(d.W/2-d.D/2)*(x-x1)/d.B;if(x<=x2)return d.W/2;if(x<=x4)return d.W/2+(d.C/2-d.W/2)*(x-x2)/d.G;return d.C/2;};
  g.fondo=function(x,lado){if(x<=xg)return 0;if(x<x2)return -d.N*(x-xg)/d.F;if(x<x4||(x===x4&&lado<0))return -d.N+(d.N-d.K)*(x-x2)/d.G;return g.zsal;};
  g.corona=function(x,lado){return (x<x4||(x===x4&&lado<0))?d.E:g.zmuroSal;};
  var xm=d.B/2,xj1=x2+0.15*d.G,xj2=x2+0.45*d.G;
  g.agua=function(x){
    if(x<=xm)return d.ha;
    if(x<=x2){var t=(x-xm)/(x2-xm);t=t*t*(3-2*t);return d.ha+(-d.N+d.h2-d.ha)*t;}
    if(x<=xj1)return -d.N+d.h2;
    if(x<=xj2)return -d.N+d.h2+(d.h3-d.h2)*(x-xj1)/(xj2-xj1);
    return g.zagua2;};
  g.estAgua=[g.x0,xm];for(var k=1;k<=10;k++)g.estAgua.push(xm+(x2-xm)*k/10);g.estAgua.push(xj1,xj2,x4,g.xs);
  return g;}

/* ---------- Cuerpos 3D cerrados: losa (sigue el fondo), muros, muro de caída y agua ---------- */
function parCuerpos3D_STAR(d,g){
  var C=[],CARAS=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]];
  var sec=function(x,y1,y2,za,zb){return [[x,y1,za],[x,y2,za],[x,y2,zb],[x,y1,zb]];};
  function orientar(v){var c=[0,0,0];v.forEach(function(p){c[0]+=p[0]/8;c[1]+=p[1]/8;c[2]+=p[2]/8;});
    return CARAS.map(function(f){var a=v[f[0]],b=v[f[1]],e=v[f[2]],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[e[0]-a[0],e[1]-a[1],e[2]-a[2]];
      var n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],m=[0,0,0];f.forEach(function(i){m[0]+=v[i][0]/4;m[1]+=v[i][1]/4;m[2]+=v[i][2]/4;});
      return n[0]*(m[0]-c[0])+n[1]*(m[1]-c[1])+n[2]*(m[2]-c[2])<0?f.slice().reverse():f;});}
  var prisma=function(capa,A,B,extra){var v=A.concat(B),o={capa:capa,v:v,f:orientar(v)};for(var k in extra)o[k]=extra[k];C.push(o);};
  var est=[g.x0,g.x1,g.xg,g.x2,g.x4,g.xs],t=d.t,ts=d.ts;
  for(var i=0;i+1<est.length;i++){
    var a=est[i],b=est[i+1],wa=g.ancho(a),wb=g.ancho(b),fa=g.fondo(a,1),fb=g.fondo(b,-1),ca=g.corona(a,1),cb=g.corona(b,-1);
    prisma("TRP-3D-CONCRETO",sec(a,-wa-t,wa+t,fa-ts,fa),sec(b,-wb-t,wb+t,fb-ts,fb));
    [1,-1].forEach(function(s){prisma("TRP-3D-CONCRETO",sec(a,s*wa,s*(wa+t),fa,ca),sec(b,s*wb,s*(wb+t),fb,cb),{muro:s});});}
  var w4=g.ancho(g.x4);
  prisma("TRP-3D-CONCRETO",sec(g.x4-t,-w4-t,w4+t,g.zsal-ts,g.fondo(g.x4-t,-1)-ts),sec(g.x4,-w4-t,w4+t,g.zsal-ts,-d.K-ts));
  for(i=0;i+1<g.estAgua.length;i++){var p=g.estAgua[i],q=g.estAgua[i+1];
    prisma("TRP-3D-AGUA",sec(p,-g.ancho(p),g.ancho(p),g.fondo(p,1),g.agua(p)),sec(q,-g.ancho(q),g.ancho(q),g.fondo(q,-1),g.agua(q)),{agua:true});}
  return C;}

/* ---------- Cuadro de convenciones ---------- */
function parConvenciones_STAR(P,x,y,h){
  var W=2.2,hf=h*3.4,yy=y;
  P.rellenar([[x,yy-hf],[x+W,yy-hf],[x+W,yy],[x,yy]],"TRP-TABLAS-RELL");P.rect(x,yy-hf,x+W,yy,"TRP-TABLAS");
  P.texto(x+W/2,yy-hf/2,"CONVENCIONES",h*1.1,{capa:"TRP-TITULOS",al:"c",va:"m",negrita:true});yy-=hf;
  var item=function(dib,txt){P.rect(x,yy-hf,x+W,yy,"TRP-TABLAS");dib(x+0.12,yy-hf+0.035,0.42,hf-0.07);P.texto(x+0.7,yy-hf/2,txt,h,{capa:"TRP-TEXTOS",va:"m"});yy-=hf;};
  item(function(a,b,w,hh){P.concreto([[a,b],[a+w,b],[a+w,b+hh],[a,b+hh]],0.7);},"Concreto reforzado");
  item(function(a,b,w,hh){P.agua([[a,b],[a+w,b],[a+w,b+hh],[a,b+hh]]);P.linea(a,b+hh,a+w,b+hh,"TRP-AGUA");},"Lámina de agua");
  item(function(a,b,w,hh){P.linea(a,b+hh/2,a+w,b+hh/2,"TRP-EJES");},"Eje de la estructura");
  item(function(a,b,w,hh){P.linea(a,b+hh/2,a+w,b+hh/2,"TRP-OCULTAS");},"Arista oculta / cambio de pendiente");
  item(function(a,b,w,hh){P.nivel(a+0.1,b+0.02,"",h*0.8);},"Nivel (m), referido a la cresta");
  item(function(a,b,w,hh){P.cotaH(a,b+hh*0.3,a+w,b+hh*0.3,b+hh*0.3,"",h*0.7);},"Cota (m)");
  return yy;}

/* ==========================================================
   PLANOS DE CONSTRUCCIÓN (DXF 2D) — escala automática; u = esc/25 ajusta textos y separaciones
   ========================================================== */
function planoParshall_STAR(d,meta){
  var g=parGeometria_STAR(d);meta.totalHojas=4;meta.unidad=meta.unidad||"CANALETA PARSHALL";
  var P=nuevoPlano(meta);
  var nf3=fmt3_STAR,niv=function(v){return "N "+(v>=0?"+":"")+nf3(v);};
  var t=d.t,ts=d.ts,Lt=g.xs-g.x0,Hc=d.E-(g.zsal-ts);
  /* Una vista por lámina, ajustada a toda la hoja y solo con convenciones:
     PAR-01 planta · PAR-02 corte A-A · PAR-03 cortes B-B y C-C · PAR-04 cortes D-D y E-E */
  var esc=25,u,mm=function(v){return v*esc/1000;},tc,tt,tx;
  var fijar=function(x){esc=x;u=esc/25;tc=0.06*u;tt=0.11*u;tx=0.055*u;};fijar(25);
  var conv=function(x){desConvenciones_STAR(P,0,0,x*0.118,x*0.002,x/25*0.8,2);};
  var ox=-g.x0,oyP=0,X=function(x){return ox+x;},cortes,tramos;

  /* ================= PAR-01 · PLANTA GENERAL ================= */
  P.hojaAjustada({titulo:"Planta general",numero:"PAR-01",ancho:Lt,alto:d.D+2*t,conv:conv},function(x){fijar(x);
  var est=[g.x0,g.x1,g.xg,g.x2,g.x4,g.xs];
  var inn=function(s){return est.map(function(x){return [X(x),oyP+s*g.ancho(x)];});};
  P.agua(inn(1).concat(inn(-1).reverse()));
  [1,-1].forEach(function(s){var ext=est.map(function(x){return [X(x),oyP+s*(g.ancho(x)+t)];});P.concreto(inn(s).concat(ext.reverse()),u);});
  [g.xg,g.x2].forEach(function(x){P.linea(X(x),oyP-g.ancho(x),X(x),oyP+g.ancho(x),"TRP-OCULTAS");});
  P.linea(X(g.x4),oyP-g.ancho(g.x4),X(g.x4),oyP+g.ancho(g.x4),"TRP-ELEVACION");
  P.linea(X(g.x0)-0.25*u,oyP,X(g.xs)+0.25*u,oyP,"TRP-EJES");
  P.linea(X(g.x0)+0.08*u,oyP+0.1*u,X(g.x0)+0.48*u,oyP+0.1*u,"TRP-TEXTOS");P.solido([[X(g.x0)+0.48*u,oyP+0.135*u],[X(g.x0)+0.48*u,oyP+0.065*u],[X(g.x0)+0.6*u,oyP+0.1*u]],"TRP-TEXTOS");
  P.texto(X(g.x0)+0.08*u,oyP+0.15*u,"FLUJO",tx,{capa:"TRP-TEXTOS"});
  var xp=g.x1+d.B/3,yp=g.ancho(xp)+t/2;
  P.circulo(X(xp),oyP+yp,0.04*u,"TRP-CORTES");P.linea(X(xp)+0.03*u,oyP+yp+0.03*u,X(xp)+0.3*u,oyP+yp+0.32*u,"TRP-TEXTOS");P.linea(X(xp)+0.3*u,oyP+yp+0.32*u,X(xp)+1.55*u,oyP+yp+0.32*u,"TRP-TEXTOS");
  P.texto(X(xp)+0.33*u,oyP+yp+0.35*u,"PIEZÓMETRO Ha  (a A/3 = "+nf3(d.A/3)+" del inicio del convergente)",tx,{capa:"TRP-TEXTOS"});
  [["CONVERGENTE",(g.x1+g.xg)/2],["GARGANTA",(g.xg+g.x2)/2],["DIVERGENTE",(g.x2+g.x4)/2],["CANAL DE SALIDA",(g.x4+g.xs)/2]].forEach(function(z){
    P.texto(X(z[1]),oyP-0.1*u,z[0],tx,{capa:"TRP-TEXTOS",al:"c",va:"m"});});
  cortes=[["B",g.x1+0.001,"SECCIÓN 1 · ENTRADA"],["C",g.x2,"SECCIÓN 2 · GARGANTA"],["D",g.x3,"SECCIÓN 3 · DIVERGENTE"],["E",g.x4-0.001,"SECCIÓN 4 · SALIDA"]];
  cortes.forEach(function(c){var w=g.ancho(c[1])+t+0.18*u;P.llamadaCorte(X(c[1]),oyP-w,X(c[1]),oyP+w,c[0],tc,-1);});
  P.llamadaCorte(X(g.x0)-0.2*u,oyP,X(g.xs)+0.2*u,oyP,"A",tc,1);
  var yb=oyP-d.D/2-t,yc1=yb-0.32*u,yc2=yc1-0.2*u;
  tramos=[[g.x0,g.x1,nf3(d.Lent)],[g.x1,g.xg,"B = "+nf3(d.B)],[g.xg,g.x2,"F = "+nf3(d.F)],[g.x2,g.x4,"G = "+nf3(d.G)],[g.x4,g.xs,nf3(d.Lsal)]];
  tramos.forEach(function(c){
    P.cotaH(X(c[0]),oyP-g.ancho(c[0]+(c[0]===g.x4?1e-6:0))-t,X(c[1]),oyP-g.ancho(c[1]-(c[1]===g.x4?1e-6:0))-t,yc1,c[2],tc);});
  P.cotaH(X(g.x0),yb,X(g.xs),yb,yc2,"LONGITUD TOTAL = "+nf3(Lt),tc);
  P.cotaV(X(g.x1),oyP-d.D/2,X(g.x1),oyP+d.D/2,X(g.x0)-0.45*u,"D = "+nf3(d.D),tc);
  P.cotaV(X(g.x0),oyP-d.D/2-t,X(g.x0),oyP+d.D/2+t,X(g.x0)-0.68*u,nf3(d.D+2*t),tc);
  P.cotaV(X(g.xg+0.12*u),oyP-d.W/2,X(g.xg+0.12*u),oyP+d.W/2,X(g.xg+0.12*u),"W = "+nf3(d.W),tc);
  P.cotaV(X(g.xs),oyP-d.C/2,X(g.xs),oyP+d.C/2,X(g.xs)+0.55*u,"C = "+nf3(d.C),tc);
  P.cotaV(X(g.xs),oyP+d.C/2,X(g.xs),oyP+d.C/2+t,X(g.xs)+0.55*u,nf3(t),tc);
  P.tituloVista(X((g.x0+g.xs)/2),oyP+d.D/2+t+0.85*u,"PLANTA GENERAL",esc,tt);

  });

  /* ================= PAR-02 · CORTE LONGITUDINAL A-A ================= */
  P.hojaAjustada({titulo:"Corte longitudinal A-A",numero:"PAR-02",ancho:Lt,alto:Hc,conv:conv},function(x){fijar(x);
  var oyC=0,Z=function(z){return oyC+z;};
  var fl=[[g.x0,0],[g.xg,0],[g.x2,-d.N],[g.x4,-d.K],[g.x4,g.zsal],[g.xs,g.zsal]];
  var xt=g.x4-t,inf=[[g.xs,g.zsal-ts],[xt,g.zsal-ts],[xt,g.fondo(xt,-1)-ts],[g.x2,-d.N-ts],[g.xg,-ts],[g.x0,-ts]];
  var su=[];for(var k=0;k<=80;k++){var xx=g.x0+(g.xs-g.x0)*k/80;su.push([X(xx),Z(g.agua(xx))]);}
  var fondoDet=[[g.xs,g.zsal],[g.x4,g.zsal],[g.x4,-d.K],[g.x2,-d.N],[g.xg,0],[g.x0,0]].map(function(q){return [X(q[0]),Z(q[1])];});
  P.agua(su.concat(fondoDet));P.polilinea(su,false,"TRP-AGUA");
  P.polilinea([[X(g.x0),Z(0)],[X(g.x0),Z(d.E)],[X(g.x4),Z(d.E)],[X(g.x4),Z(g.zmuroSal)],[X(g.xs),Z(g.zmuroSal)],[X(g.xs),Z(g.zsal)]],false,"TRP-ELEVACION");
  [g.x1,g.xg,g.x2].forEach(function(x){P.linea(X(x),Z(g.fondo(x,1)),X(x),Z(d.E),"TRP-OCULTAS");});
  P.concreto(fl.concat(inf).map(function(q){return [X(q[0]),Z(q[1])];}),u);
  /* niveles: hacia afuera de la estructura */
  P.linea(X(g.x0)-0.55*u,Z(0),X(g.x0),Z(0),"TRP-ELEVACION");P.nivel(X(g.x0)-0.1*u,Z(0),niv(0)+" CRESTA",tx,{izq:true});
  P.linea(X(g.x0)-0.55*u,Z(d.E),X(g.x0),Z(d.E),"TRP-ELEVACION");P.nivel(X(g.x0)-0.1*u,Z(d.E),niv(d.E)+" CORONA",tx,{izq:true});
  P.nivel(X(g.x1)+0.25*u,Z(d.ha),niv(d.ha)+" (Ha)",tx);
  P.linea(X(g.xs),Z(g.zagua2),X(g.xs)+0.55*u,Z(g.zagua2),"TRP-AGUA");P.nivel(X(g.xs)+0.12*u,Z(g.zagua2),niv(g.zagua2),tx);
  P.linea(X(g.xs),Z(g.zsal),X(g.xs)+0.55*u,Z(g.zsal),"TRP-ELEVACION");P.nivel(X(g.xs)+0.12*u,Z(g.zsal),niv(g.zsal),tx);
  P.linea(X(g.xs),Z(g.zmuroSal),X(g.xs)+0.55*u,Z(g.zmuroSal),"TRP-ELEVACION");P.nivel(X(g.xs)+0.12*u,Z(g.zmuroSal),niv(g.zmuroSal),tx);
  P.texto(X(g.x2),Z(-d.N-ts)-0.1*u,niv(-d.N)+" FONDO GARGANTA",tx,{capa:"TRP-NIVELES",al:"c"});
  P.linea(X(g.x2),Z(-d.N),X(g.x2),Z(-d.N-ts)-0.04*u,"TRP-NIVELES");
  P.texto(X(g.x2+0.3*d.G),Z(d.E)+0.1*u,"RESALTO HIDRÁULICO · Fr = "+String(Math.round(d.Fr*100)/100).replace(".",","),tx,{capa:"TRP-TEXTOS",al:"c"});
  P.cotaV(X(g.x1),Z(0),X(g.x1),Z(d.ha),X(g.x1)-0.12*u,"ha = "+nf3(d.ha),tc);
  P.cotaV(X(g.x2),Z(-d.N),X(g.x2),Z(0),X(g.xg)+0.15*u,"N = "+nf3(d.N),tc);
  P.cotaV(X(g.x4),Z(-d.K),X(g.x4),Z(0),X(g.x4)-0.14*u,"K = "+nf3(d.K),tc);
  P.cotaV(X(g.x4),Z(g.zsal),X(g.x4),Z(-d.K),X(g.x4)-0.14*u,"X = "+nf3(d.X),tc);
  var xd=X(g.xs)+1.3*u;
  P.cotaV(X(g.xs),Z(g.zsal),X(g.xs),Z(g.zagua2),xd,"h5 = "+nf3(d.h5),tc);
  P.cotaV(X(g.xs),Z(g.zagua2),X(g.xs),Z(g.zmuroSal),xd,"BL = "+nf3(d.BL),tc);
  P.cotaV(X(g.x0),Z(0),X(g.x0),Z(d.E),X(g.x0)-0.2*u,"E = "+nf3(d.E),tc);
  P.cotaV(X(g.x0),Z(-ts),X(g.x0),Z(0),X(g.x0)-0.2*u,nf3(ts),tc);
  var ycA=Z(g.zsal-ts)-0.18*u;
  tramos.forEach(function(c){P.cotaH(X(c[0]),Z(g.fondo(c[0],1)-ts),X(c[1]),Z(g.fondo(c[1],-1)-ts),ycA,c[2],tc);});
  P.tituloVista(X((g.x0+g.xs)/2),Z(d.E)+0.48*u,"CORTE LONGITUDINAL A-A",esc,tt);
  });

  /* ================= PAR-03 y PAR-04 · CORTES TRANSVERSALES (dos por lámina, a la misma escala y con la base alineada) ================= */
  var esc2=25,u2,tc2,tt2,tx2,m2=function(v){return v*esc2/1000;};
  var fijar2=function(x){esc2=x;u2=x/25;tc2=0.06*u2;tt2=0.11*u2;tx2=0.055*u2;};fijar2(25);
  var dibCorte=function(c,i){
    var x=c[1],w=g.ancho(x),fz=g.fondo(x,x>=g.x4-0.01?-1:1),top=g.corona(x,-1),zw=i===0?d.ha:i===1?-d.N+d.h2:g.zagua2;
    var gc=P.marca(),Zs=function(z){return z-fz;};
    P.agua([[-w,Zs(fz)],[w,Zs(fz)],[w,Zs(zw)],[-w,Zs(zw)]]);P.linea(-w,Zs(zw),w,Zs(zw),"TRP-AGUA");
    P.concreto([[-(w+t),fz-ts],[w+t,fz-ts],[w+t,top],[w,top],[w,fz],[-w,fz],[-w,top],[-(w+t),top]].map(function(q){return [q[0],Zs(q[1])];}),u2);
    P.linea(0,Zs(fz-ts)-0.12*u2,0,Zs(top)+0.12*u2,"TRP-EJES");
    P.linea(-w-t-0.45*u2,Zs(zw),-w-t,Zs(zw),"TRP-AGUA");P.nivel(-w-t-0.08*u2,Zs(zw),niv(zw)+" N.A.",tx2,{izq:true});
    var bajo=(zw-fz)<0.16*u2;
    if(!bajo){P.linea(-w-t-0.45*u2,Zs(fz),-w-t,Zs(fz),"TRP-ELEVACION");P.nivel(-w-t-0.08*u2,Zs(fz),niv(fz),tx2,{izq:true});}
    P.nivel(-w-t-0.08*u2,Zs(top),niv(top),tx2,{izq:true});P.linea(-w-t-0.45*u2,Zs(top),-w-t,Zs(top),"TRP-ELEVACION");
    P.cotaH(-w,Zs(fz-ts),w,Zs(fz-ts),Zs(fz-ts)-0.2*u2,nf3(2*w),tc2);
    P.cotaH(-w-t,Zs(fz-ts),w+t,Zs(fz-ts),Zs(fz-ts)-0.38*u2,nf3(2*w+2*t),tc2);
    P.cotaH(w,Zs(top),w+t,Zs(top),Zs(top)+0.14*u2,nf3(t),tc2);
    var xdd=w+t+0.16*u2;
    P.cotaV(w+t,Zs(fz-ts),w+t,Zs(fz),xdd,nf3(ts),tc2);
    if(!bajo)P.cotaV(w+t,Zs(fz),w+t,Zs(zw),xdd,nf3(zw-fz),tc2);
    P.cotaV(w+t,Zs(bajo?fz:zw),w+t,Zs(top),xdd,nf3(top-(bajo?fz:zw)),tc2);
    P.cotaV(w+t,Zs(fz-ts),w+t,Zs(top),xdd+0.2*u2,nf3(top-fz+ts),tc2);
    P.tituloVista(0,Zs(top)+0.62*u2,"CORTE "+c[0]+"-"+c[0],esc2,tt2);
    P.texto(0,Zs(top)+0.33*u2,c[2],tx2,{capa:"TRP-TEXTOS",al:"c"});
  };
  var wMax=0,hMax=0;cortes.forEach(function(c){var x=c[1],fz=g.fondo(x,x>=g.x4-0.01?-1:1);wMax=Math.max(wMax,2*(g.ancho(x)+t));hMax=Math.max(hMax,g.corona(x,-1)-fz+ts);});
  var par=function(i,lista){return P.hojaAjustada({titulo:"Cortes transversales "+cortes[i][0]+"-"+cortes[i][0]+" y "+cortes[i+1][0]+"-"+cortes[i+1][0],numero:"PAR-0"+(3+i/2),
      ancho:2*wMax+0.4,alto:hMax,conv:conv,escalas:lista},function(x){fijar2(x);
    var ga=P.marca();dibCorte(cortes[i],i);var ba=P.cajaDesde(ga),gb=P.marca();dibCorte(cortes[i+1],i+1);var bb=P.cajaDesde(gb);
    P.mover(gb,ba[2]+m2(35)-bb[0],0);});};   // la base de ambos cortes queda en la misma cota de papel
  var e0=P.estado(),r1=par(0),r2=par(2);
  if(r1.esc!==r2.esc){P.deshacer(e0[0],e0[1],e0[2]);var em=Math.max(r1.esc,r2.esc);par(0,[em]);par(2,[em]);}
  return P;}

/* ==========================================================
   MODELO 3D (archivo aparte, abre en vista isométrica)
   ========================================================== */
function modelo3DParshall_STAR(d,meta){
  var g=parGeometria_STAR(d),P=nuevoPlano(meta),C=parCuerpos3D_STAR(d,g);
  C.forEach(function(c){P.cuerpo3D(c.v,c.f,c.capa);});
  P.vistaIso([(g.x0+g.xs)/2,0,0.2],3.2,[-1,-1.2,0.9]);
  return P;}

/* ==========================================================
   EXPORTAR (lo llama la ventana del botón EXPORTAR del núcleo)
   ========================================================== */
function exportarParshall_STAR(modo){
  var a=parAnalizar_STAR();
  if(!a||a.err||!a.sel||a.sel.r.err)return {error:"Primero calcula la canaleta Parshall: el módulo debe mostrar sus resultados sin errores."};
  var d=parDatosPlano_STAR(a),meta=metaPlano_STAR("CANALETA PARSHALL");
  var nombre=nombreArchivo_STAR("Canaleta_Parshall_W"+String(d.lab).replace(/[^0-9A-Za-z]+/g,""));
  var res="W = "+d.lab+" · Q = "+String(Math.round(d.Q*10000)/10).replace(".",",")+" L/s";
  if(modo==="3d"){
    var g=parGeometria_STAR(d),cu=parCuerpos3D_STAR(d,g);
    var datos=[["W","Ancho de la garganta",fmt3_STAR(d.W)+" m"],["D","Ancho a la entrada",fmt3_STAR(d.D)+" m"],["C","Ancho a la salida",fmt3_STAR(d.C)+" m"],
      ["B / F / G","Longitudes",fmt2_STAR(d.B)+" / "+fmt2_STAR(d.F)+" / "+fmt2_STAR(d.G)+" m"],["E","Profundidad",fmt3_STAR(d.E)+" m"],["N","Caída en la garganta",fmt3_STAR(d.N)+" m"],
      ["e / el","Espesor muros / losa",fmt2_STAR(d.t)+" / "+fmt2_STAR(d.ts)+" m"]];
    var et=[{p:[(g.x1+g.xg)/2,g.ancho((g.x1+g.xg)/2)+d.t,d.E],t:"CONVERGENTE · B = "+fmt3_STAR(d.B)},{p:[(g.xg+g.x2)/2,-g.ancho(g.xg)-d.t,d.E],t:"GARGANTA · W = "+d.lab},
      {p:[(g.x2+g.x4)/2,g.ancho((g.x2+g.x4)/2)+d.t,d.E],t:"DIVERGENTE · G = "+fmt3_STAR(d.G)},{p:[(g.x4+g.xs)/2,-g.ancho(g.xs)-d.t,g.zmuroSal],t:"CANAL DE SALIDA"},
      {p:[g.x0,0,-d.ts],t:"LOSA e = "+fmt2_STAR(d.ts)}];
    var et2=[{p:[g.x1*0.5+g.x0*0.5,0,d.ha],t:"Ha = "+fmt3_STAR(d.ha)},{p:[(g.xg+g.x2)/2,0,-d.N+d.h2],t:"RESALTO HIDRÁULICO"},{p:[(g.x4+g.xs)/2,0,g.zagua2],t:"h5 = "+fmt3_STAR(d.h5)}];
    return {nombre:nombre,resumen:res,lamina3D:lamina3D_STAR(meta,cu,{numero:"PAR-05",titulo:"Vistas isométricas",datos:datos,etiquetas:et,etiquetas2:et2}),modelo3D:modelo3DParshall_STAR(d,meta)};}
  return {nombre:nombre,resumen:res,planos:planoParshall_STAR(d,meta)};}
