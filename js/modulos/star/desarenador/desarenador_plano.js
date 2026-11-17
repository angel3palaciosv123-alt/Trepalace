/* ##########################################################
   STAR · SISTEMAS DE TRATAMIENTO DE AGUA RESIDUAL
   MÓDULO DESARENADOR — desarenador_plano.js
   Planos de construcción (DXF / PDF) y modelo 3D a partir de calcularDesarenador_STAR():
     DES-01  Planta general, corte longitudinal A-A, cuadro de dimensiones y datos hidráulicos
     DES-02  Corte transversal B-B y deflector con orificios
     DES-03  Detalle 1 · plataforma de entrada      DES-04  Detalle 2 · plataforma de salida
     DES-05  Vistas isométricas (PDF 3D) · modelo 3D por capas (DWG 3D)
   Funcionamiento dibujado (Clase No. 4): tubería de llegada → plataforma de entrada (altura Hp hasta
   la cresta y lámina HL sobre ella) → vertedero de entrada con la cresta al nivel del agua del
   desarenador → deflector 1 (L/4) → zona de sedimentación y tolva de lodos (punto bajo a L/3) →
   deflector 2 (15·hv) → vertedero de salida (lámina hv) → plataforma de salida (Hp) → tubería de salida.
   Sufijo: las funciones y variables globales de este archivo terminan en _STAR.
   ########################################################## */

/* ---------- Geometría común (x = flujo, y = transversal, z = cota; N.A. del desarenador = 0) ----------
   ll = conducto de llegada {tipo:"tubo"|"canal", D:altura, W:ancho, lab} */
function desGeom_STAR(r,ll){
  ll=ll||{tipo:"tubo",D:0.1524,W:0.1524,lab:"Ø 6\""};
  var g={e:Number(PRO.desTmuro)||0.20,ts:Number(PRO.desTlosa)||0.20,td:Number(PRO.desTdef)||0.06,ll:ll,D:ll.D,W:ll.W||ll.D,Ds:0.1524,labS:"Ø 6\"",tubo:Number(PRO.desLtubo)||0.70};   // ventana de exportar
  g.xa=-(2*g.e+r.bp);g.xb=r.L+2*g.e+r.bp;g.xI=g.xa-g.tubo;g.xF=g.xb+g.tubo;
  g.xd1=r.L/4;g.xd2=r.L-r.Lds;
  g.zFe=-r.Hp;                         // fondo de la plataforma de entrada (cresta en 0, Hp bajo ella)
  g.zFs=-r.hv-r.Hp;                    // fondo de la plataforma de salida (cresta en −hv, Hp bajo ella)
  g.dS=Math.max(0.02,Math.min(0.7*g.Ds,0.8*r.Hp));        // lámina en la plataforma de salida
  g.yll=Math.max(0.02,Math.min(0.75*g.D,r.Hp+r.HL));      // lámina dentro del conducto de llegada
  /* Purga de lodos (Clase No. 4): en el punto bajo de la tolva (L/3) sale una tubería Ø 6" por el MURO LATERAL (lado −y),
     que nace en una boca en el centro del fondo AL, corre enterrada BAJO la losa y pasa por debajo del muro; pasa por una válvula de compuerta (vástago en tubo camisa y volante en la corona)
     y descarga en una CÁMARA DE RECOLECCIÓN DE LODOS baja, separada del tanque, de planta cuadrada (lado definido por el
     diseñador en Parámetros). Los lodos se extraen periódicamente por un tubo de extracción que sube a la corona (bomba o vactor). */
  var TL=(typeof DP_STAR!=="undefined"&&DP_STAR.T.LODOS)||{dSalida:6,dCamisa:4,dExtraccion:6,separacion:0.70,ladoMin:0.50};   // Datos preliminares
  g.Dp=TL.dSalida*0.0254;g.labP="Ø "+TL.dSalida+"\"";g.Dc=TL.dCamisa*0.0254;g.labC="Ø "+TL.dCamisa+"\"";g.Dr=TL.dExtraccion*0.0254;g.labR="Ø "+TL.dExtraccion+"\"";
  g.cv=r.ladoCaja||Math.max(TL.ladoMin,1.0);                 // lado interior de la cámara: lo ingresa el diseñador (Parámetros)
  /* Tolva = tronco de pirámide (Clase No. 4, paso 12): base mayor As = B·L a la cota −H y base menor AL (√AL × √AL)
     a −H−ho, centrada en L/3 y pegada al muro lateral de la purga (−y). Las caras de entrada, salida y la opuesta (+y)
     son inclinadas; la del lado de la purga es el mismo muro, que baja hasta AL. Así el dibujo coincide con ∀L. */
  g.aAL=Math.max(0.05,Math.min(Math.sqrt(Number(r.AL)||0.25),r.B*0.9,r.L*0.5));
  g.x0a=Math.max(0.05,Math.min(r.xL3-g.aAL/2,r.L-g.aAL-0.05));g.x0b=g.x0a+g.aAL;
  g.yA0=-g.aAL/2;g.yA1=g.aAL/2;g.z0=-r.H-r.ho;            // fondo AL CENTRADO en el ancho (y) y en L/3 (x)
  g.xw=g.x0a;g.xe=g.x0b;g.zf=g.z0;                         // en el eje (y = 0) el corte A-A pasa por el fondo AL
  g.fondoY=function(y){var u=Math.abs(y);return u<=g.yA1?g.z0:g.z0+(u-g.yA1)/(r.B/2-g.yA1)*r.ho;};   // corte por L/3
  g.xP=r.xL3;                                              // eje de la tubería de salida de lodos
  g.xcC=Math.max(g.cv/2,Math.min(r.xL3,r.L-g.cv/2));
  g.xc0=g.xcC-g.cv/2;g.xc1=g.xcC+g.cv/2;                  // caras interiores de la caja en x
  g.zp=-r.H-r.ho-g.ts-g.Dp/2-0.05;                         // tubería enterrada bajo la losa del fondo AL (boca en el centro de AL)
  g.zk=g.zp+g.Dp/2+0.15;                                   // techo interior de la caja (la tubería entra arriba)
  g.hk=Math.max(0.80,g.cv);g.zc=g.zk-g.hk;g.zcb=g.zc-g.ts;g.zkt=g.zk+g.ts;
  g.yc0=-(r.B/2+g.e);                                      // cara exterior del muro del tanque
  g.gap=Number(PRO.desSepCam)||TL.separacion;g.yw=g.yc0-g.gap;                             // separación tanque–caja (ahí va la válvula)
  g.yb0=g.yw-g.e;g.yb1=g.yb0-g.cv;g.yb2=g.yb1-g.e;        // caja: cara interior cercana, interior lejana y exterior
  g.yv=(g.yc0+g.yw)/2;g.yPe=g.yb0-0.10;                    // válvula; extremo de la tubería dentro de la caja
  g.yR=g.yb1+g.Dr/2+0.10;g.zR0=g.zc+0.10;                  // tubo de extracción de lodos junto al muro lejano
  g.yP=g.yb2;
  g.volK=g.cv*g.cv*Math.max(0,g.zp-g.Dp/2-g.zc);          // volumen de almacenamiento bajo la entrada
  return g;}

/* Poliedro convexo (agua del desarenador con su tolva): caras orientadas hacia afuera y todas sus aristas visibles */
function desPoliedro_STAR(v,f,capa,extra){
  var c=[0,0,0];v.forEach(function(p){c[0]+=p[0]/v.length;c[1]+=p[1]/v.length;c[2]+=p[2]/v.length;});
  var F=f.map(function(q){var a=v[q[0]],b=v[q[1]],d=v[q[2]],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[d[0]-a[0],d[1]-a[1],d[2]-a[2]],
      nn=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],m=[0,0,0];
    q.forEach(function(i){m[0]+=v[i][0]/q.length;m[1]+=v[i][1]/q.length;m[2]+=v[i][2]/q.length;});
    return (nn[0]*(m[0]-c[0])+nn[1]*(m[1]-c[1])+nn[2]*(m[2]-c[2])>=0)?q:q.slice().reverse();});
  var o={capa:capa,v:v,f:F,bm:F.map(function(){return [1,1,1,1];})};for(var k in extra)o[k]=extra[k];return o;}

/* Perfil inferior del muro lateral del tanque (sigue la tolva): cota de la cara inferior en x */
function desFondoMuro_STAR(r,g,x){
  if(x<=r.xL3)return -r.H-g.ts-r.ho*Math.max(0,x)/r.xL3;
  return -r.H-g.ts-r.ho*Math.max(0,r.L-x)/(r.L-r.xL3);}

/* Conducto de llegada a partir de la aducción (tubería si está calculada, si no el canal) */
function desLlegada_STAR(){
  try{
    if(PRO.REJ&&PRO.Q&&typeof calcularAduccion_STAR==="function"){
      var R=calcularAduccion_STAR();
      var okT=R.tub&&!R.tubErr.length,okC=R.canal&&!R.canalErr.length;
      if(okT&&(PRO.desLleg==="Tubería de aducción"||!okC)){var din=R.tub.D2in||R.tub.Din;return {tipo:"tubo",D:din*0.0254,W:din*0.0254,lab:"Ø "+String(Math.round(din*100)/100).replace(".",",")+"\""};}
      if(okC)return {tipo:"canal",D:R.canal.h+0.10,W:R.canal.b,lab:fmt3_STAR(R.canal.b)+" × "+fmt3_STAR(R.canal.h)};}
  }catch(_){}
  return {tipo:"tubo",D:0.1524,W:0.1524,lab:"Ø 6\""};}

