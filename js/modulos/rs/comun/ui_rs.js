/* ==========================================================
   RS · COMPONENTES DE INTERFAZ  (ui_rs.js)
   Tarjetas de resumen, chips de estado, tablas largas con filtros
   (años, residuo, escenario, variable) y descarga CSV, gráfico de barras SVG,
   campos numéricos, tablas editables y recálculo. Lo usan todos los módulos de RS.
   ========================================================== */

/* ==========================================================
   1. FORMATO, TARJETAS RESUMEN Y AVISOS
   ========================================================== */
/* ---------- Formato ---------- */
function rsF(v,d){return (v===null||v===undefined||!isFinite(v))?"—":nf(v,d===undefined?2:d);}
function rsChip(est){
  var c={"OK":"ok","CUMPLE":"ok","CORRECTO":"ok","LÍMITE":"adv","REVISAR":"adv","EXCEDE":"err","NO CUMPLE":"err","AUMENTAR Ø":"err"}[est]||"info";
  return '<span class="rs-chip '+c+'">'+est+'</span>';}

/* ---------- Tarjetas resumen ---------- */
function rsKpis(items){
  var n=items.length,filas=n<=3?[n]:n===4?[2,2]:n===5?[2,3]:[3,n-3],h='',i=0;
  filas.forEach(function(c){h+=rsKpisFila(items.slice(i,i+c));i+=c;});
  return h;}
function rsKpisFila(items){
  return '<div class="rs-kpis" style="grid-template-columns:repeat('+items.length+',minmax(0,1fr))">'+items.map(function(k){
    return '<div class="rs-kpi'+(k.est?' '+k.est:'')+'"><div class="l">'+k.t+'</div><div class="v">'+k.v+(k.u?'<small>('+k.u+')</small>':'')+'</div>'+(k.s?'<div class="s">'+k.s+'</div>':'')+'</div>';}).join("")+'</div>';}

/* ---------- Avisos ---------- */
function rsFaltaProy(){
  return '<div class="aviso"><b>Aún no hay población de diseño.</b> El diseño del relleno se calcula año a año con la serie de población. Genere la proyección en la ventana <i>Proyección poblacional</i> o ingrese la población manualmente en <i>Términos de referencia</i>.'+
    '<br><button onclick="irVista(\'proyeccion_poblacional_RS\')">Ir a proyección poblacional</button> <button onclick="irVista(\'terminos_referencia_RS\')">Ir a términos de referencia</button></div>';}
function rsLinkTR(txt){return '<button type="button" class="rs-link" onclick="irVista(\'terminos_referencia_RS\')">'+(txt||'Términos de referencia')+'</button>';}
function rsFalta(lista,vista,txtBtn){
  return '<div class="aviso"><b>Faltan insumos.</b> '+lista.join(" ")+(vista?'<br><button onclick="irVista(\''+vista+'\')">'+txtBtn+'</button>':'')+'</div>';}

/* ---------- Selector del año de la memoria ---------- */
function rsSelAnio(D){
  var a=rsAnioMemo(D);
  return '<div class="campo rs-selanio"><label>Año que se detalla en la memoria</label><select onchange="PRO.rsAnioMemo=Number(this.value);guardarPro();autoRecalcular()">'+
    D.serie.map(function(r){return '<option value="'+r.anio+'"'+(r.anio===a?' selected':'')+'>'+r.anio+' (año '+r.t+')</option>';}).join("")+'</select></div>';}

/* ---------- Botones estándar del módulo ---------- */
function rsAcciones(id,revision){
  return '<div class="acciones"><button class="btn-revision" onclick="'+revision+'">REVISIÓN DE ERRORES</button>'+
    '<button class="btn-sec" onclick="abrirTodo(\'pane-'+id+'\',true)">VER TODA LA MEMORIA DE CÁLCULO</button>'+
    '<button class="btn-sec" onclick="abrirTodo(\'pane-'+id+'\',false)">CONTRAER TODO</button></div>';}

