const API = () => `https://api.telegram.org/bot${process.env.BOT_TOKEN}/`;
async function tg(method, body) {
  const r = await fetch(API() + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}
const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
module.exports = { tg, esc };
