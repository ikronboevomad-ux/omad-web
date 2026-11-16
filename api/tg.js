// Вебхук бота @omadweb_bot: клиент пишет → сообщение Омаду; Омад отвечает реплаем → ответ клиенту.
const { tg, esc } = require('./_tg');
const OWNER = () => Number(process.env.OWNER_CHAT);

module.exports = async (req, res) => {
  if (req.method !== 'POST' || req.headers['x-telegram-bot-api-secret-token'] !== process.env.WEBHOOK_SECRET) {
    return res.status(403).send('no');
  }
  try {
    const m = req.body && req.body.message;
    if (!m || m.chat.type !== 'private') return res.status(200).send('ok');
    const chat = m.chat.id;

    if (chat === OWNER()) {
      const ref = m.reply_to_message;
      const src = ref && (ref.text || ref.caption || '');
      const id = src && (src.match(/#id(\d+)/) || [])[1];
      if (id) {
        const r = await tg('copyMessage', { chat_id: Number(id), from_chat_id: chat, message_id: m.message_id });
        await tg('sendMessage', { chat_id: chat, reply_to_message_id: m.message_id,
          text: r.ok ? '✅ Отправлено клиенту' : '⚠️ Не доставлено: ' + (r.description || 'ошибка') });
      } else {
        await tg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text:
          '👋 Это твой бот для клиентов.\n\nСюда приходят сообщения клиентов и заявки с сайта.\nЧтобы ответить клиенту, <b>свайпни его сообщение → «Ответить»</b> и напиши текст. Бот перешлёт ответ.' });
      }
      return res.status(200).send('ok');
    }

    // клиент
    const u = m.from || {};
    const who = `${esc([u.first_name, u.last_name].filter(Boolean).join(' ') || 'Клиент')}${u.username ? ' (@' + esc(u.username) + ')' : ''}`;
    const head = `💬 <b>${who}</b>  #id${chat}`;

    if (m.text && m.text.startsWith('/start')) {
      await tg('sendMessage', { chat_id: chat, text:
        'Здравствуйте! 👋 Это Omad Web — делаю сайты для бизнеса.\n\nНапишите, чем вы занимаетесь и какой сайт нужен. Я отвечу лично в ближайшее время.' });
      await tg('sendMessage', { chat_id: OWNER(), parse_mode: 'HTML', text: `${head}\nоткрыл бота 👀 (ещё ничего не написал)` });
    } else if (m.text) {
      await tg('sendMessage', { chat_id: OWNER(), parse_mode: 'HTML', text: `${head}\n\n${esc(m.text)}` });
    } else {
      await tg('copyMessage', { chat_id: OWNER(), from_chat_id: chat, message_id: m.message_id, parse_mode: 'HTML',
        caption: `${head}${m.caption ? '\n\n' + esc(m.caption) : ''}` });
    }
  } catch (e) { console.error(e); }
  res.status(200).send('ok');
};
