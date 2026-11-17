/* ==========================================================
   NÚCLEO — exportar.js
   Botones EXPORTAR PDF / EXPORTAR DWG debajo de las ilustraciones de cada módulo
   y ventana que pregunta 2D o 3D.
     · PDF 2D  → láminas A3 de construcción (planta, cortes, detalles, cuadros)
     · PDF 3D  → lámina A3 con vistas isométricas (general y en corte con lámina de agua)
     · DWG 2D  → planos de AutoCAD por capas, con cotas reales (archivo .dxf)
     · DWG 3D  → modelo 3D de AutoCAD por capas (archivo .dxf, abre en isométrica)
   Un módulo se registra en EXPORTAR_STAR con su generador: generar(modo,parte) →
     {nombre, resumen, planos} (2D) | {nombre, resumen, lamina3D, modelo3D} (3D) | {error}
   Uso en el pintar del módulo:  h += barraExportar_STAR("desarenador");
   ========================================================== */

var EXPORTAR_STAR={
  rejilla:{titulo:"Rejilla",generar:function(m){return exportarRejilla_STAR(m);},
    campos:[{id:"rejTmuro",et:"Espesor de muros (m)",def:0.15},{id:"rejTlosa",et:"Espesor de losa (m)",def:0.15},
            {id:"rejLlleg",et:"Canal de llegada (m)",def:1.50},{id:"rejLsal",et:"Canal de salida (m)",def:1.50}]},
  aduccion:{titulo:"Aducción",generar:function(m,p){return exportarAduccion_STAR(m,p);},
    /* solo para el canal: la tubería ya trae su espesor del catálogo y no lleva concreto */
    campos:[{id:"aduTmuro",et:"Espesor de muros del canal (m)",def:0.15,parte:"canal"},{id:"aduTlosa",et:"Espesor de losa del canal (m)",def:0.15,parte:"canal"}]},
  desarenador:{titulo:"Desarenador",generar:function(m){return exportarDesarenador_STAR(m);},
    campos:[{id:"desTmuro",et:"Espesor de muros (m)",def:0.20},{id:"desTlosa",et:"Espesor de losa (m)",def:0.20},
            {id:"desTdef",et:"Espesor de deflectores (m)",def:0.06},{id:"desLtubo",et:"Tramo de tubería de llegada y salida (m)",def:0.70},
            {id:"desSepCam",et:"Separación tanque – cámara de lodos (m)",def:0.70}]},
  parshall:{titulo:"Canaleta Parshall",generar:function(m){return exportarParshall_STAR(m);},
    campos:[{id:"parTmuro",et:"Espesor de muros (m)",def:0.15},{id:"parTlosa",et:"Espesor de losa (m)",def:0.15},
            {id:"parLent",et:"Tramo recto de entrada (m)",def:0.30},{id:"parLsal",et:"Canal de salida (m)",def:0.60}]}};

var EXP_ICO={
  dl:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  pdf:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 13h5M9.5 16.5h5"/>',
  dwg:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 13l3-4 3 3 2-2 2 3"/><path d="M8 21h8M12 17v4"/>',
  d2:'<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M3.5 12h17M10 5v14"/><path d="M13 8.5h4.5M13 15.5h4.5"/>',
  d3:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  ok:'<path d="m5 12.5 4.5 4.5L19 7.5"/>'};
function expIco_STAR(p,w){return '<svg viewBox="0 0 24 24" width="'+(w||18)+'" height="'+(w||18)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}

/* ---------- Barra de botones (va debajo de las ilustraciones) ---------- */
function barraExportar_STAR(clave,parte){
  var a="'"+clave+"','"+(parte||"")+"'";
  return '<div class="exp-barra">'+
    '<button type="button" class="exp-btn" onclick="abrirExportar_STAR('+a+',\'pdf\')">'+expIco_STAR(EXP_ICO.pdf)+'Exportar PDF</button>'+
    '<button type="button" class="exp-btn exp-btn-dwg" onclick="abrirExportar_STAR('+a+',\'dwg\')">'+expIco_STAR(EXP_ICO.dwg)+'Exportar DWG</button></div>';}