/* tubería en corte longitudinal: contorno, lámina interior y bridas (xs: lista de x de bridas) */
function desTubo_STAR(P,T,x0,x1,z0,D,yw,bridas,canal){
  var t=Math.min(0.012,D*0.06);
  P.rellenar([[x0,z0],[x1,z0],[x1,z0+D],[x0,z0+D]].map(T),"TRP-ISO-CARAS",255);
  if(yw>0)P.agua([[x0,z0+t],[x1,z0+t],[x1,z0+t+yw],[x0,z0+t+yw]].map(T));
  P.polilinea([[x0,z0],[x1,z0]].map(T),false,"TRP-TUBERIA");P.polilinea([[x0,z0+D],[x1,z0+D]].map(T),false,"TRP-TUBERIA");
  if(!canal){P.polilinea([[x0,z0+t],[x1,z0+t]].map(T),false,"TRP-TUBERIA");P.polilinea([[x0,z0+D-t],[x1,z0+D-t]].map(T),false,"TRP-TUBERIA");
    var a=T([0,z0+D/2]);P.linea(T([x0,0])[0],a[1],T([x1,0])[0],a[1],"TRP-EJES");}
  (bridas||[]).forEach(function(xb){var w=0.03,hh=Math.max(0.04,D*0.25);var q=[[xb,z0-hh],[xb+w,z0-hh],[xb+w,z0+D+hh],[xb,z0+D+hh]].map(T);
    P.rellenar(q,"TRP-TUBERIA");P.polilinea(q,true,"TRP-TUBERIA");});}

