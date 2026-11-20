/* ==========================================================
   NÚCLEO — plano_dxf.js
   Generador de planos de AutoCAD (DXF R12: AutoCAD lo abre directo y se guarda como DWG).
   General para todos los módulos de Trepalace: capas, tipos de línea, textos, cotas reales,
   rellenos (concreto color cemento y agua azul claro), niveles, llamadas de corte, cuadros,
   marco A3 y rótulo con el logo de TREPALACE.
   Unidades: metros a tamaño real. Cada lámina A3 se dibuja en el espacio modelo a la escala
   indicada (p. ej. 1:25), una al lado de la otra.
   Requiere: logo_dxf.js (TREPALACE_LOGO, logo vectorizado).
   ========================================================== */

/* ---------- Capas de TREPALACE: [color AutoCAD, tipo de línea] ---------- */
var PLANO_CAPAS={
  "TRP-MARCO":[7,"CONTINUOUS"],        "TRP-ROTULO":[7,"CONTINUOUS"],       "TRP-ROTULO-ETIQ":[8,"CONTINUOUS"],
  "TRP-LOGO":[94,"CONTINUOUS"],
  "TRP-CONCRETO":[7,"CONTINUOUS"],     "TRP-CONCRETO-RELL":[254,"CONTINUOUS"], "TRP-CONCRETO-ACH":[252,"CONTINUOUS"],
  "TRP-AGUA":[5,"CONTINUOUS"],         "TRP-AGUA-RELL":[141,"CONTINUOUS"],
  "TRP-EJES":[1,"CENTER"],             "TRP-ELEVACION":[8,"CONTINUOUS"],             "TRP-CORTES":[7,"CONTINUOUS"],        "TRP-OCULTAS":[8,"DASHED"],
  "TRP-COTAS":[5,"CONTINUOUS"],        "TRP-NIVELES":[7,"CONTINUOUS"],       "TRP-TEXTOS":[7,"CONTINUOUS"],
  "TRP-TITULOS":[7,"CONTINUOUS"],      "TRP-TABLAS":[7,"CONTINUOUS"],        "TRP-TABLAS-RELL":[254,"CONTINUOUS"],
  "TRP-ISO-CARAS":[254,"CONTINUOUS"],  "TRP-ISO-LINEAS":[250,"CONTINUOUS"],  "TRP-ISO-ARISTAS":[250,"CONTINUOUS"],
  "TRP-3D-CONCRETO":[9,"CONTINUOUS"],  "TRP-3D-AGUA":[141,"CONTINUOUS"],
  "TRP-3D-METAL":[251,"CONTINUOUS"],  "TRP-BARROTES":[251,"CONTINUOUS"],  "TRP-TUBERIA":[8,"CONTINUOUS"]};

/* Colores AutoCAD → pantalla (vista previa) */
var PLANO_ACI={1:"#E11D48",5:"#1D4ED8",7:"#111111",8:"#808080",9:"#C0C0C0",141:"#BFE3FB",250:"#333333",251:"#505050",252:"#696969",253:"#A8A8A8",254:"#D6D6D6",255:"#FFFFFF"};

