/* ==========================================================
   VENTANA 6 — DESARENADOR · cálculo  (desarenador.js)
   Requiere: PRO.Q, PRO.ADU / PRO.REJ, DP_STAR.T.AT y DP_STAR.T.LODOS
   ========================================================== */

/* ==========================================================
   1. FUNCIONES AUXILIARES
   ========================================================== */

/* Velocidad de llegada desde la aducción (canal o tubería) */
function desVoLlegada_STAR(){
  var A=PRO.ADU;
  /* si la aducción no está guardada, se calcula aquí */
  if(!A&&PRO.Q&&typeof calcularAduccion_STAR==="function"){
    try{var R=calcularAduccion_STAR();A={canal:R.canal&&!R.canalErr.length?{Vo:R.canal.Vo}:null,tub:R.tub&&!R.tubErr.length?{V:R.tub.V2||R.tub.V}:null};}catch(_){A=null;}}
  A=A||{};
  var c=A.canal&&A.canal.Vo?{V:A.canal.Vo,fuente:"canal de aducción"}:null,t=A.tub&&A.tub.V?{V:A.tub.V,fuente:"tubería de aducción"}:null;
  var pref=PRO.desLleg==="Tubería de aducción"?[t,c]:[c,t];
  return pref[0]||pref[1]||{V:null,fuente:""};}

/* Lado de la cámara de lodos (mínimo de Datos preliminares) */
function desLadoCaja_STAR(){var T=DP_STAR.T.LODOS,v=Number(PRO.desLado);return v>0?Math.max(T.ladoMin,v):T.ladoDef;}

/* Tuberías de la cámara de lodos: purga (catálogo PVC) y tubo de extracción (digitado).
   Devuelve el diámetro exterior real (m) para dibujar y la etiqueta nominal. */
function desTubosLodos_STAR(){
  var TL=DP_STAR.T.LODOS,cat=DP_STAR.T.PVC||[];
  var pulg=function(t){var v=0;String(t).trim().split(" ").forEach(function(q){if(q.indexOf("/")>0){var f=q.split("/");v+=Number(f[0])/Number(f[1]);}else v+=Number(q)||0;});return v;};
  var fila=function(inch){for(var i=0;i<cat.length;i++)if(Math.abs(pulg(cat[i][0])-inch)<1e-6)return cat[i];return null;};
  var txt=function(inch){return String(Math.round(inch*100)/100).replace(".",",");};
  var np=(PRO.desDpurga!==undefined&&PRO.desDpurga!==null&&PRO.desDpurga!=="")?String(PRO.desDpurga):String(TL.dSalida);
  var fp=fila(pulg(np)),ip=pulg(np)||TL.dSalida;
  var ir=pulg(PRO.desDext)>0?pulg(PRO.desDext):TL.dExtraccion,fr=fila(ir);
  return {Dp:fp?fp[1]/1000:ip*0.0254,labP:"Ø "+(fp?fp[0]:txt(ip))+"\"",inP:ip,
          Dr:fr?fr[1]/1000:ir*0.0254,labR:"Ø "+(fr?fr[0]:txt(ir))+"\"",inR:ir};}

/* Subtítulo y campos de la cámara de recolección de lodos (los mismos en Términos de referencia y en el módulo) */
function desCamaraLodosHTML_STAR(){
  var cat=DP_STAR.T.PVC||[];
  var sel=function(lbl,k){var v=(PRO[k]===undefined||PRO[k]===null)?"":String(PRO[k]);
    return '<div class="campo" style="flex:40 1 0"><label>'+lbl+'</label><select onchange="setPro(\''+k+'\',this,false);autoRecalcular()">'+
      '<option value=""'+(v===""?' selected':'')+'>Selecciona</option>'+
      cat.map(function(p){return '<option value="'+p[0]+'"'+(v===p[0]?' selected':'')+'>'+p[0]+'"</option>';}).join('')+'</select></div>';};
  return '<div class="card-title" style="padding-top:14px">1. Cámara de recolección de lodos</div>'+
    '<div class="row">'+campo("Dimensiones cámara de lodos (LxL) (m)","desLado","number",'step="0.05" min="'+DP_STAR.T.LODOS.ladoMin+'"').replace('class="campo"','class="campo" style="flex:36 1 0"')+
    sel("Diámetro tubería de recolección de lodos (in)","desDpurga")+sel("Diámetro tubería de extracción (in)","desDext")+'</div>';}

/* ==========================================================
   2. CÁLCULO
   ========================================================== */
