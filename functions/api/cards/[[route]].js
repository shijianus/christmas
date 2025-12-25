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
      const newCard = {
        id: Date.now().toString(),
        message: data.message || '',
        image: data.image || null,
        author: data.author || '匿名',
        language: data.language || 'unknown',
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

        if (cardArray.length === 0) {
          return new Response(JSON.stringify({ error: 'No cards available' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Random selection
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
