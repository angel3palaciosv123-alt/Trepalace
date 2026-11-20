/* ==========================================================
   RS · PISCINAS DE LIXIVIADOS  (piscinas.js)
   Volumen de almacenamiento, geometría trapezoidal (fondo, media, espejo y
   corona), volumen prismoidal y balance anual. Hoja: PISCINAS LIXIVIADOS.
   ========================================================== */

/* ==========================================================
   1. VALIDACIÓN
   ========================================================== */
function erroresPis_RS(){
  var e=[];
  ["rsDias","rsHPis","rsTalud","rsRelLA","rsBL"].forEach(function(k){if(!esPos(PRO[k]))e.push("Falta un valor válido de "+{rsDias:"días de autonomía",rsHPis:"profundidad útil",rsTalud:"talud",rsRelLA:"relación largo / ancho",rsBL:"bordo libre"}[k]+" (Términos de referencia).");});
  if(!(Number(PRO.rsReserva)>=0))e.push("La reserva de contingencia no puede ser negativa.");
  return e.concat(erroresLix_RS().length?["La red de lixiviados tiene datos por completar."]:[]);}

RS_TABLAS.pis_RS=function(){
  var D=rsTodo();if(!D.ok)return null;
  return {titulo:"Balance anual de la piscina",sub:"Balance = entrada − tratamiento + precipitación − evaporación sobre el espejo de agua ("+rsF(D.Pi.Ae,1)+" m²). Un balance positivo indica un volumen excedente que debe tratarse, recircularse o evacuarse.",
    columnas:[{k:"anio",t:"Año",fmt:function(v){return String(v);}},{k:"Qm",t:"Q medio",u:"m³/día",d:3},{k:"ent",t:"Entrada anual",u:"m³",d:1,tot:"sum"},{k:"tr",t:"Tratamiento anual",u:"m³",d:1,tot:"sum"},{k:"pr",t:"Precipitación",u:"m³",d:1,tot:"sum"},{k:"ev",t:"Evaporación",u:"m³",d:1,tot:"sum"},{k:"net",t:"Balance neto",u:"m³",d:1,tot:"sum"},{k:"ac",t:"Balance acumulado",u:"m³",d:1,tot:"last"}],
    csv:"Piscinas_RS",filas:D.Pi.bal};};

/* ==========================================================
   2. ESQUEMAS (planta y corte)
   ========================================================== */
