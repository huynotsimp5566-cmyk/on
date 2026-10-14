// Hàm chạy trên máy chủ Vercel (không chạy trong trình duyệt).
// Nhiệm vụ: nhận yêu cầu từ web, gọi Gemini bằng khóa bí mật, trả câu hỏi về.
// Khóa nằm trong Vercel > Settings > Environment Variables, không nằm trong code.

// Thử lần lượt các model này. Model nào bị Google ngừng thì tự chuyển sang model kế tiếp.
// Muốn ép dùng một model cụ thể: thêm biến GEMINI_MODEL trên Vercel.
const MODELS = [process.env.GEMINI_MODEL, 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'].filter(Boolean);
const ALLOWED_FILES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_BASE64_LENGTH = 4200000; // khoảng 3MB file gốc

const clamp = (n, min, max) => Math.max(min, Math.min(max, Math.floor(Number(n) || 0)));

function buildPrompt(subject, hasFile, mcq, tf) {
  const source = hasFile
    ? 'Hãy dựa vào tài liệu đính kèm để ra đề.' + (subject ? ' Môn: ' + subject + '.' : '')
    : 'Chủ đề: ' + subject + ', theo chương trình THPT Việt Nam.';
  return [
    'Bạn là giáo viên THPT ở Việt Nam, đang ra đề trắc nghiệm ôn thi.',
    source,
    'Hãy tạo đúng ' + mcq + ' câu trắc nghiệm 4 lựa chọn và đúng ' + tf + ' câu Đúng/Sai.',
    'Quy tắc:',
    '- Viết bằng tiếng Việt, rõ ràng, đúng kiến thức.',
    '- Mỗi câu trắc nghiệm chỉ có MỘT đáp án đúng; vị trí đáp án đúng phải phân bố ngẫu nhiên.',
    '- Phần giải thích ngắn gọn (1-2 câu).',
    '- Viết công thức dạng chữ đơn giản (ví dụ x^2, H2O), không dùng LaTeX.',
    '- Nếu tài liệu không đủ nội dung thì ra ít câu hơn, không được bịa kiến thức.',
    'Chỉ trả về JSON đúng dạng sau, không thêm chữ nào khác:',
    '{"mcq":[{"q":"câu hỏi","options":["A","B","C","D"],"answer":0,"explanation":"giải thích"}],' +
      '"tf":[{"q":"mệnh đề","answer":true,"explanation":"giải thích"}]}',
    '("answer" của mcq là số thứ tự 0-3 của đáp án đúng; "answer" của tf là true hoặc false.)',
  ].join('\n');
}

function parseQuiz(text, mcqWanted, tfWanted) {
  let clean = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  let obj;
  try { obj = JSON.parse(clean); } catch (e) { return null; }
  const str = (v) => typeof v === 'string' && v.trim().length > 0;

  const mcq = (Array.isArray(obj.mcq) ? obj.mcq : []).filter((x) =>
    x && str(x.q) && Array.isArray(x.options) && x.options.length === 4 && x.options.every(str) &&
    Number.isInteger(x.answer) && x.answer >= 0 && x.answer <= 3
  ).slice(0, mcqWanted).map((x) => ({
    q: x.q.trim(), options: x.options.map((o) => o.trim()), answer: x.answer, explanation: str(x.explanation) ? x.explanation.trim() : '',
  }));

  const tf = (Array.isArray(obj.tf) ? obj.tf : []).filter((x) =>
    x && str(x.q) && typeof x.answer === 'boolean'
  ).slice(0, tfWanted).map((x) => ({
    q: x.q.trim(), answer: x.answer, explanation: str(x.explanation) ? x.explanation.trim() : '',
  }));

  return mcq.length + tf.length > 0 ? { mcq, tf } : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận yêu cầu POST.' });

  // Chấp nhận cả hai cách đặt tên biến (GEMINI_API_KEY hoặc Gemini_API_KEY)
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Máy chủ chưa có khóa AI. Hãy kiểm tra Environment Variables trên Vercel.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  const subject = String(body.subject || '').slice(0, 100);
  const mcq = clamp(body.mcq, 0, 30);
  const tf = clamp(body.tf, 0, 10);
  const file = body.file || null;

  if (mcq + tf === 0) return res.status(400).json({ error: 'Hãy chọn ít nhất 1 câu hỏi.' });
  if (!subject && !file) return res.status(400).json({ error: 'Hãy chọn môn học hoặc tải tài liệu lên.' });
  if (file) {
    if (!ALLOWED_FILES.includes(file.mimeType) || typeof file.data !== 'string') {
      return res.status(400).json({ error: 'Chỉ hỗ trợ file PDF, PNG, JPG.' });
    }
    if (file.data.length > MAX_BASE64_LENGTH) {
      return res.status(413).json({ error: 'File quá lớn (tối đa 3MB).' });
    }
  }

  const parts = [];
  if (file) parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
  parts.push({ text: buildPrompt(subject, !!file, mcq, tf) });

  let lastError = 'Không gọi được AI, hãy thử lại sau.';

  for (const model of MODELS) {
    let r, data;
    try {
      r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
        }),
      });
      data = await r.json();
    } catch (e) {
      console.error('Lỗi kết nối tới Gemini:', model, e && e.message);
      lastError = 'Không kết nối được tới AI, hãy thử lại.';
      continue;
    }

    if (r.ok) {
      const candidate = data.candidates && data.candidates[0];
      const text = candidate && candidate.content && candidate.content.parts
        ? candidate.content.parts.map((p) => p.text || '').join('') : '';
      const quiz = parseQuiz(text, mcq, tf);
      if (quiz) return res.status(200).json(quiz);
      lastError = 'AI trả về dữ liệu chưa đúng định dạng, hãy bấm tạo đề lại.';
      break;
    }

    const msg = (data && data.error && data.error.message) || '';
    console.error('Gemini báo lỗi:', model, r.status, msg.slice(0, 200));

    if (/api key/i.test(msg) || r.status === 401 || r.status === 403) {
      lastError = 'Khóa AI không hợp lệ hoặc bị chặn. Hãy kiểm tra lại khóa trên Vercel.';
      break;
    }
    if (r.status === 429) {
      lastError = 'AI đang quá tải hoặc đã hết hạn mức, hãy thử lại sau ít phút.';
      break;
    }
    if (r.status === 404 || r.status === 400) {
      lastError = 'Model AI không còn khả dụng.';
      continue; // thử model kế tiếp
    }
    lastError = 'AI báo lỗi (' + r.status + '), hãy thử lại sau.';
    break;
  }

  return res.status(502).json({ error: lastError });
};