/* ==========================================================
   2. TABLA LARGA CON FILTROS
   rsTabla(id) dibuja la tabla registrada con RS_TABLAS[id] = function(){ return cfg; }
   cfg = { titulo, sub, columnas:[{k,t,d,u,tot:'sum'|'last'|null,fmt:function(v,fila)}], filas:[{anio,t,...}],
           controles: html extra (selects que llaman rsFiltro(id,clave,valor)), csv: nombre de archivo }
   El estado de los filtros vive en RS_FILT[id] (desde, hasta, soloCambios y lo que agregue cada módulo).
   ========================================================== */
var RS_TABLAS={}, RS_FILT={};
function rsFiltroEstado(id,def){RS_FILT[id]=RS_FILT[id]||{};Object.keys(def||{}).forEach(function(k){if(!(k in RS_FILT[id]))RS_FILT[id][k]=def[k];});return RS_FILT[id];}
function rsFiltro(id,k,v){rsFiltroEstado(id)[k]=v;rsRepintarTabla(id);}
function rsRepintarTabla(id){var el=gid("rsT-"+id);if(el)el.outerHTML=rsTabla(id);}

function rsFilasFiltradas(id,cfg){
  var F=rsFiltroEstado(id),filas=cfg.filas||[];
  if(!filas.length)return [];
  var a0=filas[0].anio,a1=filas[filas.length-1].anio;
  var d=Number(F.desde)||a0,h=Number(F.hasta)||a1;
  return filas.filter(function(f){
    if(f.anio<d||f.anio>h)return false;
    if(F.soloCambios&&cfg.cambios&&!cfg.cambios(f))return false;
    return true;});}

function rsTabla(id){
  var cfg=RS_TABLAS[id]?RS_TABLAS[id]():null;
  if(!cfg)return '<div id="rsT-'+id+'"></div>';
  var F=rsFiltroEstado(id),filas=cfg.filas||[];
  var anios=filas.map(function(f){return f.anio;});
  var a0=anios[0],a1=anios[anios.length-1];
  if(!(Number(F.desde)>=a0&&Number(F.desde)<=a1))F.desde=a0;
  if(!(Number(F.hasta)>=a0&&Number(F.hasta)<=a1))F.hasta=a1;
  var sel=function(k,val){return '<select onchange="rsFiltro(\''+id+'\',\''+k+'\',Number(this.value))">'+anios.map(function(a){return '<option'+(a===Number(val)?' selected':'')+'>'+a+'</option>';}).join("")+'</select>';};
  var vis=rsFilasFiltradas(id,cfg);
  var h='<div class="card rs-tcard" id="rsT-'+id+'"><div class="card-title">'+cfg.titulo+'</div>'+(cfg.sub?'<div class="card-sub">'+cfg.sub+'</div>':'');
  h+='<div class="rs-filtros">'+(cfg.controles||'')+
    '<div class="rs-f"><label>Desde</label>'+sel("desde",F.desde)+'</div><div class="rs-f"><label>Hasta</label>'+sel("hasta",F.hasta)+'</div>'+
    (cfg.cambios?'<label class="rs-chk"><input type="checkbox"'+(F.soloCambios?' checked':'')+' onchange="rsFiltro(\''+id+'\',\'soloCambios\',this.checked)"> Solo años de cambio de plazo</label>':'')+
    '<div class="rs-esp"></div><span class="rs-cuenta">'+vis.length+' de '+filas.length+' años</span>'+
    '<button type="button" class="btn-sec rs-csv" onclick="rsCSV(\''+id+'\')">'+ico('bajar')+'CSV</button></div>';
  h+='<div class="rs-tscroll"><table class="rs-table"><thead><tr>'+cfg.columnas.map(function(c){return '<th>'+c.t+(c.u?'<small>('+c.u+')</small>':'')+'</th>';}).join("")+'</tr></thead><tbody>';
  vis.forEach(function(f){
    h+='<tr'+(f._cls?' class="'+f._cls+'"':'')+'>'+cfg.columnas.map(function(c){var v=f[c.k];return '<td>'+(c.fmt?c.fmt(v,f):typeof v==="number"?rsF(v,c.d):(v===undefined?"":v))+'</td>';}).join("")+'</tr>';});
  if(cfg.columnas.some(function(c){return c.tot;})&&vis.length){
    h+='<tr class="rs-tot">'+cfg.columnas.map(function(c,i){
      if(i===0)return '<td>'+(vis.length===filas.length?'Total período':'Total filtrado')+'</td>';
      if(c.tot==="sum")return '<td>'+rsF(vis.reduce(function(a,f){return a+(isFinite(f[c.k])?f[c.k]:0);},0),c.d)+'</td>';
      if(c.tot==="last")return '<td>'+rsF(vis[vis.length-1][c.k],c.d)+'</td>';
      if(c.tot==="max")return '<td>'+rsF(Math.max.apply(null,vis.map(function(f){return isFinite(f[c.k])?f[c.k]:-Infinity;})),c.d)+'</td>';
      return '<td></td>';}).join("")+'</tr>';}
  h+='</tbody></table></div>'+(cfg.pie||'')+'</div>';
  return h;}

