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
  },
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
  "Ver todas las guías": {
    "en": "See all guides",
    "pt": "Ver todos os guias"
  },
  "Descubre esta guía seleccionada por Insight The City.": {
    "en": "Discover this guide curated by Insight The City.",
    "pt": "Descubra este guia selecionado pela Insight The City."
  },
  "Abrir guías": {
    "en": "Open guides",
    "pt": "Abrir guias"
  },
  "Todavía no hay guías publicadas.": {
    "en": "No guides have been published yet.",
    "pt": "Ainda não há guias publicados."
  },
  "No se pudo abrir la gestión de la membresía.": {
    "en": "Could not open membership management.",
    "pt": "Não foi possível abrir o gerenciamento da assinatura."
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
  "Pierdes el acceso a las guías que compraste.": {
    "en": "You lose access to the guides you purchased.",
    "pt": "Você perde o acesso aos guias que comprou."
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
  "La guía ya está disponible en tu cuenta.": {
    "en": "The guide is now available in your account.",
    "pt": "O guia já está disponível na sua conta."
  },
  "No se pudo iniciar la compra.": {
    "en": "Could not start the purchase.",
    "pt": "Não foi possível iniciar a compra."
  },
  "Compra una guía individual o disfrútala incluida con tu membresía ITC Club.": {
    "en": "Buy a single guide or enjoy it included with your ITC Club membership.",
    "pt": "Compre um guia avulso ou aproveite-o incluído na sua assinatura ITC Club."
  },
  "Cargando guías": {
    "en": "Loading guides",
    "pt": "Carregando guias"
  },
  "COMPRADA": {
    "en": "PURCHASED",
    "pt": "COMPRADO"
  },
  "Descargar guía PDF": {
    "en": "Download PDF guide",
    "pt": "Baixar guia em PDF"
  },
  "DESCARGAR GUÍA PDF": {
    "en": "DOWNLOAD PDF GUIDE",
    "pt": "BAIXAR GUIA EM PDF"
  },
  "Comprar guía": {
    "en": "Buy guide",
    "pt": "Comprar guia"
  },
  "COMPRAR GUÍA": {
    "en": "BUY GUIDE",
    "pt": "COMPRAR GUIA"
  },
  "Obtener con ITC Club": {
    "en": "Get with ITC Club",
    "pt": "Obter com ITC Club"
  },
  "OBTENER CON ITC CLUB": {
    "en": "GET WITH ITC CLUB",
    "pt": "OBTER COM ITC CLUB"
  },
  "No hay guías disponibles.": {
    "en": "No guides available.",
    "pt": "Não há guias disponíveis."
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
