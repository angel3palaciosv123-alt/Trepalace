/* ==========================================================
   VENTANA 4 — REJILLA · planos PDF/DWG  (rejilla_plano.js)
   Requiere: calcularRejilla_STAR()
   Láminas: REJ-01 planta · REJ-02 corte A-A · REJ-03 corte B-B · REJ-04 detalle de barrotes
   ========================================================== */

/* ==========================================================
   1. GEOMETRÍA
   ========================================================== */

/* Geometría común (x = flujo, y = transversal, z = cota con el N.A. en 0; la rejilla se apoya en el fondo y se inclina aguas abajo) */
function rejGeom_STAR(r){
  var g={e:Number(PRO.rejTmuro)||0.15,ts:Number(PRO.rejTlosa)||0.15,Lu:Number(PRO.rejLlleg)||1.50,Ld:Number(PRO.rejLsal)||1.50};   // ventana de exportar
  g.th=r.th*Math.PI/180;g.Ht=r.H+r.BL;g.Lx=g.Ht/Math.tan(g.th);g.Lb=g.Ht/Math.sin(g.th);
  g.xb0=g.Lu;g.xb1=g.Lu+g.Lx;g.Lc=g.Lu+g.Lx+g.Ld;
  /* separación real entre barrotes para que n barrotes + (n+1) espacios llenen el ancho Br */
  g.nb=r.nb;g.n1=r.n1;g.zr=(r.Br-g.nb*r.s)/g.n1;
  return g;}

/* ==========================================================
   2. PLANOS DE CONSTRUCCIÓN
   ========================================================== */

