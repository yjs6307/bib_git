/**
 * =============================================================================
 * 파일명: app.js
 * 설명: 부동산 매물 관리 웹 애플리케이션 프론트엔드 비즈니스 로직 (Vanilla JS)
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// 1. Supabase 클라이언트 초기화 및 데모 데이터 설정
// -----------------------------------------------------------------------------
// Supabase 프로젝트 URL과 Anon Key를 입력하면 실제 Supabase DB와 연동됩니다.
const SUPABASE_URL = "https://your-supabase-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-supabase-anon-key";

let supabaseClient = null;
if (window.supabase && SUPABASE_URL !== "https://your-supabase-project-id.supabase.co") {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Supabase 연동 전 시연 및 초기 로딩을 위한 검증된 데모 매물 데이터
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
  },
  {
    id: "4",
    title: "판교 테크노밸리 인근 오피스텔 통매매 / 기업 사옥 추천",
    property_type: "오피스텔",
    location: "경기도 성남시 분당구 삼평동 680",
    price: "매매 120억원",
    area_size: "공급 1,320.0㎡ / 전용 950.0㎡",
    zoning_info: "중심상업지역",
    description: `판교역 인근 대기업 사옥 또는 연수원용으로 적합한 오피스 건물입니다.\n
- 신분당선 판교역 도보권, 수도권 제1순환고속도로 진출입 용이\n
- 최신 빌딩제어 시스템 및 EV 충전소 완비`,
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
    ],
    created_at: new Date().toISOString()
  }
];

// -----------------------------------------------------------------------------
// 2. 애플리케이션 상태 (State Management)
// -----------------------------------------------------------------------------
let state = {
  properties: [],
  selectedCategory: "전체",
  searchQuery: "",
  selectedProperty: null,
  currentImageIndex: 0
};

// -----------------------------------------------------------------------------
// 3. DOM 요소 참조
// -----------------------------------------------------------------------------
const propertyGrid = document.getElementById("propertyGrid");
const propertyCount = document.getElementById("propertyCount");
const searchInput = document.getElementById("searchInput");
const categoryContainer = document.getElementById("categoryContainer");

// 모달 요소 참조
const detailModal = document.getElementById("detailModal");
const btnCloseDetailModal = document.getElementById("btnCloseDetailModal");
const modalGalleryMain = document.getElementById("modalGalleryMain");
const modalGalleryThumbs = document.getElementById("modalGalleryThumbs");
const btnPrevImage = document.getElementById("btnPrevImage");
const btnNextImage = document.getElementById("btnNextImage");
const galleryCounter = document.getElementById("galleryCounter");

// 상세 정보 필드 참조
const modalTypeBadge = document.getElementById("modalTypeBadge");
const modalPrice = document.getElementById("modalPrice");
const modalTitle = document.getElementById("modalTitle");
const modalLocation = document.getElementById("modalLocation");
const modalAreaSize = document.getElementById("modalAreaSize");
const modalZoningInfo = document.getElementById("modalZoningInfo");
const modalCreatedAt = document.getElementById("modalCreatedAt");
const modalDescription = document.getElementById("modalDescription");

// 관리자 모달 및 폼 참조
const adminModal = document.getElementById("adminModal");
const btnOpenAdminModal = document.getElementById("btnOpenAdminModal");
const btnCloseAdminModal = document.getElementById("btnCloseAdminModal");
const propertyForm = document.getElementById("propertyForm");

// -----------------------------------------------------------------------------
// 4. 데이터 페칭 및 렌더링 로직
// -----------------------------------------------------------------------------
async function fetchProperties() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      state.properties = data && data.length > 0 ? data : MOCK_PROPERTIES;
    } catch (err) {
      console.warn("Supabase 데이터 조회 오류, 데모 데이터를 사용합니다:", err);
      state.properties = MOCK_PROPERTIES;
    }
  } else {
    state.properties = MOCK_PROPERTIES;
  }
  render();
}

/**
 * 상태에 맞는 매물 리스트 그리드 렌더링
 */
