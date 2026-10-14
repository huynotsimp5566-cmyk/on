// ===== ThiSáng - AI Quiz: mở hộp tạo đề, gọi AI, làm bài, chấm điểm =====

// ---------- Thông báo nhỏ (thay cho alert) ----------
function showToast(message, type) {
    const old = document.querySelector('.ts-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'ts-toast ts-toast-' + (type || 'info');
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
    }, 3500);
}

// Tạo thẻ HTML an toàn (dùng textContent nên nội dung AI trả về không chạy được mã lạ)
function tsEl(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
}

// ---------- Hộp tạo đề ----------
let tsSubject = '';
let tsFile = null;
const TS_MAX_FILE = 3 * 1024 * 1024;
const TS_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

function openAiModal(subjectName) {
    const modal = document.getElementById('aiQuizModal');
    if (!modal) {
        console.error('Không tìm thấy aiQuizModal trong DOM!');
        return;
    }
    const generic = !subjectName || subjectName.indexOf('Trắc Nghiệm AI') === 0;
    tsSubject = generic ? '' : subjectName;
    clearSelectedFile();
    const title = document.getElementById('modalSubjectTitle');
    if (title) title.innerText = generic ? 'Tạo Đề Trắc Nghiệm Bằng AI' : 'Tạo Đề AI - ' + subjectName;
    modal.style.display = 'flex';
    checkRateLimit();
}

function closeAiModal() {
    const modal = document.getElementById('aiQuizModal');
    if (modal) modal.style.display = 'none';
}

function clearSelectedFile() {
    tsFile = null;
    const input = document.getElementById('fileInput');
    if (input) input.value = '';
    const nameDisplay = document.getElementById('selectedFileName');
    if (nameDisplay) nameDisplay.innerText = '';
}

function acceptFile(file) {
    if (!file) return;
    if (TS_FILE_TYPES.indexOf(file.type) === -1) {
        clearSelectedFile();
        showToast('Chỉ hỗ trợ file PDF, PNG hoặc JPG. Nếu là file Word, hãy lưu thành PDF trước nhé.', 'error');
        return;
    }
    if (file.size > TS_MAX_FILE) {
        clearSelectedFile();
        showToast('File quá lớn, tối đa 3MB.', 'error');
        return;
    }
    tsFile = file;
    const nameDisplay = document.getElementById('selectedFileName');
    if (nameDisplay) nameDisplay.innerText = '📄 Đã chọn: ' + file.name;
}

function handleFileSelect(event) {
    acceptFile(event.target.files[0]);
}

// Cho phép kéo thả file vào ô dấu cộng
function setupDropzone() {
    const zone = document.querySelector('.upload-dropzone');
    if (!zone) return;
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.background = 'rgba(79, 70, 229, 0.2)'; });
    zone.addEventListener('dragleave', () => { zone.style.background = ''; });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.style.background = '';
        if (e.dataTransfer && e.dataTransfer.files.length) acceptFile(e.dataTransfer.files[0]);
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDropzone);
} else {
    setupDropzone();
}

function readFileBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('Không đọc được file.'));
        reader.readAsDataURL(file);
    });
}

// ---------- Giới hạn 5 lượt / 5 giờ (lưu trong trình duyệt) ----------
function checkRateLimit() {
    const maxQuota = 5;
    const resetInterval = 5 * 60 * 60 * 1000;
    const now = Date.now();

    let usageData;
    try { usageData = JSON.parse(localStorage.getItem('thisang_quiz_usage')); } catch (e) { usageData = null; }
    if (!usageData) usageData = { count: 0, startTime: now };

    if (now - usageData.startTime > resetInterval) {
        usageData = { count: 0, startTime: now };
        localStorage.setItem('thisang_quiz_usage', JSON.stringify(usageData));
    }

    const remaining = maxQuota - usageData.count;
    const quotaElement = document.getElementById('remainingQuota');
    if (quotaElement) quotaElement.innerText = remaining > 0 ? remaining : 0;

    return { remaining, usageData };
}

