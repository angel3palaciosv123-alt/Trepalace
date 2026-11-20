/* ==========================================================
   RS · DATOS PRELIMINARES — tablas  (tablas.js)
   Tablas y constantes del relleno sanitario: se consultan como DP_RS.T.<nombre>
   Fuente principal: RAS — Título F (Sistemas de aseo urbano) y Título A (A.3.1).
   Las tablas marcadas como "valores de referencia" no son del RAS: son valores
   típicos y rangos usuales de literatura que solo sirven para validar.
   ========================================================== */

/* ==========================================================
   1. OBJETO DP_RS
   ========================================================== */
var DP_RS={T:{},
  tabla:function(nombre){return DP_RS.T[nombre];},
  /* Nivel de complejidad según población (Tabla A.3.1) */
  nivelComplejidad:function(p){p=Number(p);return p<=2500?"Bajo":p<=12500?"Medio":p<=60000?"Medio Alto":"Alto";},
  /* Zα según nivel de confianza (%) */
  zAlfa:function(nc){var t=DP_RS.T.CONFIANZA;for(var i=0;i<t.length;i++)if(Number(t[i][0])===Number(nc))return t[i][1];return null;},
  /* Siguiente diámetro comercial ≥ d (m) */
  diametroComercial:function(d){var L=DP_RS.T.DIAMETROS;for(var i=0;i<L.length;i++)if(L[i]>=d-1e-9)return L[i];return L[L.length-1];}};

/* ==========================================================
   2. TABLAS DE REFERENCIA (dato + bloque que la muestra)
   ========================================================== */
/* ================= 1. NIVEL DE COMPLEJIDAD (RAS Tabla A.3.1) ================= */
DP_RS.T.COMPLEJIDAD=[["Bajo","< 2 500","Baja"],["Medio","2 501 a 12 500","Baja"],["Medio Alto","12 501 a 60 000","Media"],["Alto","> 60 000","Alta"]];
function bloqueComplejidad_RS(){
  return tablaHTML("Tabla A.3.1 — Nivel de complejidad del sistema",["Nivel de complejidad","Población en la zona urbana (hab) (1)","Capacidad económica de los usuarios (2)"],DP_RS.T.COMPLEJIDAD,
    nota("(1) Proyectado al período de diseño, incluida la población flotante. (2) Incluye la capacidad económica de la población flotante; se evalúa con la metodología del DNP."));}

/* ================= 2. PRODUCCIÓN PER CÁPITA (RAS Tabla F.1.1) ================= */
DP_RS.T.PPC={"Bajo":[0.30,0.75,0.45],"Medio":[0.30,0.95,0.45],"Medio Alto":[0.30,1.00,0.53],"Alto":[0.44,1.10,0.79]};
function bloquePPC_RS(){
  return tablaHTML("Tabla F.1.1 — Valores indicativos de la producción per cápita (kg/hab·día)",["Nivel de complejidad","Valor mínimo","Valor máximo","Valor promedio"],
    Object.keys(DP_RS.T.PPC).map(function(k){var v=DP_RS.T.PPC[k];return [k,nf(v[0],2),nf(v[1],2),nf(v[2],2)];}),
    nota("La PPC de diseño es un dato que ingresa el diseñador en Términos de referencia; la plataforma solo avisa si queda fuera de este rango."));}

/* ================= 3. MÉTODOS DE CÁLCULO DE POBLACIÓN (RAS Tabla F.1.2) ================= */
DP_RS.T.METODOS=[["Aritmético","X","X","",""],["Geométrico","X","X","X","X"],["Wappus","X","X","X","X"],["Gráfico","X(1)","X","X",""],["Exponencial","X(1)","X(1)","X(2)",""],["Detallar por zonas","","X","X","X"],["Detallar densidades","","X","X","X"]];
function bloqueMetodos_RS(){
  return tablaHTML("Tabla F.1.2 — Métodos de cálculo permitidos según el nivel de complejidad",["Método de cálculo","Bajo","Medio","Medio Alto","Alto"],DP_RS.T.METODOS,
    nota("(1) Optativo, sujeto a disponibilidad de datos. (2) Solo como método de comprobación."));}

