/* ==========================================================
   RS · CELDAS — esquemas SVG  (celdas_svg.js)
   Estilo de ilustración de la canaleta Parshall (no tipo plano).
   Solo se acotan las medidas que aparecen en la tabla del esquema.
   ========================================================== */

/* ==========================================================
   1. UTILIDADES DE DIBUJO (patrones y cotas)
   ========================================================== */
/* Los ids de patrones se vuelven únicos por esquema: si hay otro esquema igual en una vista oculta,
   el navegador tomaría ese (invisible) y el relleno no se vería. */
var _rsSvgN=0;
function rsUnico(svg){var k="_"+(++_rsSvgN);return svg.replace(/\b(rsRes|rsSuelo|rsTerreno|rsBent|rsFinal|rsFl|rsAguaP)\b/g,function(m){return m+k;});}
function celDefs_RS(){
  return '<defs>'+
   '<pattern id="rsRes" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#9CA3AF"/><path d="M0 10 10 0" stroke="#6B7280" stroke-width="1.2"/><circle cx="3" cy="3" r="1" fill="#4B5563"/></pattern>'+
   '<pattern id="rsSuelo" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#C8A26B"/><circle cx="2" cy="2" r="0.9" fill="#8B5E34"/><circle cx="6" cy="5.5" r="0.8" fill="#8B5E34"/></pattern>'+
   '<pattern id="rsTerreno" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#E7D3B0"/><path d="M0 12 12 0" stroke="#D2B98B" stroke-width="1"/></pattern>'+
   '<linearGradient id="rsBent" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C6A9C"/><stop offset="1" stop-color="#5B4B7A"/></linearGradient>'+
   '<linearGradient id="rsFinal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86A45A"/><stop offset="1" stop-color="#5F7F3A"/></linearGradient>'+
   '<marker id="rsFl" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" fill="#475569"/></marker>'+
   '</defs>';}
function celCotaV_RS(x,y1,y2,txt,lado){
  var c='#475569',tx=lado==="izq"?x-8:x+8;
  return '<line x1="'+x+'" y1="'+y1+'" x2="'+x+'" y2="'+y2+'" stroke="'+c+'" stroke-width="1.2" marker-start="url(#rsFl)" marker-end="url(#rsFl)"/>'+
    '<text x="'+tx+'" y="'+((y1+y2)/2+4)+'" font-size="11" font-weight="700" fill="'+c+'" text-anchor="'+(lado==="izq"?"end":"start")+'" stroke="#fff" stroke-width="3" paint-order="stroke">'+txt+'</text>';}
function celCotaH_RS(x1,x2,y,txt){
  var c='#475569';
  return '<line x1="'+x1+'" y1="'+y+'" x2="'+x2+'" y2="'+y+'" stroke="'+c+'" stroke-width="1.2" marker-start="url(#rsFl)" marker-end="url(#rsFl)"/>'+
    '<text x="'+((x1+x2)/2)+'" y="'+(y-6)+'" font-size="11" font-weight="700" fill="'+c+'" text-anchor="middle" stroke="#fff" stroke-width="3" paint-order="stroke">'+txt+'</text>';}

/* ==========================================================
   2. CORTE TRANSVERSAL DE LA TRINCHERA
   ========================================================== */
