# Mis Recordatorios

Aplicación lista para desplegar en Vercel, sin autenticación de ChatGPT. Los datos se guardan en el navegador y una función serverless envía un correo al crear cada recordatorio.

## Despliegue en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel, selecciona **Add New > Project** e importa el repositorio.
3. Deja **Framework Preset** en `Other` y no configures comando de compilación.
4. En **Settings > Environment Variables**, agrega `RESEND_API_KEY` con una clave de [Resend](https://resend.com).
5. Agrega `REMINDER_TO_EMAILS` con los correos que recibirán los nuevos recordatorios, separados por comas.
6. Opcional: agrega `REMINDER_FROM_EMAIL`, por ejemplo `Recordatorios <recordatorios@tu-dominio.com>`. El dominio debe estar verificado en Resend. Si no lo agregas, se usa el remitente de prueba de Resend.
7. Despliega el proyecto.

Para probar correos con el remitente `onboarding@resend.dev`, Resend normalmente limita el destinatario al correo de la cuenta. Verifica un dominio para enviar a cualquier destinatario.