// ---------- Gọi AI tạo đề ----------
async function generateAiQuiz() {
    const limit = checkRateLimit();
    if (limit.remaining <= 0) {
        showToast('⚠️ Bạn đã hết 5 lượt dùng Free trong 5 giờ. Hãy quay lại sau hoặc nâng cấp gói.', 'error');
        return;
    }
    if (!tsSubject && !tsFile) {
        showToast('Hãy tải tài liệu lên, hoặc chọn một môn học ở trang chủ nhé.', 'error');
        return;
    }

    const mcq = Number(document.getElementById('rangeMcq').value);
    const tf = Number(document.getElementById('rangeTf').value);
    const btn = document.querySelector('.generate-quiz-btn');
    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ AI đang tạo đề, chờ chút nhé...';

    try {
        let file = null;
        if (tsFile) file = { mimeType: tsFile.type, data: await readFileBase64(tsFile) };

        const res = await fetch('/api/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject: tsSubject, mcq: mcq, tf: tf, file: file })
        });

        let data = null;
        try { data = await res.json(); } catch (e) { /* bỏ qua */ }
        if (!res.ok || !data || data.error) {
            if (res.status === 404) throw new Error('Chưa có chức năng AI trên máy chủ (thiếu thư mục api).');
            throw new Error((data && data.error) || 'Máy chủ báo lỗi ' + res.status + '.');
        }

        const questions = tsBuildQuestions(data);
        if (!questions.length) throw new Error('AI chưa tạo được câu hỏi nào, hãy thử lại.');

        limit.usageData.count += 1;
        localStorage.setItem('thisang_quiz_usage', JSON.stringify(limit.usageData));
        checkRateLimit();

        closeAiModal();
        startQuiz(questions, tsSubject || (tsFile ? tsFile.name : 'Đề do AI tạo'));
    } catch (err) {
        console.error('Lỗi tạo đề:', err);
        showToast('❌ ' + (err.message || 'Không tạo được đề, hãy thử lại sau.'), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = oldText;
    }
}

// Gộp câu trắc nghiệm và câu Đúng/Sai thành một danh sách chung
function tsBuildQuestions(data) {
    const list = [];
    (data.mcq || []).forEach((x) => {
        list.push({ type: 'mcq', q: x.q, options: x.options, answer: x.answer, explanation: x.explanation || '' });
    });
    (data.tf || []).forEach((x) => {
        list.push({ type: 'tf', q: x.q, options: ['Đúng', 'Sai'], answer: x.answer ? 0 : 1, explanation: x.explanation || '' });
    });
    return list;
}

// ---------- Màn hình làm bài ----------
let tsQuiz = null;

function startQuiz(questions, title) {
    tsQuiz = { questions: questions, title: title, index: 0, score: 0, wrong: [] };
    renderQuestion();
}

function tsBox() {
    let overlay = document.getElementById('quizPlayer');
    if (!overlay) {
        overlay = tsEl('div', 'tq-overlay');
        overlay.id = 'quizPlayer';
        overlay.appendChild(tsEl('div', 'tq-box'));
        document.body.appendChild(overlay);
    }
    const box = overlay.querySelector('.tq-box');
    box.textContent = '';
    return box;
}

function closeQuiz() {
    const overlay = document.getElementById('quizPlayer');
    if (overlay) overlay.remove();
    tsQuiz = null;
}

function tsHeader(box) {
    const head = tsEl('div', 'tq-head');
    head.appendChild(tsEl('span', 'tq-title', tsQuiz.title));
    const close = tsEl('button', 'tq-close', '×');
    close.onclick = closeQuiz;
    head.appendChild(close);
    box.appendChild(head);
}

