const KEY='mis-recordatorios-v1';
const $=s=>document.querySelector(s); let filter='pending';
const seed=[{id:1,title:'Revisar pagos pendientes',notes:'Confirmar transferencias y actualizar el registro.',date:new Date().toISOString().slice(0,10),priority:'alta',repeat:'daily',done:false,seen:false},{id:2,title:'Llamar al proveedor',notes:'Consultar la nueva fecha de entrega del pedido.',date:new Date(Date.now()+86400000).toISOString().slice(0,10),priority:'media',repeat:'until-seen',done:false,seen:false}];
let items=JSON.parse(localStorage.getItem(KEY)||'null')||seed;
const save=()=>localStorage.setItem(KEY,JSON.stringify(items));
const fmt=d=>new Intl.DateTimeFormat('es-EC',{day:'numeric',month:'short',year:'numeric'}).format(new Date(d+'T12:00:00'));
const day=new Intl.DateTimeFormat('es-EC',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
$('#today').textContent=day;
function render(){const now=new Date().toISOString().slice(0,10);let shown=items.filter(x=>filter==='all'||(filter==='done'?x.done:!x.done));$('#reminderList').innerHTML=shown.map(x=>{const overdue=!x.done&&x.date<now;const waiting=x.repeat==='until-seen'&&!x.seen;return `<article class="reminder ${x.done?'done':''} ${overdue?'overdue':''}"><button class="check" onclick="toggleDone(${x.id})" aria-label="Cambiar estado">${x.done?'✓':''}</button><div><h3>${esc(x.title)}</h3>${x.notes?`<p class="notes">${esc(x.notes)}</p>`:''}<div class="meta">${x.createdBy?`<span class="pill">Creado por: ${esc(x.createdBy)}</span>`:''}${x.responsible?`<span class="pill">Responsable: ${esc(x.responsible)}</span>`:''}<span class="pill ${x.priority==='alta'?'high':''}">${x.priority[0].toUpperCase()+x.priority.slice(1)}</span><span class="pill ${overdue?'due':''}">${overdue?'Venció':'Aviso'}: ${fmt(x.date)}</span><span class="pill">${x.repeat==='daily'?'↻ Diario hasta resolver':waiting?'◉ Hasta confirmar':'✓ Visto'}</span></div></div><div class="card-actions">${waiting&&!x.done?`<button class="seen" onclick="markSeen(${x.id})">Ya lo vi</button>`:''}<button class="delete" onclick="removeItem(${x.id})" aria-label="Eliminar">×</button></div></article>`}).join('');$('#emptyState').classList.toggle('hidden',shown.length>0);$('#pendingCount').textContent=items.filter(x=>!x.done).length;$('#overdueCount').textContent=items.filter(x=>!x.done&&x.date<now).length;$('#doneCount').textContent=items.filter(x=>x.done).length;$('#dailyCount').textContent=items.filter(x=>!x.done&&x.repeat==='daily').length;save()}
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
window.toggleDone=id=>{const x=items.find(x=>x.id===id);x.done=!x.done;toast(x.done?'Recordatorio resuelto':'Marcado como pendiente');render()};
window.markSeen=id=>{items.find(x=>x.id===id).seen=true;toast('Recordatorio confirmado');render()};
window.removeItem=id=>{items=items.filter(x=>x.id!==id);toast('Recordatorio eliminado');render()};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelector('.tab.active').classList.remove('active');b.classList.add('active');filter=b.dataset.filter;render()});
const modal=$('#reminderModal');$('#openModal').onclick=()=>{const d=new Date();$('#date').value=d.toISOString().slice(0,10);modal.showModal()};$('#closeModal').onclick=$('#cancelModal').onclick=()=>modal.close();
$('#reminderForm').onsubmit=async e=>{
  e.preventDefault();
  const button=$('#saveReminder');
  const reminder={id:Date.now(),title:$('#title').value.trim(),notes:$('#notes').value.trim(),createdBy:$('#createdBy').value.trim(),responsible:$('#responsible').value.trim(),date:$('#date').value,priority:$('#priority').value,repeat:new FormData(e.target).get('repeat'),done:false,seen:false};
  button.disabled=true;button.textContent='Enviando…';
  items.unshift(reminder);e.target.reset();modal.close();filter='pending';document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.filter==='pending'));render();checkDue();
  try{
    const response=await fetch('/api/reminders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(reminder)});
    const result=await response.json();
    if(!response.ok) throw new Error(result.error||'No se pudo enviar el correo');
    toast('Recordatorio guardado y correo enviado');
  }catch(error){toast(`Guardado, pero el correo falló: ${error.message}`)}finally{button.disabled=false;button.textContent='Guardar y enviar correo'}
};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t.timer);t.timer=setTimeout(()=>t.classList.remove('show'),2600)}
$('#notifyBtn').onclick=async()=>{if(!('Notification'in window))return toast('Este navegador no admite notificaciones');const p=await Notification.requestPermission();toast(p==='granted'?'Notificaciones activadas':'Permiso no concedido');if(p==='granted')checkDue()};
function checkDue(){if(!('Notification'in window)||Notification.permission!=='granted')return;const today=new Date().toISOString().slice(0,10);items.filter(x=>!x.done&&x.date<=today&&(x.repeat==='daily'||!x.seen)).slice(0,3).forEach(x=>new Notification('Recordatorio pendiente',{body:x.title,tag:'reminder-'+x.id}));}
render();setTimeout(checkDue,800);setInterval(checkDue,3600000);
