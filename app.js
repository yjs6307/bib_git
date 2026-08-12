/**
 * =============================================================================
 * 파일명: app.js
 * 설명: 부동산 매물 관리 웹 애플리케이션 프론트엔드 비즈니스 로직 및 
 *       승인제 10단계 회원 등급 / 권한 관리 시스템 (Vanilla JS)
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

// 데모 초기 회원 데이터 (DB 연결 전 시연용)
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
  },
  {
    id: "user-agent",
    email: "agent@buikbu.com",
    password: "1234",
    name: "김에이전트 공인중개사",
    phone: "010-2222-3333",
    role: "member",
    level: 8,
    status: "approved",
    can_create: true,
    can_edit: true,
    can_delete: false,
    created_at: new Date().toISOString()
  },
  {
    id: "user-pending",
    email: "newmember@buikbu.com",
    password: "1234",
    name: "신규가입자 (승인대기중)",
    phone: "010-9999-8888",
    role: "member",
    level: 1,
    status: "pending",
    can_create: false,
    can_edit: false,
    can_delete: false,
    created_at: new Date().toISOString()
  }
];

// 데모 매물 데이터
const MOCK_PROPERTIES = [
  {
    id: "1",
    title: "강남구 역삼동 신축 프라임 메디컬/오피스 타워 상가",
    property_type: "상가",
    location: "서울특별시 강남구 역삼동 824-1",
    price: "매매 45억원 (보증금 2억/월 1,500만)",
    area_size: "공급 330.5㎡ / 전용 214.8㎡ (100평/65평)",
    zoning_info: "중심상업지역",
    description: `역삼역 도보 3분 거리의 가시성 및 접근성이 매우 뛰어난 신축 타워 상가입니다.\n
- 병의원, 클리닉, 고급 브런치 카페 및 리테일 프랜차이즈 강추\n
- 층고 4.5m로 개방감 우수하며 자주식 주차 10대 가능\n
- 안정적인 고수익 임대수익률 (연 4.5% 예상)`,
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "성수동 지식산업센터 펜트하우스형 지식공장 & 전용 테라스",
    property_type: "공장/산업용지",
    location: "서울특별시 성동구 성수동2가 289",
    price: "매매 28억원",
    area_size: "공급 297.5㎡ / 전용 181.8㎡",
    zoning_info: "준공업지역",
    description: `성수 IT 밸리 중심에 위치한 최고층 지식산업센터 매물입니다.\n
- IT, 스튜디오, 디자인 기업 사옥용으로 최적\n
- 화물 엘리베이터 직접 연결 및 넉넉한 층고 확보\n
- 전용 야외 루프탑 테라스 포함`,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "한남동 UN빌리지 초입 최고급 럭셔리 하이엔드 아파트",
    property_type: "아파트",
    location: "서울특별시 용산구 한남동 11-1",
    price: "매매 75억원",
    area_size: "공급 264.4㎡ / 전용 220.1㎡",
    zoning_info: "제1종전용주거지역",
    description: `파노라마 한강뷰가 일품인 최상급 주거 공간입니다.\n
- 철저한 보안 및 24시간 단지 관리 시스템 제공\n
- 최상급 천연 대리석 인테리어 및 최고급 가전 풀옵션 빌트인\n
- 주차 가구당 3대 지원`,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
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
  currentUser: null // 현재 로그인된 사용자 정보
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
const modalPrice = document.getElementById("modalPrice");
const modalTitle = document.getElementById("modalTitle");
const modalLocation = document.getElementById("modalLocation");
const modalAreaSize = document.getElementById("modalAreaSize");
const modalZoningInfo = document.getElementById("modalZoningInfo");
const modalCreatedAt = document.getElementById("modalCreatedAt");
const modalDescription = document.getElementById("modalDescription");

// 신규 회원가입 & 로그인 & 회원관리 모달 참조
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
  // 1. 저장된 세션 유저 로드
  const savedUser = sessionStorage.getItem("buikbu_user");
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
    } catch (e) {
      state.currentUser = null;
    }
  }

  // 2. 매물 및 회원 데이터 로드
  await fetchUsers();
  await fetchProperties();
  updateNavUI();
}

async function fetchUsers() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      state.users = data && data.length > 0 ? data : MOCK_USERS;
    } catch (err) {
      console.warn("Supabase 프로필 조회 경고, 데모 유저 데이터를 사용합니다:", err);
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
      console.warn("Supabase 매물 조회 경고, 데모 매물 데이터를 사용합니다:", err);
      state.properties = MOCK_PROPERTIES;
    }
  } else {
    state.properties = MOCK_PROPERTIES;
  }
  render();
}

/**
 * 로그인 상태에 맞춰 헤더 네비게이션 액션 버튼 렌더링
 */
