/* ==========================================================
   RS · CELDAS Y TRINCHERAS  (celdas.js)
   Celda diaria, área de terreno, vida útil y materiales (bentonita,
   amortiguamiento, coberturas y geotextil). Hoja de referencia: CELDAS.
   ========================================================== */

/* ==========================================================
   1. VALIDACIÓN
   ========================================================== */
function erroresCeldas_RS(){
  var e=[];
  ["rsArea","rsNiveles","rsHCelda","rsDensComp","rsRhoBent","rsRollo"].forEach(function(k){if(!esPos(PRO[k]))e.push("Falta un valor válido de "+{rsArea:"área disponible",rsNiveles:"número de niveles",rsHCelda:"altura de la celda",rsDensComp:"densidad de compactación",rsRhoBent:"peso unitario de la bentonita",rsRollo:"ancho del rollo de geotextil"}[k]+" (Términos de referencia).");});
  var huI=rsN("rsHCelda")-rsN("rsHInter",0)-rsN("rsHBent",0)-rsN("rsHAmort",0),huF=rsN("rsHCelda")-rsN("rsHFinal",0)-rsN("rsHBent",0)-rsN("rsHAmort",0);
  if(!(huI>0)||!(huF>0))e.push("Las capas de cobertura, bentonita y amortiguamiento suman más que la altura de la celda.");
  return e.concat(erroresProd_RS().length?["La producción a disponer tiene datos por completar."]:[]);}

RS_TABLAS.cel_RS=function(){
  var D=rsTodo();if(!D.ok)return null;
  var F=rsFiltroEstado("cel_RS",{grupo:"Celdas y área"}),g=F.grupo,C=D.Cel;
  var est=function(v){return rsChip(v);},pc=function(v){return rsF(v*100,1);};
  var cols=[{k:"anio",t:"Año",fmt:function(v){return String(v);}}];
  if(g==="Celdas y área")cols=cols.concat([{k:"Td",t:"RS al relleno",u:"ton/día",d:3},{k:"Vd",t:"Volumen compactado",u:"m³/día",d:2},{k:"L",t:"Lado de la celda",u:"m",d:2},{k:"Ac",t:"Área de la celda",u:"m²",d:1},
    {k:"celA",t:"Celdas anuales",u:"und",d:0,tot:"sum"},{k:"celAc",t:"Celdas acumuladas",u:"und",d:0,tot:"last"},{k:"Va",t:"Volumen anual",u:"m³",d:0,tot:"sum"},{k:"VolAc",t:"Volumen acumulado",u:"m³",d:0,tot:"last"},
    {k:"AtHa",t:"Área de terreno anual",u:"ha",d:3,tot:"sum"},{k:"AreaAc",t:"Área acumulada",u:"ha",d:3,tot:"last"},{k:"pct",t:"Área utilizada",u:"%",fmt:pc},{k:"est",t:"Verificación",fmt:est}]);
  else if(g==="Materiales diarios")cols=cols.concat([{k:"bentD",t:"Bentonita",u:"ton/día",d:2},{k:"amortD",t:"Amortiguamiento",u:"m³/día",d:2},{k:"interD",t:"Cobertura intermedia",u:"m³/día",d:2},{k:"geoD",t:"Geotextil",u:"m lineal/d",d:2}]);
  else if(g==="Materiales anuales")cols=cols.concat([{k:"bentA",t:"Bentonita",u:"ton/año",d:1,tot:"sum"},{k:"amortA",t:"Amortiguamiento",u:"m³/año",d:1,tot:"sum"},{k:"interA",t:"Cobertura intermedia",u:"m³/año",d:1,tot:"sum"},{k:"finA",t:"Cobertura final",u:"m³/año",d:1,tot:"sum"},{k:"geoA",t:"Geotextil",u:"m lineal/año",d:1,tot:"sum"}]);
  else cols=cols.concat([{k:"bentAc",t:"Bentonita",u:"ton",d:0,tot:"last"},{k:"amortAc",t:"Amortiguamiento",u:"m³",d:0,tot:"last"},{k:"interAc",t:"Cobertura intermedia",u:"m³",d:0,tot:"last"},{k:"finAc",t:"Cobertura final",u:"m³",d:0,tot:"last"},{k:"geoAc",t:"Geotextil",u:"m lineal",d:0,tot:"last"}]);
  return {titulo:"Celdas, área y materiales por año",sub:"Celda diaria de planta cuadrada (una por día de operación). Área de terreno calculada con "+nf(C.nv,0)+" niveles apilados en la trinchera.",
    controles:'<div class="rs-f grande"><label>Mostrar</label><select onchange="rsFiltro(\'cel_RS\',\'grupo\',this.value)">'+["Celdas y área","Materiales diarios","Materiales anuales","Materiales acumulados"].map(function(o){return '<option'+(o===g?' selected':'')+'>'+o+'</option>';}).join("")+'</select></div>',
    columnas:cols,csv:"Celdas_RS",filas:C.filas.map(function(f){return Object.assign({},f,{_cls:f.est==="EXCEDE"?"rs-fila-err":f.est==="LÍMITE"?"rs-fila-adv":""});})};};