/* ================= 4. CARACTERIZACIÓN SIN APROVECHAMIENTO (RAS Tabla F.1.3) ================= */
DP_RS.T.CARAC_SIN=[
  ["Recolección y transporte, barrido y limpieza","Peso específico","X1","X1","X","X","D5057-90 (2006)"],
  ["","Contenido de humedad","X1","X1","X","X",""],
  ["Disposición final","Peso específico","X1","X1","X","X","D5057-90 (2006)"],
  ["","Contenido de humedad","X1","X1","X","X",""],
  ["","Permeabilidad de residuos compactados","X","X","X","X",""],
  ["","Metales (cadmio, cobre, mercurio, plomo y níquel)","","","X","X",""],
  ["","Capacidad de campo","","","X","X",""]];
function bloqueCaracSin_RS(){
  return tablaHTML("Tabla F.1.3 — Caracterización física, química y biológica para sistemas de aseo sin aprovechamiento",["Sistema de tratamiento","Tipo de caracterización","Bajo","Medio","Medio Alto","Alto","Norma ASTM"],DP_RS.T.CARAC_SIN,
    nota("X1: se puede usar información secundaria o de municipios similares. X: caracterización obligatoria."));}

/* ================= 5. CARACTERIZACIÓN CON APROVECHAMIENTO (RAS Tabla F.1.4) ================= */
DP_RS.T.CARAC_CON=[
  ["Recolección y transporte, barrido y limpieza","Peso específico","X1","X1","X","X","D5057-90 (2007)"],
  ["","Contenido de humedad","X1","X1","X","X",""],
  ["Compostaje aeróbico, digestión anaeróbica","Peso específico","X1","X1","X","X","D5057-90 (2007)"],
  ["","Contenido de humedad","X1","X1","X","X",""],
  ["","Tamaño de partículas","","","X","X","E726-01 (2006)"],
  ["","Distribución del tamaño","","","X","X",""],
  ["","Nutrientes esenciales","X1","X1","X","X",""],
  ["","Biodegradabilidad","X1","X1","X1","X1",""],
  ["","Coliformes","X","X","X","X",""],
  ["","Metales (cadmio, cobre, mercurio, plomo y níquel)","","","X","X",""],
  ["Tratamiento térmico – recuperación de energía","Peso específico","X1","X1","X","X","D5057-90 (2007)"],
  ["","Contenido de humedad","X1","X1","X","X",""],
  ["","Tamaño de partículas","","","X","X","E726-01 (2006)"],
  ["","Materia volátil combustible","","","X","X",""],
  ["","Ceniza","","","X","X",""],
  ["","Punto de fusión de las cenizas","X1","X1","X","X","D5468-02 (2007)"],
  ["","Análisis elemental (C, H, O, N, S, cenizas)","X1","X1","X","X","E1279-89 / E778-08"],
  ["","Contenido de energía","X1","X1","X","X",""],
  ["","Carbono fijo","X1","X1","X","X",""],
  ["Reciclaje y reutilización","Tipo de residuo a reciclar","X1","X1","X","X",""],
  ["","Peso específico por tipo","","X1","X","X","D5057"],
  ["","Tamaño de partícula y distribución","","","X","X","E726-01 (2006)"],
  ["","Posibilidades de reúso y reciclaje","X","X","X","X",""],
  ["Tratamiento y disposición final","Peso específico","X1","X1","X","X","D5057-90 (2007)"],
  ["","Contenido de humedad","X1","X1","X","X",""],
  ["","Permeabilidad de residuos compactados","X","X","X","X",""],
  ["","Análisis elemental (C, H, O, N, S, cenizas)","X1","X1","X","X","E1279-89 / E778-08"],
  ["","Metales (cadmio, cobre, mercurio, plomo y níquel)","","","X","X",""],
  ["","Capacidad de campo","","","X","X",""]];