function calcularDesarenador_STAR(){
  /* Validación de datos */
  var g=9.81,QD=PRO.Q.QDm3,pct=Number(PRO.desPct),nU=Number(PRO.desN),E=[],A=[];
  if(!(pct>0&&pct<=100)) E.push("El porcentaje del caudal de diseño debe estar entre 1 y 100 %.");
  if(!(nU>=1)||nU!==Math.floor(nU)) E.push("El número de desarenadores debe ser un entero mayor o igual a 1.");
  var req=[["desT","temperatura"],["desDp","diámetro de partícula"],["desRho","peso específico de la partícula"],["desA","tiempo de retención a"],["desAL","área de salida de lodos AL"],["desVor","velocidad en orificios Vor"],["desDor","diámetro del orificio"],["desBL","borde libre"]],f=[];
  req.forEach(function(r){ if(!aduPos_STAR(PRO[r[0]])) f.push(r[1]); });
  if(f.length) E.push("Faltan datos: "+f.join(", ")+".");
  if(E.length) return {err:E};
  /* Sedimentación (Stokes) */
  var Q=QD*pct/100/nU,T=Number(PRO.desT),dp=Number(PRO.desDp)/1000,rp=Number(PRO.desRho),rf=1000;
  var nu=4.34565e-5/(T+23.3), mu=nu*rf, Vs=g/18*(rp-rf)/mu*dp*dp, Re=Vs*dp/nu;
  /* Tiempos y altura */
  var at=DP_STAR.T.AT[PRO.desCond][DP_STAR.T.REM.indexOf(String(PRO.desRem))], a=Number(PRO.desA)*60, Ts=a/at;
  var Hc=Ts*Vs, H=Hc;
  /* Dimensiones y velocidades */
  var Vd=a*Q, As=Vd/H, VA=Q/As, B=Math.sqrt(As/4), L=4*B, Vo=Q/(B*H);
  /* Eficiencia y zona de lodos */
  var Ef=Vs/VA*100, hoc=L/10, ho=Math.min(1.5,Math.max(0.75,hoc)), AL=Number(PRO.desAL), VL=ho/3*(As+AL+Math.sqrt(As*AL)), rVL=VL/Vd*100;
  /* Orificios del deflector */
  var Aor_t=Q/Number(PRO.desVor), d=Number(PRO.desDor)*0.0254, Aor=Math.PI*d*d/4, N=Aor_t/Aor;
  var n=Math.ceil(Math.sqrt(N*B/H)), m=Math.ceil(N/n), Z=(B-n*d)/(n+1), hd0=H/Number(PRO.desDef), hd=hd0, W=(hd-m*d)/(m+1), hdAum=false;
  /* Si W < 0: subir el deflector en pasos de 0,05 m hasta W ≥ 0,01 m (máx. H) */
  if(W<0){var hn=Math.ceil((m*d+(m+1)*0.01)/0.05)*0.05;if(hn<=H+1e-9){hd=hn;hdAum=true;}else{hd=H;hdAum=true;}W=(hd-m*d)/(m+1);}
  /* Plataforma de entrada: base b = máx(b1, b2); si b < 0,30 m se usa la base asumida */
  var lleg=desVoLlegada_STAR(), Vad=(lleg.V>0)?lleg.V:0.5, VadFuente=(lleg.V>0)?lleg.fuente:"conducto de llegada (aducción sin calcular: se usa el mínimo del RAS, 0,5 m/s)";
  var b1=Q/(B*Vad), b2=Q/(B*0.5), bcal=Math.max(b1||0,b2);
  var bAs=Number(PRO.desBase); if(!(bAs>=0.30&&bAs<=0.50)) bAs=bAs>0.50?0.50:0.30;
  var bp=bcal<0.30?bAs:bcal, bAsumida=bcal<0.30, HL=Math.pow(Q/(1.84*B),1/1.5);
  /* Altura Hp: iterar t (0,5 s en 0,5 s) hasta Hp ≥ HL */
  var t0=0.5, paso=0.5, tIt=t0, it=[], Hp=Q*tIt/(B*bp);
  it.push({t:tIt,Hp:Hp});
  while(Hp<HL&&it.length<400){ tIt=Math.round((tIt+paso)*10)/10; Hp=Q*tIt/(B*bp); it.push({t:tIt,Hp:Hp}); }
  var tp=tIt;
  /* Vertedero de salida (Francis): hv = HL */
  var hv=HL;
  /* Ubicación de deflectores */
  var Lde=L/4, Lds=15*hv, Lz=L-Lde-Lds;
  /* Tolva: punto más bajo a L/3 y pendientes del fondo */
  var H2=ho, xL3=L/3, xL23=2*L/3, S1=ho/xL3*100, S2=ho/xL23*100;
  /* Borde libre y alturas totales */
  var He3=H/3, pBL=Number(PRO.desBL), BL=H*pBL/100, Ht=H+BL, Hmax=BL+H+ho;
  /* Resultados */
  return {QD:QD,pct:pct,nU:nU,Q:Q,T:T,dp:dp,rp:rp,nu:nu,mu:mu,Vs:Vs,Re:Re,at:at,a:a,Ts:Ts,Hc:Hc,H:H,Vd:Vd,As:As,VA:VA,B:B,L:L,Vo:Vo,VadFuente:VadFuente,ladoCaja:desLadoCaja_STAR(),Ef:Ef,ho:ho,AL:AL,VL:VL,rVL:rVL,Aor_t:Aor_t,d:d,Aor:Aor,N:N,n:n,m:m,Z:Z,hd0:hd0,hd:hd,hdAum:hdAum,W:W,b1:b1,Vad:Vad,b2:b2,bcal:bcal,bAsumida:bAsumida,bp:bp,Hp:Hp,HL:HL,
    hoc:hoc,t0:t0,tp:tp,it:it,hv:hv,Lde:Lde,Lds:Lds,Lz:Lz,H2:H2,xL3:xL3,xL23:xL23,S1:S1,S2:S2,He3:He3,pBL:pBL,BL:BL,Ht:Ht,Hmax:Hmax};}

/* ==========================================================
   3. REVISIÓN DE ERRORES Y AVISOS
   ========================================================== */

