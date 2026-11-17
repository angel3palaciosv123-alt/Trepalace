/* ##########################################################
   STAR · SISTEMAS DE TRATAMIENTO DE AGUA RESIDUAL
   MÓDULO DESARENADOR  (posición 7 en el menú) — desarenador_svg.js
   Dibujos del desarenador: vista en planta y perfil.
   Sufijo: las funciones y variables globales de este archivo terminan en _STAR
   (así no chocan con los módulos de STAP, IHS o RS que tengan el mismo nombre).
   ########################################################## */
// Dependencias: svgDefs/svgDimH/svgDimV y nf.
/* ==========================================================
   VISTA EN PLANTA Y PERFIL DEL DESARENADOR
   ========================================================== */

/* Fondo AL de la tolva (tronco de pirámide): lado a = √AL, centrado en el ancho y en L/3; la tubería de lodos sale por debajo */
function dsnAL_STAR(r){var a=Math.max(0.05,Math.min(Math.sqrt(Number(r.AL)||0.25),r.B*0.9,r.L*0.5)),x0a=Math.max(0.05,Math.min(r.xL3-a/2,r.L-a-0.05));
  return {a:a,x0a:x0a,x0b:x0a+a,S1:r.ho/x0a*100,S2:r.ho/(r.L-x0a-a)*100};}