function bloqueCaracCon_RS(){
  return tablaHTML("Tabla F.1.4 — Caracterización física, química y biológica para sistemas de aseo con aprovechamiento",["Sistema de tratamiento","Tipo de caracterización","Bajo","Medio","Medio Alto","Alto","Norma ASTM"],DP_RS.T.CARAC_CON,
    nota("X1: se puede usar información secundaria o de municipios similares. X: caracterización obligatoria."));}

/* ================= 6. PESO UNITARIO Y HUMEDAD (RAS Tabla F.1.5) =================
   [nombre, rango peso unitario (kg/m³), típico, rango humedad (%), típico, fuente]
   Las filas con fuente "D" son datos aportados por el diseñador (no vienen en la tabla del RAS). */
DP_RS.T.F15=[
  ["Residuos de comida mezclados","131 – 481",291,"50 – 80",70,"RAS"],
  ["Papel","42 – 131",89,"4 – 10",6,"RAS"],
  ["Cartón","42 – 80",50,"4 – 8",5,"RAS"],
  ["Plásticos","42 – 131",65,"1 – 4",2,"RAS"],
  ["Textiles","42 – 101",65,"6 – 15",10,"RAS"],
  ["Goma","101 – 202",131,"1 – 4",2,"RAS"],
  ["Cuero","101 – 261",160,"8 – 12",10,"RAS"],
  ["Residuos de jardín","59 – 225",101,"30 – 80",60,"RAS"],
  ["Madera","131 – 320",237,"15 – 40",20,"RAS"],
  ["Vidrio","160 – 481",196,"1 – 4",2,"RAS"],
  ["Latas de hojalata","50 – 160",89,"2 – 4",3,"RAS"],
  ["Aluminio","65 – 240",160,"2 – 4",2,"RAS"],
  ["Otros metales","131 – 1 151",320,"2 – 4",3,"RAS"],
  ["Suciedad, cenizas, etc.","320 – 1 000",481,"6 – 12",8,"RAS"],
  ["Cenizas","650 – 831",745,"6 – 12",6,"RAS"],
  ["Residuos de comida (húmedos)","475 – 950",540,"50 – 80",70,"RAS"],
  ["Tetrapack","42 – 80",50,"4 – 8",5,"D"],
  ["Tapabocas","42 – 101",65,"6 – 15",10,"D"],
  ["Residuos hospitalarios","42 – 131",65,"1 – 4",2,"D"],
  ["ACU (aceite de cocina usado)","—",900,"—",1,"D"],
  ["RAEE","—",350,"—",2,"D"],
  ["RCD","—",1600,"—",5,"D"],
  ["RESPEL","—",800,"—",15,"D"]];
/* Valor típico por nombre: {rho, hum} */
DP_RS.tipico=function(nombre){
  var n=String(nombre||"").toLowerCase();
  for(var i=0;i<DP_RS.T.F15.length;i++){var f=DP_RS.T.F15[i],m=f[0].toLowerCase();if(m===n||m.indexOf(n+" ")===0||n.indexOf(m+" ")===0)return {rho:f[2],hum:f[4]};}
  return null;};
function bloqueF15_RS(){
  return tablaHTML("Tabla F.1.5 — Peso unitario y contenido de humedad de los residuos sólidos",["Tipo de residuo","Peso unitario — rango (kg/m³)","Peso unitario — típico (kg/m³)","Humedad — rango (% en peso)","Humedad — típico (%)","Fuente"],
    DP_RS.T.F15.map(function(f){return [f[0],f[1],nf(f[2],0),f[3],nf(f[4],0),f[5]==="RAS"?"RAS F.1.5":"Dato del diseñador"];}),
    nota("Domésticos no compactados. Las filas marcadas como dato del diseñador (tetrapack, tapabocas, hospitalarios, ACU, RAEE, RCD y RESPEL) fueron investigadas o aportadas de manera experimental por el diseñador; en la caracterización se pueden reemplazar por valores medidos."));}