/* Botón REVISIÓN DE ERRORES: criterios de diseño */
function revisionDesarenador_STAR(){
  var e=[],r=null;
  try{
    r=calcularDesarenador_STAR();
  }catch(err){
    e.push("No fue posible completar el cálculo del desarenador. Revisa los datos ingresados.");  }
  if(r&&!r.err){
    if(r.Re>=1)
      e.push("Re ≥ 1: la ley de Stokes no es válida. Revisa el diámetro de partícula y las propiedades del agua.");
    if(r.a/60<20)
      e.push("El tiempo de retención debe ser igual o mayor a 20 min.");
    if(r.VA>=r.Vs)
      e.push("No cumple la condición VA < Vs. Revisa las dimensiones del desarenador.");
    if(r.Vo>=0.25)
      e.push("La velocidad horizontal Vo debe ser menor de 0,25 m/s.");
    if(r.Vo/r.Vs>=20)
      e.push("La relación Vo/Vs debe ser menor de 20.");
    if(r.Ef<75)
      e.push("La eficiencia es menor al 75 %.");
    var TLd=DP_STAR.T.LODOS;
    if(r.rVL<TLd.vlMin||r.rVL>TLd.vlMax)
      e.push("La relación entre el volumen de lodos y el volumen del desarenador debe estar entre "+TLd.vlMin+" y "+TLd.vlMax+" %.");
    if(r.Z<0)
      e.push("La separación entre columnas (Z) es negativa. Aumenta B o reduce el diámetro del orificio.");
    if(r.W<0||r.W>r.H)
      e.push("La separación entre filas (W) no cumple el criterio de diseño.");
    if(r.Hp<r.HL)
      e.push("La iteración del tiempo no alcanzó Hp ≥ HL: la plataforma se desborda.");
    if(r.Lz<=0)
      e.push("Los deflectores se cruzan: L/4 + 15·hv ("+nf(r.Lde+r.Lds,2)+" m) es mayor o igual que L ("+nf(r.L,2)+" m).");
    if(r.pBL<10||r.pBL>20)
      e.push("El borde libre debe estar entre el 10 y el 20 % de la altura H.");  }
  abrirRevision("Desarenador",e);}

/* Avisos de datos de entrada fuera de rango */
function avisosParametrosDesarenador_STAR(){
  var e=[];
  var Vor=Number(PRO.desVor),a=Number(PRO.desA);
  if(PRO.desDp!==""&&Number(PRO.desDp)>0.1)
    e.push("El diámetro de la partícula debe ser menor o igual a 0,1 mm (diámetro mínimo a remover según la Res. 330 de 2017).");
  if(PRO.desVor!==""&&Vor>0.1)
    e.push("La velocidad en los orificios Vor debe ser menor o igual a 0,1 m/s.");
  if(PRO.desA!==""&&a<20)
    e.push("El tiempo de retención a debe ser mayor o igual a 20 min.");
  if(PRO.desBase!==""&&PRO.desBase!==undefined&&(Number(PRO.desBase)<0.30||Number(PRO.desBase)>0.50))
    e.push("La base asumida de la plataforma debe estar entre 0,30 y 0,50 m.");
  if(PRO.desLado!==""&&PRO.desLado!==undefined&&Number(PRO.desLado)<DP_STAR.T.LODOS.ladoMin)
    e.push("La dimensión de la cámara de lodos debe ser mayor o igual a "+nf(DP_STAR.T.LODOS.ladoMin,2)+" m (Datos preliminares), para que quepan la válvula y el tubo de extracción.");
  if(PRO.desBL!==""&&(Number(PRO.desBL)<10||Number(PRO.desBL)>20))
    e.push("El borde libre debe estar entre el 10 y el 20 % de la altura H.");
  if(!(Number(PRO.desPct)>0&&Number(PRO.desPct)<=100))
    e.push("El % del caudal tratado por el desarenador debe estar entre 1 y 100.");
  if(!(Number(PRO.desN)>=1)||Number(PRO.desN)!==Math.floor(Number(PRO.desN)))
    e.push("El número de desarenadores debe ser un entero mayor o igual a 1.");
  return e;}

/* Botón RECALCULAR */
function recalcularDesarenador_STAR(){
  var e=avisosParametrosDesarenador_STAR();
  if(e.length){abrirAdvertencia("Advertencia — Desarenador",e);return;}
  var r=calcularDesarenador_STAR();
  if(r.err){abrirAdvertencia("Advertencia — Desarenador",r.err);return;}
  pintarDesarenador_STAR();}

/* ==========================================================
   4. MEMORIA DE CÁLCULO
   ========================================================== */
