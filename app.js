/**
 * =============================================================================
 * 파일명: app.js
 * 설명: 부동산 매물 관리 웹 애플리케이션 프론트엔드 비즈니스 로직 및 
 *       빌라/상가/기타 매물 관리 & 투자 수익 자동 계산 기능 (단위: 만원 & 면적(㎡))
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// 1. Supabase 클라이언트 초기화 및 데모 데이터 설정
// -----------------------------------------------------------------------------
const SUPABASE_URL = "https://cpixraohpjuozlzjvxoy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwaXhyYW9ocGp1b3psemp2eG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzE3MDEsImV4cCI6MjEwMjEwNzcwMX0.uqjG5F1wXyIxCZ1BrwlfsyWzgByB3LccgxDYFcS_uss";

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 10단계 회원 등급명 매핑
const LEVEL_NAMES = {
  1: "Level 1 (준회원 / 승인대기)",
  2: "Level 2 (일반 회원)",
  3: "Level 3 (성실 회원)",
  4: "Level 4 (우수 회원)",
  5: "Level 5 (VIP 회원)",
  6: "Level 6 (VVIP 회원)",
  7: "Level 7 (공인중개사 / 파트너)",
  8: "Level 8 (수석 에이전트)",
  9: "Level 9 (운영 매니저)",
  10: "Level 10 (최고 관리자)"
};

// 데모 회원 데이터
const MOCK_USERS = [
  {
    id: "user-admin",
    email: "admin@buikbu.com",
    password: "admin1234",
    name: "최고 관리자",
    phone: "010-8917-8383",
    role: "admin",
    level: 10,
    status: "approved",
    can_create: true,
    can_edit: true,
    can_delete: true,
    created_at: new Date().toISOString()
  }
];

// 데모 매물 데이터 ("빌라", "상가", "기타", 단위: 만원)
const MOCK_PROPERTIES = [
  {
    id: "1",
    title: "역삼동 고급 올리모델링 신축급 빌라 (투룸/화1)",
    property_type: "빌라",
    trade_status: "매매진행중",
    location: "서울특별시 강남구 역삼동 824-1",
    floor_info: "3층 / 5층",
    rooms: 2,
    bathrooms: 1,
    price: "매매 3억 8천만원",
    area_size: "공급 65.5㎡ / 전용 48.8㎡",
    zoning_info: "제2종일반주거지역",
    purchase_price: 30000,
    expected_cost: 2000,
    expected_selling_price: 38000,
    expected_profit: 6000,
    participant_members: "홍길동(50%), 김에이전트(30%), 박투자(20%)",
    description: `역삼역 도보 5분 거리의 리모델링 완료된 빌라 매물입니다.\n
- 내부 고급 인테리어 및 시스템 에어컨, 세탁기 풀옵션 제공\n
- 실주거 및 갭투자 모두 매우 우수`,
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "성수동 메인 상권 1층 메디컬/카페 코너 상가",
    property_type: "상가",
    trade_status: "인테리어중",
    location: "서울특별시 성동구 성수동2가 289",
    floor_info: "1층 / 4층",
    rooms: 0,
    bathrooms: 0,
    price: "매매 25억원",
    area_size: "공급 198.5㎡ / 전용 132.2㎡",
    zoning_info: "준공업지역",
    purchase_price: 200000,
    expected_cost: 15000,
    expected_selling_price: 250000,
    expected_profit: 35000,
    participant_members: "부익부 부동산 펀드 1호 회원단",
    description: `성수동 연무장길 코너에 위치한 고수익 상가 매물입니다.`,
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
    ],
    created_at: new Date().toISOString()
  }
];

// -----------------------------------------------------------------------------
// 2. 애플리케이션 상태 (State Management)
// -----------------------------------------------------------------------------
let state = {
  properties: [],
  users: [],
  selectedCategory: "전체",
  searchQuery: "",
  selectedProperty: null,
  currentImageIndex: 0,
  currentUser: null
};

let isEditMode = false;
let editingPropertyId = null;

// -----------------------------------------------------------------------------
// 3. DOM 요소 참조
// -----------------------------------------------------------------------------
const propertyGrid = document.getElementById("propertyGrid");
const propertyCount = document.getElementById("propertyCount");
const searchInput = document.getElementById("searchInput");
const categoryContainer = document.getElementById("categoryContainer");
const navActions = document.getElementById("navActions");

// 모달 참조
const detailModal = document.getElementById("detailModal");
const btnCloseDetailModal = document.getElementById("btnCloseDetailModal");
const modalGalleryMain = document.getElementById("modalGalleryMain");
const modalGalleryThumbs = document.getElementById("modalGalleryThumbs");
const btnPrevImage = document.getElementById("btnPrevImage");
const btnNextImage = document.getElementById("btnNextImage");
const galleryCounter = document.getElementById("galleryCounter");

const modalTypeBadge = document.getElementById("modalTypeBadge");
const modalStatusBadge = document.getElementById("modalStatusBadge");
const modalPrice = document.getElementById("modalPrice");
const modalTitle = document.getElementById("modalTitle");
const modalLocation = document.getElementById("modalLocation");
const modalAreaSize = document.getElementById("modalAreaSize");
const modalFloorInfo = document.getElementById("modalFloorInfo");
const modalVillaSpecBox = document.getElementById("modalVillaSpecBox");
const modalVillaRooms = document.getElementById("modalVillaRooms");
const modalZoningInfo = document.getElementById("modalZoningInfo");
const modalCreatedAt = document.getElementById("modalCreatedAt");
const modalDescription = document.getElementById("modalDescription");

const modalPurchasePrice = document.getElementById("modalPurchasePrice");
const modalExpectedCost = document.getElementById("modalExpectedCost");
const modalExpectedSellingPrice = document.getElementById("modalExpectedSellingPrice");
const modalExpectedProfit = document.getElementById("modalExpectedProfit");
const modalParticipants = document.getElementById("modalParticipants");

// 모달 팝업 참조
const signupModal = document.getElementById("signupModal");
const btnOpenSignupModal = document.getElementById("btnOpenSignupModal");
const btnCloseSignupModal = document.getElementById("btnCloseSignupModal");
const signupForm = document.getElementById("signupForm");

const loginModal = document.getElementById("loginModal");
const btnOpenLoginModal = document.getElementById("btnOpenLoginModal");
const btnCloseLoginModal = document.getElementById("btnCloseLoginModal");
const loginForm = document.getElementById("loginForm");

const userAdminModal = document.getElementById("userAdminModal");
const btnCloseUserAdminModal = document.getElementById("btnCloseUserAdminModal");
const userAdminTableBody = document.getElementById("userAdminTableBody");

const adminModal = document.getElementById("adminModal");
const btnOpenAdminModal = document.getElementById("btnOpenAdminModal");
const btnCloseAdminModal = document.getElementById("btnCloseAdminModal");
const propertyForm = document.getElementById("propertyForm");

// -----------------------------------------------------------------------------
// 4. 데이터 로딩 & 인증 상태 초기화
// -----------------------------------------------------------------------------
async function initApp() {
  const savedUser = sessionStorage.getItem("buikbu_user");
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
    } catch (e) {
      state.currentUser = null;
    }
  }

  await fetchUsers();
  await fetchProperties();
  updateNavUI();
  setupCalculationEvents();
}

async function fetchUsers() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      state.users = data && data.length > 0 ? data : MOCK_USERS;
    } catch (err) {
      state.users = MOCK_USERS;
    }
  } else {
    state.users = MOCK_USERS;
  }
}

async function fetchProperties() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      state.properties = data && data.length > 0 ? data : MOCK_PROPERTIES;
    } catch (err) {
      state.properties = MOCK_PROPERTIES;
    }
  } else {
    state.properties = MOCK_PROPERTIES;
  }
  render();
}

function updateNavUI() {
  if (!navActions) return;

  const user = state.currentUser;

  if (user) {
    const isAdmin = user.role === 'admin' || user.level === 10;

    navActions.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.8rem; background:#f1f5f9; color:#0f172a; padding:6px 12px; border-radius:9999px; font-weight:700;">
          👤 ${user.name} (${user.level}단계)
        </span>
        ${isAdmin ? `
          <button type="button" id="btnOpenUserAdmin" class="btn-admin" style="background-color:#10b981;">
            <i data-lucide="shield-check" style="width:16px; height:16px;"></i>
            <span>회원 승인/등급</span>
          </button>
        ` : ''}
        <button type="button" id="btnOpenAdminModal" class="btn-admin-add">
          <i data-lucide="plus-circle" style="width:16px; height:16px;"></i>
          <span>매물 등록</span>
        </button>
        <button type="button" id="btnLogout" class="btn-admin" style="background-color:#64748b;">
          <i data-lucide="log-out" style="width:16px; height:16px;"></i>
          <span>로그아웃</span>
        </button>
      </div>
    `;

    document.getElementById("btnLogout")?.addEventListener("click", () => {
      sessionStorage.removeItem("buikbu_user");
      state.currentUser = null;
      alert("로그아웃 되었습니다.");
      updateNavUI();
    });

    document.getElementById("btnOpenUserAdmin")?.addEventListener("click", () => {
      renderUserAdminTable();
      userAdminModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    document.getElementById("btnOpenAdminModal")?.addEventListener("click", handleRegisterClick);

  } else {
    navActions.innerHTML = `
      <button type="button" id="btnOpenLoginModal" class="btn-admin" style="background-color:#475569;">
        <i data-lucide="log-in" style="width:16px; height:16px;"></i>
        <span>로그인</span>
      </button>
      <button type="button" id="btnOpenSignupModal" class="btn-admin" style="background-color:#0f172a;">
        <i data-lucide="user-plus" style="width:16px; height:16px;"></i>
        <span>회원가입</span>
      </button>
      <button type="button" id="btnOpenAdminModal" class="btn-admin-add">
        <i data-lucide="plus-circle" style="width:16px; height:16px;"></i>
        <span>매물 등록</span>
      </button>
    `;

    document.getElementById("btnOpenLoginModal")?.addEventListener("click", () => loginModal.classList.add("active"));
    document.getElementById("btnOpenSignupModal")?.addEventListener("click", () => signupModal.classList.add("active"));
    document.getElementById("btnOpenAdminModal")?.addEventListener("click", handleRegisterClick);
  }

  if (window.lucide) lucide.createIcons();
}

function resetSubmitButton() {
  const submitBtn = propertyForm?.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <i data-lucide="check-circle" style="width:18px; height:18px;"></i>
      <span>매물 정보 저장하기</span>
    `;
    if (window.lucide) lucide.createIcons();
  }
}

function handleRegisterClick() {
  const user = state.currentUser;

  if (!user) {
    alert("🔒 매물 등록은 로그인한 승인 회원만 가능합니다.\n먼저 회원가입 및 로그인해 주세요.");
    loginModal.classList.add("active");
    return;
  }

  if (user.status !== "approved") {
    alert("⏳ 현재 관리자 가입 승인 대기 중입니다.\n관리자 승인 후 매물 등록이 가능합니다.");
    return;
  }

  if (!user.can_create && user.level < 8 && user.role !== 'admin') {
    alert(`🔒 매물 등록 권한이 부여되지 않았습니다.\n(현재 등급: ${LEVEL_NAMES[user.level] || user.level + '단계'})\n관리자에게 매물 등록 권한을 신청해 주세요.`);
    return;
  }

  isEditMode = false;
  editingPropertyId = null;
  const adminModalTitle = document.getElementById("adminModalTitle");
  if (adminModalTitle) adminModalTitle.textContent = "신규 매물 등록 (관리자)";
  if (propertyForm) propertyForm.reset();
  
  resetSubmitButton();
  toggleVillaSpec();
  calculateProfit();
  adminModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// -----------------------------------------------------------------------------
// 4.5. 자동 예상 수익 실시간 계산 (단위: 만원) 및 빌라 전용 필드 토글
// -----------------------------------------------------------------------------
function setupCalculationEvents() {
  const inputType = document.getElementById("inputType");
  const inputPurchasePrice = document.getElementById("inputPurchasePrice");
  const inputExpectedCost = document.getElementById("inputExpectedCost");
  const inputExpectedSellingPrice = document.getElementById("inputExpectedSellingPrice");

  if (inputType) {
    inputType.addEventListener("change", toggleVillaSpec);
  }

  [inputPurchasePrice, inputExpectedCost, inputExpectedSellingPrice].forEach(input => {
    if (input) {
      input.addEventListener("input", calculateProfit);
    }
  });
}

function toggleVillaSpec() {
  const inputType = document.getElementById("inputType");
  const villaSpecRow = document.getElementById("villaSpecRow");
  if (inputType && villaSpecRow) {
    if (inputType.value === "빌라") {
      villaSpecRow.style.display = "flex";
    } else {
      villaSpecRow.style.display = "none";
    }
  }
}

function calculateProfit() {
  const purchasePrice = parseFloat(document.getElementById("inputPurchasePrice")?.value) || 0;
  const expectedCost = parseFloat(document.getElementById("inputExpectedCost")?.value) || 0;
  const expectedSellingPrice = parseFloat(document.getElementById("inputExpectedSellingPrice")?.value) || 0;

  const profit = expectedSellingPrice - purchasePrice - expectedCost;
  const calcProfitText = document.getElementById("calcProfitText");

  if (calcProfitText) {
    const formattedProfit = Number(profit).toLocaleString('ko-KR');
    calcProfitText.textContent = `${formattedProfit} 만원`;
    if (profit > 0) {
      calcProfitText.style.color = "#059669";
    } else if (profit < 0) {
      calcProfitText.style.color = "#ef4444";
    } else {
      calcProfitText.style.color = "#64748b";
    }
  }
}

// -----------------------------------------------------------------------------
// 5. 매물 그리드 렌더링 및 모달
// -----------------------------------------------------------------------------
function getStatusBadgeClass(status) {
  switch (status) {
    case "매입준비중": return "badge-status-ready";
    case "계약": return "badge-status-contract";
    case "인테리어중": return "badge-status-interior";
    case "매매완료": return "badge-status-completed";
    case "매매진행중":
    default: return "badge-status-progress";
  }
}

function render() {
  const filtered = state.properties.filter(item => {
    const matchesCategory = state.selectedCategory === "전체" || item.property_type === state.selectedCategory;
    const query = state.searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.price.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (propertyCount) {
    propertyCount.innerHTML = `총 <strong>${filtered.length}</strong>개 매물`;
  }

  if (filtered.length === 0) {
    propertyGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i data-lucide="building-2" style="width: 48px; height: 48px; color: #94a3b8; margin-bottom: 12px;"></i>
        <h3 style="font-size: 1.125rem; font-weight: 700;">조건과 일치하는 매물이 없습니다.</h3>
        <p style="color: #94a3b8; font-size: 0.875rem;">검색어를 변경하거나 다른 카테고리를 선택해 보세요.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  propertyGrid.innerHTML = filtered
    .map(property => {
      const mainImg = (property.images && property.images.length > 0)
        ? property.images[0]
        : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

      const tradeStatus = property.trade_status || "매매진행중";
      const statusClass = getStatusBadgeClass(tradeStatus);

      return `
        <div class="property-card" data-id="${property.id}">
          <div class="card-image-wrap">
            <img src="${mainImg}" alt="${property.title}" class="card-image" />
            <div class="card-badge-type">${property.property_type}</div>
            <div class="badge-status ${statusClass}">${tradeStatus}</div>
          </div>
          <div class="card-content">
            <div>
              <div class="card-price">${property.price}</div>
              <h3 class="card-title">${property.title}</h3>
              <div class="card-location">
                <i data-lucide="map-pin" style="width:16px; height:16px; color:#94a3b8;"></i>
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${property.location}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="card-footer-item">
                <i data-lucide="maximize-2" style="width:14px; height:14px; color:#94a3b8;"></i>
                <span>${property.area_size}</span>
              </div>
              ${property.floor_info ? `
                <div class="card-footer-item">
                  <i data-lucide="layers" style="width:14px; height:14px; color:#94a3b8;"></i>
                  <span>${property.floor_info}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  if (window.lucide) lucide.createIcons();

  document.querySelectorAll(".property-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      const target = state.properties.find(p => p.id === id);
      if (target) openDetailModal(target);
    });
  });
}

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function openDetailModal(property) {
  state.selectedProperty = property;
  state.currentImageIndex = 0;

  modalTypeBadge.textContent = property.property_type;
  modalPrice.textContent = property.price;
  modalTitle.textContent = property.title;
  modalLocation.textContent = property.location;
  modalAreaSize.textContent = property.area_size;
  modalFloorInfo.textContent = property.floor_info || "정보 없음";
  modalZoningInfo.textContent = property.zoning_info || "정보 없음";
  modalCreatedAt.textContent = new Date(property.created_at).toLocaleDateString("ko-KR");
  modalDescription.textContent = property.description || "상세 설명이 없습니다.";

  // 빌라 전용 사양 표시
  if (property.property_type === "빌라") {
    modalVillaSpecBox.style.display = "block";
    modalVillaRooms.textContent = `방 ${property.rooms || 0}개 / 화장실 ${property.bathrooms || 0}개`;
  } else {
    modalVillaSpecBox.style.display = "none";
  }

  // 투자 & 수익 산출표 표시 (단위: 만원)
  modalPurchasePrice.textContent = Number(property.purchase_price || 0).toLocaleString('ko-KR') + " 만원";
  modalExpectedCost.textContent = Number(property.expected_cost || 0).toLocaleString('ko-KR') + " 만원";
  modalExpectedSellingPrice.textContent = Number(property.expected_selling_price || 0).toLocaleString('ko-KR') + " 만원";
  modalExpectedProfit.textContent = Number(property.expected_profit || 0).toLocaleString('ko-KR') + " 만원";

  // 참여 회원 명단
  modalParticipants.textContent = property.participant_members || "등록된 참여 회원 명단이 없습니다.";

  // 진행 상태 뱃지
  const status = property.trade_status || "매매진행중";
  modalStatusBadge.textContent = status;
  modalStatusBadge.className = getStatusBadgeClass(status);
  modalStatusBadge.style.cssText = "position:static; padding:4px 10px; border-radius:9999px; font-size:0.75rem; font-weight:700; color:#fff;";

  // 유튜브 비디오 임베드
  const modalYoutubeWrap = document.getElementById("modalYoutubeWrap");
  const youtubeId = extractYoutubeId(property.youtube_url);
  if (modalYoutubeWrap) {
    if (youtubeId) {
      modalYoutubeWrap.style.display = "block";
      modalYoutubeWrap.innerHTML = `
        <div style="font-size:0.875rem; font-weight:700; color:#0f172a; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
          <i data-lucide="video" style="width:16px; height:16px; color:#ef4444;"></i>
          <span>매물 홍보/임장 영상</span>
        </div>
        <div class="youtube-player-card">
          <iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=0" allowfullscreen></iframe>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    } else {
      modalYoutubeWrap.style.display = "none";
      modalYoutubeWrap.innerHTML = "";
    }
  }

  const btnEditProperty = document.getElementById("btnEditProperty");
  if (btnEditProperty) {
    btnEditProperty.onclick = () => {
      const user = state.currentUser;
      if (!user || user.status !== "approved") {
        alert("🔒 매물 수정 권한이 없습니다. (관리자 승인 필요)");
        return;
      }
      if (!user.can_edit && user.level < 8 && user.role !== 'admin') {
        alert("🔒 매물 수정 권한이 부여되지 않았습니다.");
        return;
      }

      isEditMode = true;
      editingPropertyId = property.id;
      document.getElementById("adminModalTitle").textContent = "매물 정보 수정";

      document.getElementById("inputTitle").value = property.title || "";
      document.getElementById("inputType").value = property.property_type || "빌라";
      document.getElementById("inputTradeStatus").value = property.trade_status || "매매진행중";
      document.getElementById("inputRooms").value = property.rooms || 3;
      document.getElementById("inputBathrooms").value = property.bathrooms || 2;
      document.getElementById("inputLocation").value = property.location || "";
      document.getElementById("inputFloorInfo").value = property.floor_info || "";
      document.getElementById("inputArea").value = property.area_size || "";
      document.getElementById("inputPrice").value = property.price || "";
      document.getElementById("inputZoning").value = property.zoning_info || "";

      document.getElementById("inputPurchasePrice").value = property.purchase_price || "";
      document.getElementById("inputExpectedCost").value = property.expected_cost || "";
      document.getElementById("inputExpectedSellingPrice").value = property.expected_selling_price || "";
      document.getElementById("inputParticipants").value = property.participant_members || "";

      document.getElementById("inputYoutubeUrl").value = property.youtube_url || "";
      document.getElementById("inputDescription").value = property.description || "";

      resetSubmitButton();
      toggleVillaSpec();
      calculateProfit();

      closeDetailModal();
      adminModal.classList.add("active");
      document.body.style.overflow = "hidden";
    };
  }

  const btnContactSms = document.getElementById("btnContactSms");
  if (btnContactSms) {
    btnContactSms.onclick = (e) => {
      e.preventDefault();
      const message = `안녕하세요! [${property.title}] 매물에 대해 문의드립니다.\n\n- 매물명: ${property.title}\n- 가격: ${property.price}\n- 위치: ${property.location}`;
      document.getElementById("smsContentInput").value = message;
      
      const btnSendSmsApp = document.getElementById("btnSendSmsApp");
      if (btnSendSmsApp) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        btnSendSmsApp.href = `sms:010-8917-8383${isIOS ? '&' : '?'}body=${encodeURIComponent(message)}`;
      }
      document.getElementById("smsModal").classList.add("active");
    };
  }

  updateGallery();
  detailModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeDetailModal() {
  detailModal.classList.remove("active");
  document.body.style.overflow = "";
}

function updateGallery() {
  const images = (state.selectedProperty.images && state.selectedProperty.images.length > 0)
    ? state.selectedProperty.images
    : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"];

  modalGalleryMain.src = images[state.currentImageIndex];
  galleryCounter.textContent = `${state.currentImageIndex + 1} / ${images.length}`;

  btnPrevImage.style.display = images.length > 1 ? "flex" : "none";
  btnNextImage.style.display = images.length > 1 ? "flex" : "none";

  if (images.length > 1) {
    modalGalleryThumbs.style.display = "flex";
    modalGalleryThumbs.innerHTML = images.map((img, idx) => `
      <img src="${img}" class="thumb-img ${idx === state.currentImageIndex ? 'active' : ''}" data-index="${idx}" />
    `).join("");

    document.querySelectorAll(".thumb-img").forEach(thumb => {
      thumb.addEventListener("click", (e) => {
        state.currentImageIndex = parseInt(e.target.getAttribute("data-index"), 10);
        updateGallery();
      });
    });
  } else {
    modalGalleryThumbs.style.display = "none";
  }
}

// -----------------------------------------------------------------------------
// 6. 최고 관리자 전용: 회원 승인 & 10단계 등급/권한 제어 렌더링
// -----------------------------------------------------------------------------
function renderUserAdminTable() {
  if (!userAdminTableBody) return;

  userAdminTableBody.innerHTML = state.users.map(u => {
    const isPending = u.status === 'pending';
    const isApproved = u.status === 'approved';
    const isRejected = u.status === 'rejected';

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; vertical-align: middle;">
        <td style="padding: 10px;">
          <div style="font-weight: 700; color: #0f172a;">${u.name}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${u.email}</div>
        </td>
        <td style="padding: 10px;">${u.phone}</td>
        <td style="padding: 10px;">
          ${isApproved ? '<span style="color:#10b981; font-weight:700;">🟢 승인완료</span>' : ''}
          ${isPending ? '<span style="color:#f59e0b; font-weight:700;">⏳ 승인대기</span>' : ''}
          ${isRejected ? '<span style="color:#ef4444; font-weight:700;">🔴 승인거절</span>' : ''}
        </td>
        <td style="padding: 10px;">
          <select class="user-level-select" data-id="${u.id}" style="padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.8rem;">
            ${Object.keys(LEVEL_NAMES).map(lvl => `
              <option value="${lvl}" ${u.level == lvl ? 'selected' : ''}>${LEVEL_NAMES[lvl]}</option>
            `).join('')}
          </select>
        </td>
        <td style="padding: 10px;">
          <label style="margin-right: 8px; cursor:pointer;">
            <input type="checkbox" class="user-perm-check" data-id="${u.id}" data-perm="can_create" ${u.can_create ? 'checked' : ''} /> 등록
          </label>
          <label style="margin-right: 8px; cursor:pointer;">
            <input type="checkbox" class="user-perm-check" data-id="${u.id}" data-perm="can_edit" ${u.can_edit ? 'checked' : ''} /> 수정
          </label>
        </td>
        <td style="padding: 10px; text-align: right;">
          ${isPending ? `
            <button type="button" class="btn-approve-user" data-id="${u.id}" style="background:#10b981; color:#fff; padding:4px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; margin-right:4px;">승인</button>
            <button type="button" class="btn-reject-user" data-id="${u.id}" style="background:#ef4444; color:#fff; padding:4px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">거절</button>
          ` : `
            <button type="button" class="btn-toggle-status" data-id="${u.id}" style="background:#64748b; color:#fff; padding:4px 8px; border-radius:6px; font-size:0.75rem;">${isApproved ? '승인취소' : '재승인'}</button>
          `}
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll(".btn-approve-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await updateUserProfile(id, { status: "approved", level: 2 });
    });
  });

  document.querySelectorAll(".btn-reject-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await updateUserProfile(id, { status: "rejected" });
    });
  });

  document.querySelectorAll(".btn-toggle-status").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const target = state.users.find(u => u.id === id);
      const nextStatus = target.status === 'approved' ? 'pending' : 'approved';
      await updateUserProfile(id, { status: nextStatus });
    });
  });

  document.querySelectorAll(".user-level-select").forEach(sel => {
    sel.addEventListener("change", async (e) => {
      const id = sel.getAttribute("data-id");
      const newLevel = parseInt(e.target.value, 10);
      await updateUserProfile(id, { level: newLevel });
    });
  });

  document.querySelectorAll(".user-perm-check").forEach(chk => {
    chk.addEventListener("change", async (e) => {
      const id = chk.getAttribute("data-id");
      const perm = chk.getAttribute("data-perm");
      const isChecked = e.target.checked;
      await updateUserProfile(id, { [perm]: isChecked });
    });
  });
}

async function updateUserProfile(id, updateData) {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("profiles").update(updateData).eq("id", id);
      if (error) console.error("Supabase 프로필 수정 오류:", error.message);
    } catch (e) {}
  }

  const idx = state.users.findIndex(u => u.id === id);
  if (idx !== -1) {
    state.users[idx] = { ...state.users[idx], ...updateData };
    renderUserAdminTable();
    alert("🎉 회원 등급 및 권한 설정이 성공적으로 반영되었습니다!");
  }
}

// -----------------------------------------------------------------------------
// 6.5. 이미지 파일 미리보기 & Supabase Storage 업로드
// -----------------------------------------------------------------------------
let selectedFiles = [];

function setupImageUploadHandlers() {
  const inputImageFiles = document.getElementById("inputImageFiles");
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");

  if (inputImageFiles) {
    inputImageFiles.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      selectedFiles = [...selectedFiles, ...files];
      renderImagePreviews();
      inputImageFiles.value = "";
    });
  }

  function renderImagePreviews() {
    if (!imagePreviewContainer) return;
    imagePreviewContainer.innerHTML = "";

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewItem = document.createElement("div");
        previewItem.className = "preview-item";
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="미리보기 ${index + 1}" />
          ${index === 0 ? '<span class="preview-badge-main">대표</span>' : ''}
          <button type="button" class="preview-remove-btn" data-index="${index}">&times;</button>
        `;
        imagePreviewContainer.appendChild(previewItem);

        previewItem.querySelector(".preview-remove-btn").addEventListener("click", (evt) => {
          evt.stopPropagation();
          const removeIdx = parseInt(evt.target.getAttribute("data-index"), 10);
          selectedFiles.splice(removeIdx, 1);
          renderImagePreviews();
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve) => {
    if (file.size < 300 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

async function uploadFilesToSupabase(files) {
  const uploadedUrls = [];
  for (let i = 0; i < files.length; i++) {
    const originalFile = files[i];
    const file = await compressImage(originalFile);
    
    const fileExt = file.name.split('.').pop();
    const filePath = `property_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.storage.from('property-images').upload(filePath, file, { cacheControl: '3600', upsert: false });
        if (error) {
          const base64Url = await fileToBase64(file);
          uploadedUrls.push(base64Url);
        } else {
          const { data: publicUrlData } = supabaseClient.storage.from('property-images').getPublicUrl(filePath);
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      } catch (err) {
        const base64Url = await fileToBase64(file);
        uploadedUrls.push(base64Url);
      }
    } else {
      const base64Url = await fileToBase64(file);
      uploadedUrls.push(base64Url);
    }
  }
  return uploadedUrls;
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// -----------------------------------------------------------------------------
// 7. 이벤트 바인딩 (DOM Loaded)
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initApp();

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      render();
    });
  }

  if (categoryContainer) {
    categoryContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-tag")) {
        document.querySelectorAll(".btn-tag").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        state.selectedCategory = e.target.getAttribute("data-category");
        render();
      }
    });
  }

  if (btnCloseDetailModal) btnCloseDetailModal.addEventListener("click", closeDetailModal);
  if (btnCloseSignupModal) btnCloseSignupModal.addEventListener("click", () => { signupModal.classList.remove("active"); document.body.style.overflow = ""; });
  if (btnCloseLoginModal) btnCloseLoginModal.addEventListener("click", () => { loginModal.classList.remove("active"); document.body.style.overflow = ""; });
  if (btnCloseUserAdminModal) btnCloseUserAdminModal.addEventListener("click", () => { userAdminModal.classList.remove("active"); document.body.style.overflow = ""; });
  
  const btnCloseAdminModal = document.getElementById("btnCloseAdminModal");
  const btnCancelAdminModal = document.getElementById("btnCancelAdminModal");

  function closeAdminModalSafe(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (adminModal) {
      adminModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (btnCloseAdminModal) btnCloseAdminModal.addEventListener("click", closeAdminModalSafe);
  if (btnCancelAdminModal) btnCancelAdminModal.addEventListener("click", closeAdminModalSafe);

  const btnCloseSmsModal = document.getElementById("btnCloseSmsModal");
  const smsModal = document.getElementById("smsModal");
  if (btnCloseSmsModal && smsModal) {
    btnCloseSmsModal.addEventListener("click", () => {
      smsModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  [detailModal, adminModal, signupModal, loginModal, userAdminModal, smsModal].forEach(modal => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      [detailModal, adminModal, signupModal, loginModal, userAdminModal, smsModal].forEach(modal => {
        if (modal) modal.classList.remove("active");
      });
      document.body.style.overflow = "";
    }
  });

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newMember = {
        id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
        email: document.getElementById("signupEmail").value.trim(),
        password: document.getElementById("signupPassword").value.trim(),
        name: document.getElementById("signupName").value.trim(),
        phone: document.getElementById("signupPhone").value.trim(),
        role: "member",
        level: 1,
        status: "pending",
        can_create: false,
        can_edit: false,
        can_delete: false,
        created_at: new Date().toISOString()
      };

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from("profiles").insert([newMember]);
          if (error) {
            alert(`[회원가입 실패] ${error.message}`);
            return;
          }
        } catch (err) {}
      }

      state.users.unshift(newMember);
      alert("🎉 회원가입 신청이 정상적으로 완료되었습니다!\n\n현재 [Level 1 - 승인대기] 상태입니다. 관리자가 가입을 승인한 후 이용하실 수 있습니다.");
      signupForm.reset();
      signupModal.classList.remove("active");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      let targetUser = null;

      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("email", email)
            .eq("password", password)
            .single();

          if (!error && data) {
            targetUser = data;
          }
        } catch (err) {}
      }

      if (!targetUser) {
        targetUser = state.users.find(u => u.email === email && u.password === password);
      }

      if (!targetUser) {
        alert("⚠️ 등록되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (targetUser.status === "pending") {
        alert("⏳ 현재 관리자의 가입 승인 대기 중입니다.\n관리자가 가입을 승인한 후 서비스 이용이 가능합니다.");
        return;
      }

      if (targetUser.status === "rejected") {
        alert("🔴 가입 승인이 거부된 계정입니다. 관리자에게 문의해 주세요.");
        return;
      }

      state.currentUser = targetUser;
      sessionStorage.setItem("buikbu_user", JSON.stringify(targetUser));
      alert(`🎉 반가워요, ${targetUser.name}님!\n(회원 등급: ${LEVEL_NAMES[targetUser.level] || targetUser.level + '단계'})`);
      
      loginForm.reset();
      loginModal.classList.remove("active");
      updateNavUI();
    });
  }

  // ---------------------------------------------------------------------------
  // 매물 등록 / 수정 폼 제출 이벤트
  // ---------------------------------------------------------------------------
  setupImageUploadHandlers();

  if (propertyForm) {
    propertyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = propertyForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>처리 중입니다...</span>`;

      try {
        let finalImageUrls = [];
        if (selectedFiles.length > 0) {
          finalImageUrls = await uploadFilesToSupabase(selectedFiles);
        }

        const purchasePrice = parseFloat(document.getElementById("inputPurchasePrice").value) || 0;
        const expectedCost = parseFloat(document.getElementById("inputExpectedCost").value) || 0;
        const expectedSellingPrice = parseFloat(document.getElementById("inputExpectedSellingPrice").value) || 0;
        const expectedProfit = expectedSellingPrice - purchasePrice - expectedCost;

        if (isEditMode && editingPropertyId) {
          const currentTarget = state.properties.find(p => p.id === editingPropertyId);
          const existingImages = (currentTarget && currentTarget.images) ? currentTarget.images : [];
          const updatedImages = (finalImageUrls.length > 0) ? [...existingImages, ...finalImageUrls] : existingImages;

          const updatePayload = {
            title: document.getElementById("inputTitle").value,
            property_type: document.getElementById("inputType").value,
            trade_status: document.getElementById("inputTradeStatus").value,
            rooms: parseInt(document.getElementById("inputRooms").value, 10) || 0,
            bathrooms: parseInt(document.getElementById("inputBathrooms").value, 10) || 0,
            location: document.getElementById("inputLocation").value,
            floor_info: document.getElementById("inputFloorInfo").value,
            price: document.getElementById("inputPrice").value,
            area_size: document.getElementById("inputArea").value,
            zoning_info: document.getElementById("inputZoning").value,
            purchase_price: purchasePrice,
            expected_cost: expectedCost,
            expected_selling_price: expectedSellingPrice,
            expected_profit: expectedProfit,
            participant_members: document.getElementById("inputParticipants").value,
            youtube_url: document.getElementById("inputYoutubeUrl").value.trim(),
            description: document.getElementById("inputDescription").value,
            images: updatedImages
          };

          if (supabaseClient) {
            const { error } = await supabaseClient.from("properties").update(updatePayload).eq("id", editingPropertyId);
            if (error) {
              alert(`[DB 수정 실패] ${error.message}`);
              return;
            }
            alert("🎉 매물 정보가 성공적으로 수정되었습니다!");
            await fetchProperties();
          } else {
            const idx = state.properties.findIndex(p => p.id === editingPropertyId);
            if (idx !== -1) {
              state.properties[idx] = { ...state.properties[idx], ...updatePayload };
              render();
            }
            alert("매물 정보가 수정되었습니다 (데모 모드).");
          }
        } else {
          if (finalImageUrls.length === 0) {
            finalImageUrls = ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"];
          }

          const newProperty = {
            id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
            title: document.getElementById("inputTitle").value,
            property_type: document.getElementById("inputType").value,
            trade_status: document.getElementById("inputTradeStatus").value,
            rooms: parseInt(document.getElementById("inputRooms").value, 10) || 0,
            bathrooms: parseInt(document.getElementById("inputBathrooms").value, 10) || 0,
            location: document.getElementById("inputLocation").value,
            floor_info: document.getElementById("inputFloorInfo").value,
            price: document.getElementById("inputPrice").value,
            area_size: document.getElementById("inputArea").value,
            zoning_info: document.getElementById("inputZoning").value,
            purchase_price: purchasePrice,
            expected_cost: expectedCost,
            expected_selling_price: expectedSellingPrice,
            expected_profit: expectedProfit,
            participant_members: document.getElementById("inputParticipants").value,
            youtube_url: document.getElementById("inputYoutubeUrl").value.trim(),
            description: document.getElementById("inputDescription").value,
            images: finalImageUrls,
            created_at: new Date().toISOString()
          };

          if (supabaseClient) {
            const { error } = await supabaseClient.from("properties").insert([newProperty]);
            if (error) {
              alert(`[DB 등록 실패] ${error.message}`);
              return;
            }
            alert("🎉 신규 매물이 데이터베이스에 등록되었습니다!");
            await fetchProperties();
          } else {
            state.properties.unshift(newProperty);
            render();
          }
        }

        propertyForm.reset();
        selectedFiles = [];
        isEditMode = false;
        editingPropertyId = null;
        adminModal.classList.remove("active");
        document.body.style.overflow = "";
      } catch (err) {
        alert(`처리 중 오류: ${err.message}`);
      } finally {
        resetSubmitButton();
      }
    });
  }
});