function render() {
  // 1. 필터링 로직 적용
  const filtered = state.properties.filter(item => {
    const matchesCategory = state.selectedCategory === "전체" || item.property_type === state.selectedCategory;
    const query = state.searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.price.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // 2. 개수 업데이트
  if (propertyCount) {
    propertyCount.innerHTML = `총 <strong>${filtered.length}</strong>개 매물`;
  }

  // 3. 카드 그리드 생성
  if (filtered.length === 0) {
    propertyGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i data-lucide="building-2" style="width: 48px; height: 48px; color: #94a3b8; margin-bottom: 12px;"></i>
        <h3 style="font-size: 1.125rem; font-weight: 700;">조건과 일치하는 매물이 없습니다.</h3>
        <p style="color: #94a3b8; font-size: 0.875rem;">검색어를 변경하거나 다른 카테고리를 선택해 보세요.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  propertyGrid.innerHTML = filtered
    .map(property => {
      const mainImg = (property.images && property.images.length > 0)
        ? property.images[0]
        : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

      const imgCountBadge = (property.images && property.images.length > 1)
        ? `<div class="card-badge-count">+${property.images.length}장</div>`
        : "";

      return `
        <div class="property-card" data-id="${property.id}">
          <div class="card-image-wrap">
            <img src="${mainImg}" alt="${property.title}" class="card-image" />
            <div class="card-badge-type">${property.property_type}</div>
            ${imgCountBadge}
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

  // Lucide 아이콘 동적 렌더링
  if (window.lucide) {
    lucide.createIcons();
  }

  // 카드 클릭 이벤트 바인딩
  document.querySelectorAll(".property-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      const target = state.properties.find(p => p.id === id);
      if (target) openDetailModal(target);
    });
  });
}

// -----------------------------------------------------------------------------
// 5. 백드롭 블러 상세 모달 (Modal Logic)
// -----------------------------------------------------------------------------
function openDetailModal(property) {
  state.selectedProperty = property;
  state.currentImageIndex = 0;

  // 텍스트 정보 채우기
  modalTypeBadge.textContent = property.property_type;
  modalPrice.textContent = property.price;
  modalTitle.textContent = property.title;
  modalLocation.textContent = property.location;
  modalAreaSize.textContent = property.area_size;
  modalZoningInfo.textContent = property.zoning_info || "정보 없음";
  modalCreatedAt.textContent = new Date(property.created_at).toLocaleDateString("ko-KR");
  modalDescription.textContent = property.description || "상세 설명이 없습니다.";

  // 갤러리 이미지 업데이트
  updateGallery();

  // 모달 표시
  detailModal.classList.add("active");
  document.body.style.overflow = "hidden"; // 배경 스크롤 방지
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

  // 좌우 버튼 조절
  btnPrevImage.style.display = images.length > 1 ? "flex" : "none";
  btnNextImage.style.display = images.length > 1 ? "flex" : "none";

  // 썸네일 렌더링
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
// 6. 이벤트 리스너 등록
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  fetchProperties();

  // 검색창 입력 이벤트
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      render();
    });
  }

  // 카테고리 태그 클릭 이벤트
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

  // 상세보기 모달 닫기
  if (btnCloseDetailModal) btnCloseDetailModal.addEventListener("click", closeDetailModal);
  if (detailModal) {
    detailModal.addEventListener("click", (e) => {
      if (e.target === detailModal) closeDetailModal();
    });
  }

  // 갤러리 슬라이드 버튼
  if (btnPrevImage) {
    btnPrevImage.addEventListener("click", (e) => {
      e.stopPropagation();
      const images = state.selectedProperty.images || [];
      state.currentImageIndex = (state.currentImageIndex === 0) ? images.length - 1 : state.currentImageIndex - 1;
      updateGallery();
    });
  }

  if (btnNextImage) {
    btnNextImage.addEventListener("click", (e) => {
      e.stopPropagation();
      const images = state.selectedProperty.images || [];
      state.currentImageIndex = (state.currentImageIndex === images.length - 1) ? 0 : state.currentImageIndex + 1;
      updateGallery();
    });
  }

  // 관리자 매물 등록 모달 제어
  if (btnOpenAdminModal) {
    btnOpenAdminModal.addEventListener("click", () => {
      adminModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (btnCloseAdminModal) {
    btnCloseAdminModal.addEventListener("click", () => {
      adminModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // 매물 등록 폼 제출 이벤트
  if (propertyForm) {
    propertyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newProperty = {
        id: String(Date.now()),
        title: document.getElementById("inputTitle").value,
        property_type: document.getElementById("inputType").value,
        location: document.getElementById("inputLocation").value,
        price: document.getElementById("inputPrice").value,
        area_size: document.getElementById("inputArea").value,
        zoning_info: document.getElementById("inputZoning").value,
        description: document.getElementById("inputDescription").value,
        images: [
          document.getElementById("inputImage").value ||
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
        ],
        created_at: new Date().toISOString()
      };

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from("properties").insert([newProperty]);
          if (error) throw error;
        } catch (err) {
          console.warn("Supabase 저장 중 오류가 발생하여 메모리에 추가합니다:", err);
        }
      }

      state.properties.unshift(newProperty);
      render();
      alert("새 매물이 등록되었습니다!");
      propertyForm.reset();
      adminModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }
});
