/* ==========================================================
   NÚCLEO — plano_pdf.js
   Convierte las láminas de un plano (nuevoPlano de plano_dxf.js) en un PDF vectorial
   A3 horizontal, una página por lámina. Sin librerías: funciona con file:// y sin internet.
   Uso:  var bytes=planoPDF(P);  descargarBytes(bytes,"Planos.pdf","application/pdf");
   ========================================================== */

/* Anchos de Helvetica (1/1000 em) para centrar y alinear textos */
var PDF_ANCHOS=(function(){
  var w={32:278,33:278,34:355,35:556,36:556,37:889,38:667,39:191,40:333,41:333,42:389,43:584,44:278,45:333,46:278,47:278,
    58:278,59:278,60:584,61:584,62:584,63:556,64:1015,65:667,66:667,67:722,68:722,69:667,70:611,71:778,72:722,73:278,74:500,
    75:667,76:556,77:833,78:722,79:778,80:667,81:778,82:722,83:667,84:611,85:722,86:667,87:944,88:667,89:667,90:611,91:278,
    92:278,93:278,94:469,95:556,96:333,97:556,98:556,99:500,100:556,101:556,102:278,103:556,104:556,105:222,106:222,107:500,
    108:222,109:833,110:556,111:556,112:556,113:556,114:333,115:500,116:278,117:556,118:500,119:722,120:500,121:500,122:500,
    123:334,124:260,125:334,126:584,183:278,179:333,8211:556,8212:1000};
  for(var c=48;c<=57;c++)w[c]=556;
  var base={"Á":65,"É":69,"Í":73,"Ó":79,"Ú":85,"Ñ":78,"Ü":85,"á":97,"é":101,"í":105,"ó":111,"ú":117,"ñ":110,"ü":117,"°":111};
  Object.keys(base).forEach(function(k){w[k.charCodeAt(0)]=w[base[k]];});
  return w;})();
function pdfAnchoTexto(s,tam,negrita){var t=0;for(var i=0;i<s.length;i++)t+=PDF_ANCHOS[s.charCodeAt(i)]||556;return t/1000*tam*(negrita?1.06:1);}

