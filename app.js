/**
 * =============================================================================
 * 파일명: app.js
 * 설명: 부동산 매물 관리 웹 애플리케이션 프론트엔드 비즈니스 로직 및 
 *       매물 실시간 댓글/문의 작성 & 관리자 삭제 기능
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

// 데모 매물 데이터 ("빌라", "상가", "기타")
const MOCK_PROPERTIES = [
  {
    id: "1",
    property_number: "2608001",
    registration_date: "2026-08-13",
    title: "역삼동 고급 올리모델링 신축급 빌라 (투룸/화1)",
    property_type: "빌라",
    trade_status: "매매진행중",
    location: "서울특별시 강남구 역삼동 824-1",
    floor_info: "3층 / 5층",
    rooms: 2,
    bathrooms: 1,
    price: "매매 38000 (3억 8천만원)",
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
    property_number: "2608002",
    registration_date: "2026-08-13",
    title: "성수동 메인 상권 1층 메디컬/카페 코너 상가",
    property_type: "상가",
    trade_status: "인테리어중",
    location: "서울특별시 성동구 성수동2가 289",
    floor_info: "1층 / 4층",
    rooms: 0,
    bathrooms: 0,
    price: "매매 250000 (25억원)",
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

// 데모 댓글 데이터
let MOCK_COMMENTS = [
  {
    id: "comment-1",
    property_id: "1",
    user_id: "user-admin",
    user_name: "최고 관리자",
    user_level: 10,
    content: "해당 빌라 매물은 최근 주차장 리모델링까지 완료되어 투자가치가 매우 뛰어납니다.",
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
const modalPropertyNumberBadge = document.getElementById("modalPropertyNumberBadge");
const modalPrice = document.getElementById("modalPrice");
const modalTitle = document.getElementById("modalTitle");
const modalLocation = document.getElementById("modalLocation");
const modalRegistrationDate = document.getElementById("modalRegistrationDate");
const modalPropertyNumber = document.getElementById("modalPropertyNumber");
const modalAreaSize = document.getElementById("modalAreaSize");
const modalFloorInfo = document.getElementById("modalFloorInfo");
const btnModalMapView = document.getElementById("btnModalMapView");
const modalVillaSpecBox = document.getElementById("modalVillaSpecBox");
const modalVillaRooms = document.getElementById("modalVillaRooms");
const modalZoningInfo = document.getElementById("modalZoningInfo");
const modalDescription = document.getElementById("modalDescription");

const modalPurchasePrice = document.getElementById("modalPurchasePrice");
const modalExpectedCost = document.getElementById("modalExpectedCost");
const modalExpectedSellingPrice = document.getElementById("modalExpectedSellingPrice");
const modalExpectedProfit = document.getElementById("modalExpectedProfit");
const modalParticipants = document.getElementById("modalParticipants");

// 댓글 요소 참조
const modalCommentsCount = document.getElementById("modalCommentsCount");
const commentsListContainer = document.getElementById("commentsListContainer");
const commentForm = document.getElementById("commentForm");
const commentFormWrap = document.getElementById("commentFormWrap");
const commentAuthorNotice = document.getElementById("commentAuthorNotice");
const commentLoginNotice = document.getElementById("commentLoginNotice");
const inputCommentText = document.getElementById("inputCommentText");

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
// 4-1. 유틸리티 함수: 만원 단위 금액을 한국어(억, 만원) 표기로 변환
// -----------------------------------------------------------------------------
function formatKoreanCurrency(priceVal) {
  if (!priceVal) return "가격 미상";
  // 이미 '억', '만', '원' 등의 문자가 들어있다면 기존 텍스트 그대로 반환
  if (typeof priceVal === 'string' && (priceVal.includes('억') || priceVal.includes('만') || priceVal.includes('원'))) {
    return priceVal;
  }
  
  const num = parseInt(priceVal.toString().replace(/,/g, ''), 10);
  if (isNaN(num)) return priceVal; 
  if (num === 0) return "0원";

  const uk = Math.floor(num / 10000);
  const rest = num % 10000;
  
  let result = "";
  if (uk > 0) result += `${uk}억`;
  if (rest > 0) {
    if (result.length > 0) result += " ";
    result += `${rest.toLocaleString('ko-KR')}만`;
  }
  
  return result.trim() + "원";
}

// -----------------------------------------------------------------------------
// 4. 유틸리티 함수: 7자리 무중복 자동 생성 (연도 2자 + 월 2자 + 3자 순번, 예: 2608001)
// -----------------------------------------------------------------------------
function generatePropertyNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${yy}${mm}`;

  const existingNumbers = new Set(
    (state.properties || [])
      .map(p => String(p.property_number || "").trim())
      .filter(Boolean)
  );

  let seq = 1;
  let candidate = `${prefix}${String(seq).padStart(3, '0')}`;

  while (existingNumbers.has(candidate)) {
    seq++;
    candidate = `${prefix}${String(seq).padStart(3, '0')}`;
  }

  return candidate;
}

// -----------------------------------------------------------------------------
// 5. 데이터 로딩 & 인증 상태 초기화
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
  
  // DB 연동 후에도 관리자 계정이 테이블에 없는 경우(초기화 누락 등) 무조건 MOCK_ADMIN을 배열에 포함시켜 앱이 멈추지 않게 함
  if (!state.users.find(u => u.role === "admin" && u.email === "admin@buikbu.com")) {
    state.users.push(MOCK_USERS[0]);
  }
}

async function fetchProperties() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data) {
        // 회원님이 등록하신 실제 DB 데이터만 보여줍니다 (예제 데이터 제외)
        state.properties = data;
      } else {
        state.properties = [];
      }
    } catch (err) {
      state.properties = [];
    }
  } else {
    state.properties = [];
  }
  render();
}

function updateNavUI() {
  const user = state.currentUser;
  const mobileNavActions = document.getElementById("mobileNavActions");
  const mobileMenuDrawer = document.getElementById("mobileMenuDrawer");

  function closeMobileDrawer() {
    if (mobileMenuDrawer) {
      mobileMenuDrawer.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  // 1. PC 데스크톱 버전 네비게이션 렌더링
  if (navActions) {
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
        renderBoards(); // 로그아웃 시 권한 버튼 재렌더링
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
  }

  // 게시판 쓰기 버튼 권한 (레벨 4이상) 제어
  const btnWriteNotice = document.getElementById("btnWriteNotice");
  const btnWriteInfo = document.getElementById("btnWriteInfo");
  if(user && user.level >= 4) {
    if(btnWriteNotice) btnWriteNotice.style.display = "flex";
    if(btnWriteInfo) btnWriteInfo.style.display = "flex";
  } else {
    if(btnWriteNotice) btnWriteNotice.style.display = "none";
    if(btnWriteInfo) btnWriteInfo.style.display = "none";
  }

  // 2. 모바일 3선 슬라이드 메뉴 드로어 렌더링
  if (mobileNavActions) {
    if (user) {
      const isAdmin = user.role === 'admin' || user.level === 10;
      mobileNavActions.innerHTML = `
        <div style="background:#f1f5f9; padding:12px; border-radius:10px; margin-bottom:6px; text-align:center;">
          <div style="font-size:0.75rem; color:#64748b;">로그인된 회원</div>
          <strong style="font-size:0.95rem; color:#0f172a;">👤 ${user.name} (${user.level}단계)</strong>
        </div>
        ${isAdmin ? `
          <button type="button" id="m_btnOpenUserAdmin" class="btn-admin" style="background-color:#10b981;">
            <i data-lucide="shield-check" style="width:18px; height:18px;"></i>
            <span>회원 승인/등급 관리</span>
          </button>
        ` : ''}
        <button type="button" id="m_btnOpenAdminModal" class="btn-admin-add">
          <i data-lucide="plus-circle" style="width:18px; height:18px;"></i>
          <span>매물 등록</span>
        </button>
        <button type="button" id="m_btnLogout" class="btn-admin" style="background-color:#64748b; margin-top:10px;">
          <i data-lucide="log-out" style="width:18px; height:18px;"></i>
          <span>로그아웃</span>
        </button>
      `;

      document.getElementById("m_btnLogout")?.addEventListener("click", () => {
        closeMobileDrawer();
        sessionStorage.removeItem("buikbu_user");
        state.currentUser = null;
        alert("로그아웃 되었습니다.");
        updateNavUI();
      });

      document.getElementById("m_btnOpenUserAdmin")?.addEventListener("click", () => {
        closeMobileDrawer();
        renderUserAdminTable();
        userAdminModal.classList.add("active");
        document.body.style.overflow = "hidden";
      });

      document.getElementById("m_btnOpenAdminModal")?.addEventListener("click", () => {
        closeMobileDrawer();
        handleRegisterClick();
      });

    } else {
      mobileNavActions.innerHTML = `
        <button type="button" id="m_btnOpenLoginModal" class="btn-admin" style="background-color:#475569;">
          <i data-lucide="log-in" style="width:18px; height:18px;"></i>
          <span>로그인</span>
        </button>
        <button type="button" id="m_btnOpenSignupModal" class="btn-admin" style="background-color:#0f172a;">
          <i data-lucide="user-plus" style="width:18px; height:18px;"></i>
          <span>회원가입</span>
        </button>
        <button type="button" id="m_btnOpenAdminModal" class="btn-admin-add" style="margin-top:6px;">
          <i data-lucide="plus-circle" style="width:18px; height:18px;"></i>
          <span>매물 등록</span>
        </button>
      `;

      document.getElementById("m_btnOpenLoginModal")?.addEventListener("click", () => {
        closeMobileDrawer();
        loginModal.classList.add("active");
      });
      document.getElementById("m_btnOpenSignupModal")?.addEventListener("click", () => {
        closeMobileDrawer();
        signupModal.classList.add("active");
      });
      document.getElementById("m_btnOpenAdminModal")?.addEventListener("click", () => {
        closeMobileDrawer();
        handleRegisterClick();
      });
    }
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
  currentPropertyImages = [];
  selectedFiles = [];
  const adminModalTitle = document.getElementById("adminModalTitle");
  if (adminModalTitle) adminModalTitle.textContent = "신규 매물 등록 (관리자)";
  if (propertyForm) propertyForm.reset();
  
  // 7자리 매물번호 자동 생성 세팅 (수정 불가 읽기 전용)
  const inputPropNum = document.getElementById("inputPropertyNumber");
  if (inputPropNum) {
    inputPropNum.value = generatePropertyNumber();
    inputPropNum.readOnly = true;
  }
  document.getElementById("inputRegistrationDate").value = new Date().toISOString().split('T')[0];

  resetSubmitButton();
  renderImagePreviews();
  toggleVillaSpec();
  calculateProfit();
  adminModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// -----------------------------------------------------------------------------
// 5.5. 자동 예상 수익 실시간 계산 (단위: 만원) 및 빌라 전용 필드 토글
// -----------------------------------------------------------------------------
function setupCalculationEvents() {
  const inputType = document.getElementById("inputType");
  const inputPurchasePrice = document.getElementById("inputPurchasePrice");
  const inputExpectedCost = document.getElementById("inputExpectedCost");
  const inputExpectedSellingPrice = document.getElementById("inputExpectedSellingPrice");

  if (inputType) {
    inputType.addEventListener("change", toggleVillaSpec);
  }

  const inputPrice = document.getElementById("inputPrice");
  [inputPrice, inputPurchasePrice, inputExpectedCost, inputExpectedSellingPrice].forEach(input => {
    if (input) {
      input.addEventListener("input", calculateProfit);
    }
  });
}

function toggleVillaSpec() {
  const inputType = document.getElementById("inputType");
  const villaSpecRow = document.getElementById("villaSpecRow");
  const villaExtraRow = document.getElementById("villaExtraRow");
  if (inputType && villaSpecRow) {
    if (inputType.value === "빌라") {
      villaSpecRow.style.display = "flex";
      if (villaExtraRow) villaExtraRow.style.display = "flex";
    } else {
      villaSpecRow.style.display = "none";
      if (villaExtraRow) villaExtraRow.style.display = "none";
    }
  }
}

function calculateProfit() {
  const contractPrice = parseFloat(document.getElementById("inputPrice")?.value) || 0;
  const expectedCost = parseFloat(document.getElementById("inputExpectedCost")?.value) || 0;
  const expectedSellingPrice = parseFloat(document.getElementById("inputExpectedSellingPrice")?.value) || 0;

  const profit = expectedSellingPrice - contractPrice - expectedCost;
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
// 6. 매물 그리드 렌더링 및 모달
// -----------------------------------------------------------------------------
function getStatusBadgeClass(status) {
  switch (status) {
    case "위탁매매준비중": return "badge-status-ready";
    case "매매계약완료": return "badge-status-contract";
    case "수리중": return "badge-status-interior";
    case "매매완료": return "badge-status-completed";
    case "매매진행중":
    default: return "badge-status-progress";
  }
}

function render() {
  const filtered = state.properties.filter(item => {
    const matchesCategory = state.selectedCategory === "전체" || item.property_type === state.selectedCategory;
    const query = state.searchQuery.toLowerCase();
    const propNum = (item.property_number || "").toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      propNum.includes(query) ||
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
        : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=500&q=70";

      const tradeStatus = property.trade_status || "매매진행중";
      const statusClass = getStatusBadgeClass(tradeStatus);
      const propNo = property.property_number || '2608001';
      const regDate = property.registration_date || (property.created_at ? property.created_at.split('T')[0] : '-');

      return `
        <div class="property-card" data-id="${property.id}">
          <div class="card-image-wrap">
            <img src="${mainImg}" alt="${property.title}" class="card-image" loading="lazy" decoding="async" />
            <div class="card-badge-type">${property.property_type}</div>
            <div class="badge-status ${statusClass}">${tradeStatus}</div>
          </div>
          <div class="card-content">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div class="card-price" style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
                <span style="font-size:0.75rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:2px 6px; border-radius:4px; border:1px solid #e2e8f0;">계약가</span>
                <span style="font-size:1.05rem; font-weight:700; color:#1e293b;">${formatKoreanCurrency(property.price)}</span>
              </div>
              <div style="font-size:0.75rem; color:#64748b; text-align:right; font-weight:600; line-height:1.4; background:#f1f5f9; padding:4px 8px; border-radius:6px;">
                <div>방 ${property.rooms || 0} · 화장실 ${property.bathrooms || 0}</div>
                <div>전용면적 ${
                  (property.area_size && property.area_size.includes('/')) 
                    ? property.area_size.split('/').pop().trim() 
                    : (property.area_size || '-')
                }</div>
              </div>
            </div>
            <h3 class="card-title">${property.title}</h3>
            <div class="card-location" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
              <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
                <i data-lucide="map-pin" style="width:14px; height:14px; color:#94a3b8; flex-shrink:0;"></i>
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${property.location}</span>
              </div>
              <button class="btn-map-view" data-location="${property.location}" style="display:flex; align-items:center; gap:4px; font-size:0.7rem; font-weight:700; padding:4px 8px; border-radius:4px; background:#f1f5f9; border:1px solid #cbd5e1; color:#0f172a; flex-shrink:0; cursor:pointer;">
                <i data-lucide="map" style="width:12px; height:12px; color:#3b82f6;"></i>지도
              </button>
            </div>
            </div>
            <div class="card-footer">
              <div class="card-footer-item">
                <span style="font-weight:600; color:#475569;">매물번호:${propNo}</span>
              </div>
              <div class="card-footer-item" style="margin-left: auto; justify-content: flex-end;">
                <i data-lucide="calendar" style="width:13px; height:13px; color:#10b981;"></i>
                <span>${regDate}</span>
              </div>
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

  document.querySelectorAll(".btn-map-view").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const locationStr = btn.getAttribute("data-location");
      if(locationStr) {
        const mapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(locationStr)}`;
        window.open(mapUrl, "_blank");
      }
    });
  });
}

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// -----------------------------------------------------------------------------
// 6.5. 실시간 댓글 로딩 및 렌더링 기능
// -----------------------------------------------------------------------------
async function fetchComments(propertyId) {
  let comments = [];

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("property_comments")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        comments = data;
      } else {
        comments = MOCK_COMMENTS.filter(c => c.property_id === propertyId);
      }
    } catch (err) {
      comments = MOCK_COMMENTS.filter(c => c.property_id === propertyId);
    }
  } else {
    comments = MOCK_COMMENTS.filter(c => c.property_id === propertyId);
  }

  renderComments(comments);
}

function renderComments(comments) {
  if (!commentsListContainer || !modalCommentsCount) return;

  modalCommentsCount.textContent = comments.length;

  if (comments.length === 0) {
    commentsListContainer.innerHTML = `
      <div style="text-align:center; padding:20px; background:#f8fafc; border-radius:10px; color:#94a3b8; font-size:0.85rem;">
        작성된 댓글이 없습니다. 첫번째 댓글을 남겨보세요!
      </div>
    `;
    return;
  }

  const currentUser = state.currentUser;

  commentsListContainer.innerHTML = comments.map(c => {
    const isOwner = currentUser && (currentUser.id === c.user_id || currentUser.email === c.user_id);
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.level === 10);
    const canDelete = isOwner || isAdmin;

    const dateStr = new Date(c.created_at).toLocaleString("ko-KR", {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    return `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px; position:relative;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-size:0.88rem; color:#0f172a;">${c.user_name}</strong>
            <span style="font-size:0.7rem; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; font-weight:700;">
              ${LEVEL_NAMES[c.user_level] || c.user_level + '단계'}
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.75rem; color:#94a3b8;">${dateStr}</span>
            ${canDelete ? `
              <button type="button" class="btn-delete-comment" data-id="${c.id}" style="background:none; border:none; color:#ef4444; font-size:0.75rem; font-weight:700; cursor:pointer; padding:0;">
                삭제
              </button>
            ` : ''}
          </div>
        </div>
        <div style="font-size:0.85rem; color:#334155; line-height:1.5; white-space:pre-line;">${c.content}</div>
      </div>
    `;
  }).join('');

  document.querySelectorAll(".btn-delete-comment").forEach(btn => {
    btn.onclick = async () => {
      const commentId = btn.getAttribute("data-id");
      if (!confirm("댓글을 삭제하시겠습니까?")) return;

      if (supabaseClient) {
        try {
          await supabaseClient.from("property_comments").delete().eq("id", commentId);
        } catch (e) {}
      }

      MOCK_COMMENTS = MOCK_COMMENTS.filter(c => c.id !== commentId);
      if (state.selectedProperty) {
        await fetchComments(state.selectedProperty.id);
      }
    };
  });
}

function openDetailModal(property) {
  state.selectedProperty = property;
  state.currentImageIndex = 0;

  const propNo = property.property_number || '2608001';
  const regDate = property.registration_date || (property.created_at ? property.created_at.split('T')[0] : '-');

  modalTypeBadge.textContent = property.property_type;
  modalPropertyNumberBadge.textContent = `No. ${propNo}`;
  modalPropertyNumber.textContent = propNo;
  modalRegistrationDate.textContent = regDate;

  modalPrice.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
      <span style="font-size:0.85rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:4px 8px; border-radius:6px; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center;">계약가</span>
      <span style="font-size:1.3rem; font-weight:800; color:#0f172a; line-height:1;">${formatKoreanCurrency(property.price)}</span>
    </div>
  `;
  modalTitle.textContent = property.title;
  modalLocation.textContent = property.location;

  // --- 진행상태 파이프라인 렌더링 ---
  const pipelineWrap = document.getElementById("modalPipelineWrap");
  if (pipelineWrap) {
    const steps = ["위탁매매준비중", "수리중", "매매진행중", "매매계약완료", "매매완료"];
    const currentStatus = property.trade_status || "매매진행중";
    let currentIndex = steps.indexOf(currentStatus);
    if(currentIndex === -1) currentIndex = 2; // 매치 안되면 매매진행중(기본)

    let html = `<div style="display:flex; justify-content:space-between; align-items:center; position:relative; width:100%;">`;
    // 배경 회색 선
    html += `<div style="position:absolute; top:12px; left:10%; right:10%; height:3px; background:#e2e8f0; z-index:0;"></div>`;
    
    // 파란색 진행 선
    const progressPercentage = currentIndex > 0 ? (currentIndex / (steps.length - 1)) * 80 + 10 : 10;
    html += `<div style="position:absolute; top:12px; left:10%; width:calc(${progressPercentage}% - 10%); height:3px; background:#3b82f6; z-index:0; transition:width 0.4s ease;"></div>`;

    steps.forEach((step, index) => {
      const isPastOrCurrent = index <= currentIndex;
      const isCurrent = index === currentIndex;
      const circleColor = isPastOrCurrent ? "#3b82f6" : "#f8fafc";
      const borderColor = isPastOrCurrent ? "#3b82f6" : "#cbd5e1";
      const iconHtml = isPastOrCurrent ? `<i data-lucide="check" style="width:14px; height:14px; color:#fff;"></i>` : ``;
      const textColor = isCurrent ? "#0f172a" : (isPastOrCurrent ? "#475569" : "#94a3b8");
      const fontWeight = isCurrent ? "800" : "600";
      
      html += `
        <div style="position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:6px; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:${circleColor}; border:2px solid ${borderColor}; display:flex; align-items:center; justify-content:center; outline:3px solid #fff;">
            ${iconHtml}
          </div>
          <span style="font-size:0.7rem; color:${textColor}; font-weight:${fontWeight}; text-align:center; word-break:keep-all; letter-spacing:-0.5px;">${step}</span>
        </div>
      `;
    });
    html += `</div>`;
    pipelineWrap.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }
  // --------------------------------
  const areaVal = property.area_size || '';
  modalAreaSize.textContent = areaVal ? (areaVal.includes('㎡') ? areaVal : areaVal + '㎡') : '-';
  modalFloorInfo.textContent = property.floor_info || "정보 없음";
  modalBuildYear.textContent = property.build_year || "정보 없음";
  modalDescription.textContent = property.description || "상세 설명이 없습니다.";

  // 빌라 전용 사양 표시
  if (property.property_type === "빌라") {
    modalVillaSpecBox.style.display = "block";
    modalVillaRooms.textContent = `방 ${property.rooms || 0}개 / 화장실 ${property.bathrooms || 0}개`;
  } else {
    modalVillaSpecBox.style.display = "none";
  }

  // 매물 조건 및 옵션 렌더링
  const conditions = property.conditions || [];
  const options = property.options || [];
  const modalExtraSpecBox = document.getElementById("modalExtraSpecBox");
  const modalConditionsWrap = document.getElementById("modalConditionsWrap");
  const modalOptionsWrap = document.getElementById("modalOptionsWrap");
  
  if (modalExtraSpecBox) {
    if (conditions.length > 0 || options.length > 0) {
      modalExtraSpecBox.style.display = "flex";
      if (modalConditionsWrap) {
        modalConditionsWrap.innerHTML = conditions.length > 0 
          ? conditions.map(c => `<span style="background-color: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">${c}</span>`).join("")
          : '<span style="font-size: 0.8rem; color: #94a3b8;">선택된 조건 없음</span>';
      }
      if (modalOptionsWrap) {
        modalOptionsWrap.innerHTML = options.length > 0 
          ? options.map(o => `<span style="background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">${o}</span>`).join("")
          : '<span style="font-size: 0.8rem; color: #94a3b8;">선택된 옵션 없음</span>';
      }
    } else {
      modalExtraSpecBox.style.display = "none";
    }
  }

  // 투자 & 수익 산출표 표시 (단위: 만원)
  modalPurchasePrice.textContent = Number(property.purchase_price || 0).toLocaleString('ko-KR') + " 만원";
  const modalCostDetailsWrap = document.getElementById("modalCostDetailsWrap");
  const modalCostDetails = document.getElementById("modalCostDetails");
  if (modalCostDetailsWrap && modalCostDetails) {
    if (property.cost_details) {
      modalCostDetailsWrap.style.display = "block";
      modalCostDetails.textContent = property.cost_details;
    } else {
      modalCostDetailsWrap.style.display = "none";
    }
  }
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
      currentPropertyImages = (property.images && property.images.length > 0) ? [...property.images] : [];
      selectedFiles = [];

      document.getElementById("adminModalTitle").textContent = "매물 정보 수정";

      const inputPropNum = document.getElementById("inputPropertyNumber");
      if (inputPropNum) {
        inputPropNum.value = property.property_number || generatePropertyNumber();
        inputPropNum.readOnly = true;
      }
      document.getElementById("inputRegistrationDate").value = property.registration_date || new Date().toISOString().split('T')[0];

      document.getElementById("inputTitle").value = property.title || "";
      document.getElementById("inputType").value = property.property_type || "빌라";
      document.getElementById("inputTradeStatus").value = property.trade_status || "매매진행중";
      document.getElementById("inputRooms").value = property.rooms || 3;
      document.getElementById("inputBathrooms").value = property.bathrooms || 2;
      document.getElementById("inputLocation").value = property.location || "";
      document.getElementById("inputFloorInfo").value = property.floor_info || "";
      document.getElementById("inputArea").value = property.area_size || "";
      document.getElementById("inputPrice").value = property.price || "";
      document.getElementById("inputBuildYear").value = property.build_year || "";

      // 조건 및 옵션 체크 복원
      const editConditions = property.conditions || [];
      const editOptions = property.options || [];
      document.querySelectorAll('input[name="conditions"]').forEach(cb => {
        cb.checked = editConditions.includes(cb.value);
      });
      document.querySelectorAll('input[name="options"]').forEach(cb => {
        cb.checked = editOptions.includes(cb.value);
      });

      document.getElementById("inputPurchasePrice").value = property.purchase_price || "";
      const inputCostDetails = document.getElementById("inputCostDetails");
      if (inputCostDetails) inputCostDetails.value = property.cost_details || "";
      document.getElementById("inputExpectedCost").value = property.expected_cost || "";
      document.getElementById("inputExpectedSellingPrice").value = property.expected_selling_price || "";
      document.getElementById("inputParticipants").value = property.participant_members || "";

      document.getElementById("inputYoutubeUrl").value = property.youtube_url || "";
      document.getElementById("inputDescription").value = property.description || "";

      resetSubmitButton();
      renderImagePreviews();
      toggleVillaSpec();
      calculateProfit();

      closeDetailModal();
      adminModal.classList.add("active");
      document.body.style.overflow = "hidden";
    };
  }

  // 최고 관리자 전용 매물 삭제 버튼 바인딩 및 권한 분기
  const btnDeleteProperty = document.getElementById("btnDeleteProperty");
  if (btnDeleteProperty) {
    const user = state.currentUser;
    const canDelete = user && (user.role === 'admin' || user.level === 10 || user.can_delete);
    
    if (canDelete) {
      btnDeleteProperty.style.display = "flex";
      btnDeleteProperty.onclick = async () => {
        const confirmDelete = confirm(
          `⚠️ [매물 삭제 경고]\n\n정말로 이 매물을 삭제하시겠습니까?\n\n- 매물번호: ${propNo}\n- 매물명: ${property.title}\n\n※ 삭제된 매물 데이터는 복구할 수 없습니다.`
        );

        if (!confirmDelete) return;

        try {
          if (supabaseClient) {
            const { error } = await supabaseClient.from("properties").delete().eq("id", property.id);
            if (error) console.warn("Supabase 삭제 오류 경고:", error.message);
          }

          state.properties = state.properties.filter(p => p.id !== property.id);
          closeDetailModal();
          render();
          alert(`🗑️ 매물(No. ${propNo})이 성공적으로 삭제되었습니다.`);
        } catch (err) {
          alert(`삭제 처리 중 오류: ${err.message}`);
        }
      };
    } else {
      btnDeleteProperty.style.display = "none";
    }
  }

  const btnContactSms = document.getElementById("btnContactSms");
  if (btnContactSms) {
    btnContactSms.onclick = (e) => {
      e.preventDefault();
      const message = `안녕하세요! [${property.title}] (매물번호: ${propNo}) 매물에 대해 문의드립니다.\n\n- 매물번호: ${propNo}\n- 매물명: ${property.title}\n- 가격: ${property.price}\n- 위치: ${property.location}`;
      document.getElementById("smsContentInput").value = message;
      
      const btnSendSmsApp = document.getElementById("btnSendSmsApp");
      if (btnSendSmsApp) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        btnSendSmsApp.href = `sms:010-8917-8383${isIOS ? '&' : '?'}body=${encodeURIComponent(message)}`;
      }
      document.getElementById("smsModal").classList.add("active");
    };
  }

  // 댓글 작성 UI 분기 (로그인 회원 전용)
  const currentUser = state.currentUser;
  if (currentUser) {
    if (commentForm) commentForm.style.display = "flex";
    if (commentLoginNotice) commentLoginNotice.style.display = "none";
    if (commentAuthorNotice) commentAuthorNotice.textContent = `✍️ 댓글 작성 (${currentUser.name} / ${LEVEL_NAMES[currentUser.level] || currentUser.level + '단계'})`;
  } else {
    if (commentForm) commentForm.style.display = "none";
    if (commentLoginNotice) commentLoginNotice.style.display = "block";
    const linkOpenLoginInComment = document.getElementById("linkOpenLoginInComment");
    if (linkOpenLoginInComment) {
      linkOpenLoginInComment.onclick = (e) => {
        e.preventDefault();
        closeDetailModal();
        loginModal.classList.add("active");
      };
    }
  }

  // 댓글 실시간 로딩
  fetchComments(property.id);

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

  const track = document.getElementById("modalGalleryTrack");
  if (track) {
    const currentPropId = state.selectedProperty.id || 'default';
    if (track.getAttribute("data-property-id") !== currentPropId) {
      track.innerHTML = images.map(img => `<img src="${img}" class="gallery-main-img" />`).join("");
      track.setAttribute("data-property-id", currentPropId);
    }
    track.style.transform = `translateX(-${state.currentImageIndex * 100}%)`;
  }

  galleryCounter.textContent = `${state.currentImageIndex + 1} / ${images.length}`;

  btnPrevImage.style.display = images.length > 1 ? "flex" : "none";
  btnNextImage.style.display = images.length > 1 ? "flex" : "none";

  if (images.length > 1) {
    modalGalleryThumbs.style.display = "flex";
    modalGalleryThumbs.innerHTML = images.map((img, idx) => `
      <img src="${img}" class="thumb-img ${idx === state.currentImageIndex ? 'active' : ''}" data-index="${idx}" loading="lazy" />
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
// 7. 최고 관리자 전용: 회원 승인 & 10단계 등급/권한 제어 렌더링
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
// 7.5. 이미지 파일 미리보기 & Supabase Storage 업로드 (기존 이미지 유지 및 삭제/추가)
// -----------------------------------------------------------------------------
let currentPropertyImages = [];
let selectedFiles = [];

function setupImageUploadHandlers() {
  const inputImageFiles = document.getElementById("inputImageFiles");

  if (inputImageFiles) {
    inputImageFiles.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      selectedFiles = [...selectedFiles, ...files];
      renderImagePreviews();
      inputImageFiles.value = "";
    });
  }
}

function renderImagePreviews() {
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");
  if (!imagePreviewContainer) return;
  imagePreviewContainer.innerHTML = "";

  let totalCount = 0;

  currentPropertyImages.forEach((imgUrl, index) => {
    totalCount++;
    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    previewItem.innerHTML = `
      <img src="${imgUrl}" alt="기존 이미지 ${index + 1}" />
      ${totalCount === 1 ? '<span class="preview-badge-main">대표</span>' : '<span style="position:absolute; top:4px; left:4px; background:#475569; color:#fff; font-size:0.65rem; padding:2px 6px; border-radius:4px; font-weight:700;">기존</span>'}
      <button type="button" class="preview-remove-btn" data-type="existing" data-index="${index}">&times;</button>
    `;
    imagePreviewContainer.appendChild(previewItem);

    previewItem.querySelector(".preview-remove-btn").addEventListener("click", (evt) => {
      evt.stopPropagation();
      currentPropertyImages.splice(index, 1);
      renderImagePreviews();
    });
  });

  selectedFiles.forEach((file, index) => {
    totalCount++;
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewItem = document.createElement("div");
      previewItem.className = "preview-item";
      previewItem.innerHTML = `
        <img src="${e.target.result}" alt="새 이미지 ${index + 1}" />
        ${totalCount === 1 ? '<span class="preview-badge-main">대표</span>' : '<span style="position:absolute; top:4px; left:4px; background:#10b981; color:#fff; font-size:0.65rem; padding:2px 6px; border-radius:4px; font-weight:700;">신규</span>'}
        <button type="button" class="preview-remove-btn" data-type="new" data-index="${index}">&times;</button>
      `;
      imagePreviewContainer.appendChild(previewItem);

      previewItem.querySelector(".preview-remove-btn").addEventListener("click", (evt) => {
        evt.stopPropagation();
        selectedFiles.splice(index, 1);
        renderImagePreviews();
      });
    };
    reader.readAsDataURL(file);
  });
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
// 8. 이벤트 바인딩 (DOM Loaded)
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

  if (btnPrevImage) {
    btnPrevImage.addEventListener("click", () => {
      const images = state.selectedProperty?.images || [];
      if (images.length > 1) {
        state.currentImageIndex = (state.currentImageIndex - 1 + images.length) % images.length;
        updateGallery();
      }
    });
  }

  if (btnNextImage) {
    btnNextImage.addEventListener("click", () => {
      const images = state.selectedProperty?.images || [];
      if (images.length > 1) {
        state.currentImageIndex = (state.currentImageIndex + 1) % images.length;
        updateGallery();
      }
    });
  }
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

  // 댓글 작성 폼 제출 처리
  if (commentForm) {
    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = state.currentUser;
      if (!user) {
        alert("🔒 댓글 작성을 위해 먼저 로그인해 주세요.");
        loginModal.classList.add("active");
        return;
      }

      if (!state.selectedProperty) return;

      const content = inputCommentText.value.trim();
      if (!content) return;

      const newComment = {
        id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `comment-${Date.now()}`,
        property_id: state.selectedProperty.id,
        user_id: user.id || user.email,
        user_name: user.name,
        user_level: user.level || 1,
        content: content,
        created_at: new Date().toISOString()
      };

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from("property_comments").insert([newComment]);
          if (error) console.warn("Supabase 댓글 insert 경고:", error.message);
        } catch (err) {}
      }

      MOCK_COMMENTS.unshift(newComment);
      inputCommentText.value = "";
      await fetchComments(state.selectedProperty.id);
    });
  }

  // 모바일 3선(햄버거) 토글 및 닫기 이벤트 바인딩
  const btnMobileMenuToggle = document.getElementById("btnMobileMenuToggle");
  const btnCloseMobileDrawer = document.getElementById("btnCloseMobileDrawer");
  const mobileMenuDrawer = document.getElementById("mobileMenuDrawer");

  if (btnMobileMenuToggle && mobileMenuDrawer) {
    btnMobileMenuToggle.addEventListener("click", () => {
      mobileMenuDrawer.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (btnCloseMobileDrawer && mobileMenuDrawer) {
    btnCloseMobileDrawer.addEventListener("click", () => {
      mobileMenuDrawer.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  if (btnModalMapView) {
    btnModalMapView.addEventListener("click", (e) => {
      e.stopPropagation();
      const locationStr = modalLocation ? modalLocation.textContent.trim() : "";
      if (locationStr && locationStr !== "-") {
        const mapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(locationStr)}`;
        window.open(mapUrl, "_blank");
      }
    });
  }

  [detailModal, adminModal, signupModal, loginModal, userAdminModal, smsModal, mobileMenuDrawer].forEach(modal => {
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
      [detailModal, adminModal, signupModal, loginModal, userAdminModal, smsModal, mobileMenuDrawer].forEach(modal => {
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

      // 3. 최후의 보루: DB나 state.users 어디에도 없지만 마스터 어드민 정보와 일치할 경우
      if (!targetUser && email === "admin@buikbu.com" && password === "admin1234") {
        targetUser = MOCK_USERS[0];
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
        let newUploadedUrls = [];
        if (selectedFiles.length > 0) {
          newUploadedUrls = await uploadFilesToSupabase(selectedFiles);
        }

        let finalImageUrls = [...currentPropertyImages, ...newUploadedUrls];
        if (finalImageUrls.length === 0) {
          finalImageUrls = ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"];
        }

        const checkedConditions = Array.from(document.querySelectorAll('input[name="conditions"]:checked')).map(cb => cb.value);
        const checkedOptions = Array.from(document.querySelectorAll('input[name="options"]:checked')).map(cb => cb.value);

        const contractPrice = parseFloat(document.getElementById("inputPrice").value) || 0;
        const purchasePrice = parseFloat(document.getElementById("inputPurchasePrice").value) || 0;
        const costDetails = document.getElementById("inputCostDetails") ? document.getElementById("inputCostDetails").value.trim() : "";
        const expectedCost = parseFloat(document.getElementById("inputExpectedCost").value) || 0;
        const expectedSellingPrice = parseFloat(document.getElementById("inputExpectedSellingPrice").value) || 0;
        const expectedProfit = expectedSellingPrice - contractPrice - expectedCost;

        const propertyNumber = document.getElementById("inputPropertyNumber").value.trim() || generatePropertyNumber();
        const registrationDate = document.getElementById("inputRegistrationDate").value || new Date().toISOString().split('T')[0];

        if (isEditMode && editingPropertyId) {
          const updatePayload = {
            property_number: propertyNumber,
            registration_date: registrationDate,
            title: document.getElementById("inputTitle").value,
            property_type: document.getElementById("inputType").value,
            trade_status: document.getElementById("inputTradeStatus").value,
            rooms: parseInt(document.getElementById("inputRooms").value, 10) || 0,
            bathrooms: parseInt(document.getElementById("inputBathrooms").value, 10) || 0,
            location: document.getElementById("inputLocation").value,
            floor_info: document.getElementById("inputFloorInfo").value,
            price: document.getElementById("inputPrice").value,
            area_size: document.getElementById("inputArea").value,
            build_year: document.getElementById("inputBuildYear").value,
            purchase_price: purchasePrice,
            cost_details: costDetails,
            expected_cost: expectedCost,
            expected_selling_price: expectedSellingPrice,
            expected_profit: expectedProfit,
            participant_members: document.getElementById("inputParticipants").value,
            youtube_url: document.getElementById("inputYoutubeUrl").value.trim(),
            description: document.getElementById("inputDescription").value,
            images: finalImageUrls,
            conditions: checkedConditions,
            options: checkedOptions
          };

          // 메모리 상의 state 배열 즉시 동기화 보장
          const idx = state.properties.findIndex(p => p.id === editingPropertyId);
          if (idx !== -1) {
            state.properties[idx] = { ...state.properties[idx], ...updatePayload };
          }

          if (supabaseClient) {
            try {
              const { error } = await supabaseClient.from("properties").update(updatePayload).eq("id", editingPropertyId);
              if (error) {
                console.warn("Supabase DB 수정 경고 (컬럼 미생성 가능성):", error.message);
                const fallbackPayload = { ...updatePayload };
                delete fallbackPayload.property_number;
                delete fallbackPayload.registration_date;
                await supabaseClient.from("properties").update(fallbackPayload).eq("id", editingPropertyId);
              }
            } catch (err) {
              console.warn("Supabase 갱신 오류:", err.message);
            }
          }

          render();
          Swal.fire({
            title: "BUIKBU 확인내용",
            text: "🎉 매물 번호 및 정보가 성공적으로 수정되었습니다!",
            icon: "success",
            confirmButtonText: "확인"
          });
        } else {
          const newProperty = {
            id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
            property_number: propertyNumber,
            registration_date: registrationDate,
            title: document.getElementById("inputTitle").value,
            property_type: document.getElementById("inputType").value,
            trade_status: document.getElementById("inputTradeStatus").value,
            rooms: parseInt(document.getElementById("inputRooms").value, 10) || 0,
            bathrooms: parseInt(document.getElementById("inputBathrooms").value, 10) || 0,
            location: document.getElementById("inputLocation").value,
            floor_info: document.getElementById("inputFloorInfo").value,
            price: document.getElementById("inputPrice").value,
            area_size: document.getElementById("inputArea").value,
            build_year: document.getElementById("inputBuildYear").value,
            purchase_price: purchasePrice,
            cost_details: costDetails,
            expected_cost: expectedCost,
            expected_selling_price: expectedSellingPrice,
            expected_profit: expectedProfit,
            participant_members: document.getElementById("inputParticipants").value,
            youtube_url: document.getElementById("inputYoutubeUrl").value.trim(),
            description: document.getElementById("inputDescription").value,
            images: finalImageUrls,
            conditions: checkedConditions,
            options: checkedOptions,
            created_at: new Date().toISOString()
          };

          state.properties.unshift(newProperty);

          if (supabaseClient) {
            try {
              const { error } = await supabaseClient.from("properties").insert([newProperty]);
              if (error) {
                console.warn("Supabase insert 실패 (컬럼 미생성 가능성):", error.message);
                const fallbackProp = { ...newProperty };
                delete fallbackProp.property_number;
                delete fallbackProp.registration_date;
                await supabaseClient.from("properties").insert([fallbackProp]);
              }
            } catch (err) {
              console.warn("Supabase 저장 오류:", err.message);
            }
          }

          render();
          Swal.fire({
            title: "BUIKBU 확인내용",
            text: "🎉 신규 매물이 등록되었습니다!",
            icon: "success",
            confirmButtonText: "확인"
          });
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
    });
  }
});

// =============================================================================
// [게시판 기능 추가 로직]
// =============================================================================
let MOCK_BOARDS = [];

const boardNoticeList = document.getElementById("boardNoticeList");
const boardInfoList = document.getElementById("boardInfoList");
const btnWriteNotice = document.getElementById("btnWriteNotice");
const btnWriteInfo = document.getElementById("btnWriteInfo");

const boardWriteModal = document.getElementById("boardWriteModal");
const btnBoardWriteClose = document.getElementById("btnBoardWriteClose");
const btnBoardWriteCancel = document.getElementById("btnBoardWriteCancel");
const boardWriteForm = document.getElementById("boardWriteForm");
const btnBoardWriteSubmit = document.getElementById("btnBoardWriteSubmit");

const boardDetailModal = document.getElementById("boardDetailModal");
const btnBoardDetailClose = document.getElementById("btnBoardDetailClose");
const btnBoardDetailOk = document.getElementById("btnBoardDetailOk");
const btnBoardDelete = document.getElementById("btnBoardDelete");

let currentBoardId = null;

async function fetchBoards() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("boards").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data) MOCK_BOARDS = data;
    } catch (err) {
      console.warn("게시판 DB 로드 실패, 빈 배열로 시작", err.message);
    }
  }
  renderBoards();
}

function renderBoards() {
  if (!boardNoticeList || !boardInfoList) return;

  const notices = MOCK_BOARDS.filter(b => b.category === "notice").slice(0, 5);
  const infos = MOCK_BOARDS.filter(b => b.category === "info").slice(0, 5);

  const renderItem = (b, badgeColor, isBold) => `
    <li data-id="${b.id}" class="board-item" style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:80%; cursor:pointer; ${isBold ? 'font-weight:700; color:' + badgeColor + ';' : ''}">${b.title}</span>
        <span style="font-size:0.75rem; color:#94a3b8;">${(b.created_at || "").substring(5, 10)}</span>
    </li>
  `;

  boardNoticeList.innerHTML = notices.length > 0 ? notices.map(b => renderItem(b, "#ef4444", true)).join("") : `<li style="padding: 10px 0; color:#94a3b8; font-size:0.8rem; text-align:center;">등록된 공지사항이 없습니다.</li>`;
  boardInfoList.innerHTML = infos.length > 0 ? infos.map(b => renderItem(b, "#3b82f6", false)).join("") : `<li style="padding: 10px 0; color:#94a3b8; font-size:0.8rem; text-align:center;">등록된 정보마당 글이 없습니다.</li>`;

  // 리스트 클릭 시 상세 모달 오픈
  document.querySelectorAll(".board-item").forEach(li => {
    li.addEventListener("click", () => {
      openBoardDetail(li.getAttribute("data-id"));
    });
  });
}

function openBoardDetail(id) {
  const b = MOCK_BOARDS.find(x => x.id === id);
  if(!b) return;
  currentBoardId = id;
  
  const badge = document.getElementById("boardDetailCategoryBadge");
  if(badge) {
    badge.textContent = b.category === 'notice' ? '공지사항' : '정보마당';
    badge.style.background = b.category === 'notice' ? '#ef4444' : '#3b82f6';
  }
  if(document.getElementById("boardDetailDate")) document.getElementById("boardDetailDate").textContent = (b.created_at || "").substring(0, 10);
  if(document.getElementById("boardDetailTitle")) document.getElementById("boardDetailTitle").textContent = b.title;
  if(document.getElementById("boardDetailAuthor")) document.getElementById("boardDetailAuthor").textContent = b.author_name || "관리자";
  if(document.getElementById("boardDetailContent")) document.getElementById("boardDetailContent").textContent = b.content;

  // 레벨 4 이상만 삭제 권한
  if(btnBoardDelete) {
    if(state.currentUser && state.currentUser.level >= 4) {
      btnBoardDelete.style.display = "flex";
    } else {
      btnBoardDelete.style.display = "none";
    }
  }

  if(boardDetailModal) {
    boardDetailModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

// 상세 모달 닫기
[btnBoardDetailClose, btnBoardDetailOk].forEach(btn => {
  if(btn) btn.addEventListener("click", () => {
    if(boardDetailModal) boardDetailModal.classList.remove("active");
    document.body.style.overflow = "";
    currentBoardId = null;
  });
});

// 쓰기 모달 닫기
[btnBoardWriteClose, btnBoardWriteCancel].forEach(btn => {
  if(btn) btn.addEventListener("click", () => {
    if(boardWriteModal) boardWriteModal.classList.remove("active");
    document.body.style.overflow = "";
    if(boardWriteForm) boardWriteForm.reset();
  });
});

// 새 글 쓰기 버튼 클릭
[btnWriteNotice, btnWriteInfo].forEach(btn => {
  if(btn) btn.addEventListener("click", (e) => {
    const isNotice = e.currentTarget.id === 'btnWriteNotice';
    const catSelect = document.getElementById("boardWriteCategory");
    if(catSelect) catSelect.value = isNotice ? 'notice' : 'info';
    if(boardWriteModal) {
      boardWriteModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });
});

// 글 등록 Submit
if(btnBoardWriteSubmit) {
  btnBoardWriteSubmit.addEventListener("click", async () => {
    if(!state.currentUser || state.currentUser.level < 4) {
      alert("글쓰기 권한이 없습니다."); return;
    }
    const cat = document.getElementById("boardWriteCategory").value;
    const title = document.getElementById("boardWriteTitle").value.trim();
    const content = document.getElementById("boardWriteContent").value.trim();
    if(!title || !content) {
      alert("제목과 내용을 모두 입력해주세요."); return;
    }

    btnBoardWriteSubmit.disabled = true;
    const newBoard = {
      id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
      category: cat,
      title: title,
      content: content,
      author_name: state.currentUser.name,
      author_email: state.currentUser.email,
      created_at: new Date().toISOString()
    };

    if(supabaseClient) {
      try {
        await supabaseClient.from("boards").insert([newBoard]);
      } catch(e) { console.warn("Supabase Board Insert Failed", e); }
    }
    MOCK_BOARDS.unshift(newBoard);
    
    if(boardWriteModal) boardWriteModal.classList.remove("active");
    document.body.style.overflow = "";
    if(boardWriteForm) boardWriteForm.reset();
    
    if(typeof Swal !== 'undefined') {
      Swal.fire({ title: "BUIKBU 확인내용", text: "게시글이 성공적으로 등록되었습니다.", icon: "success", confirmButtonText: "확인" });
    } else {
      alert("게시글이 등록되었습니다.");
    }
    renderBoards();
    btnBoardWriteSubmit.disabled = false;
  });
}

// 게시글 삭제
if(btnBoardDelete) {
  btnBoardDelete.addEventListener("click", async () => {
    if(!confirm("이 게시글을 완전히 삭제하시겠습니까?")) return;
    
    if(supabaseClient && currentBoardId) {
      try {
        await supabaseClient.from("boards").delete().eq("id", currentBoardId);
      } catch(e) { console.warn("Delete Failed", e); }
    }
    MOCK_BOARDS = MOCK_BOARDS.filter(b => b.id !== currentBoardId);
    
    if(boardDetailModal) boardDetailModal.classList.remove("active");
    document.body.style.overflow = "";
    renderBoards();
  });
}

// 초기화 시 게시판 불러오기 호출
setTimeout(() => {
    fetchBoards();
}, 500);