function renderQuestion() {
    const quiz = tsQuiz;
    const q = quiz.questions[quiz.index];
    const total = quiz.questions.length;
    const box = tsBox();

    tsHeader(box);

    const progress = tsEl('div', 'tq-progress');
    const bar = tsEl('div', 'tq-bar');
    bar.style.width = (quiz.index / total * 100) + '%';
    progress.appendChild(bar);
    box.appendChild(progress);

    box.appendChild(tsEl('div', 'tq-meta', 'Câu ' + (quiz.index + 1) + '/' + total + '  ·  Đúng: ' + quiz.score));
    if (q.type === 'tf') box.appendChild(tsEl('div', 'tq-tag', 'ĐÚNG / SAI'));
    box.appendChild(tsEl('div', 'tq-question', q.q));

    const optionsBox = tsEl('div', 'tq-options');
    const buttons = [];
    q.options.forEach((text, i) => {
        const b = tsEl('button', 'tq-opt');
        const key = q.type === 'mcq' ? 'ABCD'.charAt(i) : (i === 0 ? '✓' : '✗');
        b.appendChild(tsEl('span', 'tq-key', key));
        b.appendChild(tsEl('span', 'tq-txt', text));
        b.onclick = () => choose(i);
        buttons.push(b);
        optionsBox.appendChild(b);
    });
    box.appendChild(optionsBox);

    const feedback = tsEl('div', 'tq-feedback');
    feedback.style.display = 'none';
    box.appendChild(feedback);

    const next = tsEl('button', 'tq-next', quiz.index === total - 1 ? 'Xem kết quả' : 'Câu tiếp →');
    next.style.display = 'none';
    next.onclick = () => {
        quiz.index += 1;
        if (quiz.index >= total) renderResult(); else renderQuestion();
    };
    box.appendChild(next);

    let answered = false;
    function choose(i) {
        if (answered) return;
        answered = true;
        const correct = (i === q.answer);
        buttons.forEach((b, idx) => {
            b.disabled = true;
            if (idx === q.answer) b.classList.add('ok');
            else if (idx === i) b.classList.add('bad');
            else b.classList.add('dim');
        });
        if (correct) {
            quiz.score += 1;
        } else {
            quiz.wrong.push({ q: q.q, picked: q.options[i], right: q.options[q.answer], explanation: q.explanation });
        }
        feedback.className = 'tq-feedback ' + (correct ? 'ok' : 'bad');
        feedback.textContent = '';
        feedback.appendChild(tsEl('strong', '', correct ? '✅ Chính xác!' : '❌ Chưa đúng. Đáp án đúng: ' + q.options[q.answer]));
        if (q.explanation) feedback.appendChild(tsEl('p', '', q.explanation));
        feedback.style.display = 'block';
        next.style.display = 'block';
    }
}

function renderResult() {
    const quiz = tsQuiz;
    const total = quiz.questions.length;
    const percent = Math.round(quiz.score / total * 100);
    const box = tsBox();

    tsHeader(box);
    box.appendChild(tsEl('div', 'tq-big', quiz.score + '/' + total));
    box.appendChild(tsEl('div', 'tq-meta', 'Đạt ' + percent + '%'));

    let msg = 'Cố gắng thêm một chút nữa nhé, xem lại các câu sai bên dưới!';
    if (percent >= 90) msg = '🎉 Xuất sắc! Bạn nắm bài rất chắc.';
    else if (percent >= 70) msg = '👏 Làm tốt lắm! Xem lại vài câu sai là hoàn hảo.';
    else if (percent >= 50) msg = '💪 Khá ổn, ôn thêm các câu sai bên dưới nhé.';
    box.appendChild(tsEl('div', 'tq-msg', msg));

    if (quiz.wrong.length) {
        box.appendChild(tsEl('div', 'tq-subtitle', 'Các câu cần xem lại (' + quiz.wrong.length + ')'));
        quiz.wrong.forEach((w) => {
            const item = tsEl('div', 'tq-wrong');
            item.appendChild(tsEl('div', 'tq-wrong-q', w.q));
            item.appendChild(tsEl('div', 'tq-wrong-pick', 'Bạn chọn: ' + w.picked));
            item.appendChild(tsEl('div', 'tq-wrong-right', 'Đáp án đúng: ' + w.right));
            if (w.explanation) item.appendChild(tsEl('div', 'tq-wrong-why', w.explanation));
            box.appendChild(item);
        });
    }

    const actions = tsEl('div', 'tq-actions');
    const again = tsEl('button', 'tq-next', '🔁 Làm lại đề này');
    again.onclick = () => startQuiz(quiz.questions, quiz.title);
    const fresh = tsEl('button', 'tq-secondary', '✨ Tạo đề mới');
    fresh.onclick = () => { closeQuiz(); openAiModal(tsSubject); };
    const done = tsEl('button', 'tq-secondary', 'Đóng');
    done.onclick = closeQuiz;
    actions.appendChild(again);
    actions.appendChild(fresh);
    actions.appendChild(done);
    box.appendChild(actions);
}