/* ================= 7. NIVELES DE CONFIANZA ================= */
DP_RS.T.CONFIANZA=[[99.7,3],[99,2.58],[98,2.33],[96,2.05],[95,1.96],[90,1.645],[80,1.28],[50,0.674]];
function bloqueConfianza_RS(){
  return tablaHTML("Niveles de confianza para el tamaño de la muestra",["Nivel de confianza (%)","Zα"],DP_RS.T.CONFIANZA.map(function(r){return [nf(r[0],1),nf(r[1],3)];}),
    nota("n = N·Zα²·p·q / [e²·(N − 1) + Zα²·p·q]"));}

/* ================= 8. CELDAS Y COBERTURAS (valores de referencia) ================= */
DP_RS.T.CELDAS={
  densidad:{ref:1.2,min:0.4,max:1.2},       /* t/m³ residuos compactados */
  hCelda:{ref:3,min:1,max:4},               /* m */
  hAmort:{ref:0.1,min:0,max:0.5},           /* m */
  hBent:{ref:0.2,min:0,max:0.6},            /* m */
  hInter:{ref:0.2,min:0.1,max:0.3},         /* m */
  hFinal:{ref:0.6,min:0.4,max:1.0},         /* m */
  rhoBent:{ref:1.9,min:1.5,max:2.2},        /* t/m³ */
  rollo:{ref:5,min:1,max:6}};               /* m */
DP_RS.T.COMPACTACION=[["Relleno manual (compactación con pisón)","0,40 – 0,60"],["Relleno semimecanizado","0,60 – 0,80"],["Relleno mecanizado (tractor o compactador)","0,80 – 1,20"]];
function bloqueCeldas_RS(){
  var C=DP_RS.T.CELDAS,f=function(k,n,u){return [n,nf(C[k].ref,2),nf(C[k].min,2)+" – "+nf(C[k].max,2),u];};
  return tablaHTML("Celdas y coberturas — valores de referencia",["Concepto","Valor típico","Rango usual","Unidad"],[
      f("densidad","Densidad de los residuos compactados","t/m³"),f("hCelda","Altura de la celda","m"),f("hAmort","Capa de amortiguamiento","m"),
      f("hBent","Capa de bentonita (impermeabilización)","m"),f("hInter","Cobertura intermedia (diaria)","m"),f("hFinal","Cobertura final","m"),
      f("rhoBent","Peso unitario de la bentonita","t/m³"),f("rollo","Ancho del rollo de geotextil","m")],
    nota("Valores de referencia para validar los datos de Términos de referencia (no corresponden a tablas del RAS)."))+
   tablaHTML("Densidad de compactación según el tipo de operación — valor de referencia",["Tipo de operación","Densidad (t/m³)"],DP_RS.T.COMPACTACION);}

/* ================= 9. LIXIVIADOS (valor de referencia) ================= */
DP_RS.T.LIX={prodEsp:{ref:0.2,min:0.05,max:0.6},fp:{ref:2.5,min:1,max:4},n:{ref:0.013,min:0.009,max:0.015},
  Smin:{ref:0.005,min:0.005,max:0.1},Vmin:{ref:0.6,min:0.3,max:1},Vmax:{ref:3,min:2,max:5},Dmin:{ref:0.16,min:0.1,max:0.3}};