/* Corte transversal de la trinchera: niveles de celdas con sus capas */
function svgCorteTrinchera_RS(Cel,fil){
  var W=780,Hs=360,nv=Math.max(1,Math.min(8,Math.round(Cel.nv)||1)),H=Cel.H;
  var x0=150,x1=500,yTop=70,alto=230,esc=alto/(nv*H);
  var s='<svg viewBox="0 0 '+W+' '+Hs+'" class="rs-svg" font-family="system-ui,Segoe UI,Arial,sans-serif">'+celDefs_RS();
  s+='<rect x="20" y="'+yTop+'" width="'+(W-40)+'" height="'+(alto+40)+'" fill="url(#rsTerreno)"/>';
  s+='<rect x="'+x0+'" y="'+yTop+'" width="'+(x1-x0)+'" height="'+alto+'" fill="#fff"/>';
  s+='<line x1="20" y1="'+yTop+'" x2="'+(W-20)+'" y2="'+yTop+'" stroke="#5F7F3A" stroke-width="3"/>';
  var capas=[];
  for(var i=0;i<nv;i++){
    var yb=yTop+alto-i*H*esc, ult=i===nv-1, y=yb;
    var add=function(h,fill,nom){if(!(h>0))return;var hh=h*esc;s+='<rect x="'+x0+'" y="'+(y-hh)+'" width="'+(x1-x0)+'" height="'+hh+'" fill="'+fill+'" stroke="#334155" stroke-width="0.6"/>';if(i===0&&!ult||ult&&(i===0||/^(Residuos|Cobertura)/.test(nom)))capas.push({y:y-hh/2,nom:nom,niv:ult?"final":"base"});y-=hh;};
    add(Cel.hB,"url(#rsBent)","Bentonita "+nf(Cel.hB,2)+" m");
    add(Cel.hA,"#E2E8F0","Amortiguamiento "+nf(Cel.hA,2)+" m");
    add(ult?Cel.huF:Cel.huI,"url(#rsRes)",ult?"Residuos (h útil final "+nf(Cel.huF,2)+" m)":"Residuos (h útil "+nf(Cel.huI,2)+" m)");
    add(ult?Cel.hF:Cel.hI,ult?"url(#rsFinal)":"url(#rsSuelo)",ult?"Cobertura final "+nf(Cel.hF,2)+" m":"Cobertura intermedia "+nf(Cel.hI,2)+" m");
    s+='<text x="'+(x0+10)+'" y="'+(yb-H*esc/2+4)+'" font-size="11" font-weight="700" fill="#fff" stroke="#334155" stroke-width="2.5" paint-order="stroke">NIVEL '+(i+1)+'</text>';}
  for(var g=0;g<6;g++){var gx=x0+20+g*((x1-x0-40)/5);s+='<path d="M'+gx+' '+(yTop-1)+' l3 -8 M'+(gx+5)+' '+(yTop-1)+' l0 -9 M'+(gx+10)+' '+(yTop-1)+' l-3 -7" stroke="#4D7C0F" stroke-width="1.5"/>';}
  s+='<rect x="'+x0+'" y="'+yTop+'" width="'+(x1-x0)+'" height="'+alto+'" fill="none" stroke="#1F2937" stroke-width="2"/>';
  /* rótulos de capas a la derecha */
  var ly=yTop+8;
  capas.sort(function(a,b){return a.y-b.y;}).forEach(function(c){
    s+='<line x1="'+(x1+2)+'" y1="'+c.y+'" x2="'+(x1+30)+'" y2="'+ly+'" stroke="#94A3B8"/><circle cx="'+(x1+2)+'" cy="'+c.y+'" r="2.2" fill="#475569"/>'+
       '<text x="'+(x1+34)+'" y="'+(ly+4)+'" font-size="10.5" fill="#334155">'+c.nom+(c.niv==="base"?" (cada nivel)":"")+'</text>';ly+=24;});
  s+=celCotaV_RS(x0-24,yTop,yTop+alto,"Prof. "+nf(Cel.prof,2)+" m","izq");
  s+=celCotaV_RS(x0-80,yTop+alto-H*esc,yTop+alto,"H "+nf(H,2)+" m","izq");
  s+=celCotaH_RS(x0,x1,yTop+alto+24,"Celda diaria L = "+nf(fil.L,2)+" m");
  s+='<text x="'+(W/2)+'" y="24" font-size="13" font-weight="800" fill="#15803D" text-anchor="middle">CORTE TRANSVERSAL DE LA TRINCHERA — '+nv+' NIVEL'+(nv>1?'ES':'')+'</text>';
  s+='<text x="'+(W/2)+'" y="42" font-size="11" fill="#64748B" text-anchor="middle">Año '+fil.anio+' · '+nf(fil.Td,2)+' ton/día ÷ '+nf(Cel.rc,2)+' t/m³ = '+nf(fil.Vd,2)+' m³/día compactados</text>';
  return rsUnico(s+'</svg>');}