function desFilas_STAR(r){
  var x=seccion("1. VELOCIDAD DE SEDIMENTACIÓN (STOKES)");
  x+=filaDato("Caudal de diseño (QD)",r.QD,"m³/s",4,"Leído de la ventana Caudal de diseño.");
  x+=filaDato("Porcentaje del caudal tratado (%)",r.pct,"%",0,"Insertado en Términos de referencia.");
  x+=filaDato("Número de desarenadores (n)",r.nU,"",0,"Insertado en Términos de referencia.");
  x+=filaDato("Temperatura del agua (T)",r.T,"°C",1,"Insertado en Términos de referencia.");
  x+=filaDato("Diámetro de la partícula (dp)",Number(PRO.desDp),"mm",3,"Insertado en Términos de referencia.");
  x+=filaDato("Peso específico de la partícula (ρp)",r.rp,"kg/m³",0,"Insertado en Términos de referencia.");
  x+=fila("Caudal por desarenador",r.Q,"m³/s",4,"Q<sub>D</sub> = QD · (%/100) / n",nf(r.QD,4)+" × "+nf(r.pct,0)+" % / "+r.nU,"Porcentaje del caudal de diseño que trata el módulo, repartido entre los desarenadores.");
  x+=fila("Viscosidad cinemática del agua (ν)",r.nu,"m²/s",9,"ν = 4,34565×10<sup>-5</sup> / (T + 23,3)","4,34565e-5 / ("+nf(r.T,1)+" + 23,3)","");
  x+=fila("Viscosidad dinámica (μ)",r.mu,"kg/(m·s)",6,"μ = ν · ρ<sub>f</sub>",nf(r.nu,9)+" × 1000","ρ del agua = 1000 kg/m³.");
  x+=fila("Velocidad de sedimentación (Vs)",r.Vs,"m/s",5,"V<sub>s</sub> = g/18 · (ρ<sub>p</sub> − ρ<sub>f</sub>)/μ · d<sub>p</sub>²","9,81/18 × ("+nf(r.rp,0)+" − 1000)/"+nf(r.mu,6)+" × "+nf(r.dp,5)+"²","Ley de Stokes (Res. 330 de 2017: partícula de 0,1 mm y 2,65 g/cm³).");
  x+=fila("Número de Reynolds (Re)",r.Re,"",4,"Re = V<sub>s</sub> · d<sub>p</sub> / ν","Re = "+nf(r.Re,4),"Stokes es válido si Re < 1.",r.Re<1?"":"Re ≥ 1: la ley de Stokes no es válida.");
  x+=seccion("2. TIEMPO, ALTURA Y VOLUMEN");
  x+=filaDato("Condiciones de los deflectores",PRO.desCond,"",0,"Insertado en Términos de referencia.");
  x+=filaDato("Porcentaje de remoción",PRO.desRem,"%",0,"Insertado en Términos de referencia.");
  x+=fila("Relación a/t",r.at,"",3,"Tabla a/t — "+PRO.desCond+", remoción "+PRO.desRem+" %","a/t = "+nf(r.at,3),"Corcho y Duque, 1ª ed., p. 198.");
  x+=fila("Tiempo de retención (a)",r.a/60,"min",1,"<i>Dato de entrada</i> (RAS: ≥ 20 min)","a = "+nf(r.a/60,1),"Digitado por el usuario.",r.a/60<20?"El RAS exige a ≥ 20 min.":"");
  x+=fila("Tiempo de sedimentación (Ts)",r.Ts,"s",1,"T<sub>s</sub> = a / (a/t)",nf(r.a,0)+" / "+nf(r.at,3),"Se despeja Ts de a/t.");
  x+=fila("Altura del desarenador (H)",r.H,"m",3,"H = T<sub>s</sub> · V<sub>s</sub>",nf(r.Ts,1)+" × "+nf(r.Vs,5),"Se calcula (no se ingresa). El RAS no fija un rango para H; el de 0,75–1,5 m es para la zona de lodos (ho).");
  x+=filaDato("Borde libre (% de H)",r.pBL,"%",0,"Entre 10 y 20 % de H.");
  x+=fila("Borde libre (BL)",r.BL,"m",3,"BL = H · (%BL/100)",nf(r.H,3)+" × "+nf(r.pBL,0)+" / 100","Se deja sobre la altura efectiva H.",(r.pBL<10||r.pBL>20)?"Fuera de 10–20 %.":"");
  x+=fila("Altura total de muros (Ht)",r.Ht,"m",3,"H<sub>t</sub> = H + BL",nf(r.H,3)+" + "+nf(r.BL,3),"Altura de las paredes laterales sobre el fondo de la zona efectiva.");
  x+=fila("Volumen del desarenador (∀d)",r.Vd,"m³",2,"∀<sub>d</sub> = a · Q<sub>D</sub>",nf(r.a,0)+" × "+nf(r.Q,4),"");
  x+=seccion("3. DIMENSIONES Y VELOCIDADES");
  x+=fila("Superficie (As)",r.As,"m²",2,"A<sub>s</sub> = ∀<sub>d</sub> / H",nf(r.Vd,2)+" / "+nf(r.H,3),"");
  x+=fila("Ancho (B)",r.B,"m",3,"B = (A<sub>s</sub> / 4)<sup>1/2</sup>","("+nf(r.As,2)+" / 4)<sup>1/2</sup>","Relación largo/ancho mínima de 4.");
  x+=fila("Largo (L)",r.L,"m",3,"L = 4B","4 × "+nf(r.B,3),"Valores sin paredes de la estructura.");
  x+=fila("Velocidad ascensional (VA)",r.VA,"m/s",6,"V<sub>A</sub> = Q<sub>D</sub> / A<sub>s</sub>",nf(r.Q,4)+" / "+nf(r.As,2),"Carga superficial real.",r.VA<r.Vs?"":"Debe cumplirse VA < Vs.");
  x+=fila("Velocidad horizontal (Vo)",r.Vo,"m/s",4,"V<sub>o</sub> = Q<sub>D</sub> / (B · H)",nf(r.Q,4)+" / ("+nf(r.B,3)+" × "+nf(r.H,3)+")","Debe ser menor de 0,25 m/s.",r.Vo<0.25?"":"Vo ≥ 0,25 m/s.");
  x+=fila("Relación Vo / Vs",r.Vo/r.Vs,"",2,"V<sub>o</sub> / V<sub>s</sub> &lt; 20",nf(r.Vo,4)+" / "+nf(r.Vs,5),"Res. 330 de 2017.",r.Vo/r.Vs<20?"":"Vo/Vs ≥ 20.");
  x+=fila("Retención de partículas",r.Vs>r.VA?"CUMPLE (Vs > VA)":"NO CUMPLE","",0,"V<sub>s</sub> &gt; V<sub>A</sub>",nf(r.Vs,5)+(r.Vs>r.VA?" > ":" ≤ ")+nf(r.VA,6),"Si Vs > VA se retiene el 100 % o más.");
  x+=fila("Eficiencia (E)",r.Ef,"%",1,"E = (V<sub>s</sub> / V<sub>A</sub>) · 100",nf(r.Vs,5)+" / "+nf(r.VA,6)+" × 100","Debe ser mayor a 75 %.",r.Ef>=75?"":"E menor a 75 %.","final");
  x+=seccion("4. ZONA DE LODOS");
  x+=fila("Profundidad para lodos calculada",r.hoc,"m",3,"L / h<sub>o</sub> = 10 / 1 → h<sub>o</sub> = L / 10",nf(r.L,3)+" / 10","Relación 10 a 1 del RAS.");
  x+=fila("Profundidad para lodos adoptada (ho)",r.ho,"m",3,"h<sub>o</sub> entre 0,75 y 1,5 m",r.hoc<0.75?"L/10 = "+nf(r.hoc,3)+" < 0,75 → h<sub>o</sub> = 0,75":r.hoc>1.5?"L/10 = "+nf(r.hoc,3)+" > 1,5 → h<sub>o</sub> = 1,50":"L/10 = "+nf(r.hoc,3)+" está en el rango → h<sub>o</sub> = "+nf(r.ho,3),"RAS: si da menor de 0,75 m se toma 0,75 m; si da mayor de 1,5 m se toma 1,5 m.","","final");
  x+=filaDato("Área de salida de lodos (AL)",r.AL,"m²",3);
  x+=fila("Volumen de lodos (∀L)",r.VL,"m³",2,"∀<sub>L</sub> = (h<sub>o</sub>/3) · (A<sub>s</sub> + A<sub>L</sub> + (A<sub>s</sub>·A<sub>L</sub>)<sup>1/2</sup>)","("+nf(r.ho,3)+"/3) × ("+nf(r.As,2)+" + "+nf(r.AL,3)+" + √("+nf(r.As,2)+"×"+nf(r.AL,3)+"))","Tronco de pirámide.");
  x+=fila("∀L / ∀d",r.rVL,"%",1,"(∀<sub>L</sub> / ∀<sub>d</sub>) · 100",nf(r.VL,2)+" / "+nf(r.Vd,2)+" × 100","Debe estar entre "+DP_STAR.T.LODOS.vlMin+" y "+DP_STAR.T.LODOS.vlMax+" % (Datos preliminares).",(r.rVL>=DP_STAR.T.LODOS.vlMin&&r.rVL<=DP_STAR.T.LODOS.vlMax)?"":"Fuera de "+DP_STAR.T.LODOS.vlMin+"–"+DP_STAR.T.LODOS.vlMax+" %.");
  x+=fila("Profundidad de la tolva (H2)",r.H2,"m",3,"H<sub>2</sub> = h<sub>o</sub>","H2 = "+nf(r.ho,3),"Punto más bajo de la tolva.");
  x+=fila("Ubicación del punto más bajo",r.xL3,"m",3,"x = L / 3",nf(r.L,3)+" / 3","Medido desde el muro de entrada; ahí va la descarga de lodos.");
  x+=fila("Tramo hacia la salida",r.xL23,"m",3,"x = 2L / 3","2 × "+nf(r.L,3)+" / 3","Desde el punto más bajo hasta el vertedero de salida.");
  x+=fila("Pendiente del fondo hacia la entrada",r.S1,"%",1,"S<sub>1</sub> = h<sub>o</sub> / (L/3) · 100",nf(r.ho,3)+" / "+nf(r.xL3,3)+" × 100","Pendiente del tramo corto de la tolva.");
  x+=fila("Pendiente del fondo hacia la salida",r.S2,"%",1,"S<sub>2</sub> = h<sub>o</sub> / (2L/3) · 100",nf(r.ho,3)+" / "+nf(r.xL23,3)+" × 100","Pendiente del tramo largo de la tolva.");
  x+=fila("Profundidad total máxima",r.Hmax,"m",3,"H<sub>máx</sub> = BL + H + h<sub>o</sub>",nf(r.BL,3)+" + "+nf(r.H,3)+" + "+nf(r.ho,3),"Desde la corona del muro hasta el punto más bajo de la tolva.","","final");
  x+=seccion("5. DEFLECTORES");
  x+=filaDato("Velocidad en los orificios (Vor)",Number(PRO.desVor),"m/s",3,"Insertado en Términos de referencia.");
  x+=filaDato("Diámetro del orificio (Ør)",Number(PRO.desDor),"in",2,"Insertado en Términos de referencia.");
  x+=filaDato("Altura del deflector (H/n)","H/"+PRO.desDef,"",0,"Insertado en Términos de referencia.");
  x+=fila("Área total de orificios",r.Aor_t,"m²",4,"A<sub>orificios</sub> = Q<sub>D</sub> / V<sub>or</sub>",nf(r.Q,4)+" / "+nf(PRO.desVor,3),"Vor debe ser menor a 0,1 m/s.",Number(PRO.desVor)<=0.1?"":"Vor mayor a 0,1 m/s.");
  x+=fila("Área de un orificio (Aor)",r.Aor,"m²",5,"A<sub>or</sub> = π · Ø<sub>or</sub>² / 4","π × "+nf(r.d,4)+"² / 4","Ø en pulgadas × 0,0254.");
  x+=fila("Número de orificios",r.N,"",1,"N = A<sub>orificios</sub> / A<sub>or</sub>",nf(r.Aor_t,4)+" / "+nf(r.Aor,5),"");
  x+=fila("Columnas (n)",r.n,"",0,"n = (N · B / H)<sup>1/2</sup>, redondeado hacia arriba","√("+nf(r.N,1)+" × "+nf(r.B,3)+" / "+nf(r.H,3)+")","De m/n = H/B.");
  x+=fila("Filas (m)",r.m,"",0,"m = N / n, redondeado hacia arriba",nf(r.N,1)+" / "+r.n,"");
  x+=fila("Separación entre columnas (Z)",r.Z,"m",3,"Z = (B − n·Ø<sub>or</sub>) / (n + 1)","("+nf(r.B,3)+" − "+r.n+" × "+nf(r.d,4)+") / "+(r.n+1),"El ancho del desarenador es la longitud del deflector.",r.Z>=0?"":"Z negativo: aumenta B o reduce el diámetro.");
  if(r.hdAum)x+=fila("Altura inicial del deflector (H/"+PRO.desDef+")",r.hd0,"m",3,"h<sub>def</sub> = H / "+PRO.desDef,nf(r.H,3)+" / "+PRO.desDef+" → W = ("+nf(r.hd0,3)+" − "+r.m+" × "+nf(r.d,4)+") / "+(r.m+1)+" = "+nf((r.hd0-r.m*r.d)/(r.m+1),3)+" m","Con esta altura W da negativo: las "+r.m+" filas de orificios no caben.");
  x+=fila("Altura del deflector (h<sub>def</sub>)",r.hd,"m",3,r.hdAum?"h<sub>def</sub> aumentada hasta W ≥ 0,01 m (máx. H)":"h<sub>def</sub> = H / "+PRO.desDef,r.hdAum?"m · Ø<sub>or</sub> + (m + 1) · 0,01 = "+nf(r.m*r.d+(r.m+1)*0.01,3)+" → redondeado a "+nf(r.hd,3)+" m":nf(r.H,3)+" / "+PRO.desDef,r.hdAum?"Si W es negativo se aumenta la altura del deflector; el máximo es H = "+nf(r.H,3)+" m.":"H/2 o H/3 según elijas.",r.hdAum&&r.hd>=r.H-1e-9&&r.W<0?"Aun con h<sub>def</sub> = H no caben las filas: aumenta el diámetro del orificio o la velocidad Vor (≤ 0,1 m/s).":"");
  x+=fila("Separación entre filas (W)",r.W,"m",3,"W = (h<sub>def</sub> − m·Ø<sub>or</sub>) / (m + 1)","("+nf(r.hd,3)+" − "+r.m+" × "+nf(r.d,4)+") / "+(r.m+1),"Si es negativo hay que aumentar la altura del deflector; máximo H.",(r.W<0||r.W>r.H)?"Separación entre filas (W) no cumple el criterio de diseño. Sugerencia: modifica la altura del deflector o el número de filas para mantener W entre 0 y H.":"");
  x+=fila("Lámina sobre el vertedero de salida (hv)",r.hv,"m",3,"h<sub>v</sub> = H<sub>L</sub> = (Q<sub>D</sub> / (1,84 · B))<sup>1/1,5</sup>","("+nf(r.Q,4)+" / (1,84 × "+nf(r.B,3)+"))<sup>1/1,5</sup>","Se necesita aquí para ubicar el deflector de salida (ver sección 7).");
  x+=fila("Ubicación del deflector de entrada",r.Lde,"m",3,"L<sub>e</sub> = L / 4",nf(r.L,3)+" / 4","Medido desde el muro de entrada.");
  x+=fila("Ubicación del deflector de salida",r.Lds,"m",3,"L<sub>s</sub> = 15 · h<sub>v</sub>","15 × "+nf(r.hv,3),"Medido aguas arriba del vertedero de salida.");
  x+=fila("Separación entre deflectores",r.Lz,"m",3,"L<sub>z</sub> = L − L/4 − 15·h<sub>v</sub>",nf(r.L,3)+" − "+nf(r.Lde,3)+" − "+nf(r.Lds,3),"Zona de sedimentación entre deflectores; debe ser positiva.",r.Lz>0?"":"Los deflectores se cruzan.","final");
  x+=seccion("6. PLATAFORMA DE ENTRADA AL DESARENADOR");
  x+=fila("Base de la plataforma con Vo hallado (b1)",r.b1,"m",3,"b<sub>1</sub> = Q<sub>D</sub> / (B · V<sub>o</sub>)",nf(r.Q,4)+" / ("+nf(r.B,3)+" × "+nf(r.Vad,4)+")","B = ancho del desarenador = "+nf(r.B,3)+" m. V<sub>o</sub> = velocidad con la que llega el agua por el "+r.VadFuente+" = "+nf(r.Vad,4)+" m/s.");
  x+=fila("Base de la plataforma con Vo = 0,5 m/s (b2)",r.b2,"m",3,"b<sub>2</sub> = Q<sub>D</sub> / (B · 0,5)",nf(r.Q,4)+" / ("+nf(r.B,3)+" × 0,5)","B = ancho del desarenador. 0,5 m/s = velocidad mínima del RAS.");
  x+=fila("Base calculada (bc)",r.bcal,"m",3,"b<sub>c</sub> = máx(b<sub>1</sub>; b<sub>2</sub>)","máx("+(r.b1===null?"—":nf(r.b1,3))+"; "+nf(r.b2,3)+")","Se toma la mayor de las dos bases.");
  x+=fila("Base de la plataforma adoptada (b)",r.bp,"m",3,r.bAsumida?"b<sub>c</sub> &lt; 0,30 m → se asume b entre 0,30 y 0,50 m":"b<sub>c</sub> ≥ 0,30 m → b = b<sub>c</sub>",r.bAsumida?nf(r.bcal,3)+" &lt; 0,30 → b asumida = "+nf(r.bp,3):"b = "+nf(r.bcal,3),"Por limpieza y maniobra la base va entre 0,30 y 0,50 m: si la calculada es menor se asume un valor en ese rango (campo «Base asumida»); si es mayor se deja el valor mayor.","","final");
  x+=fila("Largo de la plataforma",r.B,"m",3,"Largo = B",nf(r.B,3),"La plataforma ocupa todo el ancho del desarenador.");
  x+=fila("Lámina de agua (HL)",r.HL,"m",3,"H<sub>L</sub> = (Q<sub>D</sub> / (1,84 · B))<sup>1/1,5</sup>","("+nf(r.Q,4)+" / (1,84 × "+nf(r.B,3)+"))<sup>1/1,5</sup>","Vertedero rectangular de Francis: Q = 1,84 · L · H<sup>1,5</sup>, con L = B, H = HL y Q = QD.");
  var lst=r.it, mostrar=lst.length<=12?lst:lst.slice(0,5).concat([null]).concat(lst.slice(-5));
  var tabla=mostrar.map(function(o){return o?"t = "+nf(o.t,1)+" s → Hp = "+nf(o.Hp,3)+" m "+(o.Hp>=r.HL?"≥":"<")+" HL = "+nf(r.HL,3)+" m"+(o.Hp>=r.HL?" ✔":""):"…";}).join("<br>");
  x+=fila("Iteración del tiempo (t)",r.tp,"s",1,"Caudal = ∀ / t, con ∀ = base · B · Hp → H<sub>p</sub> = (Q<sub>D</sub> · t) / (B · base); t inicia en 0,5 s y sube 0,5 s hasta H<sub>p</sub> ≥ H<sub>L</sub>",tabla,lst.length+" iteraciones (no se digita).",r.Hp>=r.HL?"":"No converge.");
  x+=fila("Altura de la plataforma de entrada (Hp)",r.Hp,"m",3,"H<sub>p</sub> = (Q<sub>D</sub> · t) / (B · base)",nf(r.Q,4)+" × "+nf(r.tp,1)+" / ("+nf(r.B,3)+" × "+nf(r.bp,3)+")","Con el t de la iteración; la plataforma contiene la lámina HL y no se desborda.","","final");
  x+=seccion("7. PLATAFORMA DE SALIDA DEL DESARENADOR");
  x+=fila("Base de la plataforma de salida",r.bp,"m",3,"base salida = base entrada","base = "+nf(r.bp,3),"");
  x+=fila("Longitud del vertedero de salida",r.B,"m",3,"L = B",nf(r.B,3),"Longitud del vertedero = ancho del desarenador.");
  x+=fila("Altura de la plataforma de salida",r.Hp,"m",3,"altura salida = altura entrada (Hp)","Hp = "+nf(r.Hp,3),"");
  x+=fila("Lámina sobre el vertedero de salida (hv)",r.hv,"m",3,"h<sub>v</sub> = (Q<sub>D</sub> / (1,84 · B))<sup>1/1,5</sup>","("+nf(r.Q,4)+" / (1,84 × "+nf(r.B,3)+"))<sup>1/1,5</sup>","Mismo vertedero de Francis (L = B), por eso hv = HL.","","final");
  return x;}