DP_RS.T.DIAMETROS=[0.10,0.16,0.20,0.25,0.315,0.355,0.40,0.45,0.50,0.60,0.70,0.80,0.90,1.00,1.20];
DP_RS.T.TRAMOS_LIX=[["Dren lateral",0.25,60,0.16],["Subcolector",0.5,120,0.20],["Colector principal",1,250,0.25],["Conducción a piscina",1,400,0.25]];
function bloqueLixiviados_RS(){
  var L=DP_RS.T.LIX,f=function(k,n,u,d){return [n,nf(L[k].ref,d),nf(L[k].min,d)+" – "+nf(L[k].max,d),u];};
  return tablaHTML("Red de lixiviados — valores de referencia",["Concepto","Valor típico","Rango usual","Unidad"],[
      f("prodEsp","Producción específica de lixiviado","m³/t RS",2),f("fp","Factor de punta","—",1),f("n","Rugosidad de Manning (PVC / PEAD)","s/m^(1/3)",3),
      f("Smin","Pendiente mínima de colectores","m/m",3),f("Vmin","Velocidad mínima","m/s",1),f("Vmax","Velocidad máxima","m/s",1),f("Dmin","Diámetro mínimo","m",2)],
    nota("Q = (1/n)·A·R^(2/3)·S^(1/2), con R = D/4 a tubo lleno."))+
   tablaHTML("Diámetros comerciales usados para sugerir el siguiente diámetro",["Diámetro (m)","Diámetro (mm)"],DP_RS.T.DIAMETROS.map(function(d){return [nf(d,3),nf(d*1000,0)];}));}

/* ================= 10. PISCINAS DE LIXIVIADOS (valor de referencia) ================= */
DP_RS.T.PIS={dias:{ref:30,min:7,max:120},reserva:{ref:0.2,min:0,max:0.5},bl:{ref:0.5,min:0.3,max:1},h:{ref:3,min:1,max:5},
  z:{ref:2,min:1.5,max:3},rel:{ref:2,min:1,max:4}};
function bloquePiscinas_RS(){
  var P=DP_RS.T.PIS,f=function(k,n,u,d){return [n,nf(P[k].ref,d),nf(P[k].min,d)+" – "+nf(P[k].max,d),u];};
  return tablaHTML("Piscinas de lixiviados — valores de referencia",["Concepto","Valor típico","Rango usual","Unidad"],[
      f("dias","Días de autonomía","días",0),f("reserva","Reserva de contingencia","fracción",2),f("bl","Bordo libre","m",2),
      f("h","Profundidad útil","m",1),f("z","Talud interior (H:1V)","—",1),f("rel","Relación largo / ancho","—",1)],
    nota("Volumen prismoidal: V = h/6 · (A<sub>fondo</sub> + A<sub>espejo</sub> + 4·A<sub>media</sub>)."));}

/* ================= 11. GASES (valor de referencia) ================= */
DP_RS.T.GAS={fb:{ref:0.55,min:0.3,max:0.8},L0:{ref:100,min:50,max:200},k:{ref:0.05,min:0.02,max:0.7},ch4:{ref:0.5,min:0.4,max:0.6},
  ef:{ref:0.65,min:0.4,max:0.9},fp:{ref:1.5,min:1,max:2},sep:{ref:35,min:20,max:60},qPozo:{ref:25,min:5,max:100},sepCond:{ref:60,min:30,max:100}};
DP_RS.T.TRAMOS_GAS=[["Ramales",0.25,100,0.01,0.11,12],["Colector secundario",0.5,250,0.01,0.16,15],["Colector principal",1,500,0.01,0.20,18]];
function bloqueGases_RS(){
  var G=DP_RS.T.GAS,f=function(k,n,u,d){return [n,nf(G[k].ref,d),nf(G[k].min,d)+" – "+nf(G[k].max,d),u];};
  return tablaHTML("Red de gases — valores de referencia",["Concepto","Valor típico","Rango usual","Unidad"],[
      f("fb","Fracción biodegradable dispuesta","fracción",2),f("L0","Potencial de generación de metano L0","m³ CH₄/t",0),
      f("k","Constante de generación k","1/año",2),f("ch4","Fracción de metano en el biogás","fracción",2),f("ef","Eficiencia de captación","fracción",2),
      f("fp","Factor de punta","—",1),f("sep","Separación entre pozos","m",0),f("qPozo","Caudal nominal por pozo","m³/h",0),f("sepCond","Separación máxima entre condensados","m",0)],
    nota("Modelo de primer orden (tipo LandGEM): Q<sub>CH₄</sub>(t) = Σ k·L0·f<sub>b</sub>·M<sub>i</sub>·e<sup>−k(t − t<sub>i</sub>)</sup>."));}