/* ==========================================================
   3. PLANTA DE CELDAS
   ========================================================== */
/* Planta: celda diaria y ocupación del área disponible */
function svgPlantaCeldas_RS(Cel,fil){
  var W=780,Hs=300,s='<svg viewBox="0 0 '+W+' '+Hs+'" class="rs-svg" font-family="system-ui,Segoe UI,Arial,sans-serif">'+celDefs_RS();
  /* celda diaria */
  var lado=150,cx=110,cy=70;
  s+='<text x="'+(cx+lado/2)+'" y="34" font-size="13" font-weight="800" fill="#15803D" text-anchor="middle">CELDA DIARIA — PLANTA</text>';
  s+='<polygon points="'+cx+','+(cy+lado)+' '+(cx+lado)+','+(cy+lado)+' '+(cx+lado+30)+','+(cy+lado-22)+' '+(cx+30)+','+(cy-22+lado)+'" fill="#6B7280" opacity=".35"/>';
  s+='<rect x="'+cx+'" y="'+cy+'" width="'+lado+'" height="'+lado+'" fill="url(#rsRes)" stroke="#1F2937" stroke-width="2"/>';
  s+='<rect x="'+cx+'" y="'+cy+'" width="'+lado+'" height="'+lado+'" fill="url(#rsSuelo)" opacity=".45"/>';
  s+=celCotaH_RS(cx,cx+lado,cy+lado+22,"L = "+nf(fil.L,2)+" m");
  s+=celCotaV_RS(cx-16,cy,cy+lado,"L = "+nf(fil.L,2)+" m","izq");
  s+='<text x="'+(cx+lado/2)+'" y="'+(cy+lado/2+4)+'" font-size="11.5" font-weight="700" fill="#fff" text-anchor="middle" stroke="#334155" stroke-width="2.5" paint-order="stroke">'+nf(fil.Ac,1)+' m²</text>';
  /* área disponible vs ocupada */
  var ax=380,ay=70,aw=360,ah=170,pct=Math.min(1.1,fil.AreaAc/Cel.Ad),ok=fil.est==="OK";
  s+='<text x="'+(ax+aw/2)+'" y="34" font-size="13" font-weight="800" fill="#15803D" text-anchor="middle">ÁREA DEL RELLENO HASTA '+fil.anio+'</text>';
  s+='<rect x="'+ax+'" y="'+ay+'" width="'+aw+'" height="'+ah+'" fill="#F0FDF4" stroke="#15803D" stroke-width="2" stroke-dasharray="7 4" rx="6"/>';
  var ow=aw*Math.min(1,pct);
  s+='<rect x="'+ax+'" y="'+ay+'" width="'+ow+'" height="'+ah+'" fill="'+(ok?'url(#rsFinal)':'#FCA5A5')+'" opacity=".85" rx="6"/>';
  if(pct>1)s+='<rect x="'+(ax+aw)+'" y="'+ay+'" width="'+(aw*(pct-1))+'" height="'+ah+'" fill="#DC2626" opacity=".55"/>';
  s+='<text x="'+(ax+aw/2)+'" y="'+(ay+ah/2-4)+'" font-size="15" font-weight="800" fill="#14532D" text-anchor="middle" stroke="#fff" stroke-width="3" paint-order="stroke">'+nf(fil.AreaAc,2)+' ha de '+nf(Cel.Ad,2)+' ha</text>';
  s+='<text x="'+(ax+aw/2)+'" y="'+(ay+ah/2+16)+'" font-size="12" font-weight="700" fill="'+(ok?'#15803D':'#B91C1C')+'" text-anchor="middle" stroke="#fff" stroke-width="3" paint-order="stroke">'+nf(fil.pct*100,1)+' % del área disponible · '+fil.est+'</text>';
  s+=celCotaH_RS(ax,ax+aw,ay+ah+22,"Área disponible = "+nf(Cel.Ad,2)+" ha");
  return rsUnico(s+'</svg>');}
