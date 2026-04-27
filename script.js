// --- 深色模式切換邏輯 ---
const themeToggleBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const htmlElement = document.documentElement;

themeToggleBtn.addEventListener("click", () => {
  if (htmlElement.getAttribute("data-bs-theme") === "dark") {
    // 切換回白天模式
    htmlElement.setAttribute("data-bs-theme", "light");
    themeIcon.classList.replace("bi-sun-fill", "bi-moon-fill");
    themeToggleBtn.classList.replace("btn-outline-light", "btn-outline-secondary");
  } else {
    // 切換為夜間模式
    htmlElement.setAttribute("data-bs-theme", "dark");
    themeIcon.classList.replace("bi-moon-fill", "bi-sun-fill");
    themeToggleBtn.classList.replace("btn-outline-secondary", "btn-outline-light");
  }
});
// ----------------------
const form = document.getElementById("beautyForm");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");

// 修改1：上傳照片時，顯示整個特效容器，並重置特效透明度
photoInput.addEventListener("change", function() {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    photoPreview.src = event.target.result;
    document.getElementById("tryOnWrapper").classList.remove("d-none");
    document.getElementById("makeupOverlay").style.opacity = "0";
    document.getElementById("hairOverlay").style.opacity = "0";
  };
  reader.readAsDataURL(file);
});

function analyzePhoto() {
  if (!photoInput.files[0]) {
    alert("請先上傳照片或拍照後再進行分析。");
    return;
  }

  // 設定各種五官的選項對應值
  const faceOptions = [
    { value: "round", text: "圓臉" }, { value: "square", text: "方臉" }, 
    { value: "long", text: "長臉" }, { value: "oval", text: "鵝蛋臉" }, { value: "heart", text: "心形臉" }
  ];
  const eyeOptions = [
    { value: "almond", text: "杏仁眼" }, { value: "round_eye", text: "圓眼" }, 
    { value: "hooded", text: "內雙" }, { value: "long_eye", text: "細長眼" }, { value: "drooping", text: "下垂眼" }
  ];
  const noseOptions = [
    { value: "small", text: "小巧鼻" }, { value: "straight", text: "直挺鼻" }, 
    { value: "round_nose", text: "圓鼻頭" }, { value: "wide", text: "寬鼻翼" }, { value: "high", text: "高鼻樑" }
  ];
  const lipOptions = [
    { value: "thin", text: "薄唇" }, { value: "thick", text: "厚唇" }, 
    { value: "smile", text: "微笑唇" }, { value: "m_shape", text: "M 字唇" }, { value: "natural_lip", text: "自然唇形" }
  ];

  // 隨機模擬 AI 分析結果
  const randomFace = faceOptions[Math.floor(Math.random() * faceOptions.length)];
  const randomEye = eyeOptions[Math.floor(Math.random() * eyeOptions.length)];
  const randomNose = noseOptions[Math.floor(Math.random() * noseOptions.length)];
  const randomLip = lipOptions[Math.floor(Math.random() * lipOptions.length)];

  // 1. 更新畫面上的分析標籤文字
  document.getElementById("detectedFace").textContent = randomFace.text;
  document.getElementById("detectedEye").textContent = randomEye.text;
  document.getElementById("detectedNose").textContent = randomNose.text;
  document.getElementById("detectedLip").textContent = randomLip.text;
  document.getElementById("photoAnalysis").classList.remove("d-none");

  // 2. 自動將分析結果帶入下方的表單欄位
  document.getElementById("faceShape").value = randomFace.value;
  document.getElementById("eyeShape").value = randomEye.value;
  document.getElementById("noseShape").value = randomNose.value;
  document.getElementById("lipShape").value = randomLip.value;
}

// 修改2：表單送出時，加入動畫與兩秒延遲
form.addEventListener("submit", function(event) {
  event.preventDefault();

  // 取出表單資料
  const faceShape = document.getElementById("faceShape").value;
  const skinTone = document.getElementById("skinTone").value;
  const hairLength = document.getElementById("hairLength").value;
  const style = document.getElementById("style").value;
  const occasion = document.getElementById("occasion").value;

  // 1. 啟動 AI 掃描線動畫與按鈕狀態
  const scanLine = document.getElementById("scanLine");
  scanLine.classList.add("scanning");
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = "AI 正在為您套用造型...";
  submitBtn.disabled = true;

  // 2. 設定 2 秒鐘的假運算時間
  // 2. 設定 2 秒鐘的假運算時間
  setTimeout(() => {
    // 停止掃描線，恢復按鈕
    scanLine.classList.remove("scanning");
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;

    // --- 啟動圖片魔法疊加 ---
    const makeupOverlay = document.getElementById("makeupOverlay");
    const hairOverlay = document.getElementById("hairOverlay");

    if (skinTone === "fair") makeupOverlay.style.backgroundColor = "rgba(255, 230, 235, 0.5)"; 
    else if (skinTone === "natural") makeupOverlay.style.backgroundColor = "rgba(255, 220, 190, 0.4)"; 
    else if (skinTone === "warm") makeupOverlay.style.backgroundColor = "rgba(210, 150, 110, 0.4)"; 

    makeupOverlay.style.opacity = "1";
    hairOverlay.style.opacity = "0.85";

    // --- 將使用者的照片同步到報告大頭貼 ---
    if (photoPreview.src && photoPreview.src !== window.location.href) {
      document.getElementById("resultPortrait").src = photoPreview.src;
    }

    // --- 將下拉選單的「文字」寫入結果標籤中 ---
    const getSelectText = (id) => {
        const select = document.getElementById(id);
        return select.options[select.selectedIndex].text;
    };
    document.getElementById("resFace").textContent = getSelectText("faceShape") || "未選擇";
    document.getElementById("resSkin").textContent = getSelectText("skinTone") || "未選擇";
    document.getElementById("resHair").textContent = getSelectText("hairLength") || "未選擇";
    document.getElementById("resStyle").textContent = getSelectText("style") || "未選擇";
    document.getElementById("resOccasion").textContent = getSelectText("occasion") || "未選擇";

    // 顯示結果區塊並捲動
    document.getElementById("emptyResult").classList.add("d-none");
    document.getElementById("resultContent").classList.remove("d-none");
    document.getElementById("saveMessage").textContent = "";
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });

  }, 2000); // 這裡的 2000 就是延遲 2 秒
});

function saveFavorite() {
  document.getElementById("saveMessage").textContent = "已收藏此推薦結果！";
}