function svgPlantaDes_STAR(r){
  /* Vista en planta con todas sus medidas: plataformas (b), deflectores (L/4 y 15·hv), punto bajo y salida de lodos (L/3),
     largo L, ancho B, longitud total, válvula de purga y caja de almacenamiento de lodos (separación y lado definido por el diseñador). */
  var T=DP_STAR.T.LODOS,cvS=r.ladoCaja,eM=0.20,Lt=r.L+2*(r.bp+2*eM);
  var W=860,x0=170,Lp=440,x1=x0+Lp,esc=Lp/r.L,Bp=Math.max(70,Math.min(140,r.B*esc)),pw=46,tw=5;
  var yT=150,y0=yT,y1=y0+Bp,ym=(y0+y1)/2,xe=x0+r.L/4*esc,xs=Math.max(xe+30,x1-Math.max(r.Lds*esc,16)),xl=x0+r.xL3*esc;
  var yv=y1+30,yk0=y1+58,kp=46,yk1=yk0+kp,xk0=xl-kp/2,xk1=xl+kp/2,xr=xl+kp/4,H=yk1+64;
  var C='#2563EB',M='#3F5F4E',Lo='#92400E',G='#475569';
  /* cota horizontal con texto ENCIMA; si el tramo es corto el texto va al lado indicado (izq, der) o más arriba (arr) */
  function tx(x,y,t,an){return '<text x="'+x+'" y="'+y+'" font-size="10.5" font-weight="700" text-anchor="'+an+'" fill="'+C+'" stroke="#fff" stroke-width="3" paint-order="stroke">'+t+'</text>';}
  function cH(xa,xb,y,t,yRef,lado){var s='';
    if(yRef!=null){var yy=y+(y<yRef?-4:4);s+='<line x1="'+xa+'" y1="'+yRef+'" x2="'+xa+'" y2="'+yy+'" stroke="#CBD5E1" stroke-width="0.8"/><line x1="'+xb+'" y1="'+yRef+'" x2="'+xb+'" y2="'+yy+'" stroke="#CBD5E1" stroke-width="0.8"/>';}
    s+=svgDimH(xa,xb,y,'',C);var corto=(xb-xa)<(t.length*6.3+12);
    if(!corto)return s+tx((xa+xb)/2,y-6,t,'middle');
    if(lado==='der')return s+tx(xb+7,y+4,t,'start');
    if(lado==='arr')return s+'<line x1="'+((xa+xb)/2)+'" y1="'+(y-3)+'" x2="'+((xa+xb)/2)+'" y2="'+(y-12)+'" stroke="'+C+'" stroke-width="0.8"/>'+tx((xa+xb)/2,y-16,t,'middle');
    return s+tx(xa-7,y+4,t,'end');}
  /* cota vertical con el texto a la izquierda o a la derecha */
  function cV(x,ya,yb,t,lado){var s=svgDimV(x,ya,yb,'',C);
    return s+'<text x="'+(lado==='izq'?x-9:x+9)+'" y="'+((ya+yb)/2+4)+'" font-size="10.5" font-weight="700" text-anchor="'+(lado==='izq'?'end':'start')+'" fill="'+C+'" stroke="#fff" stroke-width="3" paint-order="stroke">'+t+'</text>';}
  function tubo(x,y,w,h){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2" fill="#E2E8F0" stroke="#64748B" stroke-width="1.5"/>';}
  function fl(xa,ya,xb,yb,c){return '<line x1="'+xa+'" y1="'+ya+'" x2="'+xb+'" y2="'+yb+'" stroke="'+(c||'#2563EB')+'" stroke-width="2" stroke-linecap="round" marker-end="url(#dpFl'+(c?'M':'')+')"/>';}
  function valvula(x,y){return '<polygon points="'+(x-8)+','+(y-8)+' '+(x+8)+','+(y-8)+' '+x+','+y+'" fill="'+Lo+'"/><polygon points="'+(x-8)+','+(y+8)+' '+(x+8)+','+(y+8)+' '+x+','+y+'" fill="'+Lo+'"/>'+
    '<line x1="'+x+'" y1="'+y+'" x2="'+(x+15)+'" y2="'+y+'" stroke="'+Lo+'" stroke-width="1.8"/><line x1="'+(x+15)+'" y1="'+(y-6)+'" x2="'+(x+15)+'" y2="'+(y+6)+'" stroke="'+Lo+'" stroke-width="2.6" stroke-linecap="round"/>';}
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:760px">'+svgDefs()+
   '<defs><linearGradient id="dpAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0F2FE"/><stop offset="1" stop-color="#93C5FD"/></linearGradient>'+
   '<marker id="dpFl" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,1 L10,5 L0,9 z" fill="#2563EB"/></marker>'+
   '<marker id="dpFlM" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,1 L10,5 L0,9 z" fill="'+Lo+'"/></marker></defs>'+
   '<text x="'+(W/2)+'" y="20" font-size="13" font-weight="700" text-anchor="middle" fill="#15803D">VISTA EN PLANTA</text>'+
   /* conductos de llegada y salida */
   tubo(30,ym-9,x0-pw-tw-30,18)+fl(40,ym,x0-pw-tw-12,ym)+'<text x="'+((30+x0-pw-tw)/2)+'" y="'+(ym-16)+'" font-size="10" text-anchor="middle" fill="'+G+'">Llegada</text>'+
   tubo(x1+pw+tw,ym-9,W-130-(x1+pw+tw),18)+fl(x1+pw+tw+10,ym,W-138,ym)+'<text x="'+((x1+pw+tw+W-130)/2)+'" y="'+(ym-16)+'" font-size="10" text-anchor="middle" fill="'+G+'">Salida</text>'+
   /* tanque, plataformas y vertederos */
   '<rect x="'+x0+'" y="'+y0+'" width="'+Lp+'" height="'+Bp+'" fill="url(#dpAgua)" stroke="'+M+'" stroke-width="'+tw+'"/>'+
   '<rect x="'+(x0-pw)+'" y="'+y0+'" width="'+(pw-3)+'" height="'+Bp+'" fill="#F0FDF4" stroke="'+M+'" stroke-width="3"/>'+
   '<rect x="'+(x1+3)+'" y="'+y0+'" width="'+(pw-3)+'" height="'+Bp+'" fill="#F0FDF4" stroke="'+M+'" stroke-width="3"/>'+
   '<line x1="'+x1+'" y1="'+(y0+3)+'" x2="'+x1+'" y2="'+(y1-3)+'" stroke="'+Lo+'" stroke-width="4"/>'+
   '<line x1="'+x0+'" y1="'+(y0+3)+'" x2="'+x0+'" y2="'+(y1-3)+'" stroke="'+Lo+'" stroke-width="4"/>'+
   fl(x0+14,ym-Bp*0.18,xe-12,ym-Bp*0.18)+fl(x0+14,ym+Bp*0.18,xe-12,ym+Bp*0.18)+fl(xe+16,ym-Bp*0.18,xs-14,ym-Bp*0.18)+fl(xe+16,ym+Bp*0.18,xs-14,ym+Bp*0.18);
  [xe,xs].forEach(function(x,k){
    s+='<line x1="'+x+'" y1="'+(y0+3)+'" x2="'+x+'" y2="'+(y1-3)+'" stroke="#EA580C" stroke-width="5"/>';
    var nn=Math.max(1,Math.min(r.n,12));for(var i=1;i<=nn;i++)s+='<circle cx="'+x+'" cy="'+(y0+i*Bp/(nn+1))+'" r="1.6" fill="#fff"/>';
    s+='<text x="'+(x+(k?-6:6))+'" y="'+(y0+13)+'" font-size="9.5" font-weight="700" text-anchor="'+(k?'end':'start')+'" fill="#EA580C" stroke="#F0F9FF" stroke-width="3" paint-order="stroke">Deflector '+(k+1)+'</text>';});
  /* punto bajo de la tolva y salida de lodos por el muro (lado de abajo) */
  var AL=dsnAL_STAR(r),xa0=x0+AL.x0a*esc,xa1=x0+AL.x0b*esc,aPy=Math.max(8,Math.min(Bp*0.8,AL.a/r.B*Bp)),yA=ym-aPy/2,yA2=ym+aPy/2;
  /* tolva en tronco de pirámide: aristas desde las esquinas de As hasta el fondo AL (junto al muro de la purga) */
  s+=[[x0,y0,xa0,yA],[x1,y0,xa1,yA],[x0,y1,xa0,yA2],[x1,y1,xa1,yA2]].map(function(q){return '<line x1="'+q[0]+'" y1="'+q[1]+'" x2="'+q[2]+'" y2="'+q[3]+'" stroke="'+Lo+'" stroke-width="1" stroke-dasharray="5 4" opacity="0.8"/>';}).join('')+
   '<rect x="'+xa0+'" y="'+yA+'" width="'+(xa1-xa0)+'" height="'+(yA2-yA)+'" fill="#FDE7C2" fill-opacity="0.6" stroke="'+Lo+'" stroke-width="1.2" stroke-dasharray="4 3"/>'+
   '<text x="'+((xa0+xa1)/2)+'" y="'+(yA-5)+'" font-size="9.5" font-weight="700" text-anchor="middle" fill="'+Lo+'" stroke="#DBEAFE" stroke-width="3" paint-order="stroke">fondo AL</text>'+
   '<line x1="'+(xl-4)+'" y1="'+ym+'" x2="'+(xl-4)+'" y2="'+y1+'" stroke="#64748B" stroke-width="1.2" stroke-dasharray="4 3"/><line x1="'+(xl+4)+'" y1="'+ym+'" x2="'+(xl+4)+'" y2="'+y1+'" stroke="#64748B" stroke-width="1.2" stroke-dasharray="4 3"/>'+
   '<circle cx="'+xl+'" cy="'+ym+'" r="4" fill="none" stroke="#64748B" stroke-width="1.2"/>'+
   '<rect x="'+(xl-4)+'" y="'+(y1+2)+'" width="8" height="'+(yk0-y1)+'" fill="#E2E8F0" stroke="#64748B" stroke-width="1.3"/>'+
   valvula(xl,yv)+
   '<rect x="'+xk0+'" y="'+yk0+'" width="'+kp+'" height="'+kp+'" rx="2" fill="#FEF3C7" stroke="'+M+'" stroke-width="3"/>'+
   '<rect x="'+(xl-4)+'" y="'+(yk0+1)+'" width="8" height="10" fill="#E2E8F0" stroke="#64748B" stroke-width="1"/>'+
   '<circle cx="'+xr+'" cy="'+(yk1-12)+'" r="5" fill="#E2E8F0" stroke="#64748B" stroke-width="1.5"/>'+
   '<text x="'+(xl+24)+'" y="'+(yv+4)+'" font-size="10" fill="'+Lo+'">Válvula de purga Ø '+T.dSalida+'"</text>'+
   '<text x="'+(xk1+12)+'" y="'+(yk0+16)+'" font-size="10.5" font-weight="700" fill="'+Lo+'">Cámara de recolección de lodos</text>'+
   '<text x="'+(xk1+12)+'" y="'+(yk0+30)+'" font-size="9.5" fill="'+G+'">Lado '+nf(cvS,2)+' × '+nf(cvS,2)+' m · tubo de extracción Ø '+T.dExtraccion+'"</text>'+
   /* rótulos de plataformas */
   '<text x="'+(x0-pw/2)+'" y="'+(y1+16)+'" font-size="9.5" text-anchor="middle" fill="#15803D">Plataforma</text><text x="'+(x0-pw/2)+'" y="'+(y1+28)+'" font-size="9.5" text-anchor="middle" fill="#15803D">de entrada</text>'+
   '<text x="'+(x1+pw/2)+'" y="'+(y1+16)+'" font-size="9.5" text-anchor="middle" fill="#15803D">Plataforma</text><text x="'+(x1+pw/2)+'" y="'+(y1+28)+'" font-size="9.5" text-anchor="middle" fill="#15803D">de salida</text>'+
   /* cotas superiores */
   cH(x0-pw,x0,y0-20,'b = '+nf(r.bp,2)+' m',y0-2,'izq')+cH(x0,xe,y0-20,'L/4 = '+nf(r.Lde,2)+' m',y0-2,'arr')+cH(xe,xs,y0-20,nf(r.Lz,2)+' m',y0-2,'arr')+cH(xs,x1,y0-20,'15hv = '+nf(r.Lds,2)+' m',y0-2,'arr')+cH(x1,x1+pw,y0-20,'b = '+nf(r.bp,2)+' m',y0-2,'der')+
   cH(x0,xl,y0-56,'L/3 = '+nf(r.xL3,2)+' m',y0-24,'izq')+
   cH(x0,x1,y0-82,'L = '+nf(r.L,2)+' m',y0-60)+
   cH(x0-pw,x1+pw,y0-108,'Longitud total = '+nf(Lt,2)+' m (muros e = '+nf(eM,2)+' m)',y0-86)+
   /* cotas laterales */
   '<line x1="'+(x1+pw)+'" y1="'+y0+'" x2="'+(W-96)+'" y2="'+y0+'" stroke="#CBD5E1" stroke-width="0.8"/><line x1="'+(x1+pw)+'" y1="'+y1+'" x2="'+(W-96)+'" y2="'+y1+'" stroke="#CBD5E1" stroke-width="0.8"/>'+
   cV(W-100,y0,y1,'B = '+nf(r.B,2)+' m','der')+
   cV(xk0-18,y1+3,yk0,nf(T.separacion,2)+' m','izq')+
   cH(xk0,xk1,yk1+22,nf(cvS,2)+' m',yk1+2)+cV(xk0-18,yk0,yk1,nf(cvS,2)+' m','izq')+
   '<text x="'+(W/2)+'" y="'+(H-10)+'" font-size="10.5" text-anchor="middle" fill="#64748B">Deflectores: '+r.n+' columnas × '+r.m+' filas de orificios Ø '+nf(r.d*1000,1)+' mm · Z = '+nf(r.Z,3)+' m · W = '+nf(r.W,3)+' m. Esquema: plataformas y cámara ampliadas para leerlas.</text></svg>';
  return s;}

function svgPerfilDes_STAR(r){
function dsnDefs(){
  return '<defs>'+
   '<linearGradient id="dsnAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0F2FE"/><stop offset="1" stop-color="#93C5FD"/></linearGradient>'+
   '<linearGradient id="dsnLodo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDB06C"/><stop offset="1" stop-color="#A16207"/></linearGradient>'+
   '<marker id="dsnFlecha" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto">'+
     '<path d="M0,1 L10,5 L0,9 z" fill="#2563EB"/></marker>'+
   '<marker id="dsnFlechaM" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto">'+
     '<path d="M0,1 L10,5 L0,9 z" fill="#92400E"/></marker>'+
   '</defs>';
}

/* Línea de superficie con ondas suaves */
function dsnOnda(xa,xb,y,a,l){
  var d='M'+xa+','+y,x=xa,up=true;
  while(x<xb){
    var xn=Math.min(x+l,xb);
    d+=' Q'+((x+xn)/2)+','+(y+(up?-a:a))+' '+xn+','+y;
    x=xn; up=!up;
  }
  return '<path d="'+d+'" fill="none" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round"/>';
}

/* Tubería horizontal sencilla (rectángulo gris) */
function dsnTubo(x,y,w,h){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2" fill="#E2E8F0" stroke="#64748B" stroke-width="1.5"/>';
}

/* Flecha de flujo fina */
function dsnFl(x1,y1,x2,y2){
  return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#2563EB" stroke-width="2" stroke-linecap="round" marker-end="url(#dsnFlecha)"/>';
}

/* Símbolo de válvula de compuerta (dos triángulos) sobre tubería vertical */
function dsnValvula(x,y){
  return '<polygon points="'+(x-8)+','+(y-7)+' '+(x+8)+','+(y-7)+' '+x+','+y+'" fill="#92400E"/>'+
         '<polygon points="'+(x-8)+','+(y+7)+' '+(x+8)+','+(y+7)+' '+x+','+y+'" fill="#92400E"/>'+
         '<line x1="'+x+'" y1="'+y+'" x2="'+(x+13)+'" y2="'+y+'" stroke="#92400E" stroke-width="1.6"/>'+
         '<line x1="'+(x+13)+'" y1="'+(y-4)+'" x2="'+(x+13)+'" y2="'+(y+4)+'" stroke="#92400E" stroke-width="2.4" stroke-linecap="round"/>';
}

var DSN_MURO='#3F5F4E';
/* Cota horizontal: si el tramo es corto, el texto se escribe al lado */
function dsnCota(xa,xb,y,txt,lado){
  if(xb-xa>=90) return svgDimH(xa,xb,y,txt,'#2563EB');
  var c='#2563EB';
  return svgDimH(xa,xb,y,'',c)+'<text x="'+(lado==='der'?xb+6:xa-6)+'" y="'+(y+4)+'" font-size="11" font-weight="700" text-anchor="'+(lado==='der'?'start':'end')+'" fill="'+c+'">'+txt+'</text>';
}
  /* Escala: L ocupa Lp px; la altura H se dibuja con 100 px y ho con 56 px (esquema, no a escala vertical) */
  var W=780,H=420,x0=130,Lp=380,x1=x0+Lp,yT=110,Hp=100,yB=yT+Hp,hoP=56,yL=yB+hoP,xl=x0+Lp/3,esc=Lp/r.L;
  var AL=dsnAL_STAR(r),xa0=x0+AL.x0a*esc,xa1=Math.max(xa0+8,x0+AL.x0b*esc);   /* fondo AL de la tolva (tronco de pirámide) */
  var blP=Math.max(10,Hp*r.BL/r.H), yC=yT-blP;                  /* corona de muros */
  var xe=x0+Lp/4, xs=Math.max(xe+24,x1-Math.max(r.Lds*esc,14));  /* deflectores */
  var hdP=Math.min(Hp,Hp*(r.hd/r.H)),nm=Math.max(1,Math.min(r.m,7));
  var y3=yT+Hp/3;                                               /* fondo de la plataforma de entrada (esquema) */
  var hvP=Math.max(8,Math.min(26,Hp*r.hv/r.H));                 /* lámina sobre el vertedero */
  var ys=yT+hvP;                                                /* nivel aguas abajo del vertedero */
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:700px">'+svgDefs()+dsnDefs()+
   '<text x="'+(W/2)+'" y="20" font-size="13" font-weight="700" text-anchor="middle" fill="#15803D">CORTE LONGITUDINAL</text>'+
   /* agua en la zona efectiva */
   '<polygon points="'+x0+','+yT+' '+x1+','+yT+' '+x1+','+yB+' '+x0+','+yB+'" fill="url(#dsnAgua)"/>'+
   /* tolva de lodos: punto más bajo a L/3 */
   '<polygon points="'+x0+','+yB+' '+xa0+','+yL+' '+xa1+','+yL+' '+x1+','+yB+'" fill="url(#dsnLodo)"/>'+
   '<polygon points="'+x0+','+yB+' '+xa0+','+yL+' '+xa1+','+yL+' '+x1+','+yB+'" fill="url(#arena)" opacity="0.28"/>'+
   '<line x1="'+x0+'" y1="'+yB+'" x2="'+x1+'" y2="'+yB+'" stroke="#92400E" stroke-width="1" stroke-dasharray="5 4"/>';
  [0.10,0.30,0.52,0.72].forEach(function(f){
    var xa=x0+Lp*f, ya=yT+14;
    s+='<line x1="'+xa+'" y1="'+ya+'" x2="'+(xa+58)+'" y2="'+(yB-6)+'" stroke="#92400E" stroke-width="1" stroke-dasharray="3 4" opacity="0.38"/>'+
       '<circle cx="'+xa+'" cy="'+ya+'" r="2" fill="#92400E" opacity="0.55"/>'+
       '<circle cx="'+(xa+29)+'" cy="'+((ya+yB-6)/2)+'" r="1.7" fill="#92400E" opacity="0.5"/>';
  });
  /* muros: entrada (corona), fondo en tolva, muro de salida hasta la cresta del vertedero */
  s+='<polyline points="'+x0+','+yC+' '+x0+','+yB+' '+xa0+','+yL+' '+xa1+','+yL+' '+x1+','+yB+' '+x1+','+yT+'" fill="none" stroke="'+DSN_MURO+'" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>'+
   dsnOnda(x0+3,x1-3,yT,1.8,14)+
   /* plataforma de entrada: cresta al nivel del agua, fondo a Hp bajo la cresta */
   dsnTubo(8,yT+2,(x0-76)-8,16)+dsnFl(14,yT+10,x0-82,yT+10)+
   '<rect x="'+(x0-76)+'" y="'+(yT-6)+'" width="'+(76-3)+'" height="'+(y3-yT+6)+'" fill="url(#dsnAgua)"/>'+
   dsnOnda(x0-74,x0-6,yT-6,1.2,11)+
   '<polyline points="'+(x0-78)+','+yC+' '+(x0-78)+','+y3+' '+x0+','+y3+'" fill="none" stroke="'+DSN_MURO+'" stroke-width="5" stroke-linejoin="round"/>'+
   '<text x="'+(x0-40)+'" y="'+(yC-8)+'" font-size="10" text-anchor="middle" fill="#15803D">Plataforma entrada</text>'+
   '<text x="'+(x0-40)+'" y="'+(y3+16)+'" font-size="9.5" text-anchor="middle" fill="#334155">b = '+nf(r.bp,2)+' m</text>'+
   svgDimV(x0+12,yT,y3,'Hp','#2563EB')+
   '<text x="'+(x0-40)+'" y="'+(yT+14)+'" font-size="9.5" text-anchor="middle" fill="#2563EB">HL = '+nf(r.HL,3)+' m</text>'+
   /* plataforma de salida: vertedero con cresta en la lámina, caída hv */
   '<rect x="'+(x1+3)+'" y="'+ys+'" width="74" height="'+(y3-ys)+'" fill="url(#dsnAgua)"/>'+
   '<path d="M'+x1+','+yT+' Q'+(x1+10)+','+yT+' '+(x1+18)+','+ys+'" fill="none" stroke="#2563EB" stroke-width="1.8"/>'+
   dsnOnda(x1+18,x1+76,ys,1.1,11)+
   '<polyline points="'+x1+','+y3+' '+(x1+80)+','+y3+' '+(x1+80)+','+yC+'" fill="none" stroke="'+DSN_MURO+'" stroke-width="5" stroke-linejoin="round"/>'+
   dsnTubo(x1+82,y3-20,20,14)+dsnFl(x1+85,y3-13,x1+100,y3-13)+
   '<text x="'+(x1+40)+'" y="'+(yC-8)+'" font-size="10" text-anchor="middle" fill="#15803D">Plataforma salida</text>'+
   '<text x="'+(x1+42)+'" y="'+(ys+16)+'" font-size="9.5" text-anchor="middle" fill="#2563EB">hv = '+nf(r.hv,3)+' m</text>';
  /* deflectores en la posición calculada */
  [xe,xs].forEach(function(x,k){
    s+='<rect x="'+(x-3)+'" y="'+(yT-8)+'" width="6" height="'+(hdP+8)+'" rx="1" fill="#EA580C"/>';
    for(var i=1;i<=nm;i++) s+='<circle cx="'+x+'" cy="'+(yT+i*hdP/(nm+1))+'" r="1.8" fill="#fff"/>';
    s+='<text x="'+x+'" y="'+(yT+hdP+14)+'" font-size="9.5" text-anchor="middle" fill="#EA580C">Deflector '+(k+1)+' (H/'+PRO.desDef+' = '+nf(r.hd,2)+' m)</text>';});
  /* salida de lodos: sale por el muro lateral en L/3 (se ve de frente) hacia la caja de almacenamiento, al costado y abajo */
  s+='<rect x="'+(xl-26)+'" y="'+(yL-16)+'" width="52" height="40" fill="none" stroke="#475569" stroke-width="1.3" stroke-dasharray="6 4" opacity="0.8"/>'+
   '<line x1="'+(xl-14)+'" y1="'+(yC-14)+'" x2="'+(xl-14)+'" y2="'+(yL-16)+'" stroke="#475569" stroke-width="1.3" stroke-dasharray="6 4" opacity="0.75"/>'+
   '<ellipse cx="'+(xl-14)+'" cy="'+(yC-14)+'" rx="12" ry="3.5" fill="#B91C1C"/>'+
   '<line x1="'+(xl+14)+'" y1="'+(yC-8)+'" x2="'+(xl+14)+'" y2="'+(yL-16)+'" stroke="#64748B" stroke-width="1.3" stroke-dasharray="6 4" opacity="0.75"/>'+
   '<rect x="'+(xl+9)+'" y="'+(yC-12)+'" width="10" height="4" fill="#5F6B75"/>'+
   '<rect x="'+(xl-4)+'" y="'+(yL+2)+'" width="8" height="10" fill="#E2E8F0" stroke="#64748B" stroke-width="1.3"/>'+
   '<circle cx="'+xl+'" cy="'+(yL+16)+'" r="7" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>'+
   '<circle cx="'+xl+'" cy="'+(yL+16)+'" r="4" fill="none" stroke="#64748B" stroke-width="1"/>'+
   '<text x="'+(xl+32)+'" y="'+(yL+12)+'" font-size="10.5" font-weight="700" fill="#92400E" stroke="#F8FAFC" stroke-width="2" paint-order="stroke">Tubería de lodos Ø 6" bajo el fondo AL</text>'+
   '<text x="'+(xl+32)+'" y="'+(yL+25)+'" font-size="9.5" fill="#475569" stroke="#F8FAFC" stroke-width="2" paint-order="stroke">pasa bajo el muro hacia la cámara de recolección (punteada)</text>'+
   '<text x="'+(xl+24)+'" y="'+(yC-11)+'" font-size="9.5" fill="#B91C1C">Volante de la válvula · tubo de extracción</text>'+
   '<text x="'+(xl+70)+'" y="'+(yB+20)+'" font-size="11" font-weight="700" text-anchor="middle" fill="#78350F" stroke="#FDE7C2" stroke-width="2.5" paint-order="stroke">Zona de lodos</text>'+
   '<text x="'+((xe+xs)/2)+'" y="'+(yT+Hp/2+4)+'" font-size="11" text-anchor="middle" fill="#1E40AF">Zona de sedimentación</text>'+
   /* cotas */
   dsnCota(x0,xe,yC-30,'L/4 = '+nf(r.Lde,2)+' m','der')+dsnCota(xs,x1,yC-30,'15hv = '+nf(r.Lds,2)+' m','izq')+
   svgDimV(x1+126,yC,yT,'BL = '+nf(r.BL,2)+' m','#2563EB')+
   svgDimV(x1+126,yT,yB,'H = '+nf(r.H,2)+' m','#2563EB')+svgDimV(x1+126,yB,yL,'H2 = ho = '+nf(r.ho,2)+' m','#2563EB')+
   svgDimH(x0,xl,yL+56,'L/3 = '+nf(r.xL3,2)+' m','#2563EB')+svgDimH(xl,x1,yL+56,'2L/3 = '+nf(r.xL23,2)+' m','#2563EB')+
   svgDimH(x0,x1,yL+84,'L = '+nf(r.L,2)+' m','#2563EB')+
   '<text x="'+(x0+Lp/6-8)+'" y="'+(yB+(yL-yB)/2+18)+'" font-size="10" font-weight="700" text-anchor="end" fill="#78350F">S = '+nf(AL.S1,1)+' %</text>'+
   '<text x="'+(xl+Lp/3+8)+'" y="'+(yB+(yL-yB)/2+18)+'" font-size="10" font-weight="700" text-anchor="start" fill="#78350F">S = '+nf(AL.S2,1)+' %</text>'+
   '<text x="'+((xa0+xa1)/2)+'" y="'+(yL-16)+'" font-size="9.5" font-weight="700" text-anchor="middle" fill="#78350F" stroke="#FDE7C2" stroke-width="2.5" paint-order="stroke">fondo AL</text>'+
   svgDimH(xa0,xa1,yL+36,'a = '+nf(AL.a,2)+' m','#92400E')+'</svg>';
  return s;}

/* ==========================================================
   DETALLES AMPLIADOS: PLATAFORMA DE ENTRADA Y DE SALIDA (corte longitudinal)
   Mismo estilo de ilustración que la canaleta Parshall. Los símbolos van sobre el
   dibujo y los valores en el cuadro "Medidas" de abajo.
   Niveles usados para que el dibujo sea coherente:
   · Entrada: cresta al nivel del agua del desarenador; agua de la plataforma = +he; fondo = he − Hp.
   · Salida : cresta = −hv; fondo = −hv − Hp; agua de la plataforma = fondo + HL (descarga libre).
   ========================================================== */
var DSD_V_STAR='#15803D',DSD_M_STAR='#3D5A4C',DSD_G_STAR='#475569',DSD_A_STAR='#2563EB',DSD_N_STAR='#EA580C',
    DSD_H_STAR=' stroke="#FFFFFF" stroke-width="3" paint-order="stroke"',
    DSD_F_STAR='font-family="system-ui,Segoe UI,Arial,sans-serif"';
function dsdQ_STAR(v){return Math.round(v*100)/100;}
function dsdFlecha_STAR(x,y,dx,dy,c){var nx=-dy,ny=dx;
  return '<polygon points="'+dsdQ_STAR(x)+','+dsdQ_STAR(y)+' '+dsdQ_STAR(x-dx*7+nx*3)+','+dsdQ_STAR(y-dy*7+ny*3)+' '+dsdQ_STAR(x-dx*7-nx*3)+','+dsdQ_STAR(y-dy*7-ny*3)+'" fill="'+c+'"/>';}
function dsdTxt_STAR(x,y,t,c,tam,peso,ancla,extra){
  return '<text x="'+dsdQ_STAR(x)+'" y="'+dsdQ_STAR(y)+'" font-size="'+(tam||10.5)+'"'+(peso?' font-weight="'+peso+'"':'')+' text-anchor="'+(ancla||'start')+'" fill="'+c+'"'+(extra||'')+'>'+t+'</text>';}
function dsdLinea_STAR(x1,y1,x2,y2,c,dash,w){
  return '<line x1="'+dsdQ_STAR(x1)+'" y1="'+dsdQ_STAR(y1)+'" x2="'+dsdQ_STAR(x2)+'" y2="'+dsdQ_STAR(y2)+'" stroke="'+c+'" stroke-width="'+(w||1)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';}
/* cota vertical con flechas; el texto es solo el símbolo */
function dsdDimV_STAR(x,ya,yb,txt,c,lado){
  var h=dsdLinea_STAR(x,ya,x,yb,c,null,1.4)+dsdLinea_STAR(x-4,ya,x+4,ya,c,null,1.2)+dsdLinea_STAR(x-4,yb,x+4,yb,c,null,1.2);
  if(Math.abs(yb-ya)>=18) h+=dsdFlecha_STAR(x,ya,0,-1,c)+dsdFlecha_STAR(x,yb,0,1,c);
  else h+=dsdFlecha_STAR(x,ya,0,1,c)+dsdFlecha_STAR(x,yb,0,-1,c)+dsdLinea_STAR(x,ya-10,x,ya,c,null,1.4)+dsdLinea_STAR(x,yb,x,yb+10,c,null,1.4);
  return h+dsdTxt_STAR(lado==='l'?x-8:x+9,(ya+yb)/2+4,txt,c,11,'700',lado==='l'?'end':'start',DSD_H_STAR);}
function dsdDimH_STAR(xa,xb,y,txt,c){
  return dsdLinea_STAR(xa,y,xb,y,c,null,1.4)+dsdLinea_STAR(xa,y-4,xa,y+4,c,null,1.2)+dsdLinea_STAR(xb,y-4,xb,y+4,c,null,1.2)+
    dsdFlecha_STAR(xa,y,-1,0,c)+dsdFlecha_STAR(xb,y,1,0,c)+dsdTxt_STAR((xa+xb)/2,y-7,txt,c,11,'700','middle',DSD_H_STAR);}
function dsdPastilla_STAR(x,y,t){var w=t.length*5.7+16;
  return '<rect x="'+dsdQ_STAR(x-w/2)+'" y="'+(y-11)+'" width="'+dsdQ_STAR(w)+'" height="17" rx="8.5" fill="#F1F5F9" stroke="#E2E8F0"/>'+dsdTxt_STAR(x,y+1,t,'#64748B',10,'600','middle');}
function dsdFlujo_STAR(x1,x2,y){
  return dsdLinea_STAR(x1,y,x2-6,y,'#1D4ED8',null,4)+dsdFlecha_STAR(x2,y,1,0,'#1D4ED8')+dsdTxt_STAR((x1+x2)/2,y-10,'Flujo','#1D4ED8',10.5,'600','middle');}
function dsdOnda_STAR(xa,xb,y){var d='M'+dsdQ_STAR(xa)+','+dsdQ_STAR(y),x=xa,up=true;
  while(x<xb-1){var xn=Math.min(x+14,xb);d+=' Q'+dsdQ_STAR((x+xn)/2)+','+dsdQ_STAR(y+(up?-1.4:1.4))+' '+dsdQ_STAR(xn)+','+dsdQ_STAR(y);x=xn;up=!up;}
  return '<path d="'+d+'" fill="none" stroke="'+DSD_A_STAR+'" stroke-width="2.2" stroke-linecap="round"/>';}
function dsdMuro_STAR(x,y,w,h){
  return '<rect x="'+dsdQ_STAR(x)+'" y="'+dsdQ_STAR(y)+'" width="'+dsdQ_STAR(w)+'" height="'+dsdQ_STAR(h)+'" fill="url(#dsdConcreto)" stroke="'+DSD_M_STAR+'" stroke-width="2.5" stroke-linejoin="round"/>';}
function dsdDefs_STAR(){
  return '<defs>'+
   '<linearGradient id="dsdAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0F2FE"/><stop offset="1" stop-color="#93C5FD"/></linearGradient>'+
   '<pattern id="dsdConcreto" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#EEF2EF"/><line x1="0" y1="0" x2="0" y2="8" stroke="#CBD5D0" stroke-width="1.4"/></pattern>'+
   '</defs>';}
/* cuadro de valores: SOLO las medidas que aparecen acotadas en el dibujo (valor numérico o texto) */
function dsdCuadro_STAR(V,yG,W){
  var cols=Math.min(4,V.length),ancho=(W-84-(cols-1)*10)/cols,s=dsdTxt_STAR(W/2,yG-14,'Medidas del dibujo',DSD_V_STAR,11,'700','middle');
  V.forEach(function(v,i){
    var cx=42+(i%cols)*(ancho+10), cy=yG+Math.floor(i/cols)*34, val=typeof v[1]==='string'?v[1]:nf(v[1],v[2])+' '+v[3];
    s+='<rect x="'+dsdQ_STAR(cx)+'" y="'+cy+'" width="'+dsdQ_STAR(ancho)+'" height="26" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>'+
       dsdTxt_STAR(cx+12,cy+17,v[0],DSD_G_STAR,11,'700')+dsdTxt_STAR(cx+ancho-12,cy+17,val,'#334155',11.5,'600','end');});
  return s;}
/* escala común (px/m) para que las dos plataformas se vean iguales */
function dsdEsc_STAR(r){return Math.min(220/r.bp,150/(r.hv+r.Hp),2000);}
/* línea de quiebre (zigzag) para indicar que el dibujo continúa */
function dsdQuiebre_STAR(x1,y1,x2,y2){
  var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux,mx=(x1+x2)/2,my=(y1+y2)/2;
  var p=[[x1,y1],[mx-ux*5,my-uy*5],[mx-ux*2+nx*7,my-uy*2+ny*7],[mx+ux*2-nx*7,my+uy*2-ny*7],[mx+ux*5,my+uy*5],[x2,y2]];
  return '<polyline points="'+p.map(function(q){return dsdQ_STAR(q[0])+','+dsdQ_STAR(q[1]);}).join(' ')+'" fill="none" stroke="#64748B" stroke-width="1.3"/>';}
/* marca de nivel: triángulo invertido + texto */
function dsdNivel_STAR(x,y,t,ancla){
  return '<polygon points="'+dsdQ_STAR(x-5)+','+dsdQ_STAR(y-8)+' '+dsdQ_STAR(x+5)+','+dsdQ_STAR(y-8)+' '+dsdQ_STAR(x)+','+dsdQ_STAR(y)+'" fill="#334155"/>'+
    dsdLinea_STAR(x-14,y,x+14,y,'#334155',null,1)+dsdTxt_STAR(ancla==='end'?x-10:x+10,y-10,t,'#334155',10,'600',ancla||'start',DSD_H_STAR);}
/* rótulo con línea guía */
function dsdRotulo_STAR(px,py,tx,ty,t,c,ancla){
  return '<circle cx="'+dsdQ_STAR(px)+'" cy="'+dsdQ_STAR(py)+'" r="2.2" fill="'+(c||DSD_G_STAR)+'"/>'+dsdLinea_STAR(px,py,tx,ty,c||DSD_G_STAR,null,0.9)+
    dsdTxt_STAR(ancla==='end'?tx-4:tx+4,ty+4,t,c||DSD_G_STAR,10.5,'600',ancla||'start',DSD_H_STAR);}
/* tubería con brida en el muro y flecha de flujo dentro */
function dsdTuberia_STAR(xa,xb,yTop,h,xBrida,dir){
  var s='<rect x="'+dsdQ_STAR(xa)+'" y="'+dsdQ_STAR(yTop)+'" width="'+dsdQ_STAR(xb-xa)+'" height="'+dsdQ_STAR(h)+'" fill="#E2E8F0" stroke="#64748B" stroke-width="1.5"/>'+
    '<rect x="'+dsdQ_STAR(xBrida-3)+'" y="'+dsdQ_STAR(yTop-5)+'" width="6" height="'+dsdQ_STAR(h+10)+'" fill="#64748B"/>';
  var ym=yTop+h/2,x1=dir>0?xa+12:xb-12,x2=dir>0?xb-14:xa+14;
  return s+dsdLinea_STAR(x1,ym,x2-dir*6,ym,'#1D4ED8',null,2.4)+dsdFlecha_STAR(x2,ym,dir,0,'#1D4ED8');}
function dsdLlegadaTxt_STAR(){try{var ll=desLlegada_STAR();return (ll.tipo==='canal'?'Canal ':'Tubería ')+ll.lab;}catch(_){return 'Ø 6"';}}

function svgPlatEntradaDes_STAR(r){
  /* Niveles (m) respecto al agua del desarenador: cresta del vertedero de entrada = 0 (N.A.), agua en la plataforma = +HL,
     fondo de la plataforma = −Hp. La corona (+BL) se dibuja con quiebre en los muros. */
  var W=860,e=dsdEsc_STAR(r),tw=18,zW=r.HL,zF=-r.Hp;
  var yC=70,y0=yC+Math.max(70,zW*e+56);
  function Y(z){return y0-z*e;}
  var xa=250,xb=xa+r.bp*e,xd=xb+tw,xr=W-200;
  var yW=Y(zW),yF=Y(zF),yBot=Math.max(yF+tw+70,y0+120),xn=xd+Math.max(22,(y0-yW)*1.6);
  var pH=Math.max(16,Math.min(30,(yF-yW)*0.75)),yQ=yC+(Math.min(yW,y0)-yC)*0.45;
  var yG=yBot+70,H=yG+2*34+14,lab=dsdLlegadaTxt_STAR();
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:880px" xmlns="http://www.w3.org/2000/svg" '+DSD_F_STAR+' role="img" aria-label="Detalle de la plataforma de entrada">'+dsdDefs_STAR()+
   dsdTxt_STAR(W/2,24,'DETALLE PLATAFORMA DE ENTRADA — CORTE LONGITUDINAL',DSD_V_STAR,13,'700','middle')+
   /* agua: plataforma, lámina vertiente y desarenador */
   '<rect x="'+xa+'" y="'+dsdQ_STAR(yW)+'" width="'+dsdQ_STAR(xb-xa)+'" height="'+dsdQ_STAR(yF-yW)+'" fill="url(#dsdAgua)"/>'+
   '<rect x="'+xd+'" y="'+dsdQ_STAR(y0)+'" width="'+dsdQ_STAR(xr-xd)+'" height="'+dsdQ_STAR(yBot-y0)+'" fill="url(#dsdAgua)"/>'+
   '<path d="M'+dsdQ_STAR(xb-36)+','+dsdQ_STAR(yW)+' Q'+dsdQ_STAR(xb+2)+','+dsdQ_STAR(yW)+' '+dsdQ_STAR(xd+2)+','+dsdQ_STAR(y0-(y0-yW)*0.35)+' Q'+dsdQ_STAR(xd+10)+','+dsdQ_STAR(y0)+' '+dsdQ_STAR(xn)+','+dsdQ_STAR(y0)+' L'+xd+','+dsdQ_STAR(y0)+' L'+xd+','+dsdQ_STAR(y0)+' L'+xb+','+dsdQ_STAR(y0)+' L'+xb+','+dsdQ_STAR(yW)+' z" fill="url(#dsdAgua)"/>'+
   '<path d="M'+dsdQ_STAR(xb-36)+','+dsdQ_STAR(yW)+' Q'+dsdQ_STAR(xb+2)+','+dsdQ_STAR(yW)+' '+dsdQ_STAR(xd+2)+','+dsdQ_STAR(y0-(y0-yW)*0.35)+' Q'+dsdQ_STAR(xd+10)+','+dsdQ_STAR(y0)+' '+dsdQ_STAR(xn)+','+dsdQ_STAR(y0)+'" fill="none" stroke="'+DSD_A_STAR+'" stroke-width="2.2"/>'+
   dsdOnda_STAR(xa+2,xb-36,yW)+dsdOnda_STAR(xn,xr,y0)+
   /* estructura: muro de llegada (con quiebre), losa, muro-vertedero que baja al desarenador */
   dsdMuro_STAR(xa-tw,yC,tw,yF-yC+tw)+dsdMuro_STAR(xa-tw,yF,xb-xa+tw*2,tw)+dsdMuro_STAR(xb,y0,tw,yBot-y0)+
   '<rect x="'+(xa-tw-2)+'" y="'+dsdQ_STAR(yQ-5)+'" width="'+(tw+4)+'" height="10" fill="#fff"/>'+dsdQuiebre_STAR(xa-tw-6,yQ,xa+4,yQ)+
   dsdQuiebre_STAR(xb-6,yBot,xr+6,yBot)+dsdQuiebre_STAR(xr,y0-8,xr,yBot+4)+
   /* conducto de llegada con brida y flecha de flujo */
   dsdTuberia_STAR(60,xa,yF-pH,pH,xa-tw-3,1)+
   '<rect x="'+(xa-tw)+'" y="'+dsdQ_STAR(yF-pH)+'" width="'+tw+'" height="'+dsdQ_STAR(pH)+'" fill="url(#dsdAgua)"/>'+
   dsdTxt_STAR(60,yF+22,'Llegada: '+lab,DSD_G_STAR,10.5,'600','start')+
   /* niveles */
   dsdNivel_STAR(xa-tw-40,yC,'Corona','end')+
   dsdNivel_STAR(xa+28,yW,'N.A. plataforma')+
   dsdNivel_STAR(xr-40,y0,'N.A. = cresta')+
   dsdNivel_STAR(xb-26,yF,'Fondo','end')+
   /* rótulos */
   dsdRotulo_STAR(xb+tw/2,y0+4,xr+30,y0+60,'Vertedero de entrada',DSD_M_STAR)+
   dsdRotulo_STAR((xa+xb)/2,yF+tw/2,xr+30,yF+tw+28,'Losa de la plataforma',DSD_M_STAR)+
   dsdPastilla_STAR((xd+xr)/2+30,yBot-18,'Desarenador')+dsdPastilla_STAR((xa+xb)/2,yC+16,'Plataforma de entrada')+
   /* cotas: solo las del cuadro */
   dsdDimV_STAR(xa+14,y0,yF,'Hp',DSD_A_STAR)+
   dsdDimV_STAR(xa+14,yW,y0,'HL',DSD_N_STAR)+
   dsdLinea_STAR(xb+tw,y0,xr+60,y0,'#CBD5E1','4 3')+dsdLinea_STAR(xa,yC,xr+60,yC,'#CBD5E1','4 3')+
   dsdDimV_STAR(xr+54,yC,y0,'BL',DSD_G_STAR)+
   dsdLinea_STAR(xa,yF+tw+4,xa,yF+tw+40,'#CBD5E1')+dsdLinea_STAR(xb,yF+tw+4,xb,yF+tw+40,'#CBD5E1')+
   dsdDimH_STAR(xa,xb,yF+tw+34,'b',DSD_G_STAR)+
   dsdDimV_STAR(48,yF-pH,yF,'D',DSD_G_STAR,'l');
  s+=dsdCuadro_STAR([['b',r.bp,3,'m'],['Hp',r.Hp,3,'m'],['HL',r.HL,3,'m'],['BL',r.BL,3,'m'],['D',lab]],yG,W)+'</svg>';
  return s;}

function svgPlatSalidaDes_STAR(r){
  /* cresta = −hv; fondo de la plataforma = −hv − Hp; agua en la plataforma (descarga libre) = fondo + HL. */
  var W=860,e=dsdEsc_STAR(r),tw=18,zCr=-r.hv,zF=-r.hv-r.Hp,zW=zF+r.HL;
  var yC=70,y0=yC+70;
  function Y(z){return y0-z*e;}
  var xl=70,xw=470,xa=xw+tw,xb=xa+r.bp*e;
  var yCr=Y(zCr),yF=Y(zF),yW=Y(zW),yBot=Math.max(yF+tw+80,y0+130),xn=xa+Math.max(18,(yW-yCr)*0.9);
  var dReal=r.Lds*e,dMax=xw-xl-90,dpx=Math.min(dReal,dMax),xdf=xw-dpx,cortado=dReal>dMax;
  var pH=Math.max(16,Math.min(30,(yF-yW)*1.4)),yQ=yC+(y0-yC)*0.45;
  var yG=yBot+70,H=yG+2*34+14,dS=DP_STAR.T.LODOS?'Ø 6"':'Ø 6"';
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:880px" xmlns="http://www.w3.org/2000/svg" '+DSD_F_STAR+' role="img" aria-label="Detalle de la plataforma de salida">'+dsdDefs_STAR()+
   dsdTxt_STAR(W/2,24,'DETALLE PLATAFORMA DE SALIDA — CORTE LONGITUDINAL',DSD_V_STAR,13,'700','middle')+
   /* agua */
   '<rect x="'+xl+'" y="'+dsdQ_STAR(y0)+'" width="'+(xw-xl)+'" height="'+dsdQ_STAR(yBot-y0)+'" fill="url(#dsdAgua)"/>'+
   '<rect x="'+xa+'" y="'+dsdQ_STAR(yW)+'" width="'+dsdQ_STAR(xb-xa)+'" height="'+dsdQ_STAR(yF-yW)+'" fill="url(#dsdAgua)"/>'+
   '<path d="M'+(xw-36)+','+dsdQ_STAR(y0)+' Q'+(xw-4)+','+dsdQ_STAR(y0+1)+' '+(xw+tw)+','+dsdQ_STAR(yCr)+' Q'+dsdQ_STAR(xa+8)+','+dsdQ_STAR((yCr+yW)/2)+' '+dsdQ_STAR(xn)+','+dsdQ_STAR(yW)+' L'+xa+','+dsdQ_STAR(yW)+' L'+xa+','+dsdQ_STAR(yCr)+' L'+xw+','+dsdQ_STAR(yCr)+' L'+xw+','+dsdQ_STAR(y0)+' z" fill="url(#dsdAgua)"/>'+
   '<path d="M'+(xw-36)+','+dsdQ_STAR(y0)+' Q'+(xw-4)+','+dsdQ_STAR(y0+1)+' '+(xw+tw)+','+dsdQ_STAR(yCr)+' Q'+dsdQ_STAR(xa+8)+','+dsdQ_STAR((yCr+yW)/2)+' '+dsdQ_STAR(xn)+','+dsdQ_STAR(yW)+'" fill="none" stroke="'+DSD_A_STAR+'" stroke-width="2.2"/>'+
   dsdOnda_STAR(xl+4,xw-36,y0)+dsdOnda_STAR(xn,xb,yW)+
   /* estructura */
   dsdMuro_STAR(xw,yCr,tw,yBot-yCr)+dsdMuro_STAR(xa-tw,yF,xb-xa+tw*2,tw)+dsdMuro_STAR(xb,yC,tw,yF-yC+tw)+
   '<rect x="'+(xb-2)+'" y="'+dsdQ_STAR(yQ-5)+'" width="'+(tw+4)+'" height="10" fill="#fff"/>'+dsdQuiebre_STAR(xb-4,yQ,xb+tw+6,yQ)+
   dsdQuiebre_STAR(xl-6,yBot,xw+6,yBot)+dsdQuiebre_STAR(xl,y0-8,xl,yBot+4)+
   (cortado?dsdQuiebre_STAR((xdf+xw)/2-60,y0-14,(xdf+xw)/2-60,y0+30):'')+
   /* deflector de salida (continúa hacia abajo) */
   '<rect x="'+dsdQ_STAR(xdf-4)+'" y="'+dsdQ_STAR(yC+8)+'" width="8" height="'+dsdQ_STAR(yBot-yC-8)+'" rx="1" fill="'+DSD_N_STAR+'"/>'+
   /* tubería de salida con brida */
   dsdTuberia_STAR(xb,W-60,yF-pH,pH,xb+tw+3,1)+
   '<rect x="'+dsdQ_STAR(xb)+'" y="'+dsdQ_STAR(yF-pH)+'" width="'+tw+'" height="'+dsdQ_STAR(pH)+'" fill="url(#dsdAgua)"/>'+
   dsdTxt_STAR(W-60,yF+tw+18,'Salida: tubería '+dS,DSD_G_STAR,10.5,'600','end')+
   /* niveles */
   dsdNivel_STAR(xl+40,yC,'Corona')+
   dsdNivel_STAR((xdf+xw)/2+10,y0,'N.A. desarenador')+
   dsdNivel_STAR(xw-24,yCr,'Cresta','end')+
   dsdNivel_STAR(xa+(xb-xa)*0.62,yF,'Fondo','end')+
   /* rótulos */
   dsdRotulo_STAR(xdf+4,y0+70,xdf+60,y0+110,'Deflector de salida',DSD_N_STAR)+
   dsdRotulo_STAR(xw+tw/2,yCr+40,xw-150,yBot-40,'Vertedero de salida',DSD_M_STAR,'end')+
   dsdPastilla_STAR((xl+xdf)/2,yBot-18,'Desarenador')+dsdPastilla_STAR((xa+xb)/2+30,yC+16,'Plataforma de salida')+
   /* cotas: solo las del cuadro */
   dsdLinea_STAR(xdf,yC+4,xdf,yC-26,'#CBD5E1')+dsdLinea_STAR(xw,yCr-4,xw,yC-26,'#CBD5E1')+
   dsdDimH_STAR(xdf,xw,yC-20,'15·hv',DSD_N_STAR)+
   dsdLinea_STAR(xw-30,y0,xa+(xb-xa)*0.3+6,y0,'#CBD5E1','4 3')+
   dsdDimV_STAR(xa+(xb-xa)*0.3,y0,yCr,'hv',DSD_N_STAR)+
   dsdDimV_STAR(xa+(xb-xa)*0.3,yCr,yF,'Hp',DSD_A_STAR)+
   dsdLinea_STAR(xl,yC,xb+tw,yC,'#CBD5E1','4 3')+
   dsdDimV_STAR(xl+16,yC,y0,'BL',DSD_G_STAR,'l')+
   dsdLinea_STAR(xa,yF+tw+4,xa,yF+tw+40,'#CBD5E1')+dsdLinea_STAR(xb,yF+tw+4,xb,yF+tw+40,'#CBD5E1')+
   dsdDimH_STAR(xa,xb,yF+tw+34,'b',DSD_G_STAR)+
   dsdDimV_STAR(W-48,yF-pH,yF,'D',DSD_G_STAR);
  s+=dsdCuadro_STAR([['b',r.bp,3,'m'],['Hp',r.Hp,3,'m'],['hv',r.hv,3,'m'],['15·hv',r.Lds,3,'m'],['BL',r.BL,3,'m'],['D','Tubería '+dS]],yG,W)+
   (cortado?dsdTxt_STAR(W/2,H-4,'La distancia 15·hv se dibuja recortada (línea de quiebre).','#64748B',10,'','middle'):'')+'</svg>';
  return s;}

/* ==========================================================
   CORTE TRANSVERSAL POR L/3: SALIDA Y ALMACENAMIENTO DE LODOS
   En el punto bajo de la tolva sale una tubería Ø 6" por el muro lateral → válvula de compuerta
   (vástago en tubo camisa, volante en la corona) → caja de almacenamiento de lodos baja (lado definido por el diseñador);
   los lodos se sacan periódicamente por el tubo de extracción (bomba o vactor). Esquema sin escala.
   ========================================================== */
function svgTransDes_STAR(r){
  var W=760,Hs=470,yC=70,yT=96,yB=226,yL=262,ew=9,es=14,cvS=r.ladoCaja,AL=dsnAL_STAR(r);
  var xT0=430,xT1=xT0+Math.max(120,Math.min(200,120*r.B/0.8)),aPx=Math.max(16,Math.min((xT1-xT0)*0.8,AL.a/r.B*(xT1-xT0)))||16,xw=xT0-ew-60,xb1=xw-ew,xb0=xb1-90,xo=xb0-ew;
  var xc=(xT0+xT1)/2,yp=yL+es+12,yK=yp-20,yF=yp+66,xv=(xT0-ew+xw)/2,xr=xb0+20;   /* AL centrado; tubería bajo la losa */
  var M='#3F5F4E',P='#64748B',Lo='#92400E',C='#D6D3CB';
  var s='<svg viewBox="0 0 '+W+' '+Hs+'" width="100%" style="max-width:700px">'+svgDefs()+
   '<defs><linearGradient id="dstAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0F2FE"/><stop offset="1" stop-color="#93C5FD"/></linearGradient>'+
   '<linearGradient id="dstLodo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDB06C"/><stop offset="1" stop-color="#A16207"/></linearGradient>'+
   '<marker id="dstFl" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,1 L10,5 L0,9 z" fill="'+Lo+'"/></marker></defs>'+
   '<text x="'+(W/2)+'" y="20" font-size="13" font-weight="700" text-anchor="middle" fill="#15803D">CORTE TRANSVERSAL POR L/3 · SALIDA Y ALMACENAMIENTO DE LODOS</text>'+
   /* terreno */
   '<line x1="'+(xo-40)+'" y1="'+yC+'" x2="'+(xT0-ew)+'" y2="'+yC+'" stroke="#78716C" stroke-width="1.5"/>'+
   '<text x="'+(xo-44)+'" y="'+(yC+4)+'" font-size="9.5" text-anchor="end" fill="#78716C">Relleno compactado</text>'+
   /* desarenador: agua, lodos y concreto */
   '<rect x="'+xT0+'" y="'+yT+'" width="'+(xT1-xT0)+'" height="'+(yB-yT)+'" fill="url(#dstAgua)"/>'+
   '<polygon points="'+xT0+','+yB+' '+xT1+','+yB+' '+(xc+aPx/2)+','+yL+' '+(xc-aPx/2)+','+yL+'" fill="url(#dstLodo)"/>'+
   '<line x1="'+xT0+'" y1="'+yT+'" x2="'+xT1+'" y2="'+yT+'" stroke="#2563EB" stroke-width="1.8"/>'+
   '<line x1="'+xT0+'" y1="'+yB+'" x2="'+xT1+'" y2="'+yB+'" stroke="'+Lo+'" stroke-width="1" stroke-dasharray="5 4"/>'+
   '<path d="M'+(xT0-ew)+','+yC+' V'+(yB+es)+' L'+(xc-aPx/2-3)+','+(yL+es)+' H'+(xc+aPx/2+3)+' L'+(xT1+ew)+','+(yB+es)+' V'+yC+' H'+xT1+' V'+yB+' L'+(xc+aPx/2)+','+yL+' H'+(xc-aPx/2)+' L'+xT0+','+yB+' V'+yC+' Z" fill="'+C+'" stroke="'+M+'" stroke-width="1.5"/>'+
   /* caja de almacenamiento (baja, con losa tapa) */
   '<path d="M'+xo+','+(yK-ew)+' H'+xw+' V'+(yF+ew)+' H'+xo+' Z M'+xb0+','+yK+' V'+yF+' H'+xb1+' V'+yK+' Z" fill="'+C+'" fill-rule="evenodd" stroke="'+M+'" stroke-width="1.5"/>'+
   '<rect x="'+xb0+'" y="'+(yF-22)+'" width="'+(xb1-xb0)+'" height="22" fill="url(#dstLodo)"/>'+
   /* tubería de lodos: boca en el centro del fondo AL, corre bajo la losa y pasa bajo el muro hasta la cámara */
   '<rect x="'+(xc-6)+'" y="'+(yL-1)+'" width="12" height="'+(yp-yL+1)+'" fill="#E2E8F0" stroke="'+P+'" stroke-width="1.5"/>'+
   '<rect x="'+(xb1-10)+'" y="'+(yp-6)+'" width="'+(xc+6-xb1+10)+'" height="12" fill="#E2E8F0" stroke="'+P+'" stroke-width="1.5"/>'+
   '<rect x="'+(xc-5)+'" y="'+(yp-5)+'" width="10" height="10" fill="#E2E8F0"/>'+
   '<rect x="'+(xT0-ew-4)+'" y="'+(yp-10)+'" width="4" height="20" fill="'+P+'"/><rect x="'+xw+'" y="'+(yp-10)+'" width="4" height="20" fill="'+P+'"/>'+
   '<line x1="'+(xb1-12)+'" y1="'+yp+'" x2="'+(xb1-28)+'" y2="'+(yp+16)+'" stroke="'+Lo+'" stroke-width="2" marker-end="url(#dstFl)"/>'+
   /* válvula, bonete, tubo camisa con vástago y volante */
   '<polygon points="'+(xv-12)+','+(yp-10)+' '+(xv-12)+','+(yp+10)+' '+xv+','+yp+'" fill="'+Lo+'"/>'+
   '<polygon points="'+(xv+12)+','+(yp-10)+' '+(xv+12)+','+(yp+10)+' '+xv+','+yp+'" fill="'+Lo+'"/>'+
   '<rect x="'+(xv-5)+'" y="'+(yp-28)+'" width="10" height="18" fill="#5F6B75"/>'+
   '<rect x="'+(xv-4)+'" y="'+(yC-4)+'" width="8" height="'+(yp-28-yC+4)+'" fill="#E2E8F0" stroke="'+P+'" stroke-width="1"/>'+
   '<ellipse cx="'+xv+'" cy="'+(yC-12)+'" rx="20" ry="5" fill="#B91C1C"/>'+
   /* tubo de extracción */
   '<rect x="'+(xr-5)+'" y="'+(yC-14)+'" width="10" height="'+(yF-8-yC+14)+'" fill="#E2E8F0" stroke="'+P+'" stroke-width="1.3"/>'+
   '<rect x="'+(xr-8)+'" y="'+(yC-18)+'" width="16" height="5" fill="#5F6B75"/>'+
   '<line x1="'+xr+'" y1="'+(yC+40)+'" x2="'+xr+'" y2="'+(yC+8)+'" stroke="'+Lo+'" stroke-width="2" marker-end="url(#dstFl)"/>'+
   /* rótulos */
   '<text x="'+((xT0+xT1)/2)+'" y="'+((yT+yB)/2)+'" font-size="11" text-anchor="middle" fill="#1E40AF">Desarenador</text>'+
   '<text x="'+xc+'" y="'+(yB+16)+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="#78350F">Lodos</text>'+
   '<text x="'+(xv+26)+'" y="'+(yC-9)+'" font-size="9.5" fill="#B91C1C">Volante</text>'+
   '<text x="'+(xr-14)+'" y="'+(yC-22)+'" font-size="9.5" text-anchor="end" fill="#475569">Tapa · extracción (bomba o vactor)</text>'+
   '<text x="'+(xo-10)+'" y="'+(yC+70)+'" font-size="10" text-anchor="end" fill="#475569">Tubo de extracción Ø 6"</text>'+
   '<line x1="'+(xo-6)+'" y1="'+(yC+67)+'" x2="'+(xr-6)+'" y2="'+(yC+67)+'" stroke="#475569" stroke-width="0.8"/>'+
   '<text x="'+(xo-10)+'" y="'+(yC+110)+'" font-size="10" text-anchor="end" fill="#475569">Vástago en tubo camisa Ø 4"</text>'+
   '<line x1="'+(xo-6)+'" y1="'+(yC+107)+'" x2="'+(xv-5)+'" y2="'+(yC+107)+'" stroke="#475569" stroke-width="0.8"/>'+
   '<text x="'+(xo-10)+'" y="'+(yF-30)+'" font-size="10.5" font-weight="700" text-anchor="end" fill="#334155">Cámara de recolección</text>'+
   '<text x="'+(xo-10)+'" y="'+(yF-17)+'" font-size="10.5" font-weight="700" text-anchor="end" fill="#334155">de lodos '+nf(cvS,2)+' × '+nf(cvS,2)+' m</text>'+
   '<line x1="'+(xo-6)+'" y1="'+(yF-24)+'" x2="'+(xb0+8)+'" y2="'+(yF-24)+'" stroke="#334155" stroke-width="0.8"/>'+
   '<text x="'+(xv)+'" y="'+(yp+26)+'" font-size="9.5" text-anchor="middle" fill="'+Lo+'">Válvula Ø 6"</text>'+
   '<text x="'+(xc+16)+'" y="'+(yp+22)+'" font-size="10" text-anchor="start" fill="#475569">Tubería Ø 6" bajo el fondo AL y bajo el muro</text>'+
   /* cotas */
   svgDimH(xT0,xT1,yF+46,'B = '+nf(r.B,2)+' m','#2563EB')+svgDimH(xc-aPx/2,xc+aPx/2,yF+74,'fondo AL: a = '+nf(AL.a,2)+' m','#92400E')+svgDimH(xb0,xb1,yF+46,nf(cvS,2)+' m','#2563EB')+
   svgDimV(xT1+40,yT,yB,'H = '+nf(r.H,2)+' m','#2563EB')+svgDimV(xT1+40,yB,yL,'ho = '+nf(r.ho,2)+' m','#2563EB')+
   '<text x="'+(W/2)+'" y="'+(Hs-8)+'" font-size="10.5" text-anchor="middle" fill="#64748B">Esquema sin escala. Cámara de lado '+nf(cvS,2)+' m; se ubica al costado, a la altura del punto bajo de la tolva (L/3 = '+nf(r.xL3,2)+' m).</text></svg>';
  return s;}