/* Esquemas: planta y corte longitudinal (estilo ilustración) */
function svgPiscina_RS(Pi){
  var W=780,H=330,s='<svg viewBox="0 0 '+W+' '+H+'" class="rs-svg" font-family="system-ui,Segoe UI,Arial,sans-serif">'+celDefs_RS()+
    '<defs><linearGradient id="rsAguaP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFDBFE"/><stop offset="1" stop-color="#60A5FA"/></linearGradient></defs>';
  /* planta */
  var px=30,py=60,pw=300,ph=pw*Pi.Wc/Pi.Lc,e=pw/Pi.Lc;if(ph>200){ph=200;e=ph/Pi.Wc;pw=Pi.Lc*e;}
  var r=function(L,Wd,fill,st){var x=px+(Pi.Lc-L)/2*e,y=py+(Pi.Wc-Wd)/2*e;return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+(L*e).toFixed(1)+'" height="'+(Wd*e).toFixed(1)+'" fill="'+fill+'" stroke="'+st+'" stroke-width="1.6"/>';};
  s+='<text x="'+(px+pw/2)+'" y="32" font-size="13" font-weight="800" fill="#15803D" text-anchor="middle">PLANTA</text>';
  s+=r(Pi.Lc,Pi.Wc,"url(#rsTerreno)","#8B5E34")+r(Pi.Le,Pi.We,"url(#rsAguaP)","#1E3A8A")+(Pi.okF?r(Pi.Lf,Pi.Wf,"#3B82F6","#1E3A8A"):"");
  s+=celCotaH_RS(px,px+Pi.Lc*e,py+Pi.Wc*e+22,"Corona "+nf(Pi.Lc,2)+" m");
  s+=celCotaV_RS(px+Pi.Lc*e+16,py,py+Pi.Wc*e,nf(Pi.Wc,2)+" m","der");
  if(Pi.okF)s+='<text x="'+(px+Pi.Lc*e/2)+'" y="'+(py+Pi.Wc*e/2+4)+'" font-size="10.5" font-weight="700" fill="#fff" text-anchor="middle" stroke="#1E3A8A" stroke-width="2.5" paint-order="stroke">Fondo '+nf(Pi.Lf,2)+' × '+nf(Pi.Wf,2)+' m</text>';
  /* corte */
  var cx=450,cy=80,cw=250,esc=cw/Pi.Lc,hT=Pi.h+Pi.bl,ch=150,escV=ch/hT,exag=escV/esc;
  var X=function(v){return cx+v*esc;},Y=function(z){return cy+(hT-z)*escV;};
  var xL=(Pi.Lc-Pi.Lf)/2;
  s+='<text x="'+(cx+cw/2)+'" y="32" font-size="13" font-weight="800" fill="#15803D" text-anchor="middle">CORTE LONGITUDINAL</text>';
  s+='<rect x="'+(cx-10)+'" y="'+Y(hT)+'" width="'+(cw+20)+'" height="'+(ch+28)+'" fill="url(#rsTerreno)"/>';
  var pts=[[0,hT],[xL,0],[xL+Pi.Lf,0],[Pi.Lc,hT]].map(function(p){return X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1);}).join(' ');
  s+='<polygon points="'+pts+'" fill="#fff" stroke="#1F2937" stroke-width="2"/>';
  var xa=xL-Pi.z*Pi.h,xb=xL+Pi.Lf+Pi.z*Pi.h;
  s+='<polygon points="'+[[xL,0],[xL+Pi.Lf,0],[xb,Pi.h],[xa,Pi.h]].map(function(p){return X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1);}).join(' ')+'" fill="url(#rsAguaP)"/>';
  s+='<path d="M'+X(xL).toFixed(1)+' '+Y(0).toFixed(1)+' L'+X(xL+Pi.Lf).toFixed(1)+' '+Y(0).toFixed(1)+'" stroke="#1F2937" stroke-width="3"/>';
  s+='<line x1="'+X(xa)+'" y1="'+Y(Pi.h)+'" x2="'+X(xb)+'" y2="'+Y(Pi.h)+'" stroke="#1D4ED8" stroke-width="1.6" stroke-dasharray="6 3"/>';
  s+=celCotaV_RS(X(Pi.Lc)+14,Y(hT),Y(Pi.h),"BL "+nf(Pi.bl,2)+" m","der")+celCotaV_RS(X(Pi.Lc)+14,Y(Pi.h),Y(0),"h "+nf(Pi.h,2)+" m","der");
  s+='<text x="'+(X(xL)-6)+'" y="'+(Y(Pi.h/2))+'" font-size="10.5" font-weight="700" fill="#334155" text-anchor="end" stroke="#fff" stroke-width="3" paint-order="stroke">'+nf(Pi.z,1)+':1</text>';
  s+='<text x="'+(cx+cw/2)+'" y="'+(Y(0)+22)+'" font-size="10.5" fill="#334155" text-anchor="middle">Geomembrana sobre el fondo y los taludes</text>';
  if(exag>1.5)s+='<text x="'+(cx+cw/2)+'" y="'+(Y(0)+38)+'" font-size="10" fill="#64748B" text-anchor="middle">Escala vertical exagerada ×'+nf(exag,0)+'</text>';
  return rsUnico(s+'</svg>');}

/* ==========================================================
   3. VENTANA
   ========================================================== */
