// Edge Function Supabase — envoie un email au manager à chaque nouvelle demande de congé.
//
// Déploiement : supabase functions deploy notify-manager
// Secrets requis (supabase secrets set) :
//   RESEND_API_KEY        clé API Resend (https://resend.com)
//   MANAGER_EMAIL         adresse email du manager destinataire
//   SUPABASE_URL          fourni automatiquement par la plateforme
//   SUPABASE_SERVICE_ROLE_KEY  fourni automatiquement par la plateforme
//
// Branchement : Dashboard Supabase > Database > Webhooks > New webhook
//   Table: leave_requests · Events: Insert · Type: Edge Function > notify-manager

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record as {
      employee_id: string
      type: string
      start_date: string
      end_date: string
      days: number
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const managerEmail = Deno.env.get('MANAGER_EMAIL')

    if (!supabaseUrl || !serviceKey || !resendKey || !managerEmail) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required secrets' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${record.employee_id}&select=first_name,last_name`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    )
    const profiles = await profileRes.json()
    const name = profiles?.[0]
      ? `${profiles[0].first_name} ${profiles[0].last_name}`
      : 'Un salarié'

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PlannerR <onboarding@resend.dev>',
        to: managerEmail,
        subject: `Nouvelle demande de congé — ${name}`,
        html: `<p><strong>${name}</strong> a soumis une demande de <strong>${record.type}</strong>
               du ${record.start_date} au ${record.end_date} (${record.days} jour${record.days > 1 ? 's' : ''}).</p>
               <p>Connectez-vous à PlannerR pour l'approuver ou la refuser.</p>`,
      }),
    })

    return new Response(JSON.stringify({ ok: emailRes.ok }), {
      status: emailRes.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