/* ==========================================================
   5. VENTANA (formulario, esquemas y memoria)
   ========================================================== */
function pintarDesarenador_STAR(){
  /* Título y aviso si falta el caudal */
  var h='<div class="titulo"><h1>DISEÑO DE DESARENADORES</h1><p>Remoción de partículas de arena de 0,1 mm (Res. 330 de 2017) y diseño de deflectores y plataformas.</p></div>'+CONV;
  if(!PRO.Q){
    h+='<div class="aviso"><b>Falta el caudal de diseño.</b> Calcula primero la ventana de <i>Caudal de diseño</i>.<br><button onclick="irVista(\'caudal_STAR\')">Ir a caudal de diseño</button></div>';
    gid("pane-desarenador_STAR").innerHTML=h; return;}
  /* Botones */
  var r=calcularDesarenador_STAR(), bt='<div class="acciones"><button class="btn btn-primary" style="width:auto;padding:0 22px" onclick="recalcularDesarenador_STAR()">RECALCULAR</button><button class="btn-revision" onclick="revisionDesarenador_STAR()">REVISIÓN DE ERRORES</button><button class="btn-sec" onclick="abrirTodo(\'pane-desarenador_STAR\',true)">VER TODA LA MEMORIA DE CÁLCULO</button><button class="btn-sec" onclick="abrirTodo(\'pane-desarenador_STAR\',false)">CONTRAER TODO</button></div>';
  /* Distribución del caudal y parámetros */
  h+=tarjetaDistribucionDes_STAR(r);
  h+='<div class="card"><div class="card-title">Parámetros del desarenador</div><div class="card-sub">Los parámetros de esta tarjeta corresponden únicamente al dimensionamiento hidráulico y de sedimentación.</div>'+
   '<div class="row">'+campo("Temperatura del agua (°C)","desT","number",'step="0.5"').replace('class="campo"','class="campo" style="flex:25 1 0"')+campo("Diámetro de la partícula (mm)","desDp","number",'step="0.01"').replace('class="campo"','class="campo" style="flex:29 1 0"')+campo("Peso específico de la partícula (kg/m³)","desRho","number",'step="10"').replace('class="campo"','class="campo" style="flex:40 1 0"')+selec("Condiciones de los deflectores","desCond",Object.keys(DP_STAR.T.AT)).replace('class="campo"','class="campo" style="flex:42 1 0"')+'</div>'+
   '<div class="row">'+selec("% de remoción","desRem",DP_STAR.T.REM).replace('class="campo"','class="campo" style="flex:16 1 0"')+campo("Tiempo de retención a (min)","desA","number",'step="1"').replace('class="campo"','class="campo" style="flex:28 1 0"')+campo("Área de salida de lodos AL (m²)","desAL","number",'step="0.05"').replace('class="campo"','class="campo" style="flex:30 1 0"')+'</div>'+
   '<div class="row">'+campo("Velocidad en orificios Vor (m/s)","desVor","number",'step="0.01"').replace('class="campo"','class="campo" style="flex:32 1 0"')+campo("Diámetro del orificio (in)","desDor","number",'step="0.25"').replace('class="campo"','class="campo" style="flex:27 1 0"')+selec("Altura del deflector (H/…)","desDef",["2","3"]).replace('class="campo"','class="campo" style="flex:26 1 0"')+campo("Borde libre (% de H)","desBL","number",'step="1"').replace('class="campo"','class="campo" style="flex:22 1 0"')+'</div>'+
   '<div class="row">'+selec("Llegada al desarenador (planos)","desLleg",["Canal de aducción","Tubería de aducción"]).replace('class="campo"','class="campo" style="flex:32 1 0"')+campo("Base pantalla de entrada si b < 0,30 m","desBase","number",'step="0.05" min="0.30" max="0.50"').replace('class="campo"','class="campo" style="flex:40 1 0"')+'</div>'+desCamaraLodosHTML_STAR()+bt+'</div>';
  /* Guardar resultados, esquemas SVG y memoria */
  if(!r.err){PRO.DES={Q:r.Q,B:r.B,L:r.L,H:r.H,Ht:r.Ht,ho:r.ho,hv:r.hv,Hp:r.Hp,bp:r.bp};}else{PRO.DES=null;}
if(!r.err)h+='<div class="card"><div class="card-title">Esquemas del desarenador</div><div class="svg-wrap">'+svgPlantaDes_STAR(r)+'</div><div class="svg-wrap">'+svgPerfilDes_STAR(r)+'</div><div class="svg-wrap">'+svgTransDes_STAR(r)+'</div><div class="svg-wrap">'+svgPlatEntradaDes_STAR(r)+'</div><div class="svg-wrap">'+svgPlatSalidaDes_STAR(r)+'</div>'+barraExportar_STAR('desarenador')+'</div>';
if(!r.err)h+=aduMemoCard_STAR("Memoria de cálculo — desarenador",desFilas_STAR(r));
  guardarPro(); actualizarEstados();
  gid("pane-desarenador_STAR").innerHTML=h;}