function planoPDF(P){
  var PW=1190.55,PH=841.89;
  var aci=(typeof TREPALACE_LOGO!=="undefined"&&TREPALACE_LOGO.aci)||{};
  var hexRGB=function(h){h=h.replace("#","");return [parseInt(h.substr(0,2),16)/255,parseInt(h.substr(2,2),16)/255,parseInt(h.substr(4,2),16)/255];};
  var hex=function(c){if(typeof c==="string")return hexRGB(c);var h=(c===7?"#111111":(PLANO_ACI[c]||aci[c]||"#111111")).replace("#","");
    return [parseInt(h.substr(0,2),16)/255,parseInt(h.substr(2,2),16)/255,parseInt(h.substr(4,2),16)/255];};
  var f=function(v){return (Math.round(v*100)/100).toString();};
  var col=function(e,capa){return e.rgb||e.color||(PLANO_CAPAS[capa||e.capa]||[7])[0];};
  var ancho=function(capa){return capa==="TRP-ISO-ARISTAS"?0.35:capa==="TRP-CONCRETO"?0.95:capa==="TRP-CONCRETO-ACH"?0.2:(capa==="TRP-MARCO"||capa==="TRP-ROTULO")?0.75:capa==="TRP-ISO-LINEAS"?0.3:capa==="TRP-COTAS"?0.3:0.4;};
  var trazo=function(capa){var lt=(PLANO_CAPAS[capa]||[])[1];return lt==="DASHED"?"[4 2] 0 d":lt==="CENTER"?"[9 2 2 2] 0 d":"[] 0 d";};
  var esc=function(s){var o="";for(var i=0;i<s.length;i++){var c=s.charCodeAt(i),ch=s.charAt(i);
    if(ch==="\\"||ch==="("||ch===")")o+="\\"+ch;else if(c<32)o+=" ";else if(c<256)o+=ch;else o+={8211:"\x96",8212:"\x97",8226:"\x95",8217:"\x92"}[c]||"?";}return o;};
  var paginas=[];

  P.laminas.forEach(function(L){
    var k=PW/L.W,X=function(x){return f((x-L.x0)*k);},Y=function(y){return f((y-L.y0)*k);};
    var dentro=function(pts){return pts.some(function(q){return q[0]>=L.x0-0.01&&q[0]<=L.x0+L.W+0.01&&q[1]>=L.y0-0.01&&q[1]<=L.y0+L.H+0.01;});};
    var S=[],relleno=null,estado={};
    var cerrarRelleno=function(){if(relleno){S.push(relleno.rgb+" rg");S.push(relleno.cmd.join(" ")+" f");relleno=null;}};
    var trazoDe=function(e,capa){var cp=capa||e.capa,rgb=hex(col(e,capa)).map(f).join(" "),w=f(ancho(cp)),d=trazo(cp);
      if(estado.rgb!==rgb){S.push(rgb+" RG");estado.rgb=rgb;}if(estado.w!==w){S.push(w+" w");estado.w=w;}if(estado.d!==d){S.push(d);estado.d=d;}};
    function dib(e,capa){
      if(e.t==="SOLID"&&e.rgb&&e.capa==="TRP-ISO-CARAS"){cerrarRelleno();var q0=e.p.length===4?[e.p[0],e.p[1],e.p[3],e.p[2]]:e.p,c0=hex(e.rgb).map(f).join(" ");
        S.push(c0+" rg "+c0+" RG 0.35 w [] 0 d "+X(q0[0][0])+" "+Y(q0[0][1])+" m "+q0.slice(1).map(function(p){return X(p[0])+" "+Y(p[1])+" l";}).join(" ")+" h B");estado={};return;}
      if(e.t==="SOLID"){var q=e.p.length===4?[e.p[0],e.p[1],e.p[3],e.p[2]]:e.p,rgb=hex(col(e,capa)).map(f).join(" ");
        var cmd=X(q[0][0])+" "+Y(q[0][1])+" m "+q.slice(1).map(function(p){return X(p[0])+" "+Y(p[1])+" l";}).join(" ")+" h";
        if(relleno&&relleno.rgb===rgb&&relleno.cmd.length<400)relleno.cmd.push(cmd);else{cerrarRelleno();relleno={rgb:rgb,cmd:[cmd]};}return;}
      cerrarRelleno();
      if(e.t==="LINE"){trazoDe(e,capa);S.push(X(e.p[0][0])+" "+Y(e.p[0][1])+" m "+X(e.p[1][0])+" "+Y(e.p[1][1])+" l S");}
      else if(e.t==="PLINE"){trazoDe(e,capa);S.push(X(e.p[0][0])+" "+Y(e.p[0][1])+" m "+e.p.slice(1).map(function(p){return X(p[0])+" "+Y(p[1])+" l";}).join(" ")+(e.c?" h":"")+" S");}
      else if(e.t==="CIRCLE"){var cx=(e.p[0][0]-L.x0)*k,cy=(e.p[0][1]-L.y0)*k,r=Math.max(0.25,e.r*k),c=0.5523*r;
        var arco=f(cx+r)+" "+f(cy)+" m "+f(cx+r)+" "+f(cy+c)+" "+f(cx+c)+" "+f(cy+r)+" "+f(cx)+" "+f(cy+r)+" c "+f(cx-c)+" "+f(cy+r)+" "+f(cx-r)+" "+f(cy+c)+" "+f(cx-r)+" "+f(cy)+" c "+
          f(cx-r)+" "+f(cy-c)+" "+f(cx-c)+" "+f(cy-r)+" "+f(cx)+" "+f(cy-r)+" c "+f(cx+c)+" "+f(cy-r)+" "+f(cx+r)+" "+f(cy-c)+" "+f(cx+r)+" "+f(cy)+" c";
        if(e.r<0.01){S.push(hex(col(e,capa)).map(f).join(" ")+" rg "+arco+" f");}else{trazoDe(e,capa);S.push(arco+" S");}}
      else if(e.t==="TEXT"){var tam=e.h*k*1.0,wt=pdfAnchoTexto(e.s,tam,e.neg),dx=e.al==="c"?-wt/2:e.al==="d"?-wt:0,dy=e.va==="m"?-0.35*tam:e.va==="t"?-0.72*tam:0;
        var a=(e.rot||0)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),px=(e.p[0][0]-L.x0)*k+dx*ca-dy*sa,py=(e.p[0][1]-L.y0)*k+dx*sa+dy*ca;
        S.push("BT "+hex(col(e,capa)).map(f).join(" ")+" rg /"+(e.neg?"F2":"F1")+" "+f(tam)+" Tf "+[ca,sa,-sa,ca].map(function(v){return f(v);}).join(" ")+" "+f(px)+" "+f(py)+" Tm ("+esc(e.s)+") Tj ET");}
      else if(e.t==="DIM")e.G.forEach(function(q){dib(q,"TRP-COTAS");});}
    S.push("1 J 1 j");
    P.E.forEach(function(e){if(e.t!=="MESH"&&dentro(e.t==="DIM"?[e.p1,e.p2]:e.p))dib(e);});
    cerrarRelleno();
    paginas.push(S.join("\n"));});

  /* ---------- Ensamble del archivo PDF ---------- */
  var obj=[],n=0;var nuevo=function(s){obj.push(s);return ++n;};
  var cat=nuevo(""),pags=nuevo(""),f1=nuevo("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"),
      f2=nuevo("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  var kids=[];
  paginas.forEach(function(c){var cs=nuevo("<< /Length "+c.length+" >>\nstream\n"+c+"\nendstream");
    kids.push(nuevo("<< /Type /Page /Parent "+pags+" 0 R /MediaBox [0 0 "+PW+" "+PH+"] /Resources << /Font << /F1 "+f1+" 0 R /F2 "+f2+" 0 R >> >> /Contents "+cs+" 0 R >>"));});
  obj[cat-1]="<< /Type /Catalog /Pages "+pags+" 0 R >>";
  obj[pags-1]="<< /Type /Pages /Kids ["+kids.map(function(i){return i+" 0 R";}).join(" ")+"] /Count "+kids.length+" >>";
  var info=nuevo("<< /Title ("+esc((P.meta.unidad||"Planos")+" - "+(P.meta.proyecto||""))+") /Producer (Trepalace) /Author ("+esc(P.meta.diseñador||"")+") >>");
  var s="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n",ofs=[];
  obj.forEach(function(o,i){ofs.push(s.length);s+=(i+1)+" 0 obj\n"+o+"\nendobj\n";});
  var xref=s.length;
  s+="xref\n0 "+(n+1)+"\n0000000000 65535 f \n"+ofs.map(function(o){return ("0000000000"+o).slice(-10)+" 00000 n \n";}).join("");
  s+="trailer\n<< /Size "+(n+1)+" /Root "+cat+" 0 R /Info "+info+" 0 R >>\nstartxref\n"+xref+"\n%%EOF\n";
  var b=new Uint8Array(s.length);for(var i=0;i<s.length;i++){var ch=s.charCodeAt(i);b[i]=ch<256?ch:63;}
  return b;}

/* Descarga genérica de bytes desde el navegador */
function descargarBytes(bytes,nombre,tipo){
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([bytes],{type:tipo||"application/octet-stream"}));a.download=nombre;
  document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1000);}