/* ==========================================================
   2. VENTANA
   ========================================================== */
function pintarCeldas_RS(){
  var id="celdas_RS",D=rsTodo();
  var h='<div class="titulo"><h1>CELDAS Y TRINCHERAS</h1><p>Dimensionamiento de la celda diaria, área de terreno requerida, vida útil del sitio y cantidades de materiales de impermeabilización y cobertura (bentonita, capas de cobertura y geotextil).</p></div>'+CONV;
  if(!D.ok){gid("pane-"+id).innerHTML=h+rsFaltaProy();return;}
  var err=erroresCeldas_RS();
  if(err.length){gid("pane-"+id).innerHTML=h+rsFalta(err,"terminos_referencia_RS","Ir a términos de referencia")+rsAcciones(id,"revisionCeldas_RS()");return;}
  var C=D.Cel,z=C.filas[C.filas.length-1],j=rsIdx(D,rsAnioMemo(D)),f=C.filas[j];
  var vida=C.vida===null?"No alcanza":C.vida,estV=C.excede===null?"ok":C.vida===null?"err":"adv";
  h+='<div class="link-ok">Densidad de compactación <b>'+nf(C.rc,2)+' t/m³</b> · Celda H = <b>'+nf(C.H,2)+' m</b> · <b>'+nf(C.nv,0)+'</b> niveles · Área disponible <b>'+nf(C.Ad,2)+' ha</b></div>';
  h+=rsKpis([
    {t:"Vida útil del área disponible",v:vida,u:C.vida!==null?"":"",est:estV,s:C.excede===null?"El área alcanza hasta "+z.anio:"Se excede en "+C.excede},
    {t:"Área requerida en la vida útil",v:rsF(z.AreaAc,2),u:"ha",est:z.est==="OK"?"ok":z.est==="LÍMITE"?"adv":"err",s:rsF(z.pct*100,1)+" % del área disponible"},
    {t:"Celda diaria "+f.anio,v:rsF(f.L,2)+" × "+rsF(f.L,2),u:"m",s:"Volumen "+rsF(f.Vd,1)+" m³/día"},
    {t:"Volumen compactado total",v:rsF(z.VolAc,0),u:"m³"},
    {t:"Bentonita total",v:rsF(C.total.bent,0),u:"ton"}]);
  h+='<div class="card"><div class="card-title">Área acumulada vs. área disponible</div>'+rsGrafico(C.filas.map(function(x){return x.anio;}),[{nombre:"Área acumulada (ha)",color:"#15803D",valores:C.filas.map(function(x){return x.AreaAc;})}],{linea:true,limite:C.Ad,limiteTxt:"Área disponible "+nf(C.Ad,2)+" ha",uY:"ha"})+'</div>';
  h+='<div class="card"><div class="card-title">Esquemas — año '+f.anio+'</div><div class="card-sub">Esquemas para el año seleccionado en la memoria de cálculo.</div>'+
    '<div class="svg-wrap">'+svgCorteTrinchera_RS(C,f)+'</div><div class="svg-wrap">'+svgPlantaCeldas_RS(C,f)+'</div>'+
    '<div class="rs-medidas"><table class="ref-table"><tr><th>Medida acotada</th><th>Valor</th></tr>'+
    [["Profundidad de la trinchera",nf(C.prof,2)+" m"],["Altura de la celda H",nf(C.H,2)+" m"],["Lado de la celda diaria L",nf(f.L,2)+" m"],["Área disponible",nf(C.Ad,2)+" ha"]].map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>';}).join("")+'</table></div></div>';
  h+=rsTabla("cel_RS");
  h+='<div class="card"><div class="card-title">Parámetros de cálculo</div><div class="row">'+rsSelAnio(D)+'</div>'+rsAcciones(id,"revisionCeldas_RS()")+'</div>';
  var t='<table class="res-table"><thead><tr><th></th><th>VARIABLE</th><th>VALOR</th><th>UNIDAD</th></tr></thead><tbody>';
  t+=seccion("1. ALTURAS ÚTILES DE LA CELDA");
  t+=filaDato("Altura de la celda (H)",C.H,"m",2,"Términos de referencia.");
  t+=fila("Altura útil niveles intermedios (h<sub>ui</sub>)",C.huI,"m",2,"h<sub>ui</sub> = H − h<sub>int</sub> − h<sub>bent</sub> − h<sub>amort</sub>",nf(C.H,2)+" − "+nf(C.hI,2)+" − "+nf(C.hB,2)+" − "+nf(C.hA,2));
  t+=fila("Altura útil nivel final (h<sub>uf</sub>)",C.huF,"m",2,"h<sub>uf</sub> = H − h<sub>final</sub> − h<sub>bent</sub> − h<sub>amort</sub>",nf(C.H,2)+" − "+nf(C.hF,2)+" − "+nf(C.hB,2)+" − "+nf(C.hA,2));
  t+=fila("Capacidad por m² de terreno",C.cap,"m³/m²",2,"c = (n − 1)·h<sub>ui</sub> + h<sub>uf</sub>","("+nf(C.nv,0)+" − 1) × "+nf(C.huI,2)+" + "+nf(C.huF,2),"Altura útil de residuos apilada en la trinchera.");
  t+=seccion("2. CELDA DIARIA — AÑO "+f.anio);
  t+=fila("Residuos al relleno (R<sub>t</sub>)",f.Td,"ton/día",3,"Producción a disponer","—","No aprovechables del año.");
  t+=filaDato("Densidad de compactación (ρ<sub>c</sub>)",C.rc,"t/m³",2,"Términos de referencia.");
  t+=fila("Volumen diario compactado (V<sub>d</sub>)",f.Vd,"m³/día",2,"V<sub>d</sub> = R<sub>t</sub> / ρ<sub>c</sub>",nf(f.Td,3)+" / "+nf(C.rc,2));
  t+=fila("Lado de la celda (L)",f.L,"m",2,"L = √(V<sub>d</sub> / h<sub>ui</sub>)","√("+nf(f.Vd,2)+" / "+nf(C.huI,2)+")","Celda cuadrada, una por día.","","final");
  t+=fila("Área de la celda (A<sub>c</sub>)",f.Ac,"m²",2,"A<sub>c</sub> = L²",nf(f.L,2)+"²");
  t+=fila("Volumen anual compactado",f.Va,"m³",1,"V<sub>a</sub> = V<sub>d</sub> × 365",nf(f.Vd,2)+" × 365");
  t+=fila("Área de terreno del año",f.At,"m²",1,"A<sub>t</sub> = V<sub>a</sub> / c",nf(f.Va,1)+" / "+nf(C.cap,2));
  t+=fila("Área acumulada",f.AreaAc,"ha",3,"ΣA<sub>t</sub> / 10 000","—");
  t+=fila("Área utilizada",f.pct*100,"%",1,"%A = A<sub>acum</sub> / A<sub>disp</sub> × 100",nf(f.AreaAc,3)+" / "+nf(C.Ad,2)+" × 100",f.est==="OK"?"Cumple.":f.est==="LÍMITE"?"En el límite (≤ 110 %).":"Excede el área disponible.","","final");
  t+=seccion("3. MATERIALES — AÑO "+f.anio);
  t+=fila("Bentonita diaria",f.bentD,"ton/día",2,"B = A<sub>c</sub> × h<sub>bent</sub> × ρ<sub>bent</sub>",nf(f.Ac,2)+" × "+nf(C.hB,2)+" × "+nf(C.rb,2));
  t+=fila("Amortiguamiento diario",f.amortD,"m³/día",2,"A<sub>c</sub> × h<sub>amort</sub>",nf(f.Ac,2)+" × "+nf(C.hA,2));
  t+=fila("Cobertura intermedia diaria",f.interD,"m³/día",2,"A<sub>c</sub> × h<sub>int</sub>",nf(f.Ac,2)+" × "+nf(C.hI,2));
  t+=fila("Cobertura final del año",f.finA,"m³/año",1,"A<sub>t</sub> × h<sub>final</sub>",nf(f.At,1)+" × "+nf(C.hF,2),"Se coloca sobre el área de terreno ocupada en el año.");
  t+=fila("Geotextil diario",f.geoD,"m lineal/d",2,"A<sub>c</sub> / ancho del rollo",nf(f.Ac,2)+" / "+nf(C.rollo,2));
  t+='</tbody></table>';
  h+='<div class="card"><div class="card-title">Memoria de cálculo</div>'+t+'</div>';
  gid("pane-"+id).innerHTML=h;}