function pintarPiscinas_RS(){
  var id="piscinas_RS",D=rsTodo();
  var h='<div class="titulo"><h1>PISCINAS DE LIXIVIADOS</h1><p>Dimensionamiento del almacenamiento de lixiviados por días de autonomía y reserva de contingencia, geometría de sección trapezoidal, volumen prismoidal y balance hídrico anual.</p></div>'+CONV;
  if(!D.ok){gid("pane-"+id).innerHTML=h+rsFaltaProy();return;}
  var err=erroresPis_RS();
  if(err.length){gid("pane-"+id).innerHTML=h+rsFalta(err,"terminos_referencia_RS","Ir a términos de referencia")+rsAcciones(id,"revisionPis_RS()");return;}
  var Pi=D.Pi,ult=Pi.bal[Pi.bal.length-1];
  h+='<div class="link-ok">Caudal medio del año final ('+Pi.anio+'): <b>'+nf(Pi.Q,3)+' m³/día</b> · Días de autonomía: <b>'+nf(Pi.dias,0)+' días</b> · Talud: <b>'+nf(Pi.z,1)+':1</b></div>';
  h+=rsKpis([
    {t:"Volumen útil requerido",v:rsF(Pi.Vreq,1),u:"m³"},
    {t:"Volumen prismoidal",v:rsF(Pi.V,1),u:"m³",est:Pi.okV?"ok":"err",s:Pi.okV?"Cumple ≥ requerido":"Menor que el requerido"},
    {t:"Corona",v:rsF(Pi.Lc,2)+" × "+rsF(Pi.Wc,2),u:"m"},
    {t:"Profundidad total",v:rsF(Pi.Htot,2),u:"m",s:"h + bordo libre"},
    {t:"Balance acumulado",v:rsF(ult.ac,0),u:"m³",est:ult.ac>0?"adv":"ok",s:ult.ac>0?"Excedente por manejar":"Sin excedente"}]);
  h+='<div class="card"><div class="card-title">Esquemas de la piscina</div><div class="svg-wrap">'+svgPiscina_RS(Pi)+'</div>'+
    '<div class="rs-medidas"><table class="ref-table"><tr><th>Medida acotada</th><th>Valor</th></tr>'+
    [["Largo y ancho de corona",nf(Pi.Lc,2)+" × "+nf(Pi.Wc,2)+" m"],["Fondo",nf(Pi.Lf,2)+" × "+nf(Pi.Wf,2)+" m"],["Profundidad útil h",nf(Pi.h,2)+" m"],["Bordo libre",nf(Pi.bl,2)+" m"],["Talud",nf(Pi.z,1)+" H : 1 V"]].map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>';}).join("")+'</table></div></div>';
  h+=rsTabla("pis_RS");
  h+='<div class="card"><div class="card-title">Parámetros de cálculo</div>'+rsAcciones(id,"revisionPis_RS()")+'</div>';
  var t='<table class="res-table"><thead><tr><th></th><th>VARIABLE</th><th>VALOR</th><th>UNIDAD</th></tr></thead><tbody>';
  t+=seccion("1. VOLUMEN REQUERIDO");
  t+=fila("Caudal medio del año final (Q)",Pi.Q,"m³/día",3,"Q<sub>m</sub> del año "+Pi.anio,"—","Red de lixiviados.");
  t+=filaDato("Días de autonomía",Pi.dias,"días",0,"Términos de referencia.");
  t+=fila("Volumen de autonomía",Pi.Vaut,"m³",2,"V<sub>aut</sub> = Q × días",nf(Pi.Q,3)+" × "+nf(Pi.dias,0));
  t+=fila("Reserva de contingencia",Pi.Vres,"m³",2,"V<sub>res</sub> = V<sub>aut</sub> × reserva",nf(Pi.Vaut,2)+" × "+nf(Pi.res,2));
  t+=fila("Volumen útil requerido",Pi.Vreq,"m³",2,"V<sub>req</sub> = V<sub>aut</sub> + V<sub>res</sub>",nf(Pi.Vaut,2)+" + "+nf(Pi.Vres,2),"","","final");
  t+=seccion("2. GEOMETRÍA");
  t+=fila("Área a media profundidad",Pi.Am,"m²",2,"A<sub>m</sub> = V<sub>req</sub> / h",nf(Pi.Vreq,2)+" / "+nf(Pi.h,2));
  t+=fila("Largo a media profundidad",Pi.Lm,"m",2,"L<sub>m</sub> = √(A<sub>m</sub> · L/A)","√("+nf(Pi.Am,2)+" × "+nf(Pi.r,2)+")");
  t+=fila("Ancho a media profundidad",Pi.Wm,"m",2,"W<sub>m</sub> = L<sub>m</sub> / (L/A)",nf(Pi.Lm,2)+" / "+nf(Pi.r,2));
  t+=fila("Largo de fondo",Pi.Lf,"m",2,"L<sub>f</sub> = L<sub>m</sub> − z·h",nf(Pi.Lm,2)+" − "+nf(Pi.z,1)+" × "+nf(Pi.h,2));
  t+=fila("Ancho de fondo",Pi.Wf,"m",2,"W<sub>f</sub> = W<sub>m</sub> − z·h",nf(Pi.Wm,2)+" − "+nf(Pi.z,1)+" × "+nf(Pi.h,2),Pi.okF?"":"Fondo ≤ 0: revisar geometría.");
  t+=fila("Largo de espejo",Pi.Le,"m",2,"L<sub>e</sub> = L<sub>m</sub> + z·h",nf(Pi.Lm,2)+" + "+nf(Pi.z,1)+" × "+nf(Pi.h,2));
  t+=fila("Ancho de espejo",Pi.We,"m",2,"W<sub>e</sub> = W<sub>m</sub> + z·h",nf(Pi.Wm,2)+" + "+nf(Pi.z,1)+" × "+nf(Pi.h,2));
  t+=fila("Largo de corona",Pi.Lc,"m",2,"L<sub>c</sub> = L<sub>e</sub> + 2·z·BL",nf(Pi.Le,2)+" + 2 × "+nf(Pi.z,1)+" × "+nf(Pi.bl,2),"","","final");
  t+=fila("Ancho de corona",Pi.Wc,"m",2,"W<sub>c</sub> = W<sub>e</sub> + 2·z·BL",nf(Pi.We,2)+" + 2 × "+nf(Pi.z,1)+" × "+nf(Pi.bl,2),"","","final");
  t+=fila("Volumen prismoidal útil",Pi.V,"m³",2,"V = h/6 · (A<sub>f</sub> + A<sub>e</sub> + 4·A<sub>m</sub>)",nf(Pi.h,2)+"/6 × ("+nf(Pi.Af,2)+" + "+nf(Pi.Ae,2)+" + 4 × "+nf(Pi.Lm*Pi.Wm,2)+")",Pi.okV?"Cumple: V ≥ V<sub>req</sub>.":"No cumple.","","final");
  t+='</tbody></table>';
  h+='<div class="card"><div class="card-title">Memoria de cálculo</div>'+t+'</div>';
  h+=tablaHTML("Datos para dibujar el plano de las piscinas",["Dato para plano","Dónde obtenerlo","Unidad","Cómo usarlo en el plano"],[
    ["Coordenadas de esquinas y eje de entrada/salida","Topografía e implantación","m","Dibujar planta y orientación"],["Cota de fondo, nivel normal y bordo libre","Diseño geométrico","m s.n.m.","Construir cortes y verificar capacidad"],
    ["Taludes, longitud y ancho","Cálculo de la piscina","H:V / m","Dimensionar planta y sección transversal"],["Entrada, salida, rebose y bombeo","Diseño hidráulico","coordenada","Ubicar obras hidráulicas y flujo"],
    ["Geomembrana, geotextil y drenaje de fondo","Especificación constructiva","tipo / mm","Preparar el detalle de impermeabilización"]]);
  gid("pane-"+id).innerHTML=h;}

