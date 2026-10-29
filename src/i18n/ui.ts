// Source-language keys keep existing Spanish copy intact. Unknown editorial text is preserved.
export type AppLanguage = 'es' | 'en' | 'pt';
export const LANGUAGE_NAMES: Record<AppLanguage, string> = { es: 'Español', en: 'English', pt: 'Português' };
export const UI_TRANSLATIONS = {
  "Tu contraseña": { en: "Your password", pt: "Sua senha" },
  "Elige tu idioma": { en: "Choose your language", pt: "Escolha seu idioma" },
  "No se pudo generar el código. Inténtalo otra vez.": {"en": "Could not generate the code. Please try again.", "pt": "Não foi possível gerar o código. Tente novamente."},
  "Este beneficio no está disponible.": {"en": "This benefit is unavailable.", "pt": "Este benefício não está disponível."},
  "Tu cuenta no está activa.": {"en": "Your account is not active.", "pt": "Sua conta não está ativa."},
  "Necesitas una membresía ITC Club activa.": {"en": "You need an active ITC Club membership.", "pt": "Você precisa de uma assinatura ITC Club ativa."},
  "Este beneficio no está disponible en este momento.": {"en": "This benefit is currently unavailable.", "pt": "Este benefício não está disponível no momento."},
  "Ya utilizaste el máximo de cupones permitido para este beneficio.": {"en": "You have reached the redemption limit for this benefit.", "pt": "Você atingiu o limite de resgates deste benefício."},
  "Este beneficio está agotado.": {"en": "This benefit is sold out.", "pt": "Este benefício está esgotado."},

  "Quiero recibir promociones, novedades e información de Insight The City por correo electrónico.": { en: "I want to receive promotions, news and information from Insight The City by email.", pt: "Quero receber promoções, novidades e informações da Insight The City por e-mail." },
  "Opcional. Puedes crear tu cuenta sin activar esta opción.": { en: "Optional. You can create your account without enabling this option.", pt: "Opcional. Você pode criar sua conta sem ativar esta opção." },
  "No se pudo actualizar el idioma. Inténtalo de nuevo.": { en: "Could not update the language. Please try again.", pt: "Não foi possível atualizar o idioma. Tente novamente." },
  "VER MI QR": { en: "VIEW MY QR", pt: "VER MEU QR" },

  "Buscar lugares y eventos": {en: "Search places and events", pt: "Buscar lugares e eventos"},
  "DESCUBRE NYC & NJ": {en: "DISCOVER NYC & NJ", pt: "DESCUBRA NYC & NJ"},
  "Ocultar contraseña": {"en": "Hide password", "pt": "Ocultar senha"},
  "Mostrar contraseña": {"en": "Show password", "pt": "Mostrar senha"},
  "Qué hacer en New York": {"en": "Things to do in New York", "pt": "O que fazer em Nova York"},
  "Lugares y beneficios": {"en": "Places and benefits", "pt": "Lugares e benefícios"},
  "Quitar de guardados": {"en": "Remove from saved", "pt": "Remover dos salvos"},
  "Guardar": {"en": "Save", "pt": "Salvar"},
  "No se pudieron cargar tus guardados.": {"en": "Could not load your saved items.", "pt": "Não foi possível carregar seus itens salvos."},
  "No se pudo guardar el cambio. Inténtalo otra vez.": {"en": "Could not save the change. Please try again.", "pt": "Não foi possível salvar a alteração. Tente novamente."},
  "HRS": {"en": "HRS", "pt": "HRS"},
  "MIN": {"en": "MIN", "pt": "MIN"},
  "SEC": {"en": "SEC", "pt": "SEG"},
  "Food": {"en": "Food", "pt": "Comida"},
  "Beauty": {"en": "Beauty", "pt": "Beleza"},
  "Nightlife": {"en": "Nightlife", "pt": "Vida noturna"},
  "Spa": {"en": "Spa", "pt": "Spa"},
  "Atracciones": {"en": "Attractions", "pt": "Atrações"},

  "Beneficios": {"en": "Benefits", "pt": "Benefícios"},
  "Guardados": {"en": "Saved", "pt": "Salvos"},
  "BENEFICIOS ITC CLUB": {"en": "ITC CLUB BENEFITS", "pt": "BENEFÍCIOS ITC CLUB"},
  "No hay beneficios con estos filtros.": {"en": "No benefits match these filters.", "pt": "Nenhum benefício corresponde a esses filtros."},
  "ITC RECOMIENDA": {"en": "ITC RECOMMENDS", "pt": "ITC RECOMENDA"},
  "No hay recomendaciones con estos filtros.": {"en": "No recommendations match these filters.", "pt": "Nenhuma recomendação corresponde a esses filtros."},
  "QUÉ HACER EN NEW YORK": {"en": "THINGS TO DO IN NEW YORK", "pt": "O QUE FAZER EM NOVA YORK"},
  "NY AL DÍA": {"en": "NY TODAY", "pt": "NY EM DIA"},
  "Renovación cancelada": {"en": "Renewal canceled", "pt": "Renovação cancelada"},
  "Finalizada": {"en": "Ended", "pt": "Encerrada"},
  "No disponible": {"en": "Unavailable", "pt": "Indisponível"},
  "Actualizando membresía": {"en": "Updating membership", "pt": "Atualizando assinatura"},
  "Tipo de acceso": {"en": "Access type", "pt": "Tipo de acesso"},
  "Otorgado por ITC Club": {"en": "Granted by ITC Club", "pt": "Concedido pelo ITC Club"},
  "No aplica": {"en": "Not applicable", "pt": "Não se aplica"},
  "Suscripción de pago": {"en": "Paid subscription", "pt": "Assinatura paga"},
  "No hay una suscripción asociada": {"en": "No subscription is linked", "pt": "Nenhuma assinatura vinculada"},
  "Tienes acceso a los beneficios del Club. No hay una renovación automática que cancelar en esta cuenta. Si realizaste un pago, contacta con soporte para revisar la vinculación de tu suscripción.": {"en": "You have access to Club benefits. There is no automatic renewal to cancel on this account. If you made a payment, contact support to check your subscription link.", "pt": "Você tem acesso aos benefícios do Club. Não há renovação automática para cancelar nesta conta. Se você efetuou um pagamento, fale com o suporte para verificar o vínculo da sua assinatura."},
  "VER BENEFICIOS": {"en": "VIEW BENEFITS", "pt": "VER BENEFÍCIOS"},
  "No se pudieron confirmar los datos de facturación de tu membresía. Actualiza la información o contacta con soporte si ya realizaste un pago.": {"en": "We could not confirm your membership billing details. Refresh the information or contact support if you have already paid.", "pt": "Não foi possível confirmar os dados de cobrança da sua assinatura. Atualize as informações ou fale com o suporte se já efetuou o pagamento."},
  "ADMINISTRAR PAGOS": {"en": "MANAGE PAYMENTS", "pt": "GERENCIAR PAGAMENTOS"},
  "Cambia tu tarjeta o consulta tus recibos en el portal seguro de Stripe.": {"en": "Change your card or view your receipts in Stripe’s secure portal.", "pt": "Altere seu cartão ou consulte seus recibos no portal seguro da Stripe."},
  "No se pudo actualizar la membresía. La información mostrada puede estar desactualizada.": {"en": "Could not update your membership. The information shown may be out of date.", "pt": "Não foi possível atualizar a assinatura. As informações exibidas podem estar desatualizadas."},
  "Actualizar membresía": {"en": "Refresh membership", "pt": "Atualizar assinatura"},
  "Tus lugares, beneficios y planes favoritos.": {"en": "Your favorite places, benefits and plans.", "pt": "Seus lugares, benefícios e passeios favoritos."},
  "Aún no tienes elementos guardados": {"en": "You have no saved items yet", "pt": "Você ainda não tem itens salvos"},
  "Explora la ciudad y utiliza el marcador para guardar lo que quieras visitar después.": {"en": "Explore the city and use the bookmark to save places you want to visit later.", "pt": "Explore a cidade e use o marcador para salvar o que deseja visitar depois."},
  "EXPLORAR": {"en": "EXPLORE", "pt": "EXPLORAR"},
  "Ubicación": {"en": "Location", "pt": "Localização"},
  "No se pudo activar el acceso biométrico": {"en": "Could not enable biometric access", "pt": "Não foi possível ativar o acesso biométrico"},
  "Puedes seguir entrando con tu correo y contraseña.": {"en": "You can still sign in with your email and password.", "pt": "Você pode continuar entrando com seu e-mail e sua senha."},
  "Puedes iniciar sesión con tu correo y contraseña.": {"en": "You can sign in with your email and password.", "pt": "Você pode entrar com seu e-mail e sua senha."},
  "Olvidar esta cuenta en el dispositivo": {"en": "Forget this account on this device", "pt": "Esquecer esta conta no dispositivo"},
  "Se eliminará el acceso biométrico. Podrás entrar con tu correo y contraseña.": {"en": "Biometric access will be removed. You can sign in with your email and password.", "pt": "O acesso biométrico será removido. Você poderá entrar com seu e-mail e sua senha."},
  "Olvidar cuenta": {"en": "Forget account", "pt": "Esquecer conta"},
  "No se pudo olvidar la cuenta. Inténtalo nuevamente.": {"en": "Could not forget this account. Please try again.", "pt": "Não foi possível esquecer a conta. Tente novamente."},
  "Volver a explorar como invitado": {"en": "Explore again as a guest", "pt": "Voltar a explorar como visitante"},
  "No se pudo vincular Apple.": {"en": "Could not link Apple.", "pt": "Não foi possível vincular a Apple."},
  "Acceso rápido": {"en": "Quick access", "pt": "Acesso rápido"},
  "Activar": {"en": "Enable", "pt": "Ativar"},
  "No se pudo conectar con el servidor.": {"en": "Could not connect to the server.", "pt": "Não foi possível conectar ao servidor."},
  "Apple no proporcionó una credencial.": {"en": "Apple did not provide a credential.", "pt": "A Apple não forneceu uma credencial."},
  "No se pudo iniciar sesión.": {"en": "Could not sign in.", "pt": "Não foi possível entrar."},
  "Términos": {"en": "Terms", "pt": "Termos"},
  "Foto": {"en": "Photo", "pt": "Foto"},
  "No se pudo abrir Google Maps": {"en": "Could not open Google Maps", "pt": "Não foi possível abrir o Google Maps"},
  "Inténtalo nuevamente.": {"en": "Please try again.", "pt": "Tente novamente."},
  "Contraseña": {"en": "Password", "pt": "Senha"},
  "Beneficios cerca de ti": {"en": "Benefits near you", "pt": "Benefícios perto de você"},
  "Ver beneficios": {"en": "View benefits", "pt": "Ver benefícios"},
  "Borrar búsqueda": {"en": "Clear search", "pt": "Limpar busca"},
  "Buscar": {"en": "Search", "pt": "Buscar"},
  "Cerrar búsqueda": {"en": "Close search", "pt": "Fechar busca"},
  "Búsquedas recientes": {"en": "Recent searches", "pt": "Buscas recentes"},
  "Borrar búsquedas recientes": {"en": "Clear recent searches", "pt": "Limpar buscas recentes"},
  "Sugerencias": {"en": "Suggestions", "pt": "Sugestões"},
  "Resultados": {"en": "Results", "pt": "Resultados"},
  "Cargando contenido…": {"en": "Loading content…", "pt": "Carregando conteúdo…"},
  "No encontramos resultados. Prueba otra búsqueda o cambia los filtros.": {"en": "No results found. Try another search or change the filters.", "pt": "Nenhum resultado encontrado. Tente outra busca ou altere os filtros."},
  "No se pudo cargar todo el contenido. Reintentar": {"en": "Could not load all content. Retry", "pt": "Não foi possível carregar todo o conteúdo. Tentar novamente"},
  "Todos": {"en": "All", "pt": "Todos"},

  "Ver detalle": { "en": "View details", "pt": "Ver detalhes" },
  "Aplican condiciones": { "en": "Conditions apply", "pt": "Aplicam-se condições" },
  "Ver experiencia": { "en": "View experience", "pt": "Ver experiência" },
  "Ver publicación": { "en": "View article", "pt": "Ver publicação" },
  "Ver más resultados": { "en": "View more results", "pt": "Ver mais resultados" },
  "Conocer la membresía": { "en": "Explore membership", "pt": "Conhecer a assinatura" },
  "Qué hacer en NY": { "en": "Things to do in NY", "pt": "O que fazer em NY" },
  "En la app": { "en": "In the app", "pt": "No app" },
  "Este correo aún no tiene cuenta": {"en": "This email does not have an account yet", "pt": "Este e-mail ainda não tem uma conta"},
  "No encontramos una cuenta con {email}. Puedes crear una con este mismo correo.": {"en": "We could not find an account for {email}. You can create one with this email.", "pt": "Não encontramos uma conta com {email}. Você pode criar uma com este mesmo e-mail."},
  "Usar otro correo": {"en": "Use another email", "pt": "Usar outro e-mail"},
  "La contraseña no es correcta.": {"en": "The password is incorrect.", "pt": "A senha está incorreta."},
  "Esta cuenta usa Apple o Google. Usa tu acceso habitual o recupera la contraseña.": {"en": "This account uses Apple or Google. Use your usual sign-in method or reset your password.", "pt": "Esta conta usa Apple ou Google. Use seu acesso habitual ou redefina a senha."},

  "Redes sociales": {"en": "Social media", "pt": "Redes sociais"},
  "Abrir perfil en {network}": {"en": "Open profile on {network}", "pt": "Abrir perfil no {network}"},
  "No se pudo abrir el enlace. Inténtalo de nuevo.": {"en": "Could not open the link. Please try again.", "pt": "Não foi possível abrir o link. Tente novamente."},
  "O continúa con": {"en": "Or continue with", "pt": "Ou continue com"},
  "Para crear una cuenta o iniciar sesión.": {"en": "To create an account or sign in.", "pt": "Para criar uma conta ou entrar."},
  "Verifica tu identidad con Apple para continuar.": {"en": "Verify your identity with Apple to continue.", "pt": "Verifique sua identidade com Apple para continuar."},
  "La cuenta de Apple no corresponde a este perfil": {"en": "This Apple account does not match this profile", "pt": "Esta conta Apple não corresponde a este perfil"},
  "La verificación con Apple no está disponible en este dispositivo.": {"en": "Apple verification is not available on this device.", "pt": "A verificação com Apple não está disponível neste dispositivo."},
  "No se pudo verificar el acceso. Reintentar": {"en": "Could not verify access. Try again", "pt": "Não foi possível verificar o acesso. Tentar novamente"},
  "No se pudo enviar el código. Inténtalo de nuevo.": {"en": "Could not send the code. Please try again.", "pt": "Não foi possível enviar o código. Tente novamente."},
  "Revisa tu correo e introduce el código de 8 dígitos. Si no aparece, revisa spam.": {"en": "Check your email and enter the 8-digit code. If it is missing, check spam.", "pt": "Confira seu e-mail e digite o código de 8 dígitos. Se não chegar, confira o spam."},
  "Código inválido o vencido": {"en": "Invalid or expired code", "pt": "Código inválido ou expirado"},
  "Código de confirmación": {"en": "Confirmation code", "pt": "Código de confirmação"},
  "Reenviar código": {"en": "Resend code", "pt": "Reenviar código"},
  "Enviar código de confirmación": {"en": "Send confirmation code", "pt": "Enviar código de confirmação"},
  "Para eliminar tu cuenta, confirma tu identidad con el código que enviaremos a tu correo registrado.": {"en": "To delete your account, confirm your identity with the code sent to your registered email.", "pt": "Para excluir sua conta, confirme sua identidade com o código enviado ao seu e-mail cadastrado."},
  "Continuar con Google": {"en": "Continue with Google", "pt": "Continuar com Google"},
  "Google no proporcionó una credencial.": {"en": "Google did not provide a credential.", "pt": "O Google não forneceu uma credencial."},
  "Confirma tu contraseña para vincular Google a tu cuenta existente.": {"en": "Confirm your password to link Google to your existing account.", "pt": "Confirme sua senha para vincular o Google à sua conta existente."},
  "No se pudo iniciar sesión con Google. Inténtalo de nuevo.": {"en": "Could not sign in with Google. Please try again.", "pt": "Não foi possível entrar com Google. Tente novamente."},

  "Continuar con Apple": {"en":"Continue with Apple","pt":"Continuar com Apple"},
  "Vincular Apple a mi cuenta": {"en":"Link Apple to my account","pt":"Vincular Apple à minha conta"},
  "Continuar con correo": {"en": "Continue with email", "pt": "Continuar com e-mail"},
  "Apple estará disponible en una nueva compilación de iOS.": {"en": "Apple sign-in will be available in a new iOS build.", "pt": "O acesso com Apple estará disponível em uma nova compilação do iOS."},
  "Para crear tu cuenta, acepta los términos y la privacidad.": {"en": "To create your account, accept the terms and privacy policy.", "pt": "Para criar sua conta, aceite os termos e a política de privacidade."},
  "Acepto los términos y la política de privacidad": {"en": "I accept the terms and privacy policy", "pt": "Aceito os termos e a política de privacidade"},
  "Crear cuenta con Apple": {"en": "Create account with Apple", "pt": "Criar conta com Apple"},
  "Apple vinculado": {"en": "Apple linked", "pt": "Apple vinculado"},
  "Ya puedes iniciar sesión con Apple sin perder tus datos.": {"en": "You can now sign in with Apple and keep your existing data.", "pt": "Agora você pode entrar com Apple mantendo seus dados."},
  "¿Quieres activar el acceso biométrico en este dispositivo?": {"en": "Would you like to enable biometric sign-in on this device?", "pt": "Deseja ativar o acesso biométrico neste dispositivo?"},
  "Eliminar mi cuenta mediante verificación por correo": {"en": "Delete my account using email verification", "pt": "Excluir minha conta por verificação de e-mail"},

  "{count} ubicaciones": { "en": "{count} locations", "pt": "{count} locais" },
  "¿Qué incluye": { "en": "What's included in", "pt": "O que inclui" },
  "Descuentos y promociones en negocios participantes": { "en": "Discounts and promotions at participating businesses", "pt": "Descontos e promoções em estabelecimentos participantes" },
  "Beneficios exclusivos para miembros": { "en": "Exclusive member benefits", "pt": "Benefícios exclusivos para membros" },
  "Entradas y consumos se pagan aparte, salvo que la oferta indique que están incluidos.": { "en": "Tickets and purchases are paid separately unless the offer states they are included.", "pt": "Ingressos e consumos são pagos separadamente, salvo quando a oferta indicar que estão incluídos." },
  "Saltar": {"en":"Skip","pt":"Pular"},
  "TOP DE HOY": {"en":"TODAY’S TOP PICKS","pt":"DESTAQUES DE HOJE"},
  "Top de hoy: {title}": {"en":"Today’s pick: {title}","pt":"Destaque de hoje: {title}"},
  "Abre la ficha de esta atracción.": {"en":"Opens this attraction’s details.","pt":"Abre os detalhes desta atração."},
  "Siguiente atracción": {"en":"Next attraction","pt":"Próxima atração"},
  "Atracción anterior": {"en":"Previous attraction","pt":"Atração anterior"},
  "Solicitud de eliminación recibida": {"en": "Deletion request received", "pt": "Solicitação de exclusão recebida"},
  "Tu cuenta está bloqueada y la eliminación está en proceso. Te enviaremos un correo cuando termine. Si no recibes la confirmación en 48 horas, contacta a ITC Club.": {"en": "Your account is blocked and deletion is in progress. We will email you when it is complete. If you do not receive confirmation within 48 hours, contact ITC Club.", "pt": "Sua conta está bloqueada e a exclusão está em andamento. Enviaremos um e-mail quando terminar. Se não receber a confirmação em 48 horas, entre em contato com o ITC Club."},
  "Solicitamos la cancelación de tu membresía en Stripe antes de borrar la cuenta. Si ocurre un problema, reintentamos y te confirmamos cuando termine.": {"en": "We request cancellation of your Stripe membership before deleting the account. If a problem occurs, we retry and confirm when complete.", "pt": "Solicitamos o cancelamento da sua assinatura no Stripe antes de excluir a conta. Se houver um problema, tentaremos novamente e confirmaremos a conclusão."},
  "Normalmente se procesa al solicitarla. Si hay un fallo, puede tardar más. Te enviaremos la confirmación por correo; si no llega en 48 horas, contacta a ITC Club.": {"en": "It is normally processed when requested. If a failure occurs, it may take longer. We will email confirmation; if it does not arrive within 48 hours, contact ITC Club.", "pt": "Normalmente é processada ao solicitar. Se houver uma falha, pode demorar mais. Enviaremos a confirmação por e-mail; se não chegar em 48 horas, entre em contato com o ITC Club."},

  "ITC Club puede recibir una comisión si reservas o compras a través de este enlace, sin costo adicional para ti.": {
    "en": "ITC Club may receive a commission if you book or purchase through this link, at no additional cost to you.",
    "pt": "O ITC Club pode receber uma comissão se você reservar ou comprar por este link, sem custo adicional para você."
  },
  "Colaboración comercial pagada: este negocio paga por participar en ITC Club. Algunas compras o reservas también pueden generarnos comisiones.": {
    "en": "Paid commercial partnership: this business pays to participate in ITC Club. Some purchases or reservations may also earn us commissions.",
    "pt": "Colaboração comercial paga: este negócio paga para participar do ITC Club. Algumas compras ou reservas também podem gerar comissões para nós."
  },
  "Colaboración comercial: este socio ofrece beneficios exclusivos a miembros de ITC Club. Algunas compras o reservas pueden generarnos comisiones.": {
    "en": "Commercial partnership: this partner offers exclusive benefits to ITC Club members. Some purchases or reservations may earn us commissions.",
    "pt": "Colaboração comercial: este parceiro oferece benefícios exclusivos aos membros do ITC Club. Algumas compras ou reservas podem gerar comissões para nós."
  },
  "Descubre New York con beneficios exclusivos": {"en": "Discover New York with exclusive benefits", "pt": "Descubra New York com benefícios exclusivos"},
  "Cobro al suscribirte. Renovación automática cada {period}.": {"en": "Charged when you subscribe. Automatically renews every {period}.", "pt": "Cobrança ao assinar. Renovação automática a cada {period}."},
  "Cancela en Perfil → Mi membresía. Conservas tus beneficios hasta finalizar el período pagado.": {"en": "Cancel in Profile → My membership. Keep your benefits until the paid period ends.", "pt": "Cancele em Perfil → Minha assinatura. Seus benefícios continuam até o fim do período pago."},
  "Privacidad": {"en": "Privacy", "pt": "Privacidade"},

  "Beneficios sujetos a disponibilidad y condiciones.": {"en": "Benefits subject to availability and terms.", "pt": "Benefícios sujeitos à disponibilidade e condições."},
  "Cobro al suscribirte. Renovación automática cada {period} hasta que canceles.": {"en": "Charged when you subscribe. Automatically renews every {period} until you cancel.", "pt": "Cobrança ao assinar. Renovação automática a cada {period} até você cancelar."},
  "Cancela en Perfil > Mi membresía; acceso hasta finalizar el período pagado.": {"en": "Cancel in Profile > My membership; access continues until the paid period ends.", "pt": "Cancele em Perfil > Minha assinatura; acesso até o fim do período pago."},

  "CONTINUAR A LA SUSCRIPCIÓN": {"en": "CONTINUE TO SUBSCRIPTION", "pt": "CONTINUAR PARA A ASSINATURA"},

  "Cada beneficio está sujeto a disponibilidad y condiciones. La membresía no incluye todos los eventos ni consumos.": {"en": "Benefits are subject to availability and terms. Membership does not include every event or purchase.", "pt": "Os benefícios estão sujeitos à disponibilidade e condições. A assinatura não inclui todos os eventos nem consumos."},

  "No se pudieron cargar los beneficios. Toca para reintentar.": {"en": "Could not load benefits. Tap to try again.", "pt": "Não foi possível carregar os benefícios. Toque para tentar novamente."},

  "Beneficios incluidos con tu membresía": {"en": "Benefits included with your membership", "pt": "Benefícios incluídos na sua assinatura"},

  "Reanudar banners": {"en": "Resume banners", "pt": "Retomar banners"},

  "Pausar banners": {"en": "Pause banners", "pt": "Pausar banners"},

  "Siguiente beneficio": {"en": "Next benefit", "pt": "Próximo benefício"},

  "Beneficio anterior": {"en": "Previous benefit", "pt": "Benefício anterior"},

  "No hay beneficios disponibles en este momento. Vuelve a consultar antes de suscribirte.": {"en": "There are no benefits available right now. Check again before subscribing.", "pt": "Não há benefícios disponíveis no momento. Confira novamente antes de assinar."},

  "Consulta la disponibilidad y las condiciones de este beneficio.": {"en": "Check availability and terms for this benefit.", "pt": "Consulte a disponibilidade e as condições deste benefício."},

  "Ver beneficio": {"en": "View benefit", "pt": "Ver benefício"},

  "Ver la membresía no genera ningún cobro. Cada beneficio tiene sus propias condiciones.": {"en": "Viewing membership does not charge you. Each benefit has its own terms.", "pt": "Ver a assinatura não gera cobrança. Cada benefício tem suas próprias condições."},

  "Ver membresía y beneficios": {"en": "View membership and benefits", "pt": "Ver assinatura e benefícios"},

  "Obtén cupones, descuentos y beneficios exclusivos para canjear en restaurantes y eventos participantes.": {"en": "Get coupons, discounts and exclusive benefits to redeem at participating restaurants and events.", "pt": "Obtenha cupons, descontos e benefícios exclusivos para resgatar em restaurantes e eventos participantes."},

  "Continuar gratis": {"en": "Continue for free", "pt": "Continuar grátis"},

  "Sin suscripción ni cobros por continuar gratis.": {"en": "No subscription or charge to continue for free.", "pt": "Sem assinatura nem cobrança para continuar grátis."},

  "Explora lugares, eventos y contenido gratuito. También puedes consultar los beneficios del Club; obtener y canjear sus cupones requiere membresía.": {"en": "Explore places, events and free content. You can also view Club benefits; getting and redeeming their coupons requires membership.", "pt": "Explore lugares, eventos e conteúdo gratuito. Você também pode ver os benefícios do Clube; obter e resgatar seus cupons exige assinatura."},

  "ACCESO GRATIS": {"en": "FREE ACCESS", "pt": "ACESSO GRÁTIS"},

  "Elige cómo explorar la ciudad. Puedes continuar gratis o conocer los beneficios de la membresía.": {"en": "Choose how to explore the city. Continue for free or discover membership benefits.", "pt": "Escolha como explorar a cidade. Continue grátis ou conheça os benefícios da assinatura."},

  "Bienvenido a ITC": {"en": "Welcome to ITC", "pt": "Bem-vindo ao ITC"},

  "Cancela en Perfil > Mi membresía. Conservas tus beneficios hasta finalizar el período pagado.": {"en": "Cancel in Profile > My membership. Keep your benefits until the paid period ends.", "pt": "Cancele em Perfil > Minha assinatura. Seus benefícios continuam até o fim do período pago."},

  "Se cobra al suscribirte y se renueva automáticamente cada {period} hasta que canceles.": {"en": "You are charged when you subscribe, then automatically every {period} until you cancel.", "pt": "A cobrança ocorre ao assinar e se renova automaticamente a cada {period} até você cancelar."},

  "Membresía de pago": {"en": "Paid membership", "pt": "Assinatura paga"},


  "Selecciona tu idioma": {
    "en": "Choose your language",
    "pt": "Escolha seu idioma"
  },
  "El cambio se aplica a toda la interfaz.": {
    "en": "The change applies throughout the interface.",
    "pt": "A alteração se aplica a toda a interface."
  },
  "No se pudo cambiar el idioma. Revisa tu conexión e inténtalo de nuevo.": {
    "en": "Could not change the language. Check your connection and try again.",
    "pt": "Não foi possível alterar o idioma. Verifique sua conexão e tente novamente."
  },
  "Guardando…": {
    "en": "Saving…",
    "pt": "Salvando…"
  },
  "Cerrar": {
    "en": "Close",
    "pt": "Fechar"
  },
  "Cancelar": {
    "en": "Cancel",
    "pt": "Cancelar"
  },
  "Volver": {
    "en": "Back",
    "pt": "Voltar"
  },
  "VOLVER": {
    "en": "BACK",
    "pt": "VOLTAR"
  },
  "Filtrar": {
    "en": "Filter",
    "pt": "Filtrar"
  },
  "Filtrar por etiquetas": {
    "en": "Filter by tags",
    "pt": "Filtrar por etiquetas"
  },
  "Cerrar filtros": {
    "en": "Close filters",
    "pt": "Fechar filtros"
  },
  "Limpiar": {
    "en": "Clear",
    "pt": "Limpar"
  },
  "Elige una o varias. Verás contenidos con cualquiera de las etiquetas seleccionadas.": {
    "en": "Choose one or more. Results will match any selected tag.",
    "pt": "Escolha uma ou mais. Os resultados terão qualquer uma das etiquetas selecionadas."
  },
  "Ver resultados ({count})": {
    "en": "Show results ({count})",
    "pt": "Ver resultados ({count})"
  },
  "Ver menos descripción": {
    "en": "Read less of the description",
    "pt": "Ver menos da descrição"
  },
  "Ver descripción completa": {
    "en": "Read the full description",
    "pt": "Ver descrição completa"
  },
  "Ver menos": {
    "en": "Read less",
    "pt": "Ver menos"
  },
  "Ver más": {
    "en": "Read more",
    "pt": "Ver mais"
  },
  "Ver más de {title}": {
    "en": "See more of {title}",
    "pt": "Ver mais de {title}"
  },
  "Ver todo: {title}": {
    "en": "See all: {title}",
    "pt": "Ver tudo: {title}"
  },
  "Cargando {title}": {
    "en": "Loading {title}",
    "pt": "Carregando {title}"
  },
  "Imagen de {title}": {
    "en": "Image of {title}",
    "pt": "Imagem de {title}"
  },
  "Abrir {title}": {
    "en": "Open {title}",
    "pt": "Abrir {title}"
  },
  "Imagen no disponible": {
    "en": "Image unavailable",
    "pt": "Imagem indisponível"
  },
  "No hay eventos para este filtro.": {
    "en": "No events match this filter.",
    "pt": "Nenhum evento corresponde a este filtro."
  },
  "No hay contenidos con estas etiquetas.": {
    "en": "No content matches these tags.",
    "pt": "Nenhum conteúdo corresponde a estas etiquetas."
  },
  "Actualizando contenido…": {
    "en": "Updating content…",
    "pt": "Atualizando conteúdo…"
  },
  "Contenido no disponible": {
    "en": "Content unavailable",
    "pt": "Conteúdo indisponível"
  },
  "COMPRAR BOLETOS": {
    "en": "BUY TICKETS",
    "pt": "COMPRAR INGRESSOS"
  },
  "COMPRAR ENTRADAS": {
    "en": "BUY TICKETS",
    "pt": "COMPRAR INGRESSOS"
  },
  "Evento con entrada de pago": {
    "en": "Ticketed event",
    "pt": "Evento com ingresso pago"
  },
  "Premium ITC Club": {
    "en": "ITC Club Premium",
    "pt": "Premium ITC Club"
  },
  "Beneficio para miembros ITC Club": {
    "en": "ITC Club member benefit",
    "pt": "Benefício para membros ITC Club"
  },
  "Beneficio gratis": {
    "en": "Free benefit",
    "pt": "Benefício gratuito"
  },
  "BENEFICIO ITC CLUB": {
    "en": "ITC CLUB BENEFIT",
    "pt": "BENEFÍCIO ITC CLUB"
  },
  "Descripción": {
    "en": "Description",
    "pt": "Descrição"
  },
  "Qué incluye": {
    "en": "What's included",
    "pt": "O que inclui"
  },
  "Dirección": {
    "en": "Address",
    "pt": "Endereço"
  },
  "Recomendación ITC": {
    "en": "ITC recommendation",
    "pt": "Recomendação ITC"
  },
  "Abre el sitio de compra de boletos": {
    "en": "Opens the ticket booking website",
    "pt": "Abre o site de compra de ingressos"
  },
  "SUSCRÍBETE PARA DESBLOQUEAR": {
    "en": "SUBSCRIBE TO UNLOCK",
    "pt": "ASSINE PARA DESBLOQUEAR"
  },
  "BENEFICIO DESBLOQUEADO": {
    "en": "BENEFIT UNLOCKED",
    "pt": "BENEFÍCIO DESBLOQUEADO"
  },
  "BENEFICIO DISPONIBLE": {
    "en": "BENEFIT AVAILABLE",
    "pt": "BENEFÍCIO DISPONÍVEL"
  },
  "GRATIS": {
    "en": "FREE",
    "pt": "GRÁTIS"
  },
  "Hoy": {
    "en": "Today",
    "pt": "Hoje"
  },
  "Este fin de semana": {
    "en": "This weekend",
    "pt": "Este fim de semana"
  },
  "Gratis": {
    "en": "Free",
    "pt": "Grátis"
  },
  "Música": {
    "en": "Music",
    "pt": "Música"
  },
  "Arte": {
    "en": "Art",
    "pt": "Arte"
  },
  "Evento": {
    "en": "Event",
    "pt": "Evento"
  },
  "Descuento": {
    "en": "Discount",
    "pt": "Desconto"
  },
  "Que hacer en NY": {
    "en": "Things to do in NY",
    "pt": "O que fazer em NY"
  },
  "Nueva York al día": {
    "en": "New York news",
    "pt": "Notícias de Nova York"
  },
  "Experiencia": {
    "en": "Experience",
    "pt": "Experiência"
  },
  "Experiencia inmersiva": {
    "en": "Immersive experience",
    "pt": "Experiência imersiva"
  },
  "Museo": {
    "en": "Museum",
    "pt": "Museu"
  },
  "Comida": {
    "en": "Food",
    "pt": "Comida"
  },
  "Miradores": {
    "en": "Observation decks",
    "pt": "Mirantes"
  },
  "Museos": {
    "en": "Museums",
    "pt": "Museus"
  },
  "Noche": {
    "en": "Nightlife",
    "pt": "Vida noturna"
  },
  "Experiencias": {
    "en": "Experiences",
    "pt": "Experiências"
  },
  "Gastronomía": {
    "en": "Dining",
    "pt": "Gastronomia"
  },
  "Familia": {
    "en": "Family",
    "pt": "Família"
  },
  "Ahorros y descuentos": {
    "en": "Savings and discounts",
    "pt": "Economia e descontos"
  },
  "en atracciones, restaurantes y más.": {
    "en": "at attractions, restaurants and more.",
    "pt": "em atrações, restaurantes e muito mais."
  },
  "Experiencias exclusivas": {
    "en": "Exclusive experiences",
    "pt": "Experiências exclusivas"
  },
  "y giveaways.": {
    "en": "and giveaways.",
    "pt": "e sorteios."
  },
  "Alertas de eventos y pop-ups": {
    "en": "Event and pop-up alerts",
    "pt": "Alertas de eventos e pop-ups"
  },
  "antes que todos.": {
    "en": "before everyone else.",
    "pt": "antes de todo mundo."
  },
  "por tiempo limitado.": {
    "en": "for a limited time.",
    "pt": "por tempo limitado."
  },
  "creadas por expertos locales.": {
    "en": "created by local experts.",
    "pt": "criados por especialistas locais."
  },
  "Acceso anticipado": {
    "en": "Early access",
    "pt": "Acesso antecipado"
  },
  "a eventos y experiencias.": {
    "en": "to events and experiences.",
    "pt": "a eventos e experiências."
  },
  "Tus beneficios están activos. Descubre eventos, descuentos y experiencias para miembros.": {
    "en": "Your benefits are active. Discover member events, discounts and experiences.",
    "pt": "Seus benefícios estão ativos. Descubra eventos, descontos e experiências para membros."
  },
  "Descuentos, experiencias exclusivas, acceso anticipado y mucho más.": {
    "en": "Discounts, exclusive experiences, early access and much more.",
    "pt": "Descontos, experiências exclusivas, acesso antecipado e muito mais."
  },
  "VER MIS BENEFICIOS": {
    "en": "VIEW MY BENEFITS",
    "pt": "VER MEUS BENEFÍCIOS"
  },
  "UNIRME AL CLUB": {
    "en": "JOIN THE CLUB",
    "pt": "ENTRAR PARA O CLUBE"
  },
  "Top de hoy": {
    "en": "Today's top picks",
    "pt": "Destaques de hoje"
  },
  "NY al día": {
    "en": "NY news",
    "pt": "Notícias de NY"
  },
  "¿Qué hacer en NY?": {
    "en": "Things to do in NY",
    "pt": "O que fazer em NY?"
  },
  "Rutas, miradores, museos, rooftops y planes gratis para organizar tu viaje.": {
    "en": "Routes, observation decks, museums, rooftops and free activities for your trip.",
    "pt": "Roteiros, mirantes, museus, rooftops e passeios gratuitos para sua viagem."
  },
  "Todavía no hay publicaciones en esta sección.": {
    "en": "There are no posts in this section yet.",
    "pt": "Ainda não há publicações nesta seção."
  },
  "No se pudo cargar el contenido.": {
    "en": "Could not load the content.",
    "pt": "Não foi possível carregar o conteúdo."
  },
  "No se pudo cargar la nota.": {
    "en": "Could not load the article.",
    "pt": "Não foi possível carregar a notícia."
  },
  "Descubre lugares, experiencias y secretos de Nueva York.": {
    "en": "Discover New York's places, experiences and hidden gems.",
    "pt": "Descubra lugares, experiências e segredos de Nova York."
  },
  "Destacada de la semana": {
    "en": "This week's featured guide",
    "pt": "Destaque da semana"
  },
  "DESTACADA": {
    "en": "FEATURED",
    "pt": "DESTAQUE"
  },
  "Los mejores rooftops de NYC": {
    "en": "NYC's best rooftops",
    "pt": "Os melhores rooftops de NYC"
  },
  "12 lugares con vistas increíbles": {
    "en": "12 places with incredible views",
    "pt": "12 lugares com vistas incríveis"
  },
  "Broadway para principiantes": {
    "en": "Broadway for beginners",
    "pt": "Broadway para iniciantes"
  },
  "Cómo conseguir entradas baratas": {
    "en": "How to find affordable tickets",
    "pt": "Como encontrar ingressos baratos"
  },
  "Miradores imprescindibles": {
    "en": "Must-visit observation decks",
    "pt": "Mirantes imperdíveis"
  },
  "Top 10 vistas de Manhattan": {
    "en": "Top 10 views of Manhattan",
    "pt": "As 10 melhores vistas de Manhattan"
  },
  "Dónde comer bien y barato": {
    "en": "Great food on a budget",
    "pt": "Onde comer bem e barato"
  },
  "Restaurantes favoritos locales": {
    "en": "Local favorite restaurants",
    "pt": "Restaurantes favoritos dos moradores"
  },
  "Museos que debes visitar": {
    "en": "Must-visit museums",
    "pt": "Museus que você deve visitar"
  },
  "Arte, historia y cultura": {
    "en": "Art, history and culture",
    "pt": "Arte, história e cultura"
  },
  "Los mejores lugares para fotos": {
    "en": "The best photo spots",
    "pt": "Os melhores lugares para fotos"
  },
  "Instagram spots en NYC": {
    "en": "Instagram spots in NYC",
    "pt": "Lugares para Instagram em NYC"
  },
  "50 cosas gratis para hacer en NYC": {
    "en": "50 free things to do in NYC",
    "pt": "50 coisas grátis para fazer em NYC"
  },
  "Museos, parques, miradores y experiencias sin gastar dinero.": {
    "en": "Museums, parks, viewpoints and experiences without spending a dime.",
    "pt": "Museus, parques, mirantes e experiências sem gastar dinheiro."
  },
  "Noticias, alertas y lo más importante para estar al día en Nueva York.": {
    "en": "News, alerts and essential updates from New York.",
    "pt": "Notícias, alertas e novidades importantes de Nova York."
  },
  "NUEVA YORK AL DÍA": {
    "en": "NEW YORK NEWS",
    "pt": "NOTÍCIAS DE NOVA YORK"
  },
  "Últimas noticias": {
    "en": "Latest news",
    "pt": "Últimas notícias"
  },
  "Planes, eventos y experiencias para vivir Nueva York con intención.": {
    "en": "Activities, events and experiences to make the most of New York.",
    "pt": "Passeios, eventos e experiências para aproveitar Nova York."
  },
  "QUE HACER EN NY": {
    "en": "THINGS TO DO IN NY",
    "pt": "O QUE FAZER EM NY"
  },
  "Últimos planes": {
    "en": "Latest things to do",
    "pt": "Últimos passeios"
  },
  "Reintentar": {
    "en": "Try again",
    "pt": "Tentar novamente"
  },
  "Nota": {
    "en": "Article",
    "pt": "Notícia"
  },
  "NUEVA YORK AHORA": {
    "en": "NEW YORK NOW",
    "pt": "NOVA YORK AGORA"
  },
  "Clima de hoy": {
    "en": "Today's weather",
    "pt": "Clima de hoje"
  },
  "Vista de Nueva York con el clima actual": {
    "en": "New York with the current weather",
    "pt": "Vista de Nova York com o clima atual"
  },
  "Cargando clima actual": {
    "en": "Loading current weather",
    "pt": "Carregando o clima atual"
  },
  "No pudimos actualizar el clima.": {
    "en": "We couldn't update the weather.",
    "pt": "Não foi possível atualizar o clima."
  },
  "REINTENTAR": {
    "en": "TRY AGAIN",
    "pt": "TENTAR NOVAMENTE"
  },
  "Sensación": {
    "en": "Feels like",
    "pt": "Sensação"
  },
  "Humedad": {
    "en": "Humidity",
    "pt": "Umidade"
  },
  "Viento": {
    "en": "Wind",
    "pt": "Vento"
  },
  "Datos meteorológicos: Open-Meteo": {
    "en": "Weather data: Open-Meteo",
    "pt": "Dados meteorológicos: Open-Meteo"
  },
  "Cielo despejado": {
    "en": "Clear skies",
    "pt": "Céu limpo"
  },
  "Parcialmente nublado": {
    "en": "Partly cloudy",
    "pt": "Parcialmente nublado"
  },
  "Niebla": {
    "en": "Fog",
    "pt": "Nevoeiro"
  },
  "Llovizna": {
    "en": "Drizzle",
    "pt": "Garoa"
  },
  "Lluvia": {
    "en": "Rain",
    "pt": "Chuva"
  },
  "Nieve": {
    "en": "Snow",
    "pt": "Neve"
  },
  "Chubascos": {
    "en": "Rain showers",
    "pt": "Pancadas de chuva"
  },
  "Nieve intermitente": {
    "en": "Snow showers",
    "pt": "Pancadas de neve"
  },
  "Tormentas": {
    "en": "Thunderstorms",
    "pt": "Tempestades"
  },
  "Condiciones variables": {
    "en": "Variable conditions",
    "pt": "Condições variáveis"
  },
  "¡Bienvenido al Club!": {
    "en": "Welcome to the Club!",
    "pt": "Bem-vindo ao Clube!"
  },
  "Tu membresía está activa. Ya puedes explorar todo el contenido exclusivo.": {
    "en": "Your membership is active. Explore all the exclusive content.",
    "pt": "Sua assinatura está ativa. Explore todo o conteúdo exclusivo."
  },
  "Recibimos tu pago y estamos preparando tu contenido exclusivo.": {
    "en": "We received your payment and are preparing your exclusive content.",
    "pt": "Recebemos seu pagamento e estamos preparando seu conteúdo exclusivo."
  },
  "VER CONTENIDO ITC CLUB": {
    "en": "EXPLORE ITC CLUB",
    "pt": "VER CONTEÚDO ITC CLUB"
  },
  "Completa tus datos para unirte al club.": {
    "en": "Complete your details to join the club.",
    "pt": "Preencha seus dados para entrar no clube."
  },
  "INFORMACIÓN PERSONAL": {
    "en": "PERSONAL INFORMATION",
    "pt": "INFORMAÇÕES PESSOAIS"
  },
  "Nombre completo": {
    "en": "Full name",
    "pt": "Nome completo"
  },
  "Correo electrónico": {
    "en": "Email address",
    "pt": "E-mail"
  },
  "Teléfono": {
    "en": "Phone number",
    "pt": "Telefone"
  },
  "Ciudad": {
    "en": "City",
    "pt": "Cidade"
  },
  "MÉTODO DE PAGO": {
    "en": "PAYMENT METHOD",
    "pt": "FORMA DE PAGAMENTO"
  },
  "PLAN": {
    "en": "PLAN",
    "pt": "PLANO"
  },
  "$4.99 / mes": {
    "en": "$4.99 / month",
    "pt": "$4.99 / mês"
  },
  "Pago seguro activado": {
    "en": "Secure payment enabled",
    "pt": "Pagamento seguro ativado"
  },
  "Pago seguro con Stripe": {
    "en": "Secure payment with Stripe",
    "pt": "Pagamento seguro com Stripe"
  },
  "Serás redirigido a una página segura donde podrás pagar con tarjeta, Apple Pay o Google Pay. No almacenamos información de pago en la app.": {
    "en": "You'll be redirected to a secure page to pay by card, Apple Pay or Google Pay. We don't store payment details in the app.",
    "pt": "Você será redirecionado a uma página segura para pagar com cartão, Apple Pay ou Google Pay. Não armazenamos dados de pagamento no app."
  },
  "Acceso a beneficios exclusivos, descuentos y experiencias especiales.": {
    "en": "Access exclusive benefits, discounts and special experiences.",
    "pt": "Acesse benefícios exclusivos, descontos e experiências especiais."
  },
  "PROCESANDO...": {
    "en": "PROCESSING...",
    "pt": "PROCESSANDO..."
  },
  "CONTINUAR AL PAGO": {
    "en": "CONTINUE TO PAYMENT",
    "pt": "CONTINUAR PARA O PAGAMENTO"
  },
  "Pago seguro procesado por Stripe. Puedes cancelar en cualquier momento.": {
    "en": "Secure payment processed by Stripe. Cancel anytime.",
    "pt": "Pagamento seguro processado pelo Stripe. Cancele quando quiser."
  },
  "Inicia sesión": {
    "en": "Sign in",
    "pt": "Entrar"
  },
  "Iniciar sesión": {
    "en": "Sign in",
    "pt": "Entrar"
  },
  "Necesitas una cuenta para activar tu membresía.": {
    "en": "You need an account to activate your membership.",
    "pt": "Você precisa de uma conta para ativar sua assinatura."
  },
  "Campos incompletos": {
    "en": "Missing information",
    "pt": "Campos incompletos"
  },
  "Por favor completa todos los campos antes de continuar.": {
    "en": "Please complete all fields before continuing.",
    "pt": "Preencha todos os campos antes de continuar."
  },
  "Email inválido": {
    "en": "Invalid email",
    "pt": "E-mail inválido"
  },
  "Por favor ingresa un correo electrónico válido.": {
    "en": "Please enter a valid email address.",
    "pt": "Digite um e-mail válido."
  },
  "No se pudo generar el link de pago. Intenta de nuevo.": {
    "en": "Could not create the payment link. Try again.",
    "pt": "Não foi possível criar o link de pagamento. Tente novamente."
  },
  "Error de conexión": {
    "en": "Connection error",
    "pt": "Erro de conexão"
  },
  "Verifica tu conexión a internet e intenta de nuevo.": {
    "en": "Check your internet connection and try again.",
    "pt": "Verifique sua conexão e tente novamente."
  },
  "SESIÓN PROTEGIDA": {
    "en": "PROTECTED SESSION",
    "pt": "SESSÃO PROTEGIDA"
  },
  "Desbloquea Insight The City": {
    "en": "Unlock Insight The City",
    "pt": "Desbloqueie Insight The City"
  },
  "Confirma tu identidad con {biometric} para continuar donde estabas.": {
    "en": "Confirm your identity with {biometric} to pick up where you left off.",
    "pt": "Confirme sua identidade com {biometric} para continuar de onde parou."
  },
  "La biometría no está disponible. Ingresa nuevamente con tu contraseña.": {
    "en": "Biometrics are unavailable. Sign in again with your password.",
    "pt": "A biometria não está disponível. Entre novamente com sua senha."
  },
  "Ingresar con {biometric}": {
    "en": "Sign in with {biometric}",
    "pt": "Entrar com {biometric}"
  },
  "Usar correo y contraseña": {
    "en": "Use email and password",
    "pt": "Usar e-mail e senha"
  },
  "No se pudo desbloquear la sesión.": {
    "en": "Could not unlock the session.",
    "pt": "Não foi possível desbloquear a sessão."
  },
  "Abrir en Google Maps": {
    "en": "Open in Google Maps",
    "pt": "Abrir no Google Maps"
  },
  "Abrir en Waze": {
    "en": "Open in Waze",
    "pt": "Abrir no Waze"
  },
  "CONOCER MÁS": {
    "en": "LEARN MORE",
    "pt": "SAIBA MAIS"
  },
  "Hoy · 7:00 PM": {
    "en": "Today · 7:00 PM",
    "pt": "Hoje · 19:00"
  }
,
  "mes": {
    "en": "month",
    "pt": "mês"
  },
  "año": {
    "en": "year",
    "pt": "ano"
  },
  "semana": {
    "en": "week",
    "pt": "semana"
  },
  "día": {
    "en": "day",
    "pt": "dia"
  },
  "Renovación automática. Cancela cuando quieras.": {
    "en": "Renews automatically. Cancel anytime.",
    "pt": "Renovação automática. Cancele quando quiser."
  },
  "Ver todas las experiencias": {
    "en": "See all experiences",
    "pt": "Ver todas as experiências"
  },
  "Ver todos los drops": {
    "en": "See all drops",
    "pt": "Ver todos os drops"
  },
  "No se pudo abrir la gestión de la membresía.": {
    "en": "Could not open membership management.",
    "pt": "Não foi possível abrir o gerenciamento da assinatura."
  },
  "Aceptar y continuar": {
    "en": "Accept and continue",
    "pt": "Aceitar e continuar"
  },
  "Ahora no": {
    "en": "Not now",
    "pt": "Agora não"
  },
  "Ver Política de Privacidad": {
    "en": "View Privacy Policy",
    "pt": "Ver Política de Privacidade"
  },
  "Sin tu permiso, Yorki no envía nada. Puedes seguir usando el resto de la app.": {
    "en": "Without your permission, Yorki sends nothing. You can keep using the rest of the app.",
    "pt": "Sem sua permissão, o Yorki não envia nada. Você pode continuar usando o resto do app."
  },
  "Revisar aviso": {
    "en": "Review notice",
    "pt": "Revisar aviso"
  },
  "No se pudo guardar tu respuesta. Inténtalo de nuevo.": {
    "en": "Could not save your answer. Please try again.",
    "pt": "Não foi possível salvar sua resposta. Tente novamente."
  },
  "Chat con IA (Yorki)": {
    "en": "AI chat (Yorki)",
    "pt": "Chat com IA (Yorki)"
  },
  "Permitido": {
    "en": "Allowed",
    "pt": "Permitido"
  },
  "No permitido": {
    "en": "Not allowed",
    "pt": "Não permitido"
  },
  "Retirar permiso": {
    "en": "Withdraw permission",
    "pt": "Retirar permissão"
  },
  "Si retiras el permiso, Yorki deja de enviar datos a OpenAI y el chat no funcionará hasta que vuelvas a aceptarlo.": {
    "en": "If you withdraw permission, Yorki stops sending data to OpenAI and the chat will not work until you accept again.",
    "pt": "Se você retirar a permissão, o Yorki deixa de enviar dados à OpenAI e o chat não funcionará até você aceitar novamente."
  },
  "No se pudo retirar el permiso. Inténtalo de nuevo.": {
    "en": "Could not withdraw permission. Please try again.",
    "pt": "Não foi possível retirar a permissão. Tente novamente."
  },
  "Legal y privacidad": {
    "en": "Legal and privacy",
    "pt": "Jurídico e privacidade"
  },
  "Términos y Condiciones": {
    "en": "Terms and Conditions",
    "pt": "Termos e Condições"
  },
  "Política de Privacidad": {
    "en": "Privacy Policy",
    "pt": "Política de Privacidade"
  },
  "Términos de la membresía": {
    "en": "Membership terms",
    "pt": "Termos da assinatura"
  },
  "Accesibilidad": {
    "en": "Accessibility",
    "pt": "Acessibilidade"
  },
  "Eliminar cuenta": {
    "en": "Delete account",
    "pt": "Excluir conta"
  },
  "Cancelada · activa hasta el fin del período": {
    "en": "Canceled · active until the end of the period",
    "pt": "Cancelada · ativa até o fim do período"
  },
  "Pago pendiente": {
    "en": "Payment past due",
    "pt": "Pagamento pendente"
  },
  "Tu membresía y sus beneficios": {
    "en": "Your membership and benefits",
    "pt": "Sua assinatura e seus benefícios"
  },
  "Precio": {
    "en": "Price",
    "pt": "Preço"
  },
  "Renovación": {
    "en": "Renewal",
    "pt": "Renovação"
  },
  "Desactivada": {
    "en": "Off",
    "pt": "Desativada"
  },
  "Automática": {
    "en": "Automatic",
    "pt": "Automática"
  },
  "Acceso hasta": {
    "en": "Access until",
    "pt": "Acesso até"
  },
  "Próxima renovación": {
    "en": "Next renewal",
    "pt": "Próxima renovação"
  },
  "Tu membresía fue activada por el equipo de ITC Club y no tiene cobros asociados.": {
    "en": "Your membership was activated by the ITC Club team and has no charges.",
    "pt": "Sua assinatura foi ativada pela equipe ITC Club e não tem cobranças."
  },
  "No se te volverá a cobrar. Puedes reactivar la renovación desde Administrar membresía.": {
    "en": "You will not be charged again. You can turn renewal back on from Manage membership.",
    "pt": "Você não será cobrado novamente. Você pode reativar a renovação em Gerenciar assinatura."
  },
  "Tu membresía se renueva automáticamente hasta que la canceles. Si cancelas, conservas el acceso hasta el final del período pagado.": {
    "en": "Your membership renews automatically until you cancel. If you cancel, you keep access until the end of the paid period.",
    "pt": "Sua assinatura é renovada automaticamente até você cancelar. Se cancelar, você mantém o acesso até o fim do período pago."
  },
  "ADMINISTRAR O CANCELAR MEMBRESÍA": {
    "en": "MANAGE OR CANCEL MEMBERSHIP",
    "pt": "GERENCIAR OU CANCELAR ASSINATURA"
  },
  "Se abre el portal seguro de Stripe, donde puedes cancelar, cambiar tu tarjeta o ver tus recibos.": {
    "en": "Opens Stripe's secure portal, where you can cancel, change your card or view your receipts.",
    "pt": "Abre o portal seguro da Stripe, onde você pode cancelar, trocar o cartão ou ver seus recibos."
  },
  "No se pudo cargar el precio. Revisa tu conexión e inténtalo de nuevo.": {
    "en": "Could not load the price. Check your connection and try again.",
    "pt": "Não foi possível carregar o preço. Verifique sua conexão e tente novamente."
  },
  "No se completó el pago. No se te cobró nada.": {
    "en": "The payment was not completed. You were not charged.",
    "pt": "O pagamento não foi concluído. Nada foi cobrado."
  },
  "No se pudo iniciar el pago. Intenta de nuevo.": {
    "en": "Could not start the payment. Please try again.",
    "pt": "Não foi possível iniciar o pagamento. Tente novamente."
  },
  "Necesitas una cuenta": {
    "en": "You need an account",
    "pt": "Você precisa de uma conta"
  },
  "Crea una cuenta o inicia sesión para unirte a ITC Club. La membresía queda asociada a tu cuenta.": {
    "en": "Create an account or sign in to join ITC Club. The membership is linked to your account.",
    "pt": "Crie uma conta ou entre para assinar o ITC Club. A assinatura fica vinculada à sua conta."
  },
  "INICIAR SESIÓN": {
    "en": "SIGN IN",
    "pt": "ENTRAR"
  },
  "CREAR CUENTA": {
    "en": "CREATE ACCOUNT",
    "pt": "CRIAR CONTA"
  },
  "Ya eres miembro de ITC Club": {
    "en": "You are already an ITC Club member",
    "pt": "Você já é membro do ITC Club"
  },
  "Puedes ver o cancelar tu membresía en Perfil > Mi membresía.": {
    "en": "You can view or cancel your membership in Profile > My membership.",
    "pt": "Você pode ver ou cancelar sua assinatura em Perfil > Minha assinatura."
  },
  "IR A MI PERFIL": {
    "en": "GO TO MY PROFILE",
    "pt": "IR PARA MEU PERFIL"
  },
  "Cargando…": {
    "en": "Loading…",
    "pt": "Carregando…"
  },
  "TU CUENTA": {
    "en": "YOUR ACCOUNT",
    "pt": "SUA CONTA"
  },
  "La membresía se asociará a tu cuenta:": {
    "en": "The membership will be linked to your account:",
    "pt": "A assinatura será vinculada à sua conta:"
  },
  "Pagarás en la página segura de Stripe con tarjeta, Apple Pay o Google Pay. No guardamos los datos de tu tarjeta.": {
    "en": "You will pay on Stripe's secure page with a card, Apple Pay or Google Pay. We do not store your card details.",
    "pt": "Você pagará na página segura da Stripe com cartão, Apple Pay ou Google Pay. Não guardamos os dados do seu cartão."
  },
  "Renovación automática": {
    "en": "Automatic renewal",
    "pt": "Renovação automática"
  },
  "Se te cobrarán {price} hoy y luego cada {period}, de forma automática, hasta que canceles.": {
    "en": "You will be charged {price} today and then every {period}, automatically, until you cancel.",
    "pt": "Você será cobrado {price} hoje e depois a cada {period}, automaticamente, até cancelar."
  },
  "Puedes cancelar cuando quieras en Perfil > Mi membresía. La cancelación aplica al final del período pagado y conservas el acceso hasta entonces.": {
    "en": "You can cancel anytime in Profile > My membership. Cancellation takes effect at the end of the paid period and you keep access until then.",
    "pt": "Você pode cancelar quando quiser em Perfil > Minha assinatura. O cancelamento vale ao fim do período pago e você mantém o acesso até lá."
  },
  "Leer los Términos de la membresía": {
    "en": "Read the membership terms",
    "pt": "Ler os termos da assinatura"
  },
  "Acepto que mi membresía se renueve automáticamente por {price} cada {period} hasta que la cancele, y acepto los Términos de la membresía.": {
    "en": "I agree that my membership renews automatically at {price} every {period} until I cancel, and I accept the membership terms.",
    "pt": "Concordo que minha assinatura seja renovada automaticamente por {price} a cada {period} até eu cancelar, e aceito os termos da assinatura."
  },
  "SUSCRIBIRME POR {price} / {period}": {
    "en": "SUBSCRIBE FOR {price} / {period}",
    "pt": "ASSINAR POR {price} / {period}"
  },
  "No se pudo eliminar la cuenta.": {
    "en": "Could not delete the account.",
    "pt": "Não foi possível excluir a conta."
  },
  "Esta acción es permanente y no se puede deshacer.": {
    "en": "This action is permanent and cannot be undone.",
    "pt": "Esta ação é permanente e não pode ser desfeita."
  },
  "Al eliminar tu cuenta:": {
    "en": "When you delete your account:",
    "pt": "Ao excluir sua conta:"
  },
  "Borramos tu perfil, tu foto, tus mensajes del chat y tus códigos de beneficios.": {
    "en": "We delete your profile, photo, chat messages and benefit codes.",
    "pt": "Excluímos seu perfil, sua foto, suas mensagens do chat e seus códigos de benefícios."
  },
  "Si tienes una membresía ITC Club, la cancelamos de inmediato y no se te volverá a cobrar.": {
    "en": "If you have an ITC Club membership, we cancel it immediately and you will not be charged again.",
    "pt": "Se você tiver uma assinatura ITC Club, nós a cancelamos imediatamente e você não será cobrado novamente."
  },
  "Stripe puede conservar el registro de tus pagos por obligaciones legales y fiscales.": {
    "en": "Stripe may keep records of your payments for legal and tax obligations.",
    "pt": "A Stripe pode manter o registro dos seus pagamentos por obrigações legais e fiscais."
  },
  "Cuenta: {email}": {
    "en": "Account: {email}",
    "pt": "Conta: {email}"
  },
  "Confirma tu contraseña": {
    "en": "Confirm your password",
    "pt": "Confirme sua senha"
  },
  "Entiendo que mi cuenta y mis datos se eliminarán de forma permanente.": {
    "en": "I understand that my account and data will be permanently deleted.",
    "pt": "Entendo que minha conta e meus dados serão excluídos permanentemente."
  },
  "ELIMINAR MI CUENTA": {
    "en": "DELETE MY ACCOUNT",
    "pt": "EXCLUIR MINHA CONTA"
  },
  "OBTENER BENEFICIO": {
    "en": "GET BENEFIT",
    "pt": "OBTER BENEFÍCIO"
  },
  "No se pudo generar el código.": {
    "en": "Could not generate the code.",
    "pt": "Não foi possível gerar o código."
  },
  "Solo para mayores de 21 años. El comercio puede pedirte una identificación. Bebe con responsabilidad.": {
    "en": "21+ only. The venue may ask for ID. Please drink responsibly.",
    "pt": "Somente para maiores de 21 anos. O estabelecimento pode pedir um documento. Beba com responsabilidade."
  },
  "Suscríbete para desbloquear": {
    "en": "Subscribe to unlock",
    "pt": "Assine para desbloquear"
  },
  "Genera un código QR válido durante 24 horas": {
    "en": "Generates a QR code valid for 24 hours",
    "pt": "Gera um código QR válido por 24 horas"
  },
  "Abre un sitio externo": {
    "en": "Opens an external site",
    "pt": "Abre um site externo"
  },
  "AGOTADO": {
    "en": "SOLD OUT",
    "pt": "ESGOTADO"
  },
  "NO DISPONIBLE": {
    "en": "UNAVAILABLE",
    "pt": "INDISPONÍVEL"
  },
  "Cerrar código QR": {
    "en": "Close QR code",
    "pt": "Fechar código QR"
  },
  "Tu beneficio está listo": {
    "en": "Your benefit is ready",
    "pt": "Seu benefício está pronto"
  },
  "Código QR para canjear el beneficio": {
    "en": "QR code to redeem the benefit",
    "pt": "Código QR para resgatar o benefício"
  },
  "Muestra este código al personal para validar el beneficio.": {
    "en": "Show this code to the staff to validate the benefit.",
    "pt": "Mostre este código à equipe para validar o benefício."
  },
  "Válido por 24 horas · un solo uso": {
    "en": "Valid for 24 hours · single use",
    "pt": "Válido por 24 horas · uso único"
  },
  "LISTO": {
    "en": "DONE",
    "pt": "PRONTO"
  },
  "Compra confirmada": {
    "en": "Purchase confirmed",
    "pt": "Compra confirmada"
  },
  "No se pudo iniciar la compra.": {
    "en": "Could not start the purchase.",
    "pt": "Não foi possível iniciar a compra."
  },
  "COMPRADA": {
    "en": "PURCHASED",
    "pt": "COMPRADO"
  },
  "Obtener con ITC Club": {
    "en": "Get with ITC Club",
    "pt": "Obter com ITC Club"
  },
  "OBTENER CON ITC CLUB": {
    "en": "GET WITH ITC CLUB",
    "pt": "OBTER COM ITC CLUB"
  },
  "No se pudo cargar el documento. Revisa tu conexión e inténtalo de nuevo.": {
    "en": "Could not load the document. Check your connection and try again.",
    "pt": "Não foi possível carregar o documento. Verifique sua conexão e tente novamente."
  },
  "Última actualización: {date}": {
    "en": "Last updated: {date}",
    "pt": "Última atualização: {date}"
  },
  "Para crear tu cuenta debes aceptar los Términos y la Política de Privacidad.": {
    "en": "To create your account you must accept the Terms and the Privacy Policy.",
    "pt": "Para criar sua conta, você deve aceitar os Termos e a Política de Privacidade."
  },
  "Tengo 18 años o más y acepto los Términos y Condiciones y la Política de Privacidad de ITC Club.": {
    "en": "I am 18 or older and I accept the ITC Club Terms and Conditions and Privacy Policy.",
    "pt": "Tenho 18 anos ou mais e aceito os Termos e Condições e a Política de Privacidade do ITC Club."
  },
  "Leer Términos y Condiciones": {
    "en": "Read Terms and Conditions",
    "pt": "Ler Termos e Condições"
  },
  "Leer Política de Privacidad": {
    "en": "Read Privacy Policy",
    "pt": "Ler Política de Privacidade"
  },
  "Confirmando tu pago con Stripe…": {
    "en": "Confirming your payment with Stripe…",
    "pt": "Confirmando seu pagamento com a Stripe…"
  },
  "Estamos confirmando tu pago": {
    "en": "We are confirming your payment",
    "pt": "Estamos confirmando seu pagamento"
  },
  "Tu membresía está activa. Te enviamos un correo con los términos de renovación y cómo cancelar.": {
    "en": "Your membership is active. We emailed you the renewal terms and how to cancel.",
    "pt": "Sua assinatura está ativa. Enviamos um e-mail com os termos de renovação e como cancelar."
  },
  "Tu pago aún no aparece como confirmado. Si se completó, tu membresía se activará en unos minutos; revisa Perfil > Mi membresía.": {
    "en": "Your payment is not confirmed yet. If it went through, your membership will activate in a few minutes; check Profile > My membership.",
    "pt": "Seu pagamento ainda não aparece como confirmado. Se foi concluído, sua assinatura será ativada em alguns minutos; confira Perfil > Minha assinatura."
  },
  "Al usar ITC Club aceptas nuestros Términos y Condiciones y nuestra Política de Privacidad.": {
    "en": "By using ITC Club you agree to our Terms and Conditions and Privacy Policy.",
    "pt": "Ao usar o ITC Club, você aceita nossos Termos e Condições e nossa Política de Privacidade."
  }
} as const;

export function translateUi(language: AppLanguage, source: string, params?: Record<string, string | number>): string {
  const entry = UI_TRANSLATIONS[source as keyof typeof UI_TRANSLATIONS];
  let value: string = language === 'es' ? source : entry?.[language] ?? source;
  for (const [key, replacement] of Object.entries(params ?? {})) value = value.replaceAll(`{${key}}`, String(replacement));
  return value;
}

// Translate known category labels without changing the canonical values used by filters or the API.
export function translateTag(language: AppLanguage, source: string): string {
  const key = Object.keys(UI_TRANSLATIONS).find((key) => key.toLocaleLowerCase() === source.toLocaleLowerCase());
  return key ? translateUi(language, key) : source;
}
