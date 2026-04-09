// Netlify Function — Send TBF Lead to team email
// Receives confirmed lead from Sand AI and emails info@thailandboatfestival.com

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    let lead = {};
    try { lead = JSON.parse(event.body); } catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
    const { name = '', email = '', company = '', interest = '', note = '' } = lead;
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
    console.log('[TBF LEAD]', JSON.stringify({ timestamp, name, email, company, interest, note }));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}