function updateNavUI() {
  if (!navActions) return;

  const user = state.currentUser;

  if (user) {
    // 최고 관리자 (Role === 'admin' 또는 Level 10)
    const isAdmin = user.role === 'admin' || user.level === 10;

    navActions.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.8rem; background:#f1f5f9; color:#0f172a; padding:6px 12px; border-radius:9999px; font-weight:700;">
          👤 ${user.name} (${user.level}단계)
        </span>
        ${isAdmin ? `
          <button id="btnOpenUserAdmin" class="btn-admin" style="background-color:#10b981;">
            <i data-lucide="shield-check" style="width:16px; height:16px;"></i>
            <span>회원 승인/등급</span>
          </button>
        ` : ''}
        <button id="btnOpenAdminModal" class="btn-admin-add">
          <i data-lucide="plus-circle" style="width:16px; height:16px;"></i>
          <span>매물 등록</span>
        </button>
        <button id="btnLogout" class="btn-admin" style="background-color:#64748b;">
          <i data-lucide="log-out" style="width:16px; height:16px;"></i>
          <span>로그아웃</span>
        </button>
      </div>
    `;

    // 이벤트 다시 바인딩
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        sessionStorage.removeItem("buikbu_user");
        state.currentUser = null;
        alert("로그아웃 되었습니다.");
        updateNavUI();
      });
    }

    const btnOpenUserAdmin = document.getElementById("btnOpenUserAdmin");
    if (btnOpenUserAdmin) {
      btnOpenUserAdmin.addEventListener("click", () => {
        renderUserAdminTable();
        userAdminModal.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    }

    const btnReg = document.getElementById("btnOpenAdminModal");
    if (btnReg) {
      btnReg.addEventListener("click", handleRegisterClick);
    }

  } else {
    // 미로그인 상태
    navActions.innerHTML = `
      <button id="btnOpenLoginModal" class="btn-admin" style="background-color:#475569;">
        <i data-lucide="log-in" style="width:16px; height:16px;"></i>
        <span>로그인</span>
      </button>
      <button id="btnOpenSignupModal" class="btn-admin" style="background-color:#0f172a;">
        <i data-lucide="user-plus" style="width:16px; height:16px;"></i>
        <span>회원가입</span>
      </button>
      <button id="btnOpenAdminModal" class="btn-admin-add">
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

/**
 * 매물 등록 버튼 클릭 권한 체크
 */
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

  // 매물 등록 권한(can_create) 또는 최고 관리자 여부 체크
  if (!user.can_create && user.level < 8 && user.role !== 'admin') {
    alert(`🔒 매물 등록 권한이 부여되지 않았습니다.\n(현재 등급: ${LEVEL_NAMES[user.level] || user.level + '단계'})\n관리자에게 매물 등록 권한을 신청해 주세요.`);
    return;
  }

  // 승인된 권한자 등록 모달 열기
  isEditMode = false;
  editingPropertyId = null;
  const adminModalTitle = document.getElementById("adminModalTitle");
  if (adminModalTitle) adminModalTitle.textContent = "신규 매물 등록";
  if (propertyForm) propertyForm.reset();
  
  adminModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// -----------------------------------------------------------------------------
// 5. 매물 그리드 렌더링 및 모달
// -----------------------------------------------------------------------------
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

      return `
        <div class="property-card" data-id="${property.id}">
          <div class="card-image-wrap">
            <img src="${mainImg}" alt="${property.title}" class="card-image" />
            <div class="card-badge-type">${property.property_type}</div>
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
              ${property.zoning_info ? `
                <div class="card-footer-item">
                  <i data-lucide="tag" style="width:14px; height:14px; color:#94a3b8;"></i>
                  <span>${property.zoning_info}</span>
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

function openDetailModal(property) {
  state.selectedProperty = property;
  state.currentImageIndex = 0;

  modalTypeBadge.textContent = property.property_type;
  modalPrice.textContent = property.price;
  modalTitle.textContent = property.title;
  modalLocation.textContent = property.location;
  modalAreaSize.textContent = property.area_size;
  modalZoningInfo.textContent = property.zoning_info || "정보 없음";
  modalCreatedAt.textContent = new Date(property.created_at).toLocaleDateString("ko-KR");
  modalDescription.textContent = property.description || "상세 설명이 없습니다.";

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
      document.getElementById("inputType").value = property.property_type || "상가";
      document.getElementById("inputLocation").value = property.location || "";
      document.getElementById("inputPrice").value = property.price || "";
      document.getElementById("inputArea").value = property.area_size || "";
      document.getElementById("inputZoning").value = property.zoning_info || "";
      document.getElementById("inputDescription").value = property.description || "";

      closeDetailModal();
      adminModal.classList.add("active");
      document.body.style.overflow = "hidden";
    };
  }

  const btnContactSms = document.getElementById("btnContactSms");
  if (btnContactSms) {
    btnContactSms.onclick = (e) => {
      e.preventDefault();
      const message = `안녕하세요! [${property.title}] 매물에 대해 문의드립니다.\n\n- 매물명: ${property.title}\n- 매매/임대가: ${property.price}\n- 위치: ${property.location}`;
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
            <button class="btn-approve-user" data-id="${u.id}" style="background:#10b981; color:#fff; padding:4px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; margin-right:4px;">승인</button>
            <button class="btn-reject-user" data-id="${u.id}" style="background:#ef4444; color:#fff; padding:4px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">거절</button>
          ` : `
            <button class="btn-toggle-status" data-id="${u.id}" style="background:#64748b; color:#fff; padding:4px 8px; border-radius:6px; font-size:0.75rem;">${isApproved ? '승인취소' : '재승인'}</button>
          `}
        </td>
      </tr>
    `;
  }).join('');

  // 이벤트 바인딩
  // 1. 회원 승인
  document.querySelectorAll(".btn-approve-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await updateUserProfile(id, { status: "approved", level: 2 });
    });
  });

  // 2. 가입 거절
  document.querySelectorAll(".btn-reject-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await updateUserProfile(id, { status: "rejected" });
    });
  });

  // 3. 승인 토글
  document.querySelectorAll(".btn-toggle-status").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const target = state.users.find(u => u.id === id);
      const nextStatus = target.status === 'approved' ? 'pending' : 'approved';
      await updateUserProfile(id, { status: nextStatus });
    });
  });

  // 4. 10단계 등급 변경
  document.querySelectorAll(".user-level-select").forEach(sel => {
    sel.addEventListener("change", async (e) => {
      const id = sel.getAttribute("data-id");
      const newLevel = parseInt(e.target.value, 10);
      await updateUserProfile(id, { level: newLevel });
    });
  });

  // 5. 권한 체크박스 변경
  document.querySelectorAll(".user-perm-check").forEach(chk => {
    chk.addEventListener("change", async (e) => {
      const id = chk.getAttribute("data-id");
      const perm = chk.getAttribute("data-perm");
      const isChecked = e.target.checked;
      await updateUserProfile(id, { [perm]: isChecked });
    });
  });
}

