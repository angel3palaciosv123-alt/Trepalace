/* ==========================================================
   RS · PRODUCCIÓN A DISPONER  (produccion.js)
   Resumen anual de lo que llega al relleno (no aprovechable) y de lo que se
   aprovecha. Es la entrada de Celdas, Lixiviados y Gases.
   Hoja de referencia: PRODUCCIÓN DE RS.
   ========================================================== */

/* ==========================================================
   1. VALIDACIÓN
   ========================================================== */
function erroresProd_RS(){return erroresApr_RS().length?["Las metas de aprovechamiento o los módulos anteriores tienen datos por completar o corregir."]:[];}

RS_TABLAS.prod_RS=function(){
  var D=rsTodo();if(!D.ok)return null;
  var F=rsFiltroEstado("prod_RS",{grupo:"Masa"}),g=F.grupo,aparte=D.P.some(function(p){return p.parteD>0;});
  var cols=[{k:"anio",t:"Año",fmt:function(v){return String(v);}},{k:"pob",t:"Población",u:"hab",d:0}];
  if(g==="Masa"){
    cols=cols.concat([{k:"GdT",t:"Generado",u:"ton/día",d:3},{k:"aprT",t:"Aprovechable",u:"ton/día",d:3},{k:"relTd",t:"No aprovechable al relleno",u:"ton/día",d:3}]);
    if(aparte)cols.push({k:"parT",t:"Peligrosos aparte",u:"ton/día",d:3});
    cols=cols.concat([{k:"relAT",t:"Al relleno anual",u:"ton/año",d:1,tot:"sum"},{k:"relAcT",t:"Al relleno acumulado",u:"ton",d:1,tot:"last"},{k:"aprAT",t:"Aprovechable anual",u:"ton/año",d:1,tot:"sum"},{k:"aprAcT",t:"Aprovechable acumulado",u:"ton",d:1,tot:"last"}]);}
  else cols=cols.concat([{k:"relVd",t:"Al relleno diario",u:"m³/día",d:2},{k:"relVa",t:"Al relleno anual",u:"m³/año",d:1,tot:"sum"},{k:"relVac",t:"Al relleno acumulado",u:"m³",d:1,tot:"last"},
    {k:"aprVd",t:"Aprovechable diario",u:"m³/día",d:2},{k:"aprVa",t:"Aprovechable anual",u:"m³/año",d:1,tot:"sum"},{k:"aprVac",t:"Aprovechable acumulado",u:"m³",d:1,tot:"last"}]);
  return {titulo:"Producción de residuos — fracción no aprovechable y aprovechable",sub:"Volúmenes sueltos (sin compactar) calculados con el peso unitario de cada tipo de residuo.",
    controles:'<div class="rs-f"><label>Mostrar</label><select onchange="rsFiltro(\'prod_RS\',\'grupo\',this.value)">'+["Masa","Volumen"].map(function(o){return '<option'+(o===g?' selected':'')+'>'+o+'</option>';}).join("")+'</select></div>',
    columnas:cols,csv:"Produccion_RS",
    filas:D.P.map(function(p){return Object.assign({},p,{GdT:p.Gd/1000,aprT:p.aprD/1000,parT:p.parteD/1000,relAT:p.relA/1000,relAcT:p.relAc/1000,aprAT:p.aprA/1000,aprAcT:p.aprAc/1000});})};};

/* ==========================================================
   2. VENTANA
   ========================================================== */
