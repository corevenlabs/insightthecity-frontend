// Source-language keys keep existing Spanish copy intact. Unknown editorial text is preserved.
export type AppLanguage = 'es' | 'en' | 'pt';
export const LANGUAGE_NAMES: Record<AppLanguage, string> = { es: 'Español', en: 'English', pt: 'Português' };
export const UI_TRANSLATIONS = {
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
  "Guía turística": {
    "en": "City guide",
    "pt": "Guia turístico"
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
  "Guías especiales": {
    "en": "Special guides",
    "pt": "Guias especiais"
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
  "GUÍA TURÍSTICA": {
    "en": "CITY GUIDE",
    "pt": "GUIA TURÍSTICO"
  },
  "Guías para vivir NYC como local": {
    "en": "Experience NYC like a local",
    "pt": "Viva NYC como um morador local"
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
  "GUÍAS NYC": {
    "en": "NYC GUIDES",
    "pt": "GUIAS NYC"
  },
  "Descubre lugares, experiencias y secretos de Nueva York.": {
    "en": "Discover New York's places, experiences and hidden gems.",
    "pt": "Descubra lugares, experiências e segredos de Nova York."
  },
  "Buscar guía...": {
    "en": "Search guides...",
    "pt": "Buscar guia..."
  },
  "Destacada de la semana": {
    "en": "This week's featured guide",
    "pt": "Destaque da semana"
  },
  "DESTACADA": {
    "en": "FEATURED",
    "pt": "DESTAQUE"
  },
  "Más guías": {
    "en": "More guides",
    "pt": "Mais guias"
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
  "NYC & NJ GUIDE": {
    "en": "NYC & NJ GUIDE",
    "pt": "GUIA NYC & NJ"
  },
  "Hoy · 7:00 PM": {
    "en": "Today · 7:00 PM",
    "pt": "Hoje · 19:00"
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