function planoDesarenador_STAR(r,meta,ll){
  meta.totalHojas=7;meta.unidad=meta.unidad||"DESARENADOR";
  var P=nuevoPlano(meta),f3=fmt3_STAR,f2=fmt2_STAR,niv=nivTxt_STAR,g=desGeom_STAR(r,ll);
  var e=g.e,ts=g.ts,td=g.td,L=r.L,B=r.B,H=r.H,ho=r.ho,BL=r.BL,bp=r.bp,Hp=r.Hp,HL=r.HL,hv=r.hv,hd=r.hd;
  var xa=g.xa,xb=g.xb,xI=g.xI,xF=g.xF,xd1=g.xd1,xd2=g.xd2,zFe=g.zFe,zFs=g.zFs,D=g.D,Ds=g.Ds,dS=g.dS,canal=g.ll.tipo==="canal";
  var labLL=(canal?"CANAL DE ADUCCIÓN ":"TUBERÍA DE LLEGADA ")+g.ll.lab,labS="TUBERÍA DE SALIDA "+g.labS;

  /* Una vista principal por lámina, cada una con su propia escala (los dibujos llenan la hoja A3):
     DES-01 planta · DES-02 corte A-A · DES-03 corte B-B · DES-04 detalle cámara de lodos · DES-05 deflector ·
     DES-06 plataforma de entrada · DES-07 plataforma de salida  (DES-08: isométricas, archivo 3D) */
  /* ===================== DES-01 · PLANTA GENERAL ===================== */
  /* Cada vista ocupa toda su hoja (escala automática con un pequeño margen) y solo lleva las convenciones */
  var esc=25,mm=function(v){return v*esc/1000;},h,hT,hd_,est;
  var fijar=function(x){esc=x;h=mm(2.2);hT=mm(4.2);hd_=mm(2.0);est=esc/25;};fijar(25);
  var conv=function(x){desConvenciones_STAR(P,0,0,x*0.116,x*0.002,x/25*0.8,2);};
  var X=function(x){return x;},Y=function(y){return y;};
  var Dp=g.Dp,xP=g.xP,xc0=g.xc0,xc1=g.xc1,yc0=g.yc0,yw=g.yw,yb0=g.yb0,yb1=g.yb1,yb2=g.yb2,yv=g.yv,yP=g.yP,yR=g.yR;
  P.hojaAjustada({titulo:"Planta general",numero:"DES-01",ancho:xF-xI,alto:(B/2+e)-g.yb2,conv:conv},function(x){fijar(x);
  /* --- PLANTA --- */
  P.agua([[0,-B/2],[L,-B/2],[L,B/2],[0,B/2]]);
  P.agua([[xa+e,-B/2],[-e,-B/2],[-e,B/2],[xa+e,B/2]]);
  P.agua([[L+e,-B/2],[xb-e,-B/2],[xb-e,B/2],[L+e,B/2]]);
  [1,-1].forEach(function(s){P.concreto([[xa,s*B/2],[xb,s*B/2],[xb,s*(B/2+e)],[xa,s*(B/2+e)]],est);});
  [[xa,xa+e],[-e,0],[L,L+e],[xb-e,xb]].forEach(function(q){P.concreto([[q[0],-B/2],[q[1],-B/2],[q[1],B/2],[q[0],B/2]],est);});
  [xd1,xd2].forEach(function(x){P.rellenar([[x-td/2,-B/2],[x+td/2,-B/2],[x+td/2,B/2],[x-td/2,B/2]],"TRP-CONCRETO-RELL");P.rect(x-td/2,-B/2,x+td/2,B/2,"TRP-CONCRETO");});
  /* caja de almacenamiento de lodos: enterrada al fondo, separada del tanque (en planta se ve oculta) */
  P.rect(xc0-e,yb2,xc1+e,yw,"TRP-OCULTAS");P.rect(xc0,yb1,xc1,yb0,"TRP-OCULTAS");
  /* tuberías en planta */
  var tPl=function(x0,x1,W,br){P.rellenar([[x0,-W/2],[x1,-W/2],[x1,W/2],[x0,W/2]],"TRP-ISO-CARAS",255);P.rect(x0,-W/2,x1,W/2,"TRP-TUBERIA");
    (br||[]).forEach(function(x){var hh=Math.max(0.04,W*0.25);P.rellenar([[x,-W/2-hh],[x+0.03,-W/2-hh],[x+0.03,W/2+hh],[x,W/2+hh]],"TRP-TUBERIA");});};
  tPl(xI,xa+e,g.W,canal?[]:[xI,xa-0.03]);tPl(xb-e,xF,Ds,[xb,xF-0.03]);
  P.linea(xI-0.3,0,xF+0.3,0,"TRP-EJES");
  /* tolva: línea del punto bajo y aristas de las pendientes */
  /* tolva (tronco de pirámide): fondo AL junto al muro de la purga y aristas hacia las esquinas de As */
  P.rect(g.x0a,g.yA0,g.x0b,g.yA1,"TRP-OCULTAS");
  P.linea(0,B/2,g.x0a,g.yA1,"TRP-OCULTAS");P.linea(L,B/2,g.x0b,g.yA1,"TRP-OCULTAS");
  P.linea(0,-B/2,g.x0a,g.yA0,"TRP-OCULTAS");P.linea(L,-B/2,g.x0b,g.yA0,"TRP-OCULTAS");
  P.circulo(xP,0,Dp/2,"TRP-OCULTAS");
  if(g.aAL>mm(6))P.texto((g.x0a+g.x0b)/2,g.yA1-mm(2.5),"AL",h*0.8,{al:"c",va:"m"});
  /* tubería de salida de lodos (enterrada): del muro lateral en L/3 a la caja */
  [-1,1].forEach(function(s){P.linea(xP+s*Dp/2,0,xP+s*Dp/2,g.yPe,"TRP-OCULTAS");});P.linea(xP-Dp/2,g.yPe,xP+Dp/2,g.yPe,"TRP-OCULTAS");
  /* lo que asoma en la corona: volante de la válvula (tubo camisa) y tapa del tubo de extracción */
  P.circulo(xP,yv,g.Dc/2,"TRP-TUBERIA");P.circulo(xP,yv,0.17,"TRP-TUBERIA");P.linea(xP-0.17,yv,xP+0.17,yv,"TRP-TUBERIA");P.linea(xP,yv-0.17,xP,yv+0.17,"TRP-TUBERIA");
  P.circulo(xP,yR,g.Dr/2,"TRP-TUBERIA");P.circulo(xP,yR,g.Dr/2+0.03,"TRP-TUBERIA");
  /* rótulos de la planta (fuera de la estructura para que no se monten) */
  var lab=function(px,py,tx,ty,t,o){P.linea(px,py,tx,ty,"TRP-TEXTOS");P.texto(tx+(o&&o.al==="d"?-mm(0.8):mm(0.8)),ty,t,h*0.8,o);};
  var yl1=-B/2-e-mm(4),yl2=yl1-mm(4.5);
  lab(-e-bp/2,-B/2+0.02,xI-mm(2),yl1,"PLATAFORMA DE ENTRADA",{al:"d",va:"m"});
  lab(xI+Math.min(0.2,(xa-xI)/2),-g.W/2,xI-mm(2),yl2,labLL,{al:"d",va:"m"});
  lab(L+e+bp/2,-B/2+0.02,xF+mm(2),yl1,"PLATAFORMA DE SALIDA",{va:"m"});
  lab(xF-Math.min(0.2,(xF-xb)/2),-Ds/2,xF+mm(2),yl2,labS,{va:"m"});
  P.texto(xc1+e+mm(1.5),yv,"VÁLVULA "+g.labP,h*0.8,{va:"m"});
  P.texto(xc1+e+mm(1.5),(yb0+yb2)/2+mm(0.6),"CÁMARA DE RECOLECCIÓN DE LODOS",h*0.8,{va:"b"});
  P.texto(xc1+e+mm(1.5),(yb0+yb2)/2-mm(0.6),"LADO "+f2(g.cv)+" × "+f2(g.cv)+" · TUBO DE EXTRACCIÓN "+g.labR,h*0.8,{va:"t"});
  var dTxt=function(x,k,lado){var t="DEFLECTOR "+k;if(mm(2.2*0.85*0.62*t.length)<B*0.92)P.texto(x+(lado>0?mm(2):-mm(2)),B/2-mm(1),t,h*0.85,{rot:90,al:"d",va:lado>0?"t":"b"});
    else P.texto(x,B/2+e+mm(1),"D"+k,h*0.85,{al:"c"});};
  dTxt(xd1,1,1);dTxt(xd2,2,-1);
  P.texto((xd1+xd2)/2,B/4,"ZONA DE SEDIMENTACIÓN",h*0.9,{al:"c",va:"m"});
  P.linea(xI+0.05,g.W/2+mm(3),xI+mm(9),g.W/2+mm(3),"TRP-TEXTOS");P.solido([[xI+mm(9),g.W/2+mm(4)],[xI+mm(9),g.W/2+mm(2)],[xI+mm(12),g.W/2+mm(3)]],"TRP-TEXTOS");
  P.texto(xI+0.05,g.W/2+mm(4.5),"FLUJO",h*0.8);
  P.llamadaCorte(xI-0.3-mm(4),0,xF+0.3+mm(4),0,"A",h*1.1,1);
  P.llamadaCorte(xP,yb2-mm(5),xP,B/2+e+mm(4),"B",h*1.1,-1);
  /* cotas arriba (el costado de abajo lo ocupa la caja de purga) */
  var yd1=B/2+e+mm(9),yd2=yd1+mm(7),yd3=yd2+mm(7);
  P.cotaH(xa,B/2+e,-e,B/2+e,yd1,f3(bp+e),hd_);
  P.cotaH(0,B/2,xd1,B/2,yd1,"L/4 = "+f3(xd1),hd_);
  P.cotaH(xd1,B/2,xd2,B/2,yd1,f3(xd2-xd1),hd_);
  P.cotaH(xd2,B/2,L,B/2,yd1,"15hv = "+f3(r.Lds),hd_);
  P.cotaH(0,B/2,L,B/2,yd2,"L = "+f3(L),hd_);
  P.cotaH(xa,B/2+e,xb,B/2+e,yd3,"LONGITUD TOTAL = "+f3(xb-xa),hd_);
  P.cotaH(xc0,yb1,xc1,yb1,yb2-mm(9),f2(g.cv),hd_);
  P.cotaV(xb,-B/2,xb,B/2,xF+0.3+mm(14),"B = "+f3(B),hd_);
  P.cotaV(xb,-B/2-e,xb,B/2+e,xF+0.3+mm(22),f3(B+2*e),hd_);
  P.cotaV(xc0-e,yb0,xc0-e,yb1,xc0-e-mm(5),f2(g.cv),hd_);P.cotaV(xc0-e,yc0,xc0-e,yw,xc0-e-mm(5),f2(g.gap),hd_);
  P.tituloVista((xa+xb)/2,yd3+mm(14),"PLANTA GENERAL",esc,hT);
  });

  /* ===================== DES-02 · CORTE LONGITUDINAL A-A ===================== */
  P.hojaAjustada({titulo:"Corte longitudinal A-A",numero:"DES-02",ancho:xF-xI,alto:BL+H+ho+ts,conv:conv},function(x){fijar(x);
  var oz=0,Z=function(z){return oz+z;},Q=function(p){return [p[0],Z(p[1])];};
  /* agua: cámara de entrada, lámina sobre la cresta, desarenador, lámina sobre el vertedero de salida, cámara de salida */
  P.agua([[xa+e,zFe],[-e,zFe],[-e,HL],[xa+e,HL]].map(Q));
  P.agua([[-e,0],[-e,HL],[-e*0.4,HL*0.86],[0,HL*0.5],[0.15,HL*0.12],[0.35,0]].map(Q));
  P.agua([[0,0],[L-0.35,0],[L,-0.33*hv],[L,-H],[g.xe,g.zf],[g.xw,g.zf],[0,-H]].map(Q));
  var nap=[[L,-0.33*hv],[L+e*0.6,-0.55*hv],[L+e+0.03,-0.85*hv],[L+e+0.07,(zFs+dS-hv)/2],[L+e+0.10,zFs+dS]];
  P.agua(nap.concat([[L+e+0.04,zFs+dS],[L+e,-hv],[L,-hv]]).map(Q));
  P.agua([[L+e,zFs],[xb-e,zFs],[xb-e,zFs+dS],[L+e,zFs+dS]].map(Q));
  P.polilinea([[xa+e,HL],[-e,HL],[-e*0.4,HL*0.86],[0,HL*0.5],[0.15,HL*0.12],[0.35,0],[L-0.35,0]].concat(nap).concat([[xb-e,zFs+dS]]).map(Q),false,"TRP-AGUA");
  /* concreto cortado */
  P.concreto([[-e,0],[0,0],[0,-H],[g.xw,g.zf],[g.xe,g.zf],[L,-H],[L,-hv],[L+e,-hv],[L+e,zFs],[xb,zFs],[xb,zFs-ts],[L+e,zFs-ts],[L+e,-H-ts],[g.xe,g.zf-ts],[g.xw,g.zf-ts],
    [-e,-H-ts],[-e,zFe-ts],[xa,zFe-ts],[xa,zFe],[-e,zFe]].map(Q),est);
  if(zFe+D<BL)P.concreto([[xa,zFe+D],[xa+e,zFe+D],[xa+e,BL],[xa,BL]].map(Q),est);
  if(zFs+Ds<BL)P.concreto([[xb-e,zFs+Ds],[xb,zFs+Ds],[xb,BL],[xb-e,BL]].map(Q),est);
  [xd1,xd2].forEach(function(x){var q=[[x-td/2,-hd],[x+td/2,-hd],[x+td/2,BL],[x-td/2,BL]].map(Q);P.rellenar(q,"TRP-CONCRETO-RELL");P.polilinea(q,true,"TRP-CONCRETO");});
  P.polilinea([[xa+e,BL],[xb-e,BL]].map(Q),false,"TRP-ELEVACION");
  P.linea(0,Z(-H),L,Z(-H),"TRP-OCULTAS");
  /* boca de descarga en el centro del fondo AL: baja a la tubería enterrada bajo la losa */
  var zbS=g.zp+Dp/2;P.rellenar([[xP-Dp/2,g.z0],[xP+Dp/2,g.z0],[xP+Dp/2,zbS],[xP-Dp/2,zbS]].map(Q),"TRP-ISO-CARAS",255);
  P.polilinea([[xP-Dp/2,g.z0],[xP-Dp/2,zbS]].map(Q),false,"TRP-TUBERIA");P.polilinea([[xP+Dp/2,g.z0],[xP+Dp/2,zbS]].map(Q),false,"TRP-TUBERIA");
  desTubo_STAR(P,Q,xI,xa+e,zFe,D,g.yll,canal?[]:[xI,xa-0.03],canal);
  desTubo_STAR(P,Q,xb-e,xF,zFs,Ds,Math.min(dS,0.7*Ds),[xb,xF-0.03]);
  /* descarga de lodos */
  /* salida de lodos en el muro lateral (se ve de frente en el corte) */
  var zl=-H-ho-ts,cp=[],kq;for(kq=0;kq<28;kq++){var aq=2*Math.PI*kq/28;cp.push([xP+Dp/2*Math.cos(aq),Z(g.zp)+Dp/2*Math.sin(aq)]);}
  P.rellenar(cp,"TRP-ISO-CARAS",255);P.circulo(xP,Z(g.zp),Dp/2,"TRP-TUBERIA");P.circulo(xP,Z(g.zp),Dp/2-Math.min(0.012,Dp*0.06),"TRP-TUBERIA");
  P.linea(xP+Dp*0.4,Z(g.zp)-Dp*0.4,xP+mm(7),Z(zl)-mm(4),"TRP-TEXTOS");
  P.texto(xP+mm(7.8),Z(zl)-mm(4),"TUBERÍA DE LODOS "+g.labP+" BAJO EL FONDO AL · BOCA EN "+niv(-H-ho),h*0.85,{va:"m"});
  P.texto(xP+mm(7.8),Z(zl)-mm(7.5),"PASA BAJO EL MURO Y VA A LA CÁMARA DE RECOLECCIÓN (VER CORTE B-B)",h*0.75,{va:"m"});
  P.texto(L*0.58,Z(-H-ho*0.35),"ZONA DE LODOS",h,{al:"c",va:"m"});
  P.texto(L*0.58,Z(-H*0.55),"ZONA DE SEDIMENTACIÓN",h,{al:"c",va:"m"});
  P.linea(xI+0.1,Z(zFe+D),xI-mm(2),Z(BL)+mm(3),"TRP-TEXTOS");P.texto(xI-mm(2.8),Z(BL)+mm(3),labLL,h*0.8,{al:"d",va:"m"});
  P.linea(xF-0.1,Z(zFs+Ds),xF+mm(2),Z(BL)+mm(3),"TRP-TEXTOS");P.texto(xF+mm(2.8),Z(BL)+mm(3),labS,h*0.8,{va:"m"});
  P.texto(xa,Z(zFe-ts)-mm(4),"PLATAFORMA DE ENTRADA",h*0.75,{al:"d"});
  P.texto(xb,Z(zFs-ts)-mm(4),"PLATAFORMA DE SALIDA",h*0.75);
  P.nivel(L*0.40,Z(0),niv(0)+" N.A.",h);
  P.nivel(L*0.40,Z(BL),niv(BL)+" CORONA",h);
  P.nivel(L*0.60,Z(-H),niv(-H)+" FONDO ZONA ÚTIL",h);
  var ya1=Z(zl)-mm(15),ya2=ya1-mm(7);
  P.cotaH(0,Z(-H-ts),r.xL3,Z(zl),ya1,"L/3 = "+f3(r.xL3),hd_);
  P.cotaH(r.xL3,Z(zl),L,Z(-H-ts),ya1,"2L/3 = "+f3(r.xL23),hd_);
  P.cotaH(0,Z(-H-ts),L,Z(-H-ts),ya2,"L = "+f3(L),hd_);
  P.cotaH(g.x0a,Z(g.z0),g.x0b,Z(g.z0),ya2-mm(7),"FONDO AL: a = "+f3(g.aAL)+" (a × a = AL)",hd_);
  P.cotaH(0,Z(BL),xd1,Z(BL),Z(BL)+mm(7),"L/4 = "+f3(xd1),hd_);
  P.cotaH(xd2,Z(BL),L,Z(BL),Z(BL)+mm(7),"15hv = "+f3(r.Lds),hd_);
  var xv=xF+0.3+mm(14);
  P.cotaV(xb,Z(BL),L,Z(0),xv,"BL = "+f3(BL),hd_);
  P.cotaV(L,Z(0),L,Z(-H),xv,"H = "+f3(H),hd_);
  P.cotaV(L,Z(-H),r.xL3,Z(-H-ho),xv,"ho = "+f3(ho),hd_);
  P.cotaV(xd1,Z(0),xd1,Z(-hd),xd1+mm(5),"hd = "+f3(hd),hd_);
  P.cotaV(xd2,Z(0),xd2,Z(-hd),xd2-mm(5),"hd = "+f3(hd),hd_);
  P.texto(-e-bp/2,Z(BL)+mm(13),"VER DETALLE 1 (DES-06)",h*0.8,{al:"c"});
  P.texto(L+e+bp/2,Z(BL)+mm(13),"VER DETALLE 2 (DES-07)",h*0.8,{al:"c"});
  P.tituloVista((xa+xb)/2,Z(BL)+mm(24),"CORTE LONGITUDINAL A-A",esc,hT);
  });

  /* ===================== DES-03 · CORTE TRANSVERSAL B-B ===================== */
  var zc=g.zc,zp=g.zp,zcb=g.zcb,yPe=g.yPe;
  var esc2=25,m2=function(v){return v*esc2/1000;},h2,hT2,hc2,est2;
  var fijar2=function(x){esc2=x;h2=m2(2.1);hT2=m2(3.8);hc2=m2(1.9);est2=esc2/25;};fijar2(25);
  /* Corte por L/3: tanque, salida de lodos por el muro, válvula, caja de almacenamiento baja y tubo de extracción.
     k = factor de escala; zt = recorte superior; full = corte completo (si no, detalle con líneas de quiebre). */
  var tB=Math.min(0.012,Dp*0.06),vw=0.13,vh=Dp*0.9,yvt=BL+0.15,Dc=g.Dc,Dr=g.Dr;
  var dibBB=function(k,zt,full,uR){
    var T=function(p){return [p[0]*k,p[1]*k];},TT=function(a){return a.map(T);},R=function(u0,z0,u1,z1){return TT([[u0,z0],[u1,z0],[u1,z1],[u0,z1]]);};
    var za=Math.min(0,zt),ur=(uR==null)?B/2:uR,a2=g.yA1,z0=g.z0,fl=g.fondoY;
    /* tolva en el corte por L/3: fondo AL plano y centrado, paredes inclinadas a ambos lados */
    var fondo=[[-B/2,-H]].concat(ur>-a2?[[-a2,z0]].concat(ur>a2?[[a2,z0],[ur,fl(ur)]]:[[ur,z0]]):[[ur,fl(ur)]]);
    P.agua(TT([[-B/2,za],[ur,za]].concat(fondo.slice().reverse())));if(zt>=0)P.polilinea(TT([[-B/2,0],[B/2,0]]),false,"TRP-AGUA");
    var abajo=fondo.slice().reverse().map(function(p){return [p[0],p[1]-ts];});
    P.concreto(TT([[-B/2,zt]].concat(fondo).concat(uR==null?[[B/2,zt],[B/2+e,zt],[B/2+e,-H-ts]]:[]).concat(abajo.slice(0,abajo.length-1)).concat([[-B/2-e,-H-ts],[-B/2-e,zt]])),est2);
    if(full)P.polilinea(TT([[-B/2,-H],[B/2,-H]]),false,"TRP-OCULTAS");
    /* caja de almacenamiento de lodos (baja, separada del tanque) */
    var zk=g.zk,zkt=g.zkt;
    P.concreto(R(yb2,zcb,yw,zc),est2);P.concreto(R(yb0,zc,yw,zk),est2);P.concreto(R(yb2,zc,yb1,zk),est2);P.concreto(R(yb2,zk,yw,zkt),est2);
    var zl=zc+Math.min(0.30,(zp-Dp/2-zc)*0.55);
    P.rellenar(R(yb1,zc,yb0,zl),"TRP-ISO-CARAS",253);P.polilinea(TT([[yb1,zl],[yb0,zl]]),false,"TRP-OCULTAS");
    /* tubería de salida de lodos: del interior del tanque (batea en el fondo) a la caja */
    /* boca de descarga en el centro del fondo AL y tubería enterrada bajo la losa, que pasa bajo el muro */
    var u0=Math.min(ur,0);
    if(ur>=0){P.rellenar(R(-Dp/2,zp,Dp/2,z0),"TRP-ISO-CARAS",255);P.polilinea(TT([[-Dp/2,z0],[-Dp/2,zp+Dp/2]]),false,"TRP-TUBERIA");P.polilinea(TT([[Dp/2,z0],[Dp/2,zp-Dp/2],[-Dp/2,zp-Dp/2]]),false,"TRP-TUBERIA");}
    P.rellenar(R(u0,zp-Dp/2,yPe,zp+Dp/2),"TRP-ISO-CARAS",255);
    [zp+Dp/2,zp-Dp/2,zp+Dp/2-tB,zp-Dp/2+tB].forEach(function(z){P.polilinea(TT([[ur>=0&&z>zp?-Dp/2:u0,z],[yPe,z]]),false,"TRP-TUBERIA");});
    P.polilinea(TT([[yPe,zp-Dp/2],[yPe,zp+Dp/2]]),false,"TRP-TUBERIA");P.polilinea(TT([[u0,zp],[yPe+0.04,zp]]),false,"TRP-EJES");
    [yc0+0.03,yw].forEach(function(u){var hh=Math.max(0.04,Dp*0.25),q=R(u-0.03,zp-Dp/2-hh,u,zp+Dp/2+hh);P.rellenar(q,"TRP-TUBERIA");P.polilinea(q,true,"TRP-TUBERIA");});
    /* válvula de compuerta, bonete, vástago en tubo camisa */
    [[[yv-vw,zp+vh],[yv-vw,zp-vh],[yv,zp]],[[yv+vw,zp+vh],[yv+vw,zp-vh],[yv,zp]]].forEach(function(t){P.solido(TT(t),"TRP-TUBERIA");P.polilinea(TT(t),true,"TRP-TUBERIA");});
    var bo=R(yv-0.05,zp+vh,yv+0.05,zp+vh+0.20);P.rellenar(bo,"TRP-TUBERIA");P.polilinea(bo,true,"TRP-TUBERIA");
    var zcs=Math.min(BL+0.05,zt),zs=Math.min(yvt,zt);
    P.rellenar(R(yv-Dc/2,zp+vh+0.20,yv+Dc/2,zcs),"TRP-ISO-CARAS",255);
    P.polilinea(TT([[yv-Dc/2,zp+vh+0.20],[yv-Dc/2,zcs]]),false,"TRP-TUBERIA");P.polilinea(TT([[yv+Dc/2,zp+vh+0.20],[yv+Dc/2,zcs]]),false,"TRP-TUBERIA");
    P.polilinea(TT([[yv,zp+vh+0.20],[yv,zs]]),false,"TRP-TUBERIA");
    /* tubo de extracción de lodos */
    var zrt=Math.min(BL+0.30,zt);
    P.rellenar(R(yR-Dr/2,g.zR0,yR+Dr/2,zrt),"TRP-ISO-CARAS",255);
    P.polilinea(TT([[yR-Dr/2,g.zR0],[yR-Dr/2,zrt]]),false,"TRP-TUBERIA");P.polilinea(TT([[yR+Dr/2,g.zR0],[yR+Dr/2,zrt]]),false,"TRP-TUBERIA");P.polilinea(TT([[yR-Dr/2,g.zR0],[yR+Dr/2,g.zR0]]),false,"TRP-TUBERIA");
    if(full){var vo=R(yv-0.17,yvt,yv+0.17,yvt+0.035);P.rellenar(vo,"TRP-TUBERIA");P.polilinea(vo,true,"TRP-TUBERIA");
      var cap=R(yR-Dr/2-0.03,BL+0.30,yR+Dr/2+0.03,BL+0.34);P.rellenar(cap,"TRP-TUBERIA");P.polilinea(cap,true,"TRP-TUBERIA");
      P.polilinea(TT([[yb2-0.30,BL],[yc0,BL]]),false,"TRP-ELEVACION");
      for(var ti=yb2-0.25;ti<yc0-0.05;ti+=0.18)if(Math.abs(ti-yv)>0.12&&Math.abs(ti-yR)>0.12)P.polilinea(TT([[ti,BL],[ti-0.08,BL-0.08]]),false,"TRP-TEXTOS");}
    else{var q1=T([yb2-0.08,zt]),q2=T([ur+0.05,zt]);quiebre_STAR(P,q1[0],q1[1],q2[0],q2[1],m2(1.4));
      var q3=T([ur,zt+0.02]),q4=T([ur,-H-ho-ts-0.06]);quiebre_STAR(P,q3[0],q3[1],q4[0],q4[1],m2(1.4));}
    return T;};
  var lb=function(T,pp,tx,tz,t,o){var a=T(pp);P.linea(a[0],a[1],tx,tz,"TRP-TEXTOS");P.texto(tx+(o&&o.al==="d"?-m2(0.8):m2(0.8)),tz,t,h2*0.85,o);};

  /* --- Corte B-B completo --- */
  P.hojaAjustada({titulo:"Corte transversal B-B",numero:"DES-03",ancho:(B/2+e+0.35)-(yb2-0.3),alto:(BL+0.35)-zcb,conv:conv},function(x){fijar2(x);
  var T1=dibBB(1,BL,true),xl0=yb2-m2(6);
  P.texto(0,-H*0.45,"ZONA DE",h2*0.9,{al:"c",va:"b"});P.texto(0,-H*0.45-m2(1),"SEDIMENTACIÓN",h2*0.9,{al:"c",va:"t"});
  lb(T1,[yv-0.17,yvt+0.02],xl0,yvt+m2(6),"VOLANTE VÁLVULA",{al:"d",va:"m"});
  lb(T1,[yR-Dr/2,BL+0.32],xl0,yvt+m2(2),"TAPA EXTRACCIÓN",{al:"d",va:"m"});
  lb(T1,[yR-Dr/2,-H*0.30],xl0,-H*0.30,"TUBO DE EXTRACCIÓN "+g.labR,{al:"d",va:"m"});P.texto(xl0-m2(0.8),-H*0.30-m2(3.2),"(BOMBA O VACTOR)",h2*0.8,{al:"d",va:"m"});
  lb(T1,[yv-Dc/2,-H*0.55],xl0,-H*0.55,"VÁSTAGO EN CAMISA "+g.labC,{al:"d",va:"m"});
  lb(T1,[yb2+0.05,BL-0.05],xl0,BL-m2(3),"RELLENO",{al:"d",va:"m"});
  lb(T1,[yb1+0.03,(zc+g.zk)/2],xl0,zcb+m2(10),"CÁMARA DE LODOS",{al:"d",va:"m"});
  P.texto(xl0-m2(0.8),zcb+m2(6.5),"VER DETALLE 4 (DES-04)",h2*0.8,{al:"d",va:"m"});
  P.nivel(-B/4,0,niv(0)+" N.A.",h2);P.nivel(-B/4,BL,niv(BL)+" CORONA",h2);
  var yr1=zcb-m2(8),yr2=yr1-m2(7);
  P.cotaH(-B/2,-H-ho,B/2,-H-ho,yr1,"B = "+f3(B),hc2);
  P.cotaH(yb1,zc,yb0,zc,yr1,f2(g.cv),hc2);
  P.cotaH(yw,zc,yc0,-H-ho-ts,yr1,f2(g.gap),hc2);
  P.cotaH(yb2,zcb,B/2+e,-H-ho-ts,yr2,f3(B/2+e-yb2),hc2);
  P.cotaH(g.yA0,g.z0,g.yA1,g.z0,yr2-m2(7),"FONDO AL: a = "+f3(g.aAL),hc2);
  var xvB=B/2+e+m2(7);
  P.cotaV(B/2,BL,B/2,0,xvB,"BL = "+f3(BL),hc2);P.cotaV(B/2,0,B/2,-H,xvB,"H = "+f3(H),hc2);
  P.cotaV(B/2,-H,B/2,-H-ho,xvB,"ho = "+f3(ho),hc2);P.cotaV(B/2+e,-H-ho,B/2+e,-H-ho-ts,xvB,f2(ts),hc2);
  P.cotaH(-B/2-e,BL,-B/2,BL,BL+m2(5),f2(e),hc2);
  P.tituloVista((B/2+e+yb2)/2,BL+m2(16),"CORTE TRANSVERSAL B-B",esc2,hT2);
  });

  /* ===================== DES-04 · DETALLE 4: SALIDA Y CÁMARA DE RECOLECCIÓN DE LODOS ===================== */

  /* --- Detalle 4: salida de lodos y caja de almacenamiento (escala ampliada) --- */
  var uR4=Math.min(B/2,-B/2+0.45),zt4=Math.max(g.zkt+0.45,g.fondoY(uR4)+0.35);
  P.hojaAjustada({titulo:"Detalle 4 · salida y cámara de recolección de lodos",numero:"DES-04",ancho:(uR4+0.1)-(yb2-0.15),alto:zt4-(zcb-0.05),conv:conv},function(x){fijar2(x);var esc4=x;
  var k4=1,T4=dibBB(k4,zt4,false,uR4);
  var X4=function(u){return u*k4;},Z4=function(z){return z*k4;},xl4=X4(yb2)-m2(3),xr4=X4(uR4)+m2(6);
  lb(T4,[yR-Dr/2,(g.zkt+zt4)/2],xl4,Z4(zt4)+m2(1),"TUBO DE EXTRACCIÓN "+g.labR,{al:"d",va:"m"});
  lb(T4,[yb2+0.04,(g.zk+g.zkt)/2],xl4,Z4(zt4)-m2(3.5),"LOSA TAPA e = "+f2(ts),{al:"d",va:"m"});
  lb(T4,[yb1+0.04,(zc+zp)/2],xl4,Z4((zc+zp)/2),"CÁMARA "+f2(g.cv)+" × "+f2(g.cv),{al:"d",va:"m"});
  lb(T4,[(yb1+yb0)/2-0.1,zc+0.08],xl4,Z4(zc)-m2(1),"LODOS",{al:"d",va:"m"});
  lb(T4,[yv+Dc/2,(g.zkt+zt4)/2],X4(yv)+m2(10),Z4(zt4)+m2(5),"VÁSTAGO EN TUBO CAMISA "+g.labC,{va:"m"});
  lb(T4,[yv+vw*0.6,zp+vh*0.4],X4(yv)+m2(10),Z4(zt4)+m2(1),"VÁLVULA DE COMPUERTA "+g.labP,{va:"m"});
  lb(T4,[(-B/2+uR4)/2,g.fondoY((-B/2+uR4)/2)],xr4,Z4(g.fondoY(uR4))+m2(6),"PARED INCLINADA DE LA TOLVA (FONDO AL "+niv(-H-ho)+" AL CENTRO)",{va:"m"});
  lb(T4,[-B/2-e/2,zp-Dp/2],xr4,Z4(zp)-m2(6),"TUBERÍA "+g.labP+" BAJO LA LOSA Y EL MURO",{va:"m"});
  P.texto(X4(-B/2+0.04),Z4(zt4)-m2(4),"DESARENADOR",h2*0.8,{va:"m"});
  P.nivel(X4(yb1+g.cv*0.6),Z4(zc),niv(zc)+" FONDO CAJA",h2*0.8);
  var yb4=Z4(zcb)-m2(8);
  P.cotaH(X4(yb1),Z4(zc),X4(yb0),Z4(zc),yb4,f2(g.cv),hc2);
  P.cotaH(X4(yb2),Z4(zcb),X4(yb1),Z4(zcb),yb4,f2(e),hc2);
  P.cotaH(X4(yb0),Z4(zcb),X4(yw),Z4(zcb),yb4,f2(e),hc2);
  P.cotaH(X4(yw),Z4(zcb),X4(yc0),Z4(-H-ho-ts),yb4,f2(g.gap),hc2);
  P.cotaV(X4(yb2),Z4(g.zk),X4(yb2),Z4(zc),X4(yb2)-m2(4),f2(g.hk),hc2);
  P.cotaV(X4(yb2),Z4(zc),X4(yb2),Z4(zcb),X4(yb2)-m2(4),f2(ts),hc2);
  P.tituloVista(X4((yb2+uR4)/2),Z4(zt4)+m2(12),"DETALLE 4 · SALIDA Y CÁMARA DE RECOLECCIÓN DE LODOS",esc4,hT2*0.85);
  });

  /* ===================== DES-05 · DETALLE 3: DEFLECTOR ===================== */

  /* --- Detalle 3: deflector con orificios --- */
  P.hojaAjustada({titulo:"Detalle 3 · deflector",numero:"DES-05",ancho:B,alto:hd+BL,conv:conv},function(x){fijar2(x);var escF=x;
  var kf=1,FX=function(y){return y*kf;},FZ=function(z){return z*kf;};
  P.rellenar([[FX(0),FZ(0)],[FX(B),FZ(0)],[FX(B),FZ(hd+BL)],[FX(0),FZ(hd+BL)]],"TRP-CONCRETO-RELL");P.rect(FX(0),FZ(0),FX(B),FZ(hd+BL),"TRP-CONCRETO");
  P.linea(FX(0),FZ(hd),FX(B),FZ(hd),"TRP-AGUA");
  for(var i=0;i<r.n;i++)for(var j=0;j<r.m;j++)P.circulo(FX(r.Z+r.d/2+i*(r.Z+r.d)),FZ(hd-(r.W+r.d/2+j*(r.W+r.d))),r.d/2*kf,"TRP-TEXTOS");
  P.cotaH(FX(0),FZ(0),FX(B),FZ(0),FZ(0)-m2(7),"B = "+f3(B),hc2);
  P.cotaV(FX(B),FZ(hd),FX(B),FZ(0),FX(B)+m2(7),"hd = "+f3(hd),hc2);
  P.cotaV(FX(B),FZ(hd+BL),FX(B),FZ(hd),FX(B)+m2(7),"BL = "+f3(BL),hc2);
  P.cotaH(FX(0),FZ(hd),FX(r.Z),FZ(hd),FZ(hd+BL)+m2(4),"Z = "+f3(r.Z),hc2);
  P.cotaV(FX(0),FZ(hd),FX(0),FZ(hd-r.W),FX(0)-m2(5),"W = "+f3(r.W),hc2);
  P.texto(FX(0)-m2(2),FZ(hd),"N.A.",h2*0.8,{al:"d",va:"m"});
  P.texto(FX(B/2),FZ(hd+BL)+m2(10),r.n+" COLUMNAS × "+r.m+" FILAS · Ø "+f3(r.d)+" m · "+(r.n*r.m)+" ORIFICIOS",h2,{al:"c"});
  P.tituloVista(FX(B/2),FZ(hd+BL)+m2(20),"DETALLE 3 · DEFLECTOR (VISTA FRONTAL)",escF,hT2*0.85);
  });

  /* ===================== DES-03 · DETALLES DE LAS PLATAFORMAS (escala ampliada) ===================== */
  var cv=0.24,ext=0.26,anD=Math.max(ext+e+bp+e+cv,cv+e+bp+e+ext),alD=BL+Math.max(-Math.min(-0.30,zFe-ts-0.08),-Math.min(-0.30,zFs-ts-0.08));
  var escD=25,estD;
  var fijarD=function(x){escD=x;m2=function(v){return v*escD/1000;};h2=m2(2.2);hT2=m2(4.2);hc2=m2(2.0);estD=escD/25*1.2;};
  var k=1;
  var T=function(p){return [p[0]*k,p[1]*k];};
  var cV=function(x1,z1,x2,z2,xc,t){var a=T([x1,z1]),b=T([x2,z2]);P.cotaV(a[0],a[1],b[0],b[1],xc,t,hc2);};
  var cH=function(x1,z1,x2,z2,yc,t){var a=T([x1,z1]),b=T([x2,z2]);P.cotaH(a[0],a[1],b[0],b[1],yc,t,hc2);};
  var N=function(x,z,t,o){var p=T([x,z]);P.nivel(p[0],p[1],t,h2*0.9,o);};
  var tx=function(x,z,t,o){var p=T([x,z]);P.texto(p[0],p[1],t,h2*0.85,o);};

  /* DETALLE 1 · PLATAFORMA DE ENTRADA — eje local: x0 = cara exterior del muro de entrada */
  P.hojaAjustada({titulo:"Detalle 1 · plataforma de entrada",numero:"DES-06",ancho:anD,alto:alD,conv:conv},function(x){fijarD(x);
  var zb=Math.min(-0.30,zFe-ts-0.08),x0=xa,xc1=-e,xd=cv;           // xd: tramo de desarenador mostrado
  P.agua([[x0+e,zFe],[xc1,zFe],[xc1,HL],[x0+e,HL]].map(T));
  P.agua([[-e,0],[-e,HL],[-e*0.4,HL*0.86],[0,HL*0.5],[0.12,HL*0.12],[0.28,0]].map(T));
  P.agua([[0,zb],[xd,zb],[xd,0],[0,0]].map(T));
  P.polilinea([[x0+e,HL],[-e,HL],[-e*0.4,HL*0.86],[0,HL*0.5],[0.12,HL*0.12],[0.28,0],[xd,0]].map(T),false,"TRP-AGUA");
  P.concreto([[x0,zFe-ts],[-e,zFe-ts],[-e,zb],[0,zb],[0,0],[-e,0],[-e,zFe],[x0,zFe]].map(T),estD);
  if(zFe+D<BL)P.concreto([[x0,zFe+D],[x0+e,zFe+D],[x0+e,BL],[x0,BL]].map(T),estD);
  P.polilinea([[x0+e,BL],[xd,BL]].map(T),false,"TRP-ELEVACION");
  desTubo_STAR(P,T,x0-ext,x0+e,zFe,D,g.yll,canal?[]:[x0-ext,x0-0.03],canal);
  quiebre_STAR(P,T([-e+0.02,zb])[0],T([0,zb])[1],T([xd,zb])[0],T([0,zb])[1],m2(1.2));
  quiebre_STAR(P,T([xd,zb])[0],T([0,zb])[1],T([xd,0])[0],T([0,BL])[1],m2(1.2));
  /* rótulos */
  tx(x0+e+bp/2,BL+0.02,"PLATAFORMA DE ENTRADA",{al:"c",va:"b"});
  var pv=T([-e/2,zFe*0.5]);P.texto(pv[0],pv[1],"VERTEDERO",h2*0.75,{rot:90,al:"c",va:"m"});
  tx(xd*0.55,zb*0.6,"DESARENADOR",{al:"c",va:"m"});
  tx(x0-ext,zFe+D+0.05,labLL,{});
  N(x0+e+0.02,HL,niv(HL)+" N.A. PLATAFORMA");
  var pcr=T([0.02,-0.06]);P.texto(pcr[0],pcr[1],"CRESTA = N.A. DESARENADOR  N ±0,000",h2*0.8,{va:"m"});
  var pf=T([x0+e+bp/2,zFe-ts]);P.texto(pf[0],pf[1]-m2(3.5),"FONDO PLATAFORMA "+niv(zFe),h2*0.8,{al:"c"});
  N(xd-0.02,BL,niv(BL)+" CORONA",{izq:true});
  /* cotas */
  var yb1=T([0,zb])[1]-m2(7);
  cH(x0,zFe-ts,x0+e,zFe-ts,yb1,"e = "+f2(e));cH(x0+e,zFe,-e,zFe,yb1,"b = "+f3(bp));cH(-e,zFe-ts,0,zFe-ts,yb1,"e = "+f2(e));
  var xr=T([xd,0])[0]+m2(6);
  cV(xd,BL,xd,0,xr,"BL = "+f3(BL));
  var xin=T([xd,0])[0]+m2(16);
  cV(-e,HL,-e,0,xin+m2(10),"HL = "+f3(HL));cV(0,0,-e,zFe,xin,"Hp = "+f3(Hp));
  cV(x0,zFe,x0,zFe-ts,T([x0-ext,0])[0]-m2(5),"el = "+f2(ts));
  if(!canal)cV(x0-ext,zFe+D,x0-ext,zFe,T([x0-ext,0])[0]-m2(12),"Ø = "+f3(D));
  P.tituloVista(T([(x0-ext+xd)/2,0])[0],T([0,BL])[1]+m2(19),"DETALLE 1 · PLATAFORMA DE ENTRADA",escD,hT2*0.85);
  });

  /* DETALLE 2 · PLATAFORMA DE SALIDA — eje local: x = 0 en la cara aguas arriba del vertedero de salida */
  P.hojaAjustada({titulo:"Detalle 2 · plataforma de salida",numero:"DES-07",ancho:anD,alto:alD,conv:conv},function(x){fijarD(x);
  var zb2=Math.min(-0.30,zFs-ts-0.08),xs0=-cv,xo=2*e+bp;           // xo: cara exterior del muro de salida
  P.agua([[xs0,zb2],[0,zb2],[0,0],[xs0,0]].map(T));
  var nap2=[[0,-0.33*hv],[e*0.6,-0.55*hv],[e+0.03,-0.85*hv],[e+0.07,(zFs+dS-hv)/2],[e+0.10,zFs+dS]];
  P.agua([[-0.30,0],[0,-0.33*hv],[0,-hv]].map(T));
  P.agua(nap2.concat([[e+0.04,zFs+dS],[e,-hv],[0,-hv]]).map(T));
  P.agua([[e,zFs],[xo-e,zFs],[xo-e,zFs+dS],[e,zFs+dS]].map(T));
  P.polilinea([[xs0,0],[-0.30,0]].concat(nap2).concat([[xo-e,zFs+dS]]).map(T),false,"TRP-AGUA");
  P.concreto([[0,zb2],[0,-hv],[e,-hv],[e,zFs],[xo,zFs],[xo,zFs-ts],[e,zFs-ts],[e,zb2]].map(T),estD);
  if(zFs+Ds<BL)P.concreto([[xo-e,zFs+Ds],[xo,zFs+Ds],[xo,BL],[xo-e,BL]].map(T),estD);
  P.polilinea([[xs0,BL],[xo-e,BL]].map(T),false,"TRP-ELEVACION");
  desTubo_STAR(P,T,xo-e,xo+ext,zFs,Ds,Math.min(dS,0.7*Ds),[xo,xo+ext-0.03]);
  quiebre_STAR(P,T([xs0,zb2])[0],T([0,zb2])[1],T([e-0.02,zb2])[0],T([0,zb2])[1],m2(1.2));
  quiebre_STAR(P,T([xs0,zb2])[0],T([0,zb2])[1],T([xs0,0])[0],T([0,BL])[1],m2(1.2));
  tx(e+bp/2,BL+0.02,"PLATAFORMA DE SALIDA",{al:"c",va:"b"});
  var pv2=T([e/2,(-hv+zb2)/2]);P.texto(pv2[0],pv2[1],"VERTEDERO",h2*0.75,{rot:90,al:"c",va:"m"});
  tx(xs0*0.5,zb2*0.55,"DESARENADOR",{al:"c",va:"m"});
  tx(xo+ext,zFs+Ds+0.05,labS,{al:"d"});
  N(xs0+0.02,0,niv(0)+" N.A. DESARENADOR");N(xs0+0.02,BL,niv(BL)+" CORONA");
  var pc2=T([e,-hv]);P.linea(pc2[0],pc2[1],pc2[0]+m2(4),pc2[1]+m2(9),"TRP-TEXTOS");P.texto(pc2[0]+m2(5),pc2[1]+m2(9),"CRESTA "+niv(-hv),h2*0.8,{va:"m"});
  var pf2=T([e+bp/2,zFs-ts]);P.texto(pf2[0],pf2[1]-m2(3.5),"FONDO PLATAFORMA "+niv(zFs),h2*0.8,{al:"c"});
  var yb2=T([0,zb2])[1]-m2(7);
  cH(0,zFs-ts,e,zFs-ts,yb2,"e = "+f2(e));cH(e,zFs,xo-e,zFs,yb2,"b = "+f3(bp));cH(xo-e,zFs-ts,xo,zFs-ts,yb2,"e = "+f2(e));
  var xl=T([xs0,0])[0]-m2(6);
  cV(xs0,BL,xs0,0,xl,"BL = "+f3(BL));
  var xw=T([0,0])[0]-m2(9);
  cV(0,0,0,-hv,xw-m2(10),"hv = "+f3(hv));cV(e,-hv,e,zFs,xw,"Hp = "+f3(Hp));
  cV(xo+ext,zFs+Ds,xo+ext,zFs,T([xo+ext,0])[0]+m2(5),"Ø = "+f3(Ds));
  P.tituloVista(T([(xs0+xo+ext)/2,0])[0],T([0,BL])[1]+m2(19),"DETALLE 2 · PLATAFORMA DE SALIDA",escD,hT2*0.85);
  });

  return P;}