function planoRejilla_STAR(r,meta){
  meta.totalHojas=4;meta.unidad=meta.unidad||"REJILLA";
  var P=nuevoPlano(meta),f3=fmt3_STAR,f2=fmt2_STAR,niv=nivTxt_STAR,g=rejGeom_STAR(r);
  var e=g.e,ts=g.ts,Br=r.Br,H=r.H,BL=r.BL,Ht=g.Ht,s=r.s,Lu=g.Lu,Lx=g.Lx,Ld=g.Ld,Lc=g.Lc,th=g.th;

  /* Una vista por lámina, ajustada a toda la hoja (escala automática) y solo con las convenciones:
     REJ-01 planta · REJ-02 corte A-A · REJ-03 corte B-B · REJ-04 barrotes */
  var esc=25,mm=function(v){return v*esc/1000;},h,hT,hd_,est;
  var fijar=function(x){esc=x;h=mm(2.2);hT=mm(4.2);hd_=mm(2.0);est=esc/25;};fijar(25);
  var esc2=25,m2=function(v){return v*esc2/1000;},h2,hT2,hc2,est2;
  var fijar2=function(x){esc2=x;h2=m2(2.2);hT2=m2(4.2);hc2=m2(2.0);est2=esc2/25;};fijar2(25);
  var conv=function(x){desConvenciones_STAR(P,0,0,x*0.116,x*0.002,x/25*0.8,2,[[function(a,b,w,hh){P.rellenar([[a,b],[a+w,b],[a+w,b+hh],[a,b+hh]],"TRP-BARROTES");},"Barrote de acero"]]);};
  var ox=0,oyP=0,X=function(x){return ox+x;},Y=function(y){return oyP+y;},i;

  /* ===================== REJ-01 · PLANTA ===================== */
  P.hojaAjustada({titulo:"Planta",numero:"REJ-01",ancho:Lc,alto:Br+2*e,conv:conv},function(x){fijar(x);
  P.agua([[X(0),Y(-Br/2)],[X(Lc),Y(-Br/2)],[X(Lc),Y(Br/2)],[X(0),Y(Br/2)]]);
  [1,-1].forEach(function(sg){P.concreto([[X(0),Y(sg*Br/2)],[X(Lc),Y(sg*Br/2)],[X(Lc),Y(sg*(Br/2+e))],[X(0),Y(sg*(Br/2+e))]],est);});
  for(var i=0;i<g.nb;i++){var y0=-Br/2+g.zr*(i+1)+s*i,w=Math.max(s,mm(0.5));
    P.rellenar([[X(g.xb0),Y(y0)],[X(g.xb1),Y(y0)],[X(g.xb1),Y(y0+w)],[X(g.xb0),Y(y0+w)]],"TRP-BARROTES");}
  P.linea(X(-0.5),Y(0),X(Lc+0.5),Y(0),"TRP-EJES");
  P.linea(X(0)+mm(2),Y(Br/4),X(0)+mm(14),Y(Br/4),"TRP-TEXTOS");P.solido([[X(0)+mm(14),Y(Br/4)+mm(1)],[X(0)+mm(14),Y(Br/4)-mm(1)],[X(0)+mm(17),Y(Br/4)]],"TRP-TEXTOS");
  P.texto(X(0)+mm(2),Y(Br/4)+mm(2),"FLUJO",h*0.85);
  P.texto(X(Lu/2),Y(-Br/4),"CANAL DE LLEGADA",h*0.85,{al:"c"});
  P.texto(X((g.xb0+g.xb1)/2),Y(Br/2+e)+mm(2.5),"REJILLA · "+g.nb+" BARROTES",h*0.85,{al:"c"});
  P.texto(X(Lc-Ld/2),Y(-Br/4),"CANAL DE SALIDA",h*0.85,{al:"c"});
  P.llamadaCorte(X(-0.5)-mm(5),Y(0),X(Lc+0.5)+mm(5),Y(0),"A",h*1.1,1);
  P.llamadaCorte(X(Lu*0.35),Y(-Br/2-e)-mm(4),X(Lu*0.35),Y(Br/2+e)+mm(4),"B",h*1.1,-1);
  var yd1=Y(-Br/2-e)-mm(9),yd2=yd1-mm(7);
  P.cotaH(X(0),Y(-Br/2-e),X(g.xb0),Y(-Br/2-e),yd1,"Lu = "+f3(Lu),hd_);
  P.cotaH(X(g.xb0),Y(-Br/2-e),X(g.xb1),Y(-Br/2-e),yd1,"Lx = "+f3(Lx),hd_);
  P.cotaH(X(g.xb1),Y(-Br/2-e),X(Lc),Y(-Br/2-e),yd1,"Ld = "+f3(Ld),hd_);
  P.cotaH(X(0),Y(-Br/2-e),X(Lc),Y(-Br/2-e),yd2,"LONGITUD TOTAL = "+f3(Lc),hd_);
  P.cotaV(X(Lc),Y(-Br/2),X(Lc),Y(Br/2),X(Lc)+mm(9),"Br = "+f3(Br),hd_);
  P.cotaV(X(Lc),Y(-Br/2-e),X(Lc),Y(Br/2+e),X(Lc)+mm(17),f3(Br+2*e),hd_);
  P.tituloVista(X(Lc/2),Y(Br/2+e)+mm(16),"PLANTA",esc,hT);});

  /* ===================== REJ-02 · CORTE LONGITUDINAL A-A ===================== */
  P.hojaAjustada({titulo:"Corte longitudinal A-A",numero:"REJ-02",ancho:Lc,alto:Ht+ts,conv:conv},function(x){fijar(x);
  var oyC=0,Z=function(z){return oyC+z;},Q=function(p){return [X(p[0]),Z(p[1])];},yTit=Z(BL)+mm(22);
  P.agua([[0,0],[Lc,0],[Lc,-H],[0,-H]].map(Q));P.linea(X(0),Z(0),X(Lc),Z(0),"TRP-AGUA");
  P.concreto([[0,-H],[Lc,-H],[Lc,-H-ts],[0,-H-ts]].map(Q),est);
  P.polilinea([[0,-H],[0,BL],[Lc,BL],[Lc,-H]].map(Q),false,"TRP-ELEVACION");
  /* barrote inclinado (espesor exagerado a 0,9 mm de papel si es menor, solo para que se vea) */
  var w=Math.max(s,mm(0.9)),nx=Math.sin(th),ny=-Math.cos(th);
  var bar=[[g.xb0,-H],[g.xb1,BL],[g.xb1+w*nx,BL+w*ny],[g.xb0+w*nx,-H+w*ny]].map(Q);
  P.rellenar(bar,"TRP-BARROTES");P.polilinea(bar,true,"TRP-BARROTES");
  P.polilinea([[g.xb0,-H],[g.xb1,BL]].map(Q),false,"TRP-BARROTES");
  /* arco y valor de θ */
  var ra=Math.min(0.30,g.Lx*0.45),arco=[];for(var k=0;k<=12;k++){var a=th*k/12;arco.push([g.xb0+ra*Math.cos(a),-H+ra*Math.sin(a)]);}
  P.polilinea(arco.map(Q),false,"TRP-COTAS");
  P.texto(X(g.xb0+ra)+mm(2),Z(-H)+mm(2),"θ = "+f2(r.th).replace(",00","")+"°",hd_,{capa:"TRP-COTAS"});
  /* longitudes de barrote sobre la inclinación */
  var rot=r.th,mid=function(a,b){return [(a[0]+b[0])/2,(a[1]+b[1])/2];},pa=[g.xb0,-H],pw=[g.xb0+r.Lbs*Math.cos(th),0],pt=[g.xb1,BL];
  var tp=function(p,t){var q=Q(p);P.texto(q[0]-mm(2),q[1]+mm(1.2),t,hd_,{rot:rot,al:"d",va:"b",capa:"TRP-COTAS"});};
  tp(mid(pa,pw),"Lbs = "+f2(r.Lbs));tp(mid(pw,pt),"Lbns = "+f2(r.Lbns));
  /* niveles */
  P.nivel(X(0.30),Z(0),niv(0)+" N.A.",h);
  P.nivel(X(0.30),Z(BL),niv(BL)+" CORONA",h);
  P.nivel(X(Lc-1.0),Z(-H),niv(-H)+" FONDO",h);
  /* cotas */
  var xv=X(Lc)+mm(9);
  P.cotaV(X(Lc),Z(BL),X(Lc),Z(0),xv,"BL = "+f3(BL),hd_);
  P.cotaV(X(Lc),Z(0),X(Lc),Z(-H),xv,"H = "+f3(H),hd_);
  P.cotaV(X(Lc),Z(-H),X(Lc),Z(-H-ts),xv,f2(ts),hd_);
  P.cotaV(X(0),Z(BL),X(0),Z(-H),X(0)-mm(8),"Htotal = "+f3(Ht),hd_);
  var yc=Z(-H-ts)-mm(8);
  P.cotaH(X(0),Z(-H-ts),X(g.xb0),Z(-H-ts),yc,"Lu = "+f3(Lu),hd_);
  P.cotaH(X(g.xb0),Z(-H-ts),X(g.xb1),Z(-H-ts),yc,"Lx = "+f3(Lx),hd_);
  P.cotaH(X(g.xb1),Z(-H-ts),X(Lc),Z(-H-ts),yc,"Ld = "+f3(Ld),hd_);
  P.cotaH(X(0),Z(-H-ts),X(Lc),Z(-H-ts),yc-mm(7),"LONGITUD TOTAL = "+f3(Lc),hd_);
  P.tituloVista(X(Lc/2),yTit,"CORTE LONGITUDINAL A-A",esc,hT);
  });

  /* ===================== REJ-03 · CORTE TRANSVERSAL B-B ===================== */
  P.hojaAjustada({titulo:"Corte transversal B-B",numero:"REJ-03",ancho:Br+2*e,alto:Ht+ts,conv:conv},function(x){fijar2(x);
  var g2=P.marca(),bx=0,bz=0,XB=function(y){return bx+y;},ZB=function(z){return bz+z;};
  P.agua([[XB(-Br/2),ZB(0)],[XB(Br/2),ZB(0)],[XB(Br/2),ZB(-H)],[XB(-Br/2),ZB(-H)]]);P.linea(XB(-Br/2),ZB(0),XB(Br/2),ZB(0),"TRP-AGUA");
  P.concreto([[-Br/2,BL],[-Br/2,-H],[Br/2,-H],[Br/2,BL],[Br/2+e,BL],[Br/2+e,-H-ts],[-Br/2-e,-H-ts],[-Br/2-e,BL]].map(function(q){return [XB(q[0]),ZB(q[1])];}),est2);
  var wb=Math.max(s,m2(0.5));
  for(i=0;i<g.nb;i++){var yb=-Br/2+g.zr*(i+1)+s*i;
    P.rellenar([[XB(yb),ZB(-H)],[XB(yb+wb),ZB(-H)],[XB(yb+wb),ZB(BL)],[XB(yb),ZB(BL)]],"TRP-BARROTES");}
  P.linea(XB(-Br/2),ZB(BL),XB(Br/2),ZB(BL),"TRP-BARROTES");
  P.nivel(XB(-Br/2-e)-m2(2),ZB(0),niv(0)+" N.A.",h2,{izq:true});P.nivel(XB(-Br/2-e)-m2(2),ZB(BL),niv(BL)+" CORONA",h2,{izq:true});P.nivel(XB(-Br/2-e)-m2(2),ZB(-H),niv(-H)+" FONDO",h2,{izq:true});
  P.linea(XB(-Br/2-e)-m2(2),ZB(0),XB(-Br/2-e),ZB(0),"TRP-AGUA");P.linea(XB(-Br/2-e)-m2(2),ZB(-H),XB(-Br/2-e),ZB(-H),"TRP-ELEVACION");
  P.cotaH(XB(-Br/2),ZB(-H-ts),XB(Br/2),ZB(-H-ts),ZB(-H-ts)-m2(8),"Br = "+f3(Br),hc2);
  P.cotaH(XB(-Br/2-e),ZB(-H-ts),XB(Br/2+e),ZB(-H-ts),ZB(-H-ts)-m2(15),f3(Br+2*e),hc2);
  var xvB=XB(Br/2+e)+m2(8);
  P.cotaV(XB(Br/2+e),ZB(BL),XB(Br/2+e),ZB(0),xvB,"BL = "+f3(BL),hc2);
  P.cotaV(XB(Br/2+e),ZB(0),XB(Br/2+e),ZB(-H),xvB,"H = "+f3(H),hc2);
  P.cotaV(XB(Br/2+e),ZB(-H),XB(Br/2+e),ZB(-H-ts),xvB,f2(ts),hc2);
  P.cotaV(XB(Br/2+e),ZB(BL),XB(Br/2+e),ZB(-H-ts),xvB+m2(9),"Htotal + el = "+f3(Ht+ts),hc2);
  P.cotaH(XB(-Br/2-e),ZB(BL),XB(-Br/2),ZB(BL),ZB(BL)+m2(5),f2(e),hc2);
  P.texto(XB(0),ZB(BL)+m2(12),g.nb+" BARROTES · "+g.n1+" ESPACIOS · z = "+f3(r.z),h2,{al:"c"});
  P.tituloVista(XB(0),ZB(BL)+m2(34),"CORTE TRANSVERSAL B-B",esc2,hT2);
  P.texto(XB(0),ZB(BL)+m2(20),"VISTA FRONTAL DE LA REJILLA",h2,{al:"c"});
  });

  /* ===================== REJ-04 · DETALLE DE BARROTES (sección de 3 barrotes) ===================== */
  var rb=s,zr=g.zr,Wd=4*zr+3*rb,hb=Math.max(rb,0.04);
  P.hojaAjustada({titulo:"Detalle 1 · barrotes",numero:"REJ-04",ancho:Wd,alto:hb+0.04,conv:conv},function(x){fijar2(x);var escD=x;
  var kd=1,fD=function(p){return [p[0]*kd,p[1]*kd];};
  var redondo=(PRO.forma==="C3"||PRO.forma==="C7");
  P.rellenar([[0,-0.02],[Wd,-0.02],[Wd,hb+0.02],[0,hb+0.02]].map(fD),"TRP-AGUA-RELL");
  P.polilinea([[0,hb+0.02],[Wd,hb+0.02]].map(fD),false,"TRP-AGUA");
  for(i=0;i<3;i++){var xi=zr*(i+1)+rb*i;
    if(redondo){var c=fD([xi+rb/2,hb/2]);circuloLleno_STAR(P,c[0],c[1],rb/2*kd,"TRP-BARROTES");}
    else{P.rellenar([[xi,hb/2-rb/2],[xi+rb,hb/2-rb/2],[xi+rb,hb/2+rb/2],[xi,hb/2+rb/2]].map(fD),"TRP-BARROTES");}}
  var y0D=fD([0,-0.02])[1],yD=y0D-m2(7),yb0=fD([0,hb/2])[1];
  P.cotaH(fD([0,0])[0],y0D,fD([zr,0])[0],y0D,yD,"z = "+f3(zr),hc2);
  var ysA=fD([0,hb+0.02])[1]+m2(6);P.cotaH(fD([zr,0])[0],yb0,fD([zr+rb,0])[0],yb0,ysA,"s = "+f3(rb),hc2);
  P.cotaH(fD([zr+rb,0])[0],y0D,fD([2*zr+rb,0])[0],y0D,yD,"z = "+f3(zr),hc2);
  P.cotaH(fD([zr,0])[0],y0D,fD([2*zr+rb,0])[0],y0D,yD-m2(7),"PASO = s + z = "+f3(rb+zr),hc2);
  var c3=fD([Wd/2,hb+0.02]);
  P.texto(c3[0],c3[1]+m2(14),"SECCIÓN HORIZONTAL · FORMA "+(PRO.forma||"")+(redondo?" (CIRCULAR)":" (RECTANGULAR)")+" · ACERO",h2*0.9,{al:"c"});
  P.tituloVista(c3[0],c3[1]+m2(26),"DETALLE 1 · BARROTES",escD,hT2*0.85);
  });
  return P;}

