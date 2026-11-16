// Заявка с формы на сайте → сообщение Омаду в бот.
const { tg, esc } = require('./_tg');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.website) return res.status(200).json({ ok: true }); // ловушка для спам-ботов
  const name = String(b.name || '').trim().slice(0, 80);
  const phone = String(b.phone || '').trim().slice(0, 40);
  const msg = String(b.msg || '').trim().slice(0, 1000);
  if (!name || phone.replace(/\D/g, '').length < 7) return res.status(400).json({ ok: false, error: 'Укажите имя и телефон' });
  const r = await tg('sendMessage', { chat_id: Number(process.env.OWNER_CHAT), parse_mode: 'HTML', text:
    `📩 <b>Заявка с сайта</b>\n\n👤 ${esc(name)}\n📞 ${esc(phone)}${msg ? '\n📝 ' + esc(msg) : ''}\n\nПозвони или напиши клиенту как можно скорее 🙌` });
  res.status(r.ok ? 200 : 500).json({ ok: !!r.ok });
};