/**
 * DB 및 로컬 상태 회원 프로필 업데이트 유틸리티
 */
async function updateUserProfile(id, updateData) {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("profiles").update(updateData).eq("id", id);
      if (error) console.error("Supabase 프로필 수정 오류:", error.message);
    } catch (e) {
      console.warn("프로필 업데이트 예외:", e);
    }
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

async function uploadFilesToSupabase(files) {
  const uploadedUrls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
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

  // 검색창 입력
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      render();
    });
  }

  // 카테고리 태그
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

  // 상세 모달 닫기
  if (btnCloseDetailModal) btnCloseDetailModal.addEventListener("click", closeDetailModal);
  if (btnCloseSignupModal) btnCloseSignupModal.addEventListener("click", () => signupModal.classList.remove("active"));
  if (btnCloseLoginModal) btnCloseLoginModal.addEventListener("click", () => loginModal.classList.remove("active"));
  if (btnCloseUserAdminModal) btnCloseUserAdminModal.addEventListener("click", () => userAdminModal.classList.remove("active"));

  // ---------------------------------------------------------------------------
  // 신규 회원가입 폼 제출 이벤트
  // ---------------------------------------------------------------------------
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
        level: 1, // 최초가입 시 Level 1 (준회원/승인대기)
        status: "pending", // 관리자 승인 대기중
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
        } catch (err) {
          console.warn("Supabase 프로필 가입 실패, 메모리에 등록합니다:", err);
        }
      }

      state.users.unshift(newMember);
      alert("🎉 회원가입 신청이 정상적으로 완료되었습니다!\n\n현재 [Level 1 - 승인대기] 상태입니다. 관리자가 가입을 승인한 후 이용하실 수 있습니다.");
      signupForm.reset();
      signupModal.classList.remove("active");
    });
  }

  // ---------------------------------------------------------------------------
  // 로그인 폼 제출 이벤트
  // ---------------------------------------------------------------------------
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

      // 승인 상태 체크
      if (targetUser.status === "pending") {
        alert("⏳ 현재 관리자의 가입 승인 대기 중입니다.\n관리자가 가입을 승인한 후 서비스 이용이 가능합니다.");
        return;
      }

      if (targetUser.status === "rejected") {
        alert("🔴 가입 승인이 거부된 계정입니다. 관리자에게 문의해 주세요.");
        return;
      }

      // 로그인 성공
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

        if (isEditMode && editingPropertyId) {
          const updatePayload = {
            title: document.getElementById("inputTitle").value,
            property_type: document.getElementById("inputType").value,
            location: document.getElementById("inputLocation").value,
            price: document.getElementById("inputPrice").value,
            area_size: document.getElementById("inputArea").value,
            zoning_info: document.getElementById("inputZoning").value,
            description: document.getElementById("inputDescription").value,
          };
          if (finalImageUrls.length > 0) updatePayload.images = finalImageUrls;

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
            location: document.getElementById("inputLocation").value,
            price: document.getElementById("inputPrice").value,
            area_size: document.getElementById("inputArea").value,
            zoning_info: document.getElementById("inputZoning").value,
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
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});
