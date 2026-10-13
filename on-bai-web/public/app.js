// --- ThiSáng - Giao diện hình ảnh minh họa HD phong cách chuyên nghiệp ---
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app') || document.body;
  
  // Danh sách môn học với ảnh minh họa HD
  const subjects = [
    { id: 'toan', name: 'Môn Toán', desc: 'Trắc nghiệm Toán học THPT', img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80' },
    { id: 'ly', name: 'Vật Lý', desc: 'Trắc nghiệm Vật Lý THPT', img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80' },
    { id: 'hoa', name: 'Hóa Học', desc: 'Trắc nghiệm Hóa Học THPT', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&q=80' },
    { id: 'anh', name: 'Tiếng Anh', desc: 'Luyện thi Tiếng Anh THPT', img: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&q=80' },
    { id: 'su', name: 'Lịch Sử', desc: 'Trắc nghiệm Lịch Sử THPT', img: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&q=80' },
    { id: 'dia', name: 'Địa Lý', desc: 'Trắc nghiệm Địa Lý THPT', img: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=500&q=80' },
    { id: 'sinh', name: 'Sinh Học', desc: 'Trắc nghiệm Sinh Học THPT', img: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=500&q=80' },
    { id: 'gdcd', name: 'GDCD', desc: 'Giáo dục công dân / Kinh tế & Pháp luật', img: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&q=80' }
  ];

  let currentView = 'home';
  let isDarkMode = true;

  function getActivePlan() {
    return localStorage.getItem('thisang_active_plan') || 'Free';
  }

  function setActivePlan(planName) {
    localStorage.setItem('thisang_active_plan', planName);
  }

  function renderLayout() {
    const bgMain = isDarkMode ? '#0b0f17' : '#f8fafc';
    const bgHeader = isDarkMode ? '#121826' : '#ffffff';
    const textMain = isDarkMode ? '#ffffff' : '#0f172a';
    const textSub = isDarkMode ? '#94a3b8' : '#64748b';
    const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
    const borderColor = isDarkMode ? '#334155' : '#e2e8f0';

    appContainer.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: ${textMain}; background-color: ${bgMain}; min-height: 100vh; margin: 0; transition: 0.3s; position: relative; padding-bottom: 80px;">
        
        <!-- HEADER -->
        <header style="display: flex; justify-content: space-between; align-items: center; padding: 12px 30px; background: ${bgHeader}; border-bottom: 1px solid ${borderColor}; position: sticky; top: 0; z-index: 100;">
          <div style="display: flex; align-items: center; gap: 25px;">
            <div id="logo-home" style="background: ${cardBg}; padding: 6px 14px; border-radius: 8px; border: 1px solid ${borderColor}; cursor: pointer;">
              <span style="color: #38bdf8; font-weight: 800; font-size: 19px;">ThiSáng</span>
            </div>
            <nav style="display: flex; gap: 20px; align-items: center;">
              <a href="#" id="menu-home" style="color: ${currentView === 'home' ? '#38bdf8' : textSub}; text-decoration: none; font-weight: 600; font-size: 15px;">🏠 Trang Chủ</a>
              <a href="#" id="menu-study" style="color: ${currentView === 'study' ? '#38bdf8' : textSub}; text-decoration: none; font-weight: 600; font-size: 15px;">📚 Học Tập & Môn Học</a>
            </nav>
          </div>

          <div style="flex: 0 0 320px; position: relative;">
            <input type="text" placeholder="Tìm kiếm môn học, tài liệu..." style="width: 100%; background: ${isDarkMode ? '#0f172a' : '#f1f5f9'}; border: 1px solid ${borderColor}; padding: 8px 15px 8px 35px; border-radius: 20px; color: ${textMain}; font-size: 13px; outline: none;">
            <span style="position: absolute; left: 12px; top: 8px; color: ${textSub}; font-size: 14px;">🔍</span>
          </div>

          <div style="display: flex; align-items: center; gap: 15px;">
            <div id="btn-theme-toggle" style="background: ${isDarkMode ? '#0f172a' : '#f1f5f9'}; border: 1px solid ${borderColor}; padding: 6px 14px; border-radius: 20px; font-size: 13px; color: ${textMain}; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600;">
              <span>${isDarkMode ? '☀️ Sáng' : '🌙 Tối'}</span>
            </div>

            <!-- PROFILE & DROPDOWN -->
            <div style="position: relative;" id="profile-container">
              <div id="profile-btn" style="width: 38px; height: 38px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-weight: bold; border: 2px solid #60a5fa;">
                H
              </div>

              <div id="dropdown-menu" style="display: none; position: absolute; right: 0; top: 46px; background: ${cardBg}; border: 1px solid ${borderColor}; border-radius: 10px; width: 200px; box-shadow: 0 8px 20px rgba(0,0,0,0.25); overflow: hidden; z-index: 1000;">
                <div style="padding: 12px 15px; border-bottom: 1px solid ${borderColor}; background: ${isDarkMode ? '#0f172a' : '#f8fafc'};">
                  <p style="margin: 0; font-weight: bold; color: ${textMain}; font-size: 13px; overflow: hidden; text-overflow: ellipsis;">huynotsimp5566</p>
                </div>
                <div style="padding: 6px 0;">
                  <a href="#" id="drop-upgrade" style="display: block; padding: 8px 15px; color: ${textMain}; text-decoration: none; font-size: 13px; font-weight: 500;">⭐ Nâng cấp gói</a>
                  <a href="#" id="drop-history" style="display: block; padding: 8px 15px; color: ${textSub}; text-decoration: none; font-size: 13px;">📊 Lịch sử làm bài</a>
                </div>
                <div style="border-top: 1px solid ${borderColor}; padding: 6px 0;">
                  <a href="#" id="drop-logout" style="display: block; padding: 8px 15px; color: #ef4444; text-decoration: none; font-size: 13px; font-weight: bold;">🚪 Đăng xuất</a>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- MAIN CONTENT -->
        <main style="padding: 30px 40px; max-width: 1200px; margin: 0 auto;">
          ${currentView === 'home' ? renderHomeContent(cardBg, textMain, textSub, borderColor) : renderStudyContent(cardBg, textMain, textSub, borderColor)}
        </main>

        <!-- BONG BÓNG CHAT HỖ TRỢ TRỰC TIẾP -->
        <div id="chat-bubble-container" style="position: fixed; bottom: 25px; right: 25px; display: flex; align-items: center; gap: 12px; z-index: 999; cursor: pointer;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 10px 18px; border-radius: 20px; box-shadow: 0 4px 15px rgba(59,130,246,0.4); font-size: 13px; font-weight: 600; display: flex; flex-direction: column; align-items: flex-end;">
            <span>Chat với admin</span>
            <span style="font-size: 11px; font-weight: normal; color: #93c5fd;">Hỗ trợ trực tiếp 24/7</span>
          </div>
          <div style="width: 50px; height: 50px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); color: white; font-size: 24px;">
            💬
          </div>
        </div>

      </div>
    `;

    bindEvents();
  }

  // Giao diện Trang chủ với ảnh minh họa HD chuẩn đẹp
  function renderHomeContent(cardBg, textMain, textSub, borderColor) {
    const methods = [
      { title: 'Flashcard Ghi Nhớ Nhanh', desc: 'Thẻ ghi nhớ thông minh từ vựng, công thức', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80', badge: 'HOT' },
      { title: 'Trắc Nghiệm AI 24/7', desc: 'Tự động sinh câu hỏi từ tài liệu tải lên', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80', badge: 'MỚI' },
      { title: 'Luyện Giải Đề THPT', desc: 'Kho đề thi thử chuẩn cấu trúc Bộ GD&ĐT', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80', badge: 'VIP' },
      { title: 'Sơ Đồ Tư Duy (Mindmap)', desc: 'Hệ thống kiến thức trọng tâm ngắn gọn', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&q=80', badge: 'PRO' }
    ];

    return `
      <div>
        <!-- DANH MỤC 1: PHƯƠNG PHÁP HỌC TẬP -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="margin: 0; color: #38bdf8; font-size: 18px; font-weight: 700;">🚀 PHƯƠNG PHÁP HỌC TẬP NỔI BẬT</h3>
          <span style="color: ${textSub}; font-size: 13px; cursor: pointer;">Xem tất cả ></span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px;">
          ${methods.map(m => `
            <div class="method-card" style="background: ${cardBg}; border: 1px solid${borderColor}; border-radius: 16px; overflow: hidden; cursor: pointer; transition: 0.3s; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
              <span style="position: absolute; top: 12px; right: 12px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 20px; z-index: 2; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${m.badge}</span>
              <div style="height: 140px; overflow: hidden; position: relative;">
                <img src="${m.img}" alt="${m.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
              </div>
              <div style="padding: 16px;">
                <h4 style="margin: 0 0 6px 0; color: ${textMain}; font-size: 16px; font-weight: 700;">${m.title}</h4>
                <p style="margin: 0; color: ${textSub}; font-size: 13px; line-height: 1.4;">${m.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- DANH MỤC 2: KHO MÔN HỌC THPT -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="margin: 0; color: #38bdf8; font-size: 18px; font-weight: 700;">📚 KHO MÔN HỌC & ÔN THI</h3>
          <span style="color: ${textSub}; font-size: 13px; cursor: pointer;">Xem tất cả ></span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
          ${subjects.map(s => `
            <div class="subject-box" data-id="${s.id}" style="background: ${cardBg}; border: 1px solid${borderColor}; border-radius: 16px; overflow: hidden; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
              <div style="height: 120px; overflow: hidden;">
                <img src="${s.img}" alt="${s.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
              </div>
              <div style="padding: 16px;">
                <h4 style="margin: 0 0 6px 0; color: #38bdf8; font-size: 16px; font-weight: 700;">${s.name}</h4>
                <p style="margin: 0; color: ${textSub}; font-size: 13px;">${s.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderStudyContent(cardBg, textMain, textSub, borderColor) {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <h2 style="margin: 0; font-size: 24px; color: ${textMain}; font-weight: 700;">📚 Chọn môn học để bắt đầu làm bài:</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
        ${subjects.map(s => `
          <div class="subject-box" data-id="${s.id}" style="background: ${cardBg}; border: 1px solid${borderColor}; border-radius: 16px; overflow: hidden; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
            <div style="height: 130px; overflow: hidden;">
              <img src="${s.img}" alt="${s.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
            </div>
            <div style="padding: 16px;">
              <h3 style="margin: 0 0 6px 0; color: #38bdf8; font-size: 18px; font-weight: 700;">${s.name}</h3>
              <p style="margin: 0; color: ${textSub}; font-size: 13px;">${s.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderUpgradeModal() {
    const existingModal = document.getElementById('modal-upgrade');
    if (existingModal) existingModal.remove();

    const currentActivePlan = getActivePlan();

    const modalHTML = `
      <div id="modal-upgrade" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 20px;">
        <div style="background: #111827; color: #fff; padding: 25px 30px; border-radius: 20px; width: 720px; max-height: 90vh; overflow-y: auto; border: 1px solid #374151; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <button id="close-modal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #9ca3af; font-size: 22px; cursor: pointer;">✕</button>
          
          <h2 style="color: #f3f4f6; text-align: center; margin-top: 0; font-size: 24px; font-weight: 800;">Nâng cấp tài khoản ThiSáng</h2>
          <p style="color: #9ca3af; text-align: center; font-size: 13px; margin-bottom: 20px;">Chọn gói phù hợp để mở khóa toàn bộ kho đề thi thông minh.</p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
            <div class="plan-card" data-plan="Free" data-price="0" style="background: #1f2937; border: ${currentActivePlan === 'Free' ? '2px solid #3b82f6' : '1px solid #374151'}; border-radius: 14px; padding: 18px 12px; text-align: center; cursor: pointer;">
              <h4 style="margin: 0 0 6px 0; color: #93c5fd; font-size: 16px; font-weight: 700;">Gói FREE</h4>
              <p style="font-size: 22px; font-weight: bold; color: #fff; margin: 0 0 10px 0;">0đ</p>
              <p style="font-size: 12px; color: #9ca3af; margin-bottom: 12px; line-height: 1.3;">Dùng thử cơ bản hàng ngày.</p>
              <div class="plan-status" style="background: ${currentActivePlan === 'Free' ? '#3b82f6' : '#374151'}; color: white; padding: 8px; border-radius: 8px; font-weight: bold; font-size: 13px;">${currentActivePlan === 'Free' ? 'Đang dùng' : 'Chọn gói này'}</div>
            </div>

            <div class="plan-card" data-plan="Tuần" data-price="20000" style="background: #1f2937; border: ${currentActivePlan === 'Tuần' ? '2px solid #3b82f6' : '1px solid #374151'}; border-radius: 14px; padding: 18px 12px; text-align: center; cursor: pointer;">
              <h4 style="margin: 0 0 6px 0; color: #60a5fa; font-size: 16px; font-weight: 700;">Gói TUẦN</h4>
              <p style="font-size: 22px; font-weight: bold; color: #22c55e; margin: 0 0 10px 0;">20.000đ</p>
              <p style="font-size: 12px; color: #9ca3af; margin-bottom: 12px; line-height: 1.3;">Mở khóa không giới hạn 7 ngày.</p>
              <div class="plan-status" style="background: ${currentActivePlan === 'Tuần' ? '#3b82f6' : '#374151'}; color: white; padding: 8px; border-radius: 8px; font-weight: bold; font-size: 13px;">${currentActivePlan === 'Tuần' ? 'Đang dùng' : 'Chọn gói này'}</div>
            </div>

            <div class="plan-card" data-plan="Tháng" data-price="80000" style="background: #1f2937; border: ${currentActivePlan === 'Tháng' ? '2px solid #3b82f6' : '1px solid #374151'}; border-radius: 14px; padding: 18px 12px; text-align: center; cursor: pointer;">
              <h4 style="margin: 0 0 6px 0; color: #f59e0b; font-size: 16px; font-weight: 700;">Gói THÁNG</h4>
              <p style="font-size: 22px; font-weight: bold; color: #22c55e; margin: 0 0 10px 0;">80.000đ</p>
              <p style="font-size: 12px; color: #9ca3af; margin-bottom: 12px; line-height: 1.3;">Tiết kiệm hơn, dùng trọn 30 ngày.</p>
              <div class="plan-status" style="background: ${currentActivePlan === 'Tháng' ? '#3b82f6' : '#374151'}; color: white; padding: 8px; border-radius: 8px; font-weight: bold; font-size: 13px;">${currentActivePlan === 'Tháng' ? 'Đang dùng' : 'Chọn gói này'}</div>
            </div>
          </div>

          <div id="action-section" style="text-align: center; margin-top: 15px;">
            <button id="btn-buy-now" style="background: #3b82f6; color: white; border: none; padding: 12px 30px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(59,130,246,0.4);">Chọn gói Tuần / Tháng để thanh toán</button>
          </div>

          <div id="qr-section" style="display: none; background: #1f2937; border: 1px solid #3b82f6; border-radius: 14px; padding: 18px; text-align: center; margin-top: 15px;">
            <p id="qr-title" style="margin: 0 0 10px 0; font-weight: bold; color: #60a5fa; font-size: 14px;"></p>
            <div style="background: #ffffff; padding: 8px; border-radius: 10px; display: inline-block; margin-bottom: 10px;">
              <img id="qr-image" src="" alt="Mã QR" style="width: 140px; height: 140px; object-fit: contain; display: block;">
            </div>
            <div style="font-size: 12px; color: #d1d5db; text-align: left; max-width: 300px; margin: 0 auto 10px auto; background: #111827; padding: 10px; border-radius: 8px;">
              <p style="margin: 2px 0; color: #facc15;"><b>Chủ TK:</b> LE NHAT HUY</p>
              <p style="margin: 2px 0; color: #38bdf8;"><b>Nội dung:</b> THISANG [Email của bạn]</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 0; font-style: italic;">💡 Quét mã thanh toán xong, Admin sẽ kiểm tra và duyệt kích hoạt gói cho bạn.</p>
          </div>

        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('close-modal').onclick = () => {
      const modal = document.getElementById('modal-upgrade');
      if (modal) modal.remove();
    };

    let selectedPlan = currentActivePlan;
    let selectedPrice = currentActivePlan === 'Tháng' ? '80000' : (currentActivePlan === 'Tuần' ? '20000' : '0');

    const cards = document.querySelectorAll('.plan-card');
    cards.forEach(card => {
      card.onclick = () => {
        const planName = card.getAttribute('data-plan');
        const activeNow = getActivePlan();

        cards.forEach(c => {
          const p = c.getAttribute('data-plan');
          const isCurr = (p === activeNow);
          c.style.border = isCurr ? '2px solid #3b82f6' : '1px solid #374151';
          const statusDiv = c.querySelector('.plan-status');
          statusDiv.style.background = isCurr ? '#3b82f6' : '#374151';
          statusDiv.innerText = isCurr ? 'Đang dùng' : 'Chọn gói này';
        });

        card.style.border = '2px solid #3b82f6';
        const activeStatus = card.querySelector('.plan-status');
        activeStatus.style.background = '#3b82f6';
        activeStatus.innerText = (planName === activeNow) ? 'Đang dùng' : 'Đang chọn';

        selectedPlan = planName;
        selectedPrice = card.getAttribute('data-price');

        const btnBuyNow = document.getElementById('btn-buy-now');
        const qrSection = document.getElementById('qr-section');
        qrSection.style.display = 'none';

        if (selectedPrice === '0') {
          btnBuyNow.innerText = 'Đang dùng Gói FREE';
        } else {
          btnBuyNow.innerText = `Thanh toán Gói ${selectedPlan} (${Number(selectedPrice).toLocaleString()}đ)`;
        }
      };
    });

    document.getElementById('btn-buy-now').onclick = () => {
      if (selectedPrice === '0') {
        alert('Bạn đang ở Gói FREE.');
        return;
      }

      setActivePlan(selectedPlan);

      const qrSection = document.getElementById('qr-section');
      const qrTitle = document.getElementById('qr-title');
      const qrImage = document.getElementById('qr-image');

      qrTitle.innerHTML = `Quét mã QR để thanh toán Gói ${selectedPlan} (${Number(selectedPrice).toLocaleString()}đ):`;
      qrImage.src = `https://api.vietqr.io/image/970422-0000394-sng.jpg?accountName=LE%20NHAT%20HUY&amount=${selectedPrice}&addInfo=THISANG`;
      qrSection.style.display = 'block';

      const modalContent = document.querySelector('#modal-upgrade > div');
      if (modalContent) {
        setTimeout(() => { modalContent.scrollTop = modalContent.scrollHeight; }, 50);
      }
    };
  }

  function bindEvents() {
    const logoHome = document.getElementById('logo-home');
    if (logoHome) logoHome.onclick = () => { currentView = 'home'; renderLayout(); };

    const menuHome = document.getElementById('menu-home');
    if (menuHome) menuHome.onclick = (e) => { e.preventDefault(); currentView = 'home'; renderLayout(); };

    const menuStudy = document.getElementById('menu-study');
    if (menuStudy) menuStudy.onclick = (e) => { e.preventDefault(); currentView = 'study'; renderLayout(); };

    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) btnTheme.onclick = () => {
      isDarkMode = !isDarkMode;
      renderLayout();
    };

    const profileBtn = document.getElementById('profile-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (profileBtn && dropdownMenu) {
      profileBtn.onclick = (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
      };
    }

    document.onclick = () => {
      if (dropdownMenu) dropdownMenu.style.display = 'none';
    };

    const dropUpgrade = document.getElementById('drop-upgrade');
    if (dropUpgrade) {
      dropUpgrade.onclick = (e) => {
        e.preventDefault();
        renderUpgradeModal();
      };
    }

    // Gắn sự kiện cho các thẻ phương pháp học nổi bật
    document.querySelectorAll('.method-card').forEach(card => {
        card.onclick = () => {
            openAiModal("Phương pháp học tập");
        };
    });

    // Gắn sự kiện cho các thẻ môn học
    document.querySelectorAll('.subject-box').forEach(box => {
        box.onclick = () => {
            const id = box.getAttribute('data-id');
            const sub = subjects.find(s => s.id === id);
            openAiModal(sub ? sub.name : "Môn học");
        };
    });

    const chatBubble = document.getElementById('chat-bubble-container');
    if (chatBubble) {
      chatBubble.onclick = () => {
        alert('Đang kết nối trực tiếp với Admin Lê Nhật Huy để tư vấn học tập!');
      };
    }
  }

  renderLayout();
});
// --- 1. HÀM MỞ VÀ ĐÓNG MODAL AI QUIZ ---
function openAiModal(subjectName) {
  const modal = document.getElementById('aiQuizModal');
  const title = document.getElementById('modalSubjectTitle');
  if (modal) {
    if (title) title.innerText = "Tạo Đề AI - Môn " + subjectName;
    modal.style.display = 'flex';
    checkRateLimit(); // Kiểm tra số lượt còn lại khi mở modal
  }
}

function closeAiModal() {
  const modal = document.getElementById('aiQuizModal');
  if (modal) modal.style.display = 'none';
}

// --- 2. XỬ LÝ KHI NGƯỜI DÙNG CHỌN FILE TẢI LÊN ---
function handleFileSelect(event) {
  const file = event.target.files[0];
  const nameDisplay = document.getElementById('selectedFileName');
  if (file && nameDisplay) {
    nameDisplay.innerText = "📄 Đã chọn: " + file.name;
  }
}

// --- 3. QUẢN LÝ GIỚI HẠN 5 LƯỢT / 5 GIỜ (FREEMIUM RATE LIMIT) ---
function checkRateLimit() {
  const maxQuota = 5;
  const resetInterval = 5 * 60 * 60 * 1000; // 5 giờ tính bằng mili-giây
  const now = Date.now();

  let usageData = JSON.parse(localStorage.getItem('thisang_quiz_usage')) || {
    count: 0,
    startTime: now
  };

  // Nếu đã qua 5 giờ, reset lại lượt dùng
  if (now - usageData.startTime > resetInterval) {
    usageData = { count: 0, startTime: now };
    localStorage.setItem('thisang_quiz_usage', JSON.stringify(usageData));
  }

  const remaining = maxQuota - usageData.count;
  const quotaElement = document.getElementById('remainingQuota');
  if (quotaElement) {
    quotaElement.innerText = remaining > 0 ? remaining : 0;
  }

  return { remaining, usageData };
}

async function generateAiQuiz() {
    const [remaining, usageData] = checkRateLimit();

    if (remaining <= 0) {
        alert("⚠️ Bạn đã hết 5 lượt dùng Free trong 5 giờ! Vui lòng quay lại sau hoặc nâng cấp gói.");
        return;
    }

    // Kiểm tra API Key từ file config.js
    if (typeof GEMINI_API_KEY === "undefined" || !GEMINI_API_KEY) {
        alert("❌ Chưa cấu hình GEMINI_API_KEY trong config.js!");
        return;
    }

    alert("🤖 Đang kết nối với Google Gemini Flash để sinh bộ đề trắc nghiệm thông minh...");

    try {
        const prompt = "Hãy tạo 5 câu hỏi trắc nghiệm khách quan (có đáp án A, B, C, D và giải thích) dựa trên chủ đề bài học này dưới dạng định dạng JSON chuẩn.";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            const aiResponseText = data.candidates[0].content.parts[0].text;
            console.log("Kết quả từ Gemini AI:", aiResponseText);

            // Cập nhật tăng số lần dùng sau khi gọi thành công
            usageData.count += 1;
            localStorage.setItem("thisang_quiz_usage", JSON.stringify(usageData));
            checkRateLimit();

            alert("🎉 Đã sinh đề thành công bởi AI!");
            closeAiModal();
        } else {
            throw new Error("Phản hồi từ Gemini API không đúng định dạng.");
        }

    } catch (error) {
        console.error("Lỗi gọi Gemini API:", error);
        alert("❌ Có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra lại khóa API!");
    }
}