function pintarProduccion_RS(){
  var id="produccion_RS",D=rsTodo();
  var h='<div class="titulo"><h1>PRODUCCIÓN A DISPONER</h1><p>Balance anual de la fracción no aprovechable que se dispone en el relleno y de la fracción aprovechable, en masa y volumen suelto. Constituye la base de diseño de celdas, lixiviados y gases.</p></div>'+CONV;
  if(!D.ok){gid("pane-"+id).innerHTML=h+rsFaltaProy();return;}
  var err=erroresProd_RS();
  if(err.length){gid("pane-"+id).innerHTML=h+rsFalta(err,"aprovechamiento_RS","Ir a metas de aprovechamiento")+rsAcciones(id,"revisionProd_RS()");return;}
  var P=D.P,a=P[0],z=P[P.length-1];
  if(PRO.rsPeligrosos===PELIGROSOS_RS[1])h+='<div class="link-ok">Los residuos peligrosos (RESPEL y hospitalarios) se gestionan aparte y no se disponen en el relleno (opción definida en Términos de referencia).</div>';
  h+=rsKpis([
    {t:"Al relleno en "+a.anio,v:rsF(a.relTd,2),u:"ton/día"},
    {t:"Al relleno en "+z.anio,v:rsF(z.relTd,2),u:"ton/día"},
    {t:"Total dispuesto en la vida útil",v:rsF(z.relAc/1000,0),u:"ton",s:rsF(z.relVac,0)+" m³ sueltos"},
    {t:"Total aprovechable",v:rsF(z.aprAc/1000,0),u:"ton",s:rsF(z.aprVac,0)+" m³"}]);
  h+='<div class="card"><div class="card-title">Destino de los residuos generados</div>'+
    rsGrafico(P.map(function(p){return p.anio;}),[{nombre:"No aprovechable al relleno (ton/año)",color:"#78716C",valores:P.map(function(p){return p.relA/1000;})},{nombre:"Aprovechable (ton/año)",color:"#16A34A",valores:P.map(function(p){return p.aprA/1000;})}].concat(P.some(function(p){return p.parteD>0;})?[{nombre:"Peligrosos aparte (ton/año)",color:"#DC2626",valores:P.map(function(p){return p.parteD*365/1000;})}]:[]),{uY:"ton/año"})+'</div>';
  h+=rsTabla("prod_RS");
  var j=rsIdx(D,rsAnioMemo(D)),p=P[j];
  h+='<div class="card"><div class="card-title">Parámetros de cálculo</div><div class="row">'+rsSelAnio(D)+'</div>'+rsAcciones(id,"revisionProd_RS()")+'</div>';
  var t='<table class="res-table"><thead><tr><th></th><th>VARIABLE</th><th>VALOR</th><th>UNIDAD</th></tr></thead><tbody>';
  t+=seccion("AÑO "+p.anio);
  t+=fila("Generación total diaria",p.Gd,"kg/día",2,"G<sub>d</sub> = P × PPC<sub>t</sub>","—","PPC y generación.");
  t+=fila("Aprovechable diario",p.aprD,"kg/día",2,"A = Σ A<sub>i</sub>","Suma de los "+D.M.length+" residuos","Metas de aprovechamiento.");
  if(p.parteD>0)t+=fila("Peligrosos gestionados aparte",p.parteD,"kg/día",2,"Σ N<sub>i</sub> de residuos peligrosos","—","No entran al relleno (Términos de referencia).");
  t+=fila("No aprovechable al relleno",p.relD,"kg/día",2,"R = Σ N<sub>i</sub>"+(p.parteD>0?" (sin peligrosos)":""),"G<sub>d</sub> − A"+(p.parteD>0?" − peligrosos":"")+" = "+nf(p.Gd,2)+" − "+nf(p.aprD,2)+(p.parteD>0?" − "+nf(p.parteD,2):""),"","","final");
  t+=fila("No aprovechable al relleno",p.relTd,"ton/día",3,"R<sub>t</sub> = R / 1000",nf(p.relD,2)+" / 1000","Entrada del módulo de celdas, lixiviados y gases.","","final");
  t+=fila("Volumen suelto al relleno",p.relVd,"m³/día",3,"V = Σ N<sub>i</sub> / ρ<sub>i</sub>","—","Cada residuo con su peso unitario.");
  t+=fila("Al relleno anual",p.relA/1000,"ton/año",2,"R<sub>a</sub> = R<sub>t</sub> × 365",nf(p.relTd,3)+" × 365");
  t+=fila("Aprovechado del total",p.pctApr*100,"%",2,"A / G<sub>d</sub> × 100",nf(p.aprD,2)+" / "+nf(p.Gd,2)+" × 100");
  t+='</tbody></table>';
  h+='<div class="card"><div class="card-title">Memoria de cálculo</div>'+t+'</div>';
  gid("pane-"+id).innerHTML=h;}

/* ==========================================================
   3. REVISIÓN, AVISOS Y RECALCULAR
   ========================================================== */
function revisionProd_RS(){abrirRevision("Producción a disponer",erroresProd_RS());}

/* ==========================================================
   4. REGISTRO DEL MÓDULO
   ========================================================== */
MODULOS.push({
  id:"produccion_RS",
  titulo:"Producción a disponer",
  descripcion:"Residuos no aprovechables dispuestos en el relleno y residuos aprovechables por año.",
  grupo:"residuos", orden:7, icono:"prod_RS",
  iconoSvg:"<path d=\"M3 7h11v9H3z\"/><path d=\"M14 10h4l3 3v3h-7z\"/><circle cx=\"7\" cy=\"17.5\" r=\"1.8\"/><circle cx=\"17\" cy=\"17.5\" r=\"1.8\"/>",
  valores:{},
  indicador:true, imprimible:true,
  normalizar:function(PRO){},
  completo:function(PRO){return rsSerie().length>0&&erroresProd_RS().length===0;},
  pintar:pintarProduccion_RS,
  recalcular:function(){rsRecalcular(pintarProduccion_RS,function(){return [];},"Producción a disponer");},
  errores:erroresProd_RS
});