function nuevoPlano(meta){
  var E=[],BLOQ=[],nDim=0,laminas=[],P={meta:meta||{},E:E,laminas:laminas,vista3D:null};
  function add(o){E.push(o);return o;}

  /* ---------- Primitivas ---------- */
  P.linea=function(x1,y1,x2,y2,capa,color){return add({t:"LINE",p:[[x1,y1],[x2,y2]],capa:capa||"TRP-TEXTOS",color:color});};
  P.polilinea=function(pts,cerrada,capa,color){return add({t:"PLINE",p:pts,c:!!cerrada,capa:capa||"TRP-TEXTOS",color:color});};
  P.rect=function(x1,y1,x2,y2,capa,color){return P.polilinea([[x1,y1],[x2,y1],[x2,y2],[x1,y2]],true,capa,color);};
  P.circulo=function(x,y,r,capa,color){return add({t:"CIRCLE",p:[[x,y]],r:r,capa:capa||"TRP-TEXTOS",color:color});};
  P.solido=function(pts,capa,color){return add({t:"SOLID",p:pts,capa:capa||"TRP-TEXTOS",color:color});};
  /* texto: h en metros; al "i|c|d"; va "b|m|t" */
  P.texto=function(x,y,s,h,o){o=o||{};return add({t:"TEXT",p:[[x,y]],s:String(s),h:h,rot:o.rot||0,al:o.al||"i",va:o.va||"b",capa:o.capa||"TRP-TEXTOS",color:o.color,neg:!!o.negrita});};

  /* ---------- Relleno de un polígono simple (triangulación por orejas → SOLID) ---------- */
  P.rellenar=function(pts,capa,color){
    var V=pts.slice(),area=0;for(var i=0;i<V.length;i++){var a=V[i],b=V[(i+1)%V.length];area+=a[0]*b[1]-b[0]*a[1];}
    if(area<0)V.reverse();
    var cruz=function(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);};
    var dentroT=function(p,a,b,c){return cruz(a,b,p)>=-1e-12&&cruz(b,c,p)>=-1e-12&&cruz(c,a,p)>=-1e-12;};
    var guard=0;
    while(V.length>3&&guard++<5000){
      var hecho=false;
      for(var k=0;k<V.length;k++){
        var A=V[(k+V.length-1)%V.length],B=V[k],C=V[(k+1)%V.length];
        if(cruz(A,B,C)<=1e-12)continue;
        var libre=true;for(var m=0;m<V.length;m++){var Q=V[m];if(Q===A||Q===B||Q===C)continue;if(dentroT(Q,A,B,C)){libre=false;break;}}
        if(!libre)continue;
        P.solido([A,B,C],capa,color);V.splice(k,1);hecho=true;break;}
      if(!hecho)break;}
    if(V.length===3)P.solido(V,capa,color);};
  var dentroPol=function(p,pol){var c=false;for(var i=0,j=pol.length-1;i<pol.length;j=i++){var a=pol[i],b=pol[j];
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  var distBorde=function(p,pol){var d=1e9;for(var i=0;i<pol.length;i++){var a=pol[i],b=pol[(i+1)%pol.length],dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1e-12;
    var t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2));d=Math.min(d,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy));}return d;};

  /* ---------- Concreto en corte: relleno color cemento + símbolo de concreto (puntos y triángulos) + contorno ---------- */
  P.concreto=function(pol,esc){
    esc=esc||1;P.rellenar(pol,"TRP-CONCRETO-RELL");
    var xs=pol.map(function(q){return q[0];}),ys=pol.map(function(q){return q[1];}),x0=Math.min.apply(null,xs),x1=Math.max.apply(null,xs),y0=Math.min.apply(null,ys),y1=Math.max.apply(null,ys);
    var paso=0.075*esc,sem=1;var rnd=function(){sem=(sem*16807)%2147483647;return (sem-1)/2147483646;};
    for(var y=y0+paso/2;y<y1;y+=paso)for(var x=x0+paso/2;x<x1;x+=paso){
      var p=[x+(rnd()-0.5)*paso*0.8,y+(rnd()-0.5)*paso*0.8],r=rnd();
      if(!dentroPol(p,pol)||distBorde(p,pol)<0.018*esc)continue;
      if(r<0.22){var s=0.012*esc,a=rnd()*Math.PI*2,tri=[0,1,2].map(function(k){return [p[0]+s*Math.cos(a+k*2.094),p[1]+s*Math.sin(a+k*2.094)];});P.polilinea(tri,true,"TRP-CONCRETO-ACH");}
      else if(r<0.62){P.circulo(p[0],p[1],0.0022*esc,"TRP-CONCRETO-ACH");}}
    P.polilinea(pol,true,"TRP-CONCRETO");};
  /* ---------- Agua: relleno azul claro ---------- */
  P.agua=function(pol){P.rellenar(pol,"TRP-AGUA-RELL");};

  /* ---------- Cotas de AutoCAD (DIMENSION real con su bloque) ---------- */
  function cota(tipo,p1,p2,pos,texto,h){
    var nombre="*D"+(++nDim),G=[],d1,d2,ang;
    if(tipo==="H"){d1=[p1[0],pos];d2=[p2[0],pos];ang=0;}else{d1=[pos,p1[1]];d2=[pos,p2[1]];ang=90;}
    var ext=function(a,b){var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<1e-9)return null;return [[a[0]+dx/L*h*0.35,a[1]+dy/L*h*0.35],[b[0]+dx/L*h*0.55,b[1]+dy/L*h*0.55]];};
    var e1=ext(p1,d1),e2=ext(p2,d2);if(e1)G.push({t:"LINE",p:e1});if(e2)G.push({t:"LINE",p:e2});
    var ux=d2[0]-d1[0],uy=d2[1]-d1[1],L=Math.hypot(ux,uy)||1;ux/=L;uy/=L;
    G.push({t:"LINE",p:[[d1[0]-ux*h*0.5,d1[1]-uy*h*0.5],[d2[0]+ux*h*0.5,d2[1]+uy*h*0.5]]});
    var tk=h*0.45;[d1,d2].forEach(function(d){G.push({t:"LINE",p:[[d[0]-tk*(ux+uy)*0.7,d[1]-tk*(uy-ux)*0.7],[d[0]+tk*(ux+uy)*0.7,d[1]+tk*(uy-ux)*0.7]]});});
    var tm=[(d1[0]+d2[0])/2,(d1[1]+d2[1])/2],tp=tipo==="H"?[tm[0],tm[1]+h*0.3]:[tm[0]-h*0.3,tm[1]];
    G.push({t:"TEXT",p:[tp],s:texto,h:h,rot:ang,al:"c",va:"b"});
    BLOQ.push({nombre:nombre,G:G});
    return add({t:"DIM",nombre:nombre,p1:p1,p2:p2,d2:d2,tm:tp,ang:ang,s:texto,capa:"TRP-COTAS",G:G});}
  P.cotaH=function(x1,ya,x2,yb,yc,txt,h){return cota("H",[x1,ya],[x2,yb],yc,txt,h);};
  P.cotaV=function(xa,y1,xb,y2,xc,txt,h){return cota("V",[xa,y1],[xb,y2],xc,txt,h);};

  /* ---------- Símbolo de nivel en corte (triángulo + línea + texto) ---------- */
  P.nivel=function(x,y,txt,h,o){o=o||{};var s=h*0.85,lado=o.izq?-1:1,c=o.capa||"TRP-NIVELES";
    P.polilinea([[x,y],[x-s*0.55,y+s*0.95],[x+s*0.55,y+s*0.95]],true,c);
    P.solido([[x,y],[x-s*0.55,y+s*0.95],[x,y+s*0.95]],c);
    var L=txt.length*h*0.62+s;P.linea(x,y+s*0.95,x+lado*L,y+s*0.95,c);
    P.texto(x+lado*(s*0.7),y+s*1.25,txt,h,{capa:c,al:lado>0?"i":"d"});};
  /* ---------- Llamada de corte (línea gruesa en los extremos, círculo con letra y flecha de dirección) ---------- */
  P.llamadaCorte=function(x1,y1,x2,y2,letra,h,lado){
    var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy*(lado||1),ny=ux*(lado||1),r=h*1.1;
    P.linea(x1,y1,x2,y2,"TRP-EJES");
    [[x1,y1,-1],[x2,y2,1]].forEach(function(q){
      var cx=q[0]+ux*q[2]*r,cy=q[1]+uy*q[2]*r;
      P.circulo(cx,cy,r,"TRP-CORTES");
      P.texto(cx,cy,letra,h*1.05,{capa:"TRP-CORTES",al:"c",va:"m",negrita:true});
      var bx=q[0],by=q[1];
      P.solido([[bx+nx*r*0.15,by+ny*r*0.15],[bx+nx*r*1.9-ux*q[2]*r*0.0,by+ny*r*1.9],[bx-ux*q[2]*r*0.55+nx*r*0.15,by-uy*q[2]*r*0.55+ny*r*0.15]],"TRP-CORTES");});};
  /* ---------- Título de vista (estilo civil: nombre subrayado doble y escala) ---------- */
  P.tituloVista=function(x,y,txt,esc,h){
    P.texto(x,y,txt,h,{capa:"TRP-TITULOS",al:"c",negrita:true});
    var w=txt.length*h*0.64;P.linea(x-w/2,y-h*0.32,x+w/2,y-h*0.32,"TRP-TITULOS");P.linea(x-w/2,y-h*0.45,x+w/2,y-h*0.45,"TRP-TITULOS");
    if(esc)P.texto(x,y-h*1.25,"ESCALA 1:"+esc,h*0.55,{capa:"TRP-TITULOS",al:"c"});};
  /* ---------- Cuadro (tabla) con encabezado sombreado ---------- */
  P.cuadro=function(x,y,anchos,encab,filas,h,titulo,alin){
    var hf=h*2.2,W=anchos.reduce(function(a,b){return a+b;},0),yy=y;
    var celda=function(x0,x1,y1,y0,s,i,neg){var a=(alin&&alin[i])||"c";
      P.texto(a==="i"?x0+h*0.6:a==="d"?x1-h*0.6:(x0+x1)/2,(y0+y1)/2,s,h,{capa:"TRP-TEXTOS",al:a,va:"m",negrita:neg});};
    if(titulo){P.rellenar([[x,yy-hf],[x+W,yy-hf],[x+W,yy],[x,yy]],"TRP-TABLAS-RELL");P.rect(x,yy-hf,x+W,yy,"TRP-TABLAS");
      P.texto(x+W/2,yy-hf/2,titulo,h*1.1,{capa:"TRP-TITULOS",al:"c",va:"m",negrita:true});yy-=hf;}
    if(encab){var xx=x;encab.forEach(function(c,i){P.rect(xx,yy-hf,xx+anchos[i],yy,"TRP-TABLAS");celda(xx,xx+anchos[i],yy,yy-hf,c,i,true);xx+=anchos[i];});yy-=hf;}
    filas.forEach(function(f){var xx=x;f.forEach(function(c,i){P.rect(xx,yy-hf,xx+anchos[i],yy,"TRP-TABLAS");celda(xx,xx+anchos[i],yy,yy-hf,c,i,false);xx+=anchos[i];});yy-=hf;});
    P.rect(x,yy,x+W,y,"TRP-TABLAS");return yy;};

  /* ---------- Logo TREPALACE vectorizado (franjas de color) ---------- */
  P.logo=function(x,y,alto,parte){
    if(typeof TREPALACE_LOGO==="undefined")return 0;
    var L=TREPALACE_LOGO[parte||"emblema"],s=alto/L.h;
    L.r.forEach(function(r){var x0=x+r[0]*s,x1=x+r[2]*s,ya=y+alto-r[1]*s,yb=y+alto-r[3]*s;P.solido([[x0,yb],[x1,yb],[x0,ya],[x1,ya]],"TRP-LOGO",r[4]);});
    return L.w*s;};

  /* ---------- Lámina A3 con marco y rótulo ---------- */
  P.lamina=function(o){
    var esc=o.escala||25,mm=function(v){return v*esc/1000;},Wh=mm(420),Hh=mm(297),y0=0,ult=laminas[laminas.length-1],x0=ult?ult.x0+ult.W+ult.mm(60):0;
    var L={x0:x0,y0:y0,W:Wh,H:Hh,esc:esc,mm:mm,numero:o.numero};
    var fx0=x0+mm(25),fy0=y0+mm(10),fx1=x0+Wh-mm(10),fy1=y0+Hh-mm(10),hr=mm(30);
    P.rect(x0,y0,x0+Wh,y0+Hh,"TRP-MARCO",8);
    P.rect(fx0,fy0,fx1,fy1,"TRP-MARCO");P.rect(fx0+mm(1.2),fy0+mm(1.2),fx1-mm(1.2),fy1-mm(1.2),"TRP-MARCO",8);
    /* rótulo inferior: logo | proyecto | diseñador | fecha | escala | unidad | plano */
    var ry=fy0+hr;P.linea(fx0,ry,fx1,ry,"TRP-ROTULO");
    var cols=[fx0,fx0+mm(92),fx0+mm(200),fx0+mm(245),fx0+mm(275),fx0+mm(300),fx0+mm(350),fx1];
    cols.slice(1,-1).forEach(function(c){P.linea(c,fy0,c,ry,"TRP-ROTULO");});
    /* logo */
    var hl=mm(22),wl=P.logo(fx0+mm(4),fy0+(hr-hl)/2,hl,"emblema");
    var hn=mm(7.2);P.logo(fx0+mm(6)+wl,fy0+hr/2-mm(1),hn,"nombre");
    P.texto(fx0+mm(6)+wl,fy0+hr/2-mm(5.5),"Soluciones ambientales y sanitarias",mm(2.3),{capa:"TRP-ROTULO-ETIQ"});
    var casilla=function(i,et,val,hv){var a=cols[i],b=cols[i+1];
      P.texto(a+mm(2.5),ry-mm(4.5),et,mm(2.2),{capa:"TRP-ROTULO-ETIQ"});
      P.texto((a+b)/2,fy0+hr*0.5,val,hv||mm(3.4),{capa:"TRP-ROTULO",al:"c",va:"m",negrita:true});};   // valor centrado en la casilla
    casilla(1,"PROYECTO",P.meta.proyecto||"",mm(3.6));
    casilla(2,"DISEÑADOR",P.meta.diseñador||"");
    casilla(3,"FECHA",P.meta.fecha||"");
    casilla(4,"ESCALA",o.escalaTxt||"1:"+esc);
    casilla(5,"UNIDAD",P.meta.unidad||"");
    casilla(6,"PLANO No.",o.numero||"",mm(6));
    P.texto((cols[6]+cols[7])/2,fy0+mm(3.5),"HOJA "+(laminas.length+1)+" DE "+(P.meta.totalHojas||1),mm(2),{capa:"TRP-ROTULO-ETIQ",al:"c"});
    if(o.titulo)P.texto((cols[1]+cols[2])/2,fy0+mm(4),o.titulo.toUpperCase(),mm(2.4),{capa:"TRP-ROTULO-ETIQ",al:"c"});
    L.area={x0:fx0+mm(5),y0:ry+mm(5),x1:fx1-mm(5),y1:fy1-mm(5)};
    laminas.push(L);return L;};

  /* ---------- Agrupar y centrar: marca = P.marca(); ...dibujar...; P.centrar(marca,[x0,y0,x1,y1]) ---------- */
  P.marca=function(){return E.length;};
  P.cajaDesde=function(i0){
    var b=[1e9,1e9,-1e9,-1e9],ver=function(x,y){b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y);};
    var txt=function(e){var w=e.s.length*e.h*0.62,dx=e.al==="c"?-w/2:e.al==="d"?-w:0,dy=e.va==="m"?-e.h/2:e.va==="t"?-e.h:0,a=(e.rot||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=e.p[0][0],y=e.p[0][1];
      [[dx,dy],[dx+w,dy],[dx,dy+e.h],[dx+w,dy+e.h]].forEach(function(q){ver(x+q[0]*c-q[1]*s,y+q[0]*s+q[1]*c);});};
    var una=function(e){if(e.t==="TEXT")txt(e);else if(e.t==="CIRCLE"){ver(e.p[0][0]-e.r,e.p[0][1]-e.r);ver(e.p[0][0]+e.r,e.p[0][1]+e.r);}
      else if(e.t==="DIM")e.G.forEach(una);else if(e.p)e.p.forEach(function(q){ver(q[0],q[1]);});};
    for(var i=i0;i<E.length;i++)una(E[i]);return b;};
  P.mover=function(i0,dx,dy){
    var m=function(q){return [q[0]+dx,q[1]+dy];},una=function(e){
      if(e.p)e.p=e.p.map(m);
      if(e.t==="DIM"){e.p1=m(e.p1);e.p2=m(e.p2);e.d2=m(e.d2);e.tm=m(e.tm);e.G.forEach(una);}};
    for(var i=i0;i<E.length;i++)if(E[i].t!=="MESH")una(E[i]);};
  /* centra el grupo dibujado desde la marca i0 dentro de la región r=[x0,y0,x1,y1] (alin: "c" centro, "a" arriba) */
  /* ---------- Deshacer lo dibujado desde una marca (entidades, bloques de cota y láminas) ---------- */
  P.deshacer=function(nE,nB,nL){E.length=nE;BLOQ.length=nB;laminas.length=nL;};
  P.estado=function(){return [E.length,BLOQ.length,laminas.length];};
  /* ---------- Lámina ajustada: una vista que ocupa toda la hoja (con un pequeño margen) + convenciones en la esquina.
     o = {titulo, numero, ancho, alto (m, tamaño del dibujo sin rótulos, para empezar la búsqueda), conv:function(esc), margen (mm)}
     dibujar(esc): dibuja la vista a la escala esc (en cualquier origen). Se prueba de la escala más grande a la más pequeña
     hasta que la vista, con sus cotas y textos, quepa en la hoja sin tocar las convenciones. ---------- */
  P.hojaAjustada=function(o,dibujar){
    var LS=o.escalas||((typeof ESCALAS_STAR!=="undefined")?ESCALAS_STAR:[1,2,5,10,20,25,50,100,200,250,500,1000]),i0=0;
    var anchoU=360,altoU=222;   // mm útiles de una A3 con rótulo
    if(o.ancho>0||o.alto>0)while(i0<LS.length-1&&((o.ancho||0)*1000/LS[i0]>anchoU||(o.alto||0)*1000/LS[i0]>altoU))i0++;
    for(var i=i0;i<LS.length;i++){
      var esc=LS[i],nE=E.length,nB=BLOQ.length,nL=laminas.length;
      var lam=P.lamina({titulo:o.titulo,escala:esc,numero:o.numero}),A=lam.area,mm=lam.mm;
      var g=P.marca();dibujar(esc);var b=P.cajaDesde(g),gv=P.marca(),cw=0,ch=0;
      if(o.conv){var nB2=BLOQ.length;o.conv(esc);var cb=P.cajaDesde(gv);cw=cb[2]-cb[0];ch=cb[3]-cb[1];P.deshacer(gv,nB2,laminas.length);}
      var m=mm(o.margen==null?4:o.margen),gap=mm(4),bw=b[2]-b[0],bh=b[3]-b[1];
      var X0=A.x0+m,Y0=A.y0+m,X1=A.x1-m,Y1=A.y1-m,cR=[X1-cw,Y0,X1,Y0+ch],caja=null;
      var cabe=function(r){return bw<=r[2]-r[0]+1e-9&&bh<=r[3]-r[1]+1e-9;};
      /* 1) centrada en toda la hoja si no pisa las convenciones */
      if(cabe([X0,Y0,X1,Y1])){var cx=(X0+X1)/2,cy=(Y0+Y1)/2,d=[cx-bw/2,cy-bh/2,cx+bw/2,cy+bh/2];
        if(!o.conv||d[2]<cR[0]-gap||d[1]>cR[3]+gap)caja=[X0,Y0,X1,Y1];}
      /* 2) arriba de la franja de convenciones  3) a la izquierda de la columna de convenciones */
      if(!caja&&cabe([X0,Y0+ch+gap,X1,Y1]))caja=[X0,Y0+ch+gap,X1,Y1];
      if(!caja&&cabe([X0,Y0,X1-cw-gap,Y1]))caja=[X0,Y0,X1-cw-gap,Y1];
      if(caja||i===LS.length-1){
        P.centrar(g,caja||[X0,Y0+ch+gap,X1,Y1]);
        if(o.conv){var g2=P.marca();o.conv(esc);var c2=P.cajaDesde(g2);P.mover(g2,X1-c2[2],Y0-c2[1]);}
        return {esc:esc,lamina:lam};}
      P.deshacer(nE,nB,nL);}};
  P.centrar=function(i0,r,alin){var b=P.cajaDesde(i0),dx=(r[0]+r[2])/2-(b[0]+b[2])/2,dy=alin==="a"?r[3]-b[3]:(r[1]+r[3])/2-(b[1]+b[3])/2;P.mover(i0,dx,dy);return b;};

  /* ---------- Cuerpos 3D (mallas cerradas) ---------- */
  P.cuerpo3D=function(v,caras,capa){return add({t:"MESH",v:v,f:caras,capa:capa});};
  /* Vista inicial en 3D (isométrica sureste): dirección y centro */
  P.vistaIso=function(centro,alto,dir){P.vista3D={c:centro,h:alto,d:dir||[-1,-1,1]};};

  /* ==========================================================
     SALIDA DXF (AutoCAD R12, ANSI_1252)
     ========================================================== */
  P.dxf=function(){
    var o=[];function g(c,v){o.push(c,v);}
    function n(x){var s=(Math.round(x*1e5)/1e5).toFixed(5).replace(/0+$/,"").replace(/\.$/,"");return s==="-0"?"0":s;}
    var mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
    E.forEach(function(e){(e.p||[]).concat(e.v||[]).forEach(function(q){for(var k=0;k<2;k++){mn[k]=Math.min(mn[k],q[k]);mx[k]=Math.max(mx[k],q[k]);}
      mn[2]=Math.min(mn[2],q[2]||0);mx[2]=Math.max(mx[2],q[2]||0);});});
    g(0,"SECTION");g(2,"HEADER");
    g(9,"$ACADVER");g(1,"AC1009");g(9,"$DWGCODEPAGE");g(3,"ANSI_1252");
    g(9,"$EXTMIN");g(10,n(mn[0]));g(20,n(mn[1]));g(30,n(mn[2]));g(9,"$EXTMAX");g(10,n(mx[0]));g(20,n(mx[1]));g(30,n(mx[2]));
    g(9,"$LIMMIN");g(10,n(mn[0]));g(20,n(mn[1]));g(9,"$LIMMAX");g(10,n(mx[0]));g(20,n(mx[1]));
    g(9,"$LTSCALE");g(40,"1");g(9,"$LUNITS");g(70,"2");g(9,"$LUPREC");g(70,"3");g(9,"$TEXTSTYLE");g(7,"TREPALACE");
    g(9,"$DIMTXT");g(40,"0.0625");g(9,"$DIMASZ");g(40,"0.05");g(9,"$DIMTSZ");g(40,"0.035");g(9,"$DIMEXE");g(40,"0.035");
    g(9,"$DIMEXO");g(40,"0.02");g(9,"$DIMGAP");g(40,"0.015");g(9,"$DIMTAD");g(70,"1");g(9,"$DIMTIH");g(70,"0");g(9,"$DIMTOH");g(70,"0");
    g(9,"$DIMCLRD");g(70,"5");g(9,"$DIMCLRE");g(70,"5");g(9,"$DIMCLRT");g(70,"5");
    g(0,"ENDSEC");
    g(0,"SECTION");g(2,"TABLES");
    if(P.vista3D){var V=P.vista3D;
      g(0,"TABLE");g(2,"VPORT");g(70,"1");
      g(0,"VPORT");g(2,"*ACTIVE");g(70,"0");g(10,"0");g(20,"0");g(11,"1");g(21,"1");g(12,"0");g(22,"0");g(13,"0");g(23,"0");g(14,"0.5");g(24,"0.5");g(15,"0.5");g(25,"0.5");
      g(16,n(V.d[0]));g(26,n(V.d[1]));g(36,n(V.d[2]));g(17,n(V.c[0]));g(27,n(V.c[1]));g(37,n(V.c[2]));
      g(40,n(V.h));g(41,"1.6");g(42,"50");g(43,"0");g(44,"0");g(50,"0");g(51,"0");g(71,"0");g(72,"1000");g(73,"1");g(74,"3");g(75,"0");g(76,"0");g(77,"0");g(78,"0");
      g(0,"ENDTAB");}
    g(0,"TABLE");g(2,"LTYPE");g(70,"3");
    [["CONTINUOUS","Solid line",[]],["DASHED","Dashed __ __ __",[0.12,-0.06]],["CENTER","Center ____ _ ____",[0.32,-0.06,0.06,-0.06]]].forEach(function(l){
      g(0,"LTYPE");g(2,l[0]);g(70,"0");g(3,l[1]);g(72,"65");g(73,String(l[2].length));
      g(40,n(l[2].reduce(function(a,b){return a+Math.abs(b);},0)));l[2].forEach(function(s){g(49,n(s));});});
    g(0,"ENDTAB");
    g(0,"TABLE");g(2,"LAYER");g(70,String(Object.keys(PLANO_CAPAS).length+1));
    g(0,"LAYER");g(2,"0");g(70,"0");g(62,"7");g(6,"CONTINUOUS");
    Object.keys(PLANO_CAPAS).forEach(function(k){g(0,"LAYER");g(2,k);g(70,"0");g(62,String(PLANO_CAPAS[k][0]));g(6,PLANO_CAPAS[k][1]);});
    g(0,"ENDTAB");
    g(0,"TABLE");g(2,"STYLE");g(70,"1");
    g(0,"STYLE");g(2,"TREPALACE");g(70,"0");g(40,"0");g(41,"1");g(50,"0");g(71,"0");g(42,"0.1");g(3,"arial.ttf");g(4,"");
    g(0,"ENDTAB");g(0,"ENDSEC");
    function ent(e,capa){
      var c=e.capa||capa;
      if(e.t==="LINE"){g(0,"LINE");g(8,c);if(e.color)g(62,String(e.color));g(10,n(e.p[0][0]));g(20,n(e.p[0][1]));g(30,"0");g(11,n(e.p[1][0]));g(21,n(e.p[1][1]));g(31,"0");}
      else if(e.t==="PLINE"){g(0,"POLYLINE");g(8,c);if(e.color)g(62,String(e.color));g(66,"1");g(10,"0");g(20,"0");g(30,"0");g(70,e.c?"1":"0");
        e.p.forEach(function(q){g(0,"VERTEX");g(8,c);g(10,n(q[0]));g(20,n(q[1]));g(30,"0");});g(0,"SEQEND");g(8,c);}
      else if(e.t==="CIRCLE"){g(0,"CIRCLE");g(8,c);if(e.color)g(62,String(e.color));g(10,n(e.p[0][0]));g(20,n(e.p[0][1]));g(30,"0");g(40,n(e.r));}
      else if(e.t==="SOLID"){var q=e.p.length===3?[e.p[0],e.p[1],e.p[2],e.p[2]]:e.p;
        g(0,"SOLID");g(8,c);if(e.color)g(62,String(e.color));[10,11,12,13].forEach(function(k,i){g(k,n(q[i][0]));g(k+10,n(q[i][1]));g(k+20,"0");});}
      else if(e.t==="TEXT"){var AL={i:0,c:1,d:2},VA={b:0,m:2,t:3};
        g(0,"TEXT");g(8,c);if(e.color)g(62,String(e.color));g(10,n(e.p[0][0]));g(20,n(e.p[0][1]));g(30,"0");g(40,n(e.h));g(1,e.s);
        if(e.rot)g(50,n(e.rot));g(7,"TREPALACE");
        if(AL[e.al]||VA[e.va]){g(72,String(AL[e.al]));g(11,n(e.p[0][0]));g(21,n(e.p[0][1]));g(31,"0");g(73,String(VA[e.va]));}}
      else if(e.t==="DIM"){g(0,"DIMENSION");g(8,c);g(2,e.nombre);g(10,n(e.d2[0]));g(20,n(e.d2[1]));g(30,"0");
        g(11,n(e.tm[0]));g(21,n(e.tm[1]));g(31,"0");g(70,"32");g(1,e.s);
        g(13,n(e.p1[0]));g(23,n(e.p1[1]));g(33,"0");g(14,n(e.p2[0]));g(24,n(e.p2[1]));g(34,"0");g(50,n(e.ang));}
      else if(e.t==="MESH"){g(0,"POLYLINE");g(8,c);g(66,"1");g(10,"0");g(20,"0");g(30,"0");g(70,"64");g(71,String(e.v.length));g(72,String(e.f.length));
        e.v.forEach(function(q){g(0,"VERTEX");g(8,c);g(10,n(q[0]));g(20,n(q[1]));g(30,n(q[2]));g(70,"192");});
        e.f.forEach(function(f){g(0,"VERTEX");g(8,c);g(10,"0");g(20,"0");g(30,"0");g(70,"128");f.filter(function(ix,k){return k===0||ix!==f[k-1];}).forEach(function(ix,k){g(71+k,String(ix+1));});});
        g(0,"SEQEND");g(8,c);}}
    g(0,"SECTION");g(2,"BLOCKS");
    BLOQ.forEach(function(b){g(0,"BLOCK");g(8,"0");g(2,b.nombre);g(70,"1");g(10,"0");g(20,"0");g(30,"0");g(3,b.nombre);
      b.G.forEach(function(e){ent(e,"TRP-COTAS");});g(0,"ENDBLK");g(8,"0");});
    g(0,"ENDSEC");
    g(0,"SECTION");g(2,"ENTITIES");E.forEach(function(e){ent(e,"0");});g(0,"ENDSEC");g(0,"EOF");
    var s="";for(var i=0;i<o.length;i+=2)s+=o[i]+"\r\n"+o[i+1]+"\r\n";return s;};
  /* Bytes en Windows-1252 (tildes, ñ, ³) */
  P.bytes=function(){var s=P.dxf(),b=new Uint8Array(s.length);for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);b[i]=c<256?c:63;}return b;};
  /* Descarga en el navegador */
  P.descargar=function(nombre){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([P.bytes()],{type:"application/dxf"}));a.download=nombre;
    document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},800);};

  /* ==========================================================
     VISTA PREVIA SVG de una lámina
     ========================================================== */
  P.svgLamina=function(L,anchoPx){
    var s=anchoPx/L.W,X=function(x){return ((x-L.x0)*s).toFixed(2);},Y=function(y){return ((L.y0+L.H-y)*s).toFixed(2);};
    var aci=(typeof TREPALACE_LOGO!=="undefined"&&TREPALACE_LOGO.aci)||{};
    var col=function(e,capa){if(e.rgb)return e.rgb;var c=e.color||(PLANO_CAPAS[capa||e.capa]||[7])[0];return PLANO_ACI[c]||aci[c]||"#111";};
    var dash=function(capa){var lt=(PLANO_CAPAS[capa]||[])[1];return lt==="DASHED"?' stroke-dasharray="5 3"':lt==="CENTER"?' stroke-dasharray="14 3 3 3"':'';};
    var anchoL=function(capa){return capa==="TRP-ISO-ARISTAS"?0.55:capa==="TRP-CONCRETO"?1.5:capa==="TRP-CONCRETO-ACH"?0.35:(capa==="TRP-MARCO"||capa==="TRP-ROTULO")?1.1:0.6;};
    var dentro=function(pts){return pts.some(function(q){return q[0]>=L.x0-0.01&&q[0]<=L.x0+L.W+0.01&&q[1]>=L.y0-0.01&&q[1]<=L.y0+L.H+0.01;});};
    var out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+anchoPx+' '+(L.H*s).toFixed(0)+'" width="'+anchoPx+'" style="background:#fff;font-family:Arial,sans-serif">'];
    function dib(e,capa){var cp=capa||e.capa,c=col(e,capa),lw=anchoL(cp);
      if(e.t==="LINE")out.push('<line x1="'+X(e.p[0][0])+'" y1="'+Y(e.p[0][1])+'" x2="'+X(e.p[1][0])+'" y2="'+Y(e.p[1][1])+'" stroke="'+c+'" stroke-width="'+lw+'"'+dash(cp)+'/>');
      else if(e.t==="PLINE")out.push('<'+(e.c?'polygon':'polyline')+' points="'+e.p.map(function(q){return X(q[0])+','+Y(q[1]);}).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="'+lw+'" stroke-linejoin="round"'+dash(cp)+'/>');
      else if(e.t==="CIRCLE")out.push('<circle cx="'+X(e.p[0][0])+'" cy="'+Y(e.p[0][1])+'" r="'+Math.max(0.4,e.r*s).toFixed(2)+'" fill="'+(e.r<0.01?c:'none')+'" stroke="'+c+'" stroke-width="'+lw+'"/>');
      else if(e.t==="SOLID"){var q=e.p.length===4?[e.p[0],e.p[1],e.p[3],e.p[2]]:e.p;out.push('<polygon points="'+q.map(function(p){return X(p[0])+','+Y(p[1]);}).join(' ')+'" fill="'+c+'" stroke="'+c+'" stroke-width="'+(e.rgb?0.9:0.25)+'"/>');}
      else if(e.t==="TEXT"){var anc={i:"start",c:"middle",d:"end"}[e.al],bl={b:"auto",m:"central",t:"hanging"}[e.va];
        out.push('<text x="'+X(e.p[0][0])+'" y="'+Y(e.p[0][1])+'" font-size="'+(e.h*s*1.02).toFixed(2)+'" fill="'+c+'" text-anchor="'+anc+'" dominant-baseline="'+bl+'"'+(e.neg?' font-weight="bold"':'')+(e.rot?' transform="rotate('+(-e.rot)+' '+X(e.p[0][0])+' '+Y(e.p[0][1])+')"':'')+'>'+e.s.replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</text>');}
      else if(e.t==="DIM")e.G.forEach(function(q){dib(q,"TRP-COTAS");});}
    E.forEach(function(e){if(e.t!=="MESH"&&dentro(e.t==="DIM"?[e.p1,e.p2]:e.p))dib(e);});
    out.push('</svg>');return out.join("");};
  return P;}