/* ---------- Ventana: ¿2D o 3D? ---------- */
var EXP_MODO_STAR="2d";
function abrirExportar_STAR(clave,parte,fmt){
  var X=EXPORTAR_STAR[clave];if(!X)return;
  var prev=null;try{prev=X.generar("2d",parte);}catch(e){prev={error:"No se pudo preparar el plano: "+e.message};}
  if(!prev||prev.error){mostrarError("Exportar "+(fmt==="pdf"?"PDF":"DWG"),(prev&&prev.error)||"Primero completa el cálculo del módulo.");return;}
  cerrarExportar_STAR();
  var pdf=fmt==="pdf",m=prev.planos.meta,nh=prev.planos.laminas.length;
  var op=function(id,ico,tit,desc){return '<label class="exp-op'+(EXP_MODO_STAR===id?' on':'')+'" data-modo="'+id+'" onclick="expModo_STAR(\''+id+'\')">'+
    '<span class="exp-op-ico">'+expIco_STAR(ico,30)+'</span><span class="exp-op-tx"><b>'+tit+'</b><small>'+desc+'</small></span>'+
    '<span class="exp-chk">'+expIco_STAR(EXP_ICO.ok,15)+'</span></label>';};
  var campos=(X.campos||[]).filter(function(c){return !c.parte||c.parte===parte;}).map(function(c){var v=PRO[c.id]!=null&&PRO[c.id]!==""?PRO[c.id]:c.def;
    return '<label class="exp-campo"><span>'+c.et+'</span><input type="number" data-campo="'+c.id+'" value="'+v+'" step="0.01" min="0"></label>';}).join("");
  var h='<div class="exp-ov" id="exp-ov" onclick="if(event.target===this)cerrarExportar_STAR()"><div class="exp-box" role="dialog" aria-modal="true" aria-labelledby="exp-tt">'+
    '<div class="exp-head"><div class="exp-hico">'+expIco_STAR(pdf?EXP_ICO.pdf:EXP_ICO.dwg,24)+'</div>'+
      '<div><h3 id="exp-tt">'+(pdf?"Exportar PDF":"Exportar DWG · AutoCAD")+'</h3><p>'+esc(X.titulo)+(parte?" · "+esc(parte==="canal"?"Canal":"Tubería"):"")+' · '+esc(prev.resumen||"")+'</p></div>'+
      '<button class="exp-x" onclick="cerrarExportar_STAR()" aria-label="Cerrar">×</button></div>'+
    '<div class="exp-body">'+
      '<div class="exp-sec">¿En 2D o en 3D?</div><div class="exp-ops">'+
      op("2d",EXP_ICO.d2,"2D · Planos de construcción",pdf?nh+" lámina"+(nh>1?"s":"")+" A3: planta, cortes, detalles, cotas y cuadros de dimensiones, a escala normalizada.":
        "Planos por capas con cotas reales de AutoCAD: planta, cortes, detalles y cuadros ("+nh+" lámina"+(nh>1?"s":"")+").")+
      op("3d",EXP_ICO.d3,"3D · Modelo tridimensional",pdf?"Lámina A3 con vista isométrica general y en corte con la lámina de agua.":
        "Modelo 3D por capas (concreto, agua, tubería) para rotar, medir y renderizar en AutoCAD.")+'</div>'+
      '<div class="exp-sec">Datos del plano</div>'+
      '<div class="exp-info"><span><small>Proyecto</small><b>'+esc(m.proyecto||"—")+'</b></span><span><small>Diseñador</small><b>'+esc(m.diseñador||"—")+'</b></span><span><small>Fecha</small><b>'+esc(m.fecha||"")+'</b></span></div>'+
      '<p class="exp-nota">El proyecto y el diseñador se toman de Términos de referencia. La escala se elige sola para que el dibujo llene la lámina.</p>'+
      (campos?'<div class="exp-campos">'+campos+'</div>':'')+
      (pdf?'':'<p class="exp-nota exp-nota-dwg">Se descarga como archivo de AutoCAD <b>.dxf</b> (el navegador no puede escribir .dwg directamente): ábrelo en AutoCAD y usa <b>Guardar como → .dwg</b>. Conserva capas, cotas y textos.</p>')+
    '</div>'+
    '<div class="exp-foot"><span class="exp-err" id="exp-err"></span><button class="btn-sec" onclick="cerrarExportar_STAR()">Cancelar</button>'+
      '<button class="exp-go" id="exp-go" onclick="ejecutarExportar_STAR(\''+clave+'\',\''+(parte||"")+'\',\''+fmt+'\')">'+expIco_STAR(EXP_ICO.dl,17)+'<span>Descargar</span></button></div>'+
    '</div></div>';
  document.body.insertAdjacentHTML("beforeend",h);
  requestAnimationFrame(function(){var o=gid("exp-ov");if(o)o.classList.add("show");});
  document.addEventListener("keydown",expTecla_STAR);}
function expModo_STAR(id){EXP_MODO_STAR=id;[].slice.call(document.querySelectorAll("#exp-ov .exp-op")).forEach(function(l){l.classList.toggle("on",l.getAttribute("data-modo")===id);});}
function expTecla_STAR(e){if(e.key==="Escape")cerrarExportar_STAR();}
function cerrarExportar_STAR(){var o=gid("exp-ov");if(o)o.remove();document.removeEventListener("keydown",expTecla_STAR);}

/* ---------- Generar y descargar ---------- */
function ejecutarExportar_STAR(clave,parte,fmt){
  var X=EXPORTAR_STAR[clave],err=gid("exp-err"),malo=null;
  [].slice.call(document.querySelectorAll("#exp-ov [data-campo]")).forEach(function(i){var v=Number(String(i.value).replace(",","."));
    if(!(v>=0)||String(i.value).trim()===""){malo=malo||i;return;}PRO[i.getAttribute("data-campo")]=v;});
  if(malo){err.textContent="Revisa el valor de “"+malo.parentNode.firstChild.textContent+"”.";malo.focus();return;}
  if(X.campos)guardarPro();
  var b=gid("exp-go"),modo=EXP_MODO_STAR;b.disabled=true;b.lastChild.textContent="Generando…";
  setTimeout(function(){
    var r;try{r=X.generar(modo,parte||undefined);}catch(e){r={error:"No se pudo generar el plano: "+e.message};}
    if(!r||r.error){b.disabled=false;b.lastChild.textContent="Descargar";err.textContent=(r&&r.error)||"No se pudo generar el plano.";return;}
    var nom=r.nombre+(parte?"_"+(parte==="canal"?"Canal":"Tuberia"):"")+(modo==="3d"?"_3D":"_Planos");
    if(fmt==="pdf")descargarBytes(planoPDF(modo==="3d"?r.lamina3D:r.planos),nom+".pdf","application/pdf");
    else descargarBytes((modo==="3d"?r.modelo3D:r.planos).bytes(),nom+".dxf","application/dxf");
    cerrarExportar_STAR();
    uiToast(fmt==="pdf"?"PDF "+modo.toUpperCase()+" descargado":"Plano de AutoCAD "+modo.toUpperCase()+" descargado (.dxf → Guardar como .dwg)");},40);}