/* ==========================================================
   MODELO 3D del desarenador (mismas cotas de los planos)
   ========================================================== */
function desCuerpos3D_STAR(r,ll){
  var g=desGeom_STAR(r,ll),e=g.e,ts=g.ts,B=r.B,L=r.L,H=r.H,ho=r.ho,BL=r.BL,hv=r.hv,HL=r.HL,xL3=r.xL3,td=g.td,hd=r.hd;
  var C=[],K="TRP-3D-CONCRETO",W="TRP-3D-AGUA",add=function(b){C.push(b);return b;};
  var caja=function(x0,x1,y0,y1,z0,z1,ex){if(x1-x0>1e-4&&y1-y0>1e-4&&z1-z0>1e-4)add(M3D.caja(x0,x1,y0,y1,z0,z1,K,ex));};
  /* muros laterales (perfil completo: plataformas + tanque con tolva) */
  [1,-1].forEach(function(s){
    var y0=s>0?B/2:-B/2-e,y1=s>0?B/2+e:-B/2,ex=s<0?{muro:-1}:{};
    /* el muro de la purga (−y) baja hasta el fondo AL; el opuesto (+y) termina en la base mayor (−H) */
    add(M3D.prismaXZ([[0,BL],[L,BL],[L,-H-ts],[0,-H-ts]],y0,y1,K,ex));        // los dos muros terminan en la base mayor (−H)
    caja(g.xa,0,y0,y1,g.zFe-ts,BL,ex);caja(L,g.xb,y0,y1,g.zFs-ts,BL,ex);});
  /* tolva */
  /* tolva en tronco de pirámide: losa del fondo AL y tres losas inclinadas (entrada, salida y lado opuesto) */
  var losa=function(q,ex){add(M3D.extruir(q,[0,0,-ts],K,ex));},x0a=g.x0a,x0b=g.x0b,a0=g.yA0,a1=g.yA1,z0=g.z0;
  caja(x0a,x0b,a0,a1,z0-ts,z0);                                                   // fondo AL (centrado)
  losa([[0,-B/2,-H],[x0a,a0,z0],[x0a,a1,z0],[0,B/2,-H]]);                          // pared de entrada
  losa([[L,-B/2,-H],[L,B/2,-H],[x0b,a1,z0],[x0b,a0,z0]]);                          // pared de salida
  losa([[0,B/2,-H],[x0a,a1,z0],[x0b,a1,z0],[L,B/2,-H]]);                           // pared lateral +y
  losa([[0,-B/2,-H],[L,-B/2,-H],[x0b,a0,z0],[x0a,a0,z0]],{muro:-1});               // pared lateral −y (se quita en el corte)
  /* plataforma de entrada: losa, muro exterior con el paso de la llegada, vertedero (cresta = N.A.) */
  caja(g.xa,-e,-B/2,B/2,g.zFe-ts,g.zFe);
  caja(-e,0,-B/2,B/2,-H-ts,0);
  var wE=Math.min(g.W,B-0.02),zt=Math.min(g.zFe+g.D,BL);
  caja(g.xa,g.xa+e,-B/2,B/2,zt,BL);caja(g.xa,g.xa+e,-B/2,-wE/2,g.zFe,zt,{muro:-1});caja(g.xa,g.xa+e,wE/2,B/2,g.zFe,zt);
  /* plataforma de salida: vertedero (cresta −hv), losa, muro exterior con el paso de la tubería */
  caja(L,L+e,-B/2,B/2,-H-ts,-hv);
  caja(L+e,g.xb,-B/2,B/2,g.zFs-ts,g.zFs);
  var zt2=Math.min(g.zFs+g.Ds,BL);
  caja(g.xb-e,g.xb,-B/2,B/2,zt2,BL);caja(g.xb-e,g.xb,-B/2,-g.Ds/2,g.zFs,zt2,{muro:-1});caja(g.xb-e,g.xb,g.Ds/2,B/2,g.zFs,zt2);
  /* deflectores (hasta la corona) */
  [g.xd1,g.xd2].forEach(function(x){add(M3D.caja(x-td/2,x+td/2,-B/2,B/2,-hd,BL,K,{corte:M3D.caja(x-td/2,x+td/2,-B/2,B/2,0,BL,K)}));});
  /* tuberías con bridas */
  if(g.ll.tipo==="canal"){var wc=g.W;caja(g.xI,g.xa,-wc/2-0.10,wc/2+0.10,g.zFe-0.10,g.zFe);caja(g.xI,g.xa,-wc/2-0.10,-wc/2,g.zFe,g.zFe+g.D,{muro:-1});caja(g.xI,g.xa,wc/2,wc/2+0.10,g.zFe,g.zFe+g.D);
    add(M3D.caja(g.xI,g.xa+e,-wc/2,wc/2,g.zFe,g.zFe+g.yll,W,{agua:true}));}
  else M3D.tuboBridas([g.xI,0,g.zFe+g.D/2],[g.xa+e,0,g.zFe+g.D/2],g.D/2,"TRP-TUBERIA",[0]).concat(
    M3D.tuboBridas([g.xa-0.03,0,g.zFe+g.D/2],[g.xa,0,g.zFe+g.D/2],g.D/2,"TRP-TUBERIA",[0]).slice(1)).forEach(add);
  M3D.tuboBridas([g.xb-e,0,g.zFs+g.Ds/2],[g.xF,0,g.zFs+g.Ds/2],g.Ds/2,"TRP-TUBERIA",[1]).concat(
    M3D.tuboBridas([g.xb,0,g.zFs+g.Ds/2],[g.xb+0.03,0,g.zFs+g.Ds/2],g.Ds/2,"TRP-TUBERIA",[0]).slice(1)).forEach(add);
  /* salida de lodos: tubería por el muro lateral (L/3) → válvula (vástago en tubo camisa) → caja de almacenamiento baja */
  var xc0=g.xc0,xc1=g.xc1,yc0=g.yc0,yw=g.yw,yb0=g.yb0,yb1=g.yb1,yb2=g.yb2,zc=g.zc,zk=g.zk,zkt=g.zkt,zp=g.zp,xP=g.xP,yv=g.yv,Dp=g.Dp;
  caja(xc0-e,xc1+e,yb2,yw,g.zcb,zc);                                              // losa de fondo
  caja(xc0-e,xc0,yb2,yw,zc,zk);caja(xc1,xc1+e,yb2,yw,zc,zk);                       // muros extremos
  caja(xc0,xc1,yb0,yw,zc,zk);                                                      // muro hacia el tanque
  caja(xc0,xc1,yb2,yb1,zc,zk,{muro:-1});                                           // muro exterior (se quita en el corte)
  caja(xc0-e,xc1+e,yb2,yw,zk,zkt,{muro:-1});                                       // losa tapa (se quita en el corte)
  add(M3D.cilindro([xP,0,g.z0],[xP,0,zp-Dp/2],Dp/2,20,"TRP-TUBERIA",{rgb:"#C9CFD6"}));                 // boca en el centro de AL
  add(M3D.cilindro([xP,Dp/2,zp],[xP,g.yPe,zp],Dp/2,20,"TRP-TUBERIA",{rgb:"#C9CFD6"}));                    // tubería bajo la losa y el muro
  [yc0,yw].forEach(function(u){add(M3D.cilindro([xP,u+0.03,zp],[xP,u,zp],Dp/2*1.6+0.02,20,"TRP-TUBERIA",{rgb:"#8E979F"}));});
  add(M3D.caja(xP-0.13,xP+0.13,yv-0.09,yv+0.09,zp-0.13,zp+0.13,"TRP-3D-METAL",{rgb:"#5F6B75"}));      // cuerpo de la válvula
  add(M3D.cilindro([xP,yv,zp+0.13],[xP,yv,zp+0.33],0.05,14,"TRP-3D-METAL",{rgb:"#5F6B75"}));          // bonete
  add(M3D.cilindro([xP,yv,zp+0.33],[xP,yv,BL+0.05],g.Dc/2,16,"TRP-TUBERIA",{rgb:"#C9CFD6"}));          // tubo camisa
  add(M3D.cilindro([xP,yv,BL+0.05],[xP,yv,BL+0.20],0.016,10,"TRP-3D-METAL",{rgb:"#5F6B75"}));         // vástago
  add(M3D.cilindro([xP,yv,BL+0.20],[xP,yv,BL+0.24],0.17,22,"TRP-3D-METAL",{rgb:"#B91C1C"}));         // volante
  add(M3D.cilindro([xP,g.yR,g.zR0],[xP,g.yR,BL+0.30],g.Dr/2,18,"TRP-TUBERIA",{rgb:"#C9CFD6"}));      // tubo de extracción
  add(M3D.cilindro([xP,g.yR,BL+0.30],[xP,g.yR,BL+0.34],g.Dr/2+0.03,18,"TRP-3D-METAL",{rgb:"#5F6B75"}));  // tapa
  add(M3D.caja(xc0+0.02,xc1-0.02,yb1+0.02,yb0-0.02,zc,zc+Math.min(0.30,(zp-Dp/2-zc)*0.55),"TRP-3D-METAL",{rgb:"#A16207"}));  // lodos acumulados
  /* agua */
  add(desPoliedro_STAR([[0,-B/2,0],[L,-B/2,0],[L,B/2,0],[0,B/2,0],[0,-B/2,-H],[L,-B/2,-H],[L,B/2,-H],[0,B/2,-H],
    [x0a,a0,z0],[x0b,a0,z0],[x0b,a1,z0],[x0a,a1,z0]],
    [[0,1,2,3],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,9,8],[5,6,10,9],[6,7,11,10],[7,4,8,11],[8,9,10,11]],W,{agua:true}));
  add(M3D.caja(g.xa+e,-e,-B/2,B/2,g.zFe,HL,W,{agua:true}));
  add(M3D.caja(L+e,g.xb-e,-B/2,B/2,g.zFs,g.zFs+g.dS,W,{agua:true}));
  return C;}

