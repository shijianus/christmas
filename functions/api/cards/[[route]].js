// Builtin virtual cards for new users
const BUILTIN_CARDS = [
  {
    id: 'builtin_1',
    message: 'Merry Christmas! Wishing you joy and happiness this holiday season!',
    image: null,
    author: 'Santa Claus 🎅',
    language: 'en-US',
    country: 'US',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_2',
    message: '圣诞快乐！愿你度过一个温馨快乐的圣诞节！',
    image: null,
    author: '圣诞老人 🎄',
    language: 'zh-CN',
    country: 'CN',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_3',
    message: 'Joyeux Noël! Que la magie de Noël illumine votre foyer!',
    image: null,
    author: 'Père Noël 🎅',
    language: 'fr-FR',
    country: 'FR',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_4',
    message: 'Frohe Weihnachten! Frieden und Freude für Sie und Ihre Familie!',
    image: null,
    author: 'Weihnachtsmann 🎄',
    language: 'de-DE',
    country: 'DE',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_5',
    message: 'メリークリスマス！素敵な休暇をお過ごしください！',
    image: null,
    author: 'サンタクロース 🎅',
    language: 'ja-JP',
    country: 'JP',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_6',
    message: '¡Feliz Navidad! ¡Que disfrutes de unas fiestas maravillosas!',
    image: null,
    author: 'Santa Claus 🎅',
    language: 'es-ES',
    country: 'ES',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_7',
    message: 'Buon Natale! Auguri per un periodo festivo pieno di gioia!',
    image: null,
    author: 'Babbo Natale 🎅',
    language: 'it-IT',
    country: 'IT',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_8',
    message: '메리 크리스마스! 행복한 연말 보내세요!',
    image: null,
    author: '산타클로스 🎅',
    language: 'ko-KR',
    country: 'KR',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_9',
    message: 'Веселого Рождества! Пусть праздник принесет радость и счастье!',
    image: null,
    author: 'Дед Мороз 🎅',
    language: 'ru-RU',
    country: 'RU',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  },
  {
    id: 'builtin_10',
    message: 'God Jul! Önskar dig en fridfull och joyfull julhelg!',
    image: null,
    author: 'Tomten 🎅',
    language: 'sv-SE',
    country: 'SE',
    timestamp: '2024-12-25T00:00:00.000Z',
    type: 'card',
    isBuiltin: true
  }
];

// API endpoint for managing Christmas cards
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // POST - Create new card
    if (request.method === 'POST') {
      const data = await request.json();

      // Extract country from Cloudflare request data
      const cf = request.cf || {};
      const country = cf.country || data.language || 'unknown';

      const newCard = {
        id: Date.now().toString(),
        message: data.message || '',
        image: data.image || null,
        author: data.author || '匿名',
        language: data.language || country,
        country: country,
        timestamp: new Date().toISOString(),
        type: 'card'
      };

      // Get existing cards
      const cardsData = await env.CHRISTMAS_KV.get('christmas_cards', { type: 'json' }) || [];
      let cards = Array.isArray(cardsData) ? cardsData : [];

      // Add new card
      cards.push(newCard);

      // Keep only last 1000 cards
      if (cards.length > 1000) {
        cards = cards.slice(-1000);
      }

      // Save to KV
      await env.CHRISTMAS_KV.put('christmas_cards', JSON.stringify(cards));

      return new Response(JSON.stringify({ success: true, card: newCard }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET - Retrieve all cards or stats
    if (request.method === 'GET') {
      const path = url.pathname;

      // GET /api/cards/stats
      if (path.includes('/stats')) {
        const cards = await env.CHRISTMAS_KV.get('christmas_cards', { type: 'json' }) || [];
        const cardArray = Array.isArray(cards) ? cards : [];

        // Count cards by language
        const languages = {};
        const today = new Date().toISOString().split('T')[0];
        let todayCount = 0;

        cardArray.forEach(card => {
          // Count languages
          const lang = card.language || 'unknown';
          languages[lang] = (languages[lang] || 0) + 1;

          // Count today's cards
          if (card.timestamp && card.timestamp.startsWith(today)) {
            todayCount++;
          }
        });

        const stats = {
          totalCards: cardArray.length,
          todayCards: todayCount,
          languages: Object.keys(languages).length,
          byLanguage: languages
        };

        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET /api/cards/random
      if (path.includes('/random')) {
        const cards = await env.CHRISTMAS_KV.get('christmas_cards', { type: 'json' }) || [];
        const cardArray = Array.isArray(cards) ? cards : [];

        // If KV is empty, use builtin cards
        if (cardArray.length === 0) {
          const randomBuiltin = BUILTIN_CARDS[Math.floor(Math.random() * BUILTIN_CARDS.length)];
          return new Response(JSON.stringify(randomBuiltin), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // KV has cards, prioritize them (90% KV, 10% builtin for variety)
        const useBuiltin = Math.random() < 0.1;
        if (useBuiltin) {
          const randomBuiltin = BUILTIN_CARDS[Math.floor(Math.random() * BUILTIN_CARDS.length)];
          return new Response(JSON.stringify(randomBuiltin), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Random selection from KV
        const randomCard = cardArray[Math.floor(Math.random() * cardArray.length)];

        return new Response(JSON.stringify(randomCard), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET /api/cards - Get all cards
      const cards = await env.CHRISTMAS_KV.get('christmas_cards', { type: 'json' }) || [];
      return new Response(JSON.stringify(Array.isArray(cards) ? cards : []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Method not allowed
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