/* ==========================================================
   3. REVISIÓN, AVISOS Y RECALCULAR
   ========================================================== */
function avisosResCeldas_RS(){
  var D=rsTodo();if(!D.ok||erroresCeldas_RS().length)return [];
  var C=D.Cel;return C.excede===null?[]:["El área acumulada supera el área disponible ("+nf(C.Ad,2)+" ha) a partir de "+C.excede+". Considere aumentar el área, la profundidad de la trinchera (más niveles), la densidad de compactación o las metas de aprovechamiento."];}
function revisionCeldas_RS(){abrirRevision("Celdas y trincheras",erroresCeldas_RS().concat(trAvisosCeldas_RS(),avisosResCeldas_RS()));}

/* ==========================================================
   4. REGISTRO DEL MÓDULO
   ========================================================== */
registrarMemoria({ins:["Altura de la celda (H)","Densidad de compactación (ρ<sub>c</sub>)"]});

MODULOS.push({
  id:"celdas_RS",
  titulo:"Celdas y vida útil",
  descripcion:"Celda diaria, área de terreno requerida, vida útil del sitio y materiales de cobertura.",
  grupo:"relleno", orden:8, icono:"cel_RS",
  iconoSvg:"<rect x=\"3\" y=\"10\" width=\"18\" height=\"10\" rx=\"1\"/><path d=\"M3 15h18M9 10v10M15 10v10M6 10l3-5h6l3 5\"/>",
  valores:{},
  indicador:true, imprimible:true,
  normalizar:function(PRO){},
  completo:function(PRO){return rsSerie().length>0&&erroresCeldas_RS().length===0;},
  pintar:pintarCeldas_RS,
  recalcular:function(){rsRecalcular(pintarCeldas_RS,function(){return avisosResCeldas_RS();},"Celdas y vida útil");},
  errores:erroresCeldas_RS
});