function desEtiquetas3D_STAR(r,ll){
  var g=desGeom_STAR(r,ll),B=r.B,BL=r.BL,canal=g.ll.tipo==="canal";
  return [{p:[g.xI+0.1,0,g.zFe+g.D],t:(canal?"CANAL DE ADUCCIÓN ":"TUBERÍA DE LLEGADA ")+g.ll.lab},
    {p:[-g.e-r.bp/2,B/2,BL],t:"PLATAFORMA DE ENTRADA"},{p:[-g.e/2,-B/4,0],t:"VERTEDERO DE ENTRADA"},
    {p:[g.xd1,-B/4,BL],t:"DEFLECTOR 1 (L/4)"},{p:[(g.xd1+g.xd2)/2,B/2+g.e,BL],t:"ZONA DE SEDIMENTACIÓN"},
    {p:[g.xd2,B/4,BL],t:"DEFLECTOR 2 (15·hv)"},{p:[r.L+g.e/2,B/4,-r.hv],t:"VERTEDERO DE SALIDA"},
    {p:[r.L+g.e+r.bp/2,-B/2,BL],t:"PLATAFORMA DE SALIDA"},{p:[g.xF-0.1,0,g.zFs+g.Ds],t:"TUBERÍA DE SALIDA "+g.labS},
    {p:[g.xcC,g.yb2,g.zkt],t:"CÁMARA DE LODOS"},{p:[g.xP,g.yv,r.BL+0.24],t:"VÁLVULA DE PURGA"},
    {p:[g.xP,g.yR,r.BL+0.34],t:"TUBO DE EXTRACCIÓN"}];}