/* ==========================================================
   3. MODELO 3D
   ========================================================== */

function rejCuerpos3D_STAR(r){
  var g=rejGeom_STAR(r),e=g.e,ts=g.ts,Br=r.Br,H=r.H,BL=r.BL,Lc=g.Lc,s=r.s;
  var C=[],K="TRP-3D-CONCRETO",add=function(b){C.push(b);return b;};
  add(M3D.caja(0,Lc,-Br/2-e,Br/2+e,-H-ts,-H,K));
  add(M3D.caja(0,Lc,Br/2,Br/2+e,-H,BL,K));
  add(M3D.caja(0,Lc,-Br/2-e,-Br/2,-H,BL,K,{muro:-1}));
  var ws=Math.max(s,0.012);
  for(var i=0;i<g.nb;i++){var y0=-Br/2+g.zr*(i+1)+s*i;
    add(M3D.extruir([[g.xb0,y0,-H],[g.xb1,y0,BL],[g.xb1+ws*Math.sin(g.th),y0,BL-ws*Math.cos(g.th)],[g.xb0+ws*Math.sin(g.th),y0,-H-ws*Math.cos(g.th)]].map(function(p){return [p[0],p[1],p[2]];}),[0,ws,0],"TRP-3D-METAL",{color:250}));}
  add(M3D.caja(0,Lc,-Br/2,Br/2,-H,0,"TRP-3D-AGUA",{agua:true}));
  return C;}