function rsCSV(id){
  var cfg=RS_TABLAS[id]&&RS_TABLAS[id]();if(!cfg)return;
  var vis=rsFilasFiltradas(id,cfg);
  var txt=function(s){return '"'+String(s).replace(/<[^>]*>/g,"").replace(/"/g,'""')+'"';};
  var lin=[cfg.columnas.map(function(c){return txt(c.t+(c.u?" ("+c.u+")":""));}).join(";")];
  vis.forEach(function(f){lin.push(cfg.columnas.map(function(c){var v=f[c.k];return typeof v==="number"&&isFinite(v)?String(rnd(v,c.d===undefined?4:Math.max(c.d,2))).replace(".",","):txt(v===undefined?"":(c.fmt?c.fmt(v,f):v));}).join(";"));});
  var blob=new Blob(["﻿"+lin.join("\r\n")],{type:"text/csv;charset=utf-8"});
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=(cfg.csv||id)+"_"+String(PRO.nombrePob||"proyecto").replace(/[^\wáéíóúñÁÉÍÓÚÑ-]+/g,"_")+".csv";
  document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);}

/* ==========================================================
   3. GRÁFICO DE BARRAS (apiladas) Y LÍNEA — SVG simple
   series: [{nombre,color,valores:[...]}]  · etiquetas: años
   ========================================================== */
function rsGrafico(etiquetas,series,opt){
  opt=opt||{};
  var W=760,H=250,ml=64,mr=14,mt=16,mb=42,w=W-ml-mr,h=H-mt-mb,n=etiquetas.length;if(!n)return "";
  var tot=etiquetas.map(function(_,i){return series.reduce(function(a,s){return a+(opt.linea?0:Math.max(0,s.valores[i]||0));},0);});
  var mx=opt.linea?Math.max.apply(null,series.map(function(s){return Math.max.apply(null,s.valores.map(function(v){return isFinite(v)?v:0;}));})):Math.max.apply(null,tot);
  if(opt.limite)mx=Math.max(mx,opt.limite);
  if(!(mx>0))mx=1;
  var p10=Math.pow(10,Math.floor(Math.log10(mx))),paso=[1,2,2.5,5,10].map(function(k){return k*p10;}).filter(function(s){return mx/s<=5;})[0]||p10*10,top=Math.ceil(mx/paso)*paso;
  var y=function(v){return mt+h-(v/top)*h;},bw=w/n;
  var s='<svg viewBox="0 0 '+W+' '+H+'" class="rs-graf" role="img" aria-label="'+(opt.titulo||"Gráfico")+'">';
  for(var g=0;g<=top+1e-9;g+=paso){s+='<line x1="'+ml+'" x2="'+(W-mr)+'" y1="'+y(g)+'" y2="'+y(g)+'" stroke="#E5EDE8"/><text x="'+(ml-6)+'" y="'+(y(g)+3.5)+'" font-size="10" text-anchor="end" fill="#64748B">'+rsCorto(g)+'</text>';}
  if(opt.linea){
    series.forEach(function(se){
      var pts=se.valores.map(function(v,i){return (ml+bw*i+bw/2).toFixed(1)+','+y(isFinite(v)?v:0).toFixed(1);}).join(' ');
      s+='<polyline points="'+pts+'" fill="none" stroke="'+se.color+'" stroke-width="2.4" stroke-linejoin="round"/>';
      se.valores.forEach(function(v,i){s+='<circle cx="'+(ml+bw*i+bw/2).toFixed(1)+'" cy="'+y(isFinite(v)?v:0).toFixed(1)+'" r="2.6" fill="'+se.color+'"><title>'+etiquetas[i]+' · '+se.nombre+': '+rsF(v,2)+'</title></circle>';});});
  }else{
    etiquetas.forEach(function(et,i){var acc=0;
      series.forEach(function(se){var v=Math.max(0,se.valores[i]||0);if(!(v>0))return;
        s+='<rect x="'+(ml+bw*i+bw*0.14).toFixed(1)+'" y="'+y(acc+v).toFixed(1)+'" width="'+(bw*0.72).toFixed(1)+'" height="'+(y(acc)-y(acc+v)).toFixed(1)+'" rx="2" fill="'+se.color+'"><title>'+et+' · '+se.nombre+': '+rsF(v,2)+'</title></rect>';acc+=v;});});}
  if(opt.limite)s+='<line x1="'+ml+'" x2="'+(W-mr)+'" y1="'+y(opt.limite)+'" y2="'+y(opt.limite)+'" stroke="#DC2626" stroke-dasharray="6 4" stroke-width="1.6"/><text x="'+(W-mr)+'" y="'+(y(opt.limite)-5)+'" font-size="10.5" font-weight="700" text-anchor="end" fill="#DC2626">'+(opt.limiteTxt||"Límite")+'</text>';
  var cada=Math.ceil(n/16);
  etiquetas.forEach(function(et,i){if(i%cada===0||i===n-1)s+='<text x="'+(ml+bw*i+bw/2).toFixed(1)+'" y="'+(H-mb+15)+'" font-size="10" text-anchor="middle" fill="#64748B">'+et+'</text>';});
  s+='<line x1="'+ml+'" x2="'+(W-mr)+'" y1="'+(mt+h)+'" y2="'+(mt+h)+'" stroke="#94A3B8"/>';
  if(opt.uY)s+='<text x="12" y="'+(mt+h/2)+'" font-size="10.5" fill="#64748B" transform="rotate(-90 12 '+(mt+h/2)+')" text-anchor="middle">'+opt.uY+'</text>';
  s+='</svg>';
  var ley='<div class="rs-leyenda">'+series.map(function(se){return '<span><i style="background:'+se.color+'"></i>'+se.nombre+'</span>';}).join("")+(opt.limite?'<span><i style="background:#DC2626;height:2px"></i>'+(opt.limiteTxt||"Límite")+'</span>':'')+'</div>';
  return '<div class="rs-graf-wrap">'+(opt.titulo?'<div class="rs-graf-t">'+opt.titulo+'</div>':'')+s+ley+'</div>';}
function rsCorto(v){var a=Math.abs(v);return a>=1e9?nf(v/1e9,1)+" G":a>=1e6?nf(v/1e6,1)+" M":a>=1e4?nf(v/1e3,0)+" k":nf(v,a<10&&a!==0?1:0);}

/* ==========================================================
   4. CAMPOS NUMÉRICOS SIN FLECHAS
   Se usan campos de texto con teclado decimal: no tienen flechas de subir/bajar y la rueda
   del mouse no cambia el valor. Se acepta coma o punto decimal. Enter guarda y recalcula.
   ========================================================== */
function rsNumTxt(v){var t=String(v===undefined||v===null?"":v).trim().replace(/\s/g,"").replace(",",".");if(t==="")return "";var n=Number(t);return isFinite(n)?n:t;}
function rsVer(v){return (v===""||v===null||v===undefined)?"":String(v).replace(".",",");}
var RS_ENTER='onkeydown="if(event.key===\'Enter\'){event.preventDefault();this.blur();}"';

/* Campo de Términos de referencia (mismo aspecto que campo() del núcleo) */
/* entero=true: valores enteros (años, habitantes); el punto se toma como separador de miles (10.554 = 10554) */
function rsCampo(lbl,k,entero){
  var v=entero?(PRO[k]===""||PRO[k]===null||PRO[k]===undefined?"":String(PRO[k])):rsVer(PRO[k]);
  return '<div class="campo"><label>'+lbl+'</label><input type="text" inputmode="'+(entero?'numeric':'decimal')+'" autocomplete="off" placeholder="Ingrese un valor" value="'+esc(v)+'" '+
    'oninput="rsSetPro(\''+k+'\',this,'+(entero?'true':'false')+')" onchange="autoRecalcular()" '+RS_ENTER+'></div>';}
function rsSetPro(k,el,entero){PRO[k]=rsNumTxt(entero?String(el.value).replace(/[.\s]/g,"").replace(/,\d*$/,""):el.value);guardarPro();actualizarEstados();}
/* Campo en porcentaje: se muestra en % y se guarda como fracción */
function rsCampoPct(lbl,k){
  var v=PRO[k]===""||PRO[k]===null||PRO[k]===undefined||!isFinite(Number(PRO[k]))?"":rnd(Number(PRO[k])*100,4);
  return '<div class="campo"><label>'+lbl+' (%)</label><input type="text" inputmode="decimal" autocomplete="off" placeholder="Ingrese un valor" value="'+rsVer(v)+'" '+
    'oninput="rsSetProPct(\''+k+'\',this)" onchange="autoRecalcular()" '+RS_ENTER+'></div>';}
function rsSetProPct(k,el){var v=rsNumTxt(el.value);PRO[k]=typeof v==="number"?v/100:v;guardarPro();actualizarEstados();}

/* ==========================================================
   5. TABLAS EDITABLES (residuos, metas y tramos)
   ========================================================== */
function rsInp(lista,i,k,val,opts){
  opts=opts||{};
  var v=opts.text?(val===undefined||val===null?"":val):rsVer(val);
  return '<input class="rs-inp'+(opts.cls?' '+opts.cls:'')+'" type="text"'+(opts.text?'':' inputmode="decimal"')+' autocomplete="off" value="'+esc(v)+'" '+
    'oninput="rsSetLista(\''+lista+'\','+i+',\''+k+'\',this,'+(opts.text?'false':'true')+')" onchange="autoRecalcular()" '+RS_ENTER+'>';}
function rsChk(lista,i,k,val){
  return '<input type="checkbox" class="rs-cb"'+(Number(val)?' checked':'')+' onchange="rsSetLista(\''+lista+'\','+i+',\''+k+'\',this,\'chk\');autoRecalcular()">';}
function rsSetLista(lista,i,k,el,num){
  var L=PRO[lista];if(!L||!L[i])return;
  L[i][k]=num==="chk"?(el.checked?1:0):num?rsNumTxt(el.value):el.value;
  guardarPro();actualizarEstados();}
function rsAgregarFila(lista,fila){PRO[lista]=PRO[lista]||[];PRO[lista].push(fila);guardarPro();autoEjecutar();}

/* Eliminar filas: ventana con la lista de filas para marcar las que se borran */
function rsEliminarFilas(lista,titulo,sub){
  var L=PRO[lista]||[];
  if(!L.length){abrirRevision(titulo,["La tabla no tiene filas para eliminar."]);return;}
  var c='<div class="rs-del-lista" id="rs-del-lista">'+L.map(function(f,i){return '<label><input type="checkbox" value="'+i+'"><span><b>'+(i+1)+'.</b> '+esc(f.n||"Sin nombre")+'</span></label>';}).join("")+'</div>'+
    '<button type="button" class="rs-del-btn" onclick="rsConfirmarEliminar(\''+lista+'\')">Eliminar seleccionados</button>';
  uiRevision('adv','x',titulo,sub||'Marque las filas que desea eliminar de la tabla.',c);}
function rsConfirmarEliminar(lista){
  var sel=[].map.call(document.querySelectorAll('#rs-del-lista input:checked'),function(x){return Number(x.value);});
  if(!sel.length){uiToast('No se seleccionó ninguna fila','adv');return;}
  PRO[lista]=(PRO[lista]||[]).filter(function(_,i){return sel.indexOf(i)<0;});
  guardarPro();cerrarRevision();autoEjecutar();uiToast(sel.length+(sel.length===1?' fila eliminada':' filas eliminadas'));}

/* ==========================================================
   6. RECALCULAR CON ADVERTENCIA
   ========================================================== */
/* Recalcular un módulo y, si hay datos ingresados con error, mostrar la advertencia (igual que en STAR) */
function rsRecalcular(pintar,errores,titulo){
  pintar();
  var e=[];try{e=errores()||[];}catch(_){}
  if(e.length)abrirAdvertencia("Advertencia — "+titulo,e);}