/* ==========================================================
   6. REGISTRO DEL MÓDULO
   ========================================================== */
MODULOS.push({
  id:"desarenador_STAR",
  titulo:"Desarenador",
  descripcion:"Remoción de arena fina (0,1 mm) por sedimentación, con deflectores y plataformas.",
  grupo:"hidraulico", orden:7, icono:"m2", iconoSvg:"<path d=\"M4 5h16l-6 8v6l-4-2v-4z\"/>",
  valores:{"DES": null, "desPct": 100, "desN": 2, "desT": 20, "desDp": 0.1, "desRho": 2650, "desCond": "", "desRem": "", "desA": 20, "desAL": 0.25, "desVor": 0.1, "desLleg": "Canal de aducción", "desBase": 0.30, "desDor": 2, "desDef": "2", "desBL": 15, "desLado": 1.00, "desDpurga": "6", "desDext": "6"},
  indicador:true, imprimible:true,
  normalizar:function(PRO){
    if(typeof PRO.desDext==="number")PRO.desDext=String(PRO.desDext);
    normFix("desCond",Object.keys(DP_STAR.T.AT)); normFix("desRem",DP_STAR.T.REM); normFix("desDef",["2","3"]); normFix("desLleg",["Canal de aducción","Tubería de aducción"],"Canal de aducción"); if(PRO.desBase===""||PRO.desBase===undefined) PRO.desBase=0.30;
  },
  completo:function(PRO){return !!PRO.DES;},
  pintar:pintarDesarenador_STAR,
  recalcular:recalcularDesarenador_STAR,
  errores:function(){var e=avisosParametrosDesarenador_STAR();if(!e.length){try{var r=calcularDesarenador_STAR();if(r&&r.err)e=[].concat(r.err);}catch(_){}}return e;}
});