/* ==========================================================
   4. EXPORTAR (lo llama exportar.js)
   ========================================================== */

function exportarRejilla_STAR(modo){
  var r=null;try{if(PRO.Q)r=calcularRejilla_STAR();}catch(_){r=null;}
  if(!r||!(r.nb>=1)||!(r.Br>0)||!(r.H>0))return {error:"Primero completa el cálculo de la rejilla: el módulo debe mostrar sus esquemas sin errores."};
  var meta=metaPlano_STAR("REJILLA"),nombre=nombreArchivo_STAR("Rejilla"),
      res="Br = "+fmt2_STAR(r.Br)+" m · "+r.nb+" barrotes · θ = "+fmt2_STAR(r.th)+"°";
  if(modo==="3d"){
    var cu=rejCuerpos3D_STAR(r),g=rejGeom_STAR(r);
    var datos=[["Br","Ancho del canal",fmt3_STAR(r.Br)+" m"],["H","Altura de agua",fmt3_STAR(r.H)+" m"],["BL","Borde libre",fmt3_STAR(r.BL)+" m"],["θ","Inclinación",fmt2_STAR(r.th)+"°"],
      ["Lrt","Longitud del barrote",fmt3_STAR(r.Lrt)+" m"],["s","Espesor del barrote",fmt3_STAR(r.s)+" m"],["z","Separación",fmt3_STAR(r.z)+" m"],["n","Número de barrotes",String(r.nb)],["Lc","Longitud del canal",fmt3_STAR(g.Lc)+" m"]];
    return {nombre:nombre,resumen:res,lamina3D:lamina3D_STAR(meta,cu,{numero:"REJ-05",titulo:"Vistas isométricas",datos:datos,colores:[["#7C8791","Barrotes de acero"]],
      etiquetas:[{p:[g.Lu*0.4,r.Br/2+g.e,r.BL],t:"CANAL DE LLEGADA"},{p:[g.xb1,0,r.BL],t:"REJILLA · "+r.nb+" BARROTES · θ = "+fmt2_STAR(r.th).replace(",00","")+"°"},
        {p:[g.Lc-g.Ld*0.4,-r.Br/2-g.e,r.BL],t:"CANAL DE SALIDA"},{p:[g.Lc,0,-r.H-g.ts],t:"LOSA DE FONDO e = "+fmt2_STAR(g.ts)}],
      etiquetas2:[{p:[g.Lu*0.4,0,0],t:"LÁMINA DE AGUA H = "+fmt3_STAR(r.H)},{p:[g.xb0+0.05,0,-r.H*0.5],t:"BARROTES Ø "+String(PRO.diamIn||"").replace(".",",")+"\" · z = "+fmt3_STAR(g.zr)}]}),modelo3D:modelo3DAuto_STAR(cu,meta)};}
  return {nombre:nombre,resumen:res,planos:planoRejilla_STAR(r,meta)};}