/* ==========================================================
   4. REVISIÓN, AVISOS Y RECALCULAR
   ========================================================== */
function avisosResPis_RS(){
  var e=[],D=rsTodo();if(erroresPis_RS().length||!D.ok)return e;
  if(!D.Pi.okF)e.push("El fondo de la piscina resulta con largo o ancho ≤ 0: reduzca la profundidad útil o el talud, o aumente los días de autonomía o la relación largo/ancho.");
  if(!D.Pi.okV)e.push("El volumen prismoidal es menor que el volumen útil requerido.");
  return e;}
function revisionPis_RS(){abrirRevision("Piscinas de lixiviados",erroresPis_RS().concat(trAvisosPis_RS(),avisosResPis_RS()));}

/* ==========================================================
   5. REGISTRO DEL MÓDULO
   ========================================================== */
registrarMemoria({ins:["Días de autonomía"]});

MODULOS.push({
  id:"piscinas_RS",
  titulo:"Piscinas de lixiviados",
  descripcion:"Volumen de almacenamiento, geometría trapezoidal y balance hídrico anual.",
  grupo:"relleno", orden:10, icono:"pis_RS",
  iconoSvg:"<path d=\"M3 8h18l-3 10H6z\"/><path d=\"M5 12c2 1.2 4 1.2 7 0s5-1.2 7 0\"/>",
  valores:{},
  indicador:true, imprimible:true,
  normalizar:function(PRO){},
  completo:function(PRO){return rsSerie().length>0&&erroresPis_RS().length===0;},
  pintar:pintarPiscinas_RS,
  recalcular:function(){rsRecalcular(pintarPiscinas_RS,avisosResPis_RS,"Piscinas de lixiviados");},
  errores:erroresPis_RS
});
