// ═══ رابط GitHub الخاص بك ═══
const GITHUB_URL = "https://raw.githubusercontent.com/sakrsalmi13/vpn-data/main/servers.json";

// ═══ المفتاح السري (نفس التطبيق) ═══
const SECRET_KEY = "MaxVip_Secure_2026";

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const ts = parseInt(url.searchParams.get('ts'));
  const token = url.searchParams.get('token') || '';
  
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  };
  
  // التحقق من الإجراء
  if (action !== 'get_max_app_data') {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Invalid action'
    }), { headers });
  }
  
  // التحقق من الوقت
  const currentTs = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTs - ts) > 600) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Token expired'
    }), { headers });
  }
  
  // التحقق من التوكن
  const data = SECRET_KEY + ts;
  let expectedToken = '';
  for (let i = 0; i < data.length; i++) {
    let byte = data.charCodeAt(i) & 0xff;
    byte = byte ^ 0x7;
    expectedToken += byte.toString(16).padStart(2, '0');
  }
  
  if (token !== expectedToken) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Invalid token'
    }), { headers });
  }
  
  // جلب البيانات من GitHub
  try {
    const ghResponse = await fetch(GITHUB_URL);
    
    if (!ghResponse.ok) {
      throw new Error('GitHub fetch failed: ' + ghResponse.status);
    }
    
    const ghData = await ghResponse.json();
    const version = ghData.version || 1.0;
    const servers = ghData.servers || [];
    
    const final = [{ version: version }, ...servers];
    const json = JSON.stringify(final);
    
    // Base64 × 2
    const utf8Bytes = new TextEncoder().encode(json);
    const base64_1 = btoa(String.fromCharCode(...utf8Bytes));
    const base64_2 = btoa(base64_1);
    
    return new Response(JSON.stringify({
      status: 'success',
      data: base64_2
    }), { headers });
    
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Fetch failed: ' + error.message
    }), { headers });
  }
}