/* ==========================================================
   EXPORTAR (lo llama el núcleo: exportar.js)
   ========================================================== */
function exportarDesarenador_STAR(modo){
  var r=null;try{if(PRO.Q)r=calcularDesarenador_STAR();}catch(_){r=null;}
  if(!r||r.err)return {error:"Primero calcula el desarenador: el módulo debe mostrar sus resultados sin errores."};
  var ll=desLlegada_STAR(),meta=metaPlano_STAR("DESARENADOR"),nombre=nombreArchivo_STAR("Desarenador"),
      res="L = "+fmt2_STAR(r.L)+" m · B = "+fmt2_STAR(r.B)+" m · H = "+fmt2_STAR(r.H)+" m";
  if(modo==="3d"){
    var cu=desCuerpos3D_STAR(r,ll),g=desGeom_STAR(r,ll);
    var datos=[["L","Longitud útil",fmt3_STAR(r.L)+" m"],["B","Ancho",fmt3_STAR(r.B)+" m"],["H","Profundidad útil",fmt3_STAR(r.H)+" m"],["ho","Profundidad de lodos",fmt3_STAR(r.ho)+" m"],
      ["BL","Borde libre",fmt3_STAR(r.BL)+" m"],["hd","Altura de deflectores",fmt3_STAR(r.hd)+" m"],["b","Base de plataformas",fmt3_STAR(r.bp)+" m"],["Hp","Altura de plataformas",fmt3_STAR(r.Hp)+" m"],
      ["Lt","Longitud total",fmt3_STAR(g.xb-g.xa)+" m"],["e","Espesor muros y losa",fmt2_STAR(g.e)+" m"]];
    var et=desEtiquetas3D_STAR(r,ll);
    return {nombre:nombre,resumen:res,
      lamina3D:lamina3D_STAR(meta,cu,{numero:"DES-08",titulo:"Vistas isométricas",datos:datos,etiquetas:et,etiquetas2:et.filter(function(q){return /PLATAFORMA|LODOS|PURGA|DEFLECTOR 1/.test(q.t);})}),
      modelo3D:modelo3DAuto_STAR(cu,meta)};}
  return {nombre:nombre,resumen:res,planos:planoDesarenador_STAR(r,meta,ll)};}
