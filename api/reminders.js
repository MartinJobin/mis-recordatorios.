const clean=value=>String(value||'').trim();
const escapeHtml=value=>clean(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Método no permitido'});
  const {title,notes,createdBy,responsible,date,priority,repeat}=req.body||{};
  const emails=clean(process.env.REMINDER_TO_EMAILS).split(',').map(clean).filter(Boolean);
  if(!clean(title)||!clean(date)||!clean(createdBy)||!clean(responsible)) return res.status(400).json({error:'Completa el título, la fecha, quien lo crea y el responsable'});
  if(!emails.length||emails.some(email=>!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return res.status(500).json({error:'Falta configurar correctamente REMINDER_TO_EMAILS en Vercel'});
  if(!process.env.RESEND_API_KEY) return res.status(500).json({error:'Falta configurar RESEND_API_KEY en Vercel'});
  const repeatText=repeat==='daily'?'Diario hasta marcarlo como resuelto':'Desde la fecha indicada hasta confirmar que fue visto';
  const from=process.env.REMINDER_FROM_EMAIL||'Recordatorios <onboarding@resend.dev>';
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:emails,subject:`Nuevo recordatorio: ${clean(title)}`,html:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#17231e"><div style="background:#245c48;color:white;padding:24px;border-radius:14px 14px 0 0"><small>NUEVO RECORDATORIO</small><h1 style="margin:8px 0 0">${escapeHtml(title)}</h1></div><div style="border:1px solid #dddcd3;border-top:0;padding:24px;border-radius:0 0 14px 14px"><p><strong>Creado por:</strong> ${escapeHtml(createdBy)}</p><p><strong>Responsable:</strong> ${escapeHtml(responsible)}</p><p><strong>Fecha del primer aviso:</strong> ${escapeHtml(date)}</p><p><strong>Prioridad:</strong> ${escapeHtml(priority)}</p><p><strong>Frecuencia:</strong> ${escapeHtml(repeatText)}</p>${clean(notes)?`<p><strong>Novedades:</strong><br>${escapeHtml(notes).replace(/\n/g,'<br>')}</p>`:''}<p style="color:#6f7974;font-size:13px;margin-top:28px">Este correo confirma que el recordatorio fue creado correctamente.</p></div></div>`})});
  const data=await response.json();
  if(!response.ok) return res.status(response.status).json({error:data.message||'El servicio de correo rechazó el envío'});
  return res.status(200).json({ok:true,id:data.id});
}
