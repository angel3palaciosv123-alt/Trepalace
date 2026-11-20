/* ==========================================================
   NÚCLEO — sesion.js
   Inicio de sesión, cierre de sesión y modo solo lectura.
   ========================================================== */
function aplicarSesion(animado){
  var w=gid("login-wrap");
  if(animado){w.style.opacity="0";setTimeout(function(){w.style.display="none";},450);}
  else w.style.display="none";
  gid("tb-user").textContent=SES.u.toUpperCase()+" · "+SES.rol;
  sbPintarUsuario();
  if(!SES.edita) document.body.classList.add("solo-lectura");
  iniciarProyectos();}

function lgSacudir(){
  var c=gid("lg-card"); c.classList.remove("lg-sacude"); void c.offsetWidth; c.classList.add("lg-sacude");}

function lgEntrar(){
  var u=gid("lg-u").value.trim().toLowerCase(), p=gid("lg-p").value, err=gid("login-err");
  if(USUARIOS[u] && USUARIOS[u].p===p){
    SES={u:u,rol:USUARIOS[u].rol,edita:USUARIOS[u].edita};
    try{sessionStorage.setItem(CLAVE_SESION,JSON.stringify(SES));}catch(e){}
    err.style.display="none";
    lgMarcarMal(false);
    lgOk();
    setTimeout(function(){aplicarSesion(true);},1100);
  }else{
    lgSacudir();
    lgMarcarMal(true);
    err.textContent="Usuario o contraseña incorrectos.";
    err.style.display="block";}}

/* Entrada correcta: el botón muestra un chulito encerrado en un círculo (sin temblor) */
function lgOk(){
  var b=gid("lg-btn");
  if(!b.querySelector(".lg-ok"))b.insertAdjacentHTML("beforeend",'<span class="lg-ok" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="22"/><path d="M15 27l7 7 15-16"/></svg></span>');
  b.disabled=true;b.classList.add("ok");}

/* Contraseña incorrecta: borde rojo en los campos hasta que se vuelva a escribir */
function lgMarcarMal(si){["lg-u","lg-p"].forEach(function(id){var i=gid(id);if(i)i.classList.toggle("lg-mal",si);});}

function lgSalir(){try{sessionStorage.removeItem(CLAVE_SESION);sessionStorage.removeItem(CLAVE_TIPO);}catch(e){}location.reload();}

function restaurarSesion(){
  try{var s=sessionStorage.getItem(CLAVE_SESION);if(s){SES=JSON.parse(s);aplicarSesion();}}catch(e){}
  gid("lg-p").addEventListener("keydown",function(e){if(e.key==="Enter")lgEntrar();});
  ["lg-u","lg-p"].forEach(function(id){gid(id).addEventListener("input",function(){lgMarcarMal(false);gid("login-err").style.display="none";});});
  gid("lg-u").addEventListener("keydown",function(e){if(e.key==="Enter")gid("lg-p").focus();});}
