// Cloudflare Worker for Christmas Tree Blessings API

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET: Retrieve a random blessing or wish
      if (path === '/api/random') {
        const type = url.searchParams.get('type') || null; // 'blessing' or 'wish' or null for both
        const excludeBuiltin = url.searchParams.get('excludeBuiltin') === 'true';

        let query = 'SELECT * FROM blessings';
        const conditions = [];
        const params = [];

        if (type) {
          conditions.push('type = ?');
          params.push(type);
        }
        if (excludeBuiltin) {
          conditions.push('is_builtin = 0');
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY RANDOM() LIMIT 1';

        const stmt = env.DB.prepare(query);
        const result = await stmt.bind(...params).first();

        if (!result) {
          return new Response(JSON.stringify({ error: 'No messages found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET: Get statistics
      if (path === '/api/stats') {
        const totalBlessings = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM blessings'
        ).first();

        const totalWishes = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM blessings WHERE type = ?'
        ).bind('wish').first();

        const userMessages = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM blessings WHERE is_builtin = 0'
        ).first();

        return new Response(JSON.stringify({
          total: totalBlessings.count,
          wishes: totalWishes.count,
          blessings: totalBlessings.count - totalWishes.count,
          userMessages: userMessages.count
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET: Get recent messages
      if (path === '/api/recent') {
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const messages = await env.DB.prepare(
          'SELECT * FROM blessings ORDER BY created_at DESC LIMIT ?'
        ).bind(limit).all();

        return new Response(JSON.stringify(messages.results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST: Submit a new blessing or wish
      if (path === '/api/submit') {
        const data = await request.json();
        const { type, content, language, country, authorName, isAnonymous } = data;

        if (!type || !content) {
          return new Response(JSON.stringify({ error: 'Type and content are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!['blessing', 'wish'].includes(type)) {
          return new Response(JSON.stringify({ error: 'Type must be blessing or wish' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await env.DB.prepare(
          'INSERT INTO blessings (type, content, language, country, author_name, is_anonymous, is_builtin) VALUES (?, ?, ?, ?, ?, ?, 0)'
        ).bind(type, content, language || 'en', country || null, authorName || null, isAnonymous ? 1 : 0).run();

        // Get the inserted message
        const newMessage = await env.DB.prepare(
          'SELECT * FROM blessings WHERE id = ?'
        ).bind(result.meta.last_row_id).first();

        return new Response(JSON.stringify(newMessage), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET: Exchange message (submit and get one back)
      if (path === '/api/exchange') {
        const data = await request.json();
        const { type, content, language, country, authorName, isAnonymous } = data;

        if (!type || !content) {
          return new Response(JSON.stringify({ error: 'Type and content are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Insert the new message
        await env.DB.prepare(
          'INSERT INTO blessings (type, content, language, country, author_name, is_anonymous, is_builtin) VALUES (?, ?, ?, ?, ?, ?, 0)'
        ).bind(type, content, language || 'en', country || null, authorName || null, isAnonymous ? 1 : 0).run();

        // Get a random message from someone else (excluding builtin)
        const randomMessage = await env.DB.prepare(
          'SELECT * FROM blessings WHERE is_builtin = 0 AND id NOT IN (SELECT id FROM blessings ORDER BY id DESC LIMIT 1) ORDER BY RANDOM() LIMIT 1'
        ).first();

        // If no user messages yet, get a builtin one
        const exchangeMessage = randomMessage || await env.DB.prepare(
          'SELECT * FROM blessings WHERE is_builtin = 1 ORDER BY RANDOM() LIMIT 1'
        ).first();

        return new Response(JSON.stringify({
          submitted: true,
          exchangeMessage: exchangeMessage
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
