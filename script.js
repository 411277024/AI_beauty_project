// --- 深色模式切換邏輯 ---
const themeToggleBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const htmlElement = document.documentElement;

// ==========================================
// ⚙️ 設定：後端網址
//   · 在自己電腦上（127.0.0.1 / localhost）：網頁由後端 main.py 自己提供，
//     所以用相對路徑呼叫，不用設定
//   · 放在 GitHub Pages：把「部署好的後端網址」填在下面的 PROD_API，
//     例如 "https://beauty-api.onrender.com"（結尾不要加 /）
//   · PROD_API 留空 = 離線版，使用下方內建資料，不呼叫任何後端
// ⚠️ API 金鑰只能放在後端的環境變數，絕對不要寫在這個檔案
// ==========================================
const PROD_API = " https://ai-beauty-api-w6ua.onrender.com";
const IS_LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
const API_BASE = IS_LOCAL ? "" : PROD_API;
const USE_API = IS_LOCAL || PROD_API !== "";

// 呼叫後端：沒設定、逾時、回傳錯誤，一律回傳 null，讓程式退回內建資料
// 後端要等 Gemini 寫報告、OpenAI 畫圖，所以預設等 90 秒
async function callApi(path, options, timeoutMs) {
    if (!USE_API) return null;
    try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeoutMs || 90000);
        const res = await fetch(API_BASE + path, Object.assign({ signal: ctrl.signal }, options));
        clearTimeout(timer);
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.warn("後端無法使用，改用內建資料：", err);
        return null;
    }
}

// ==========================================
// 📦 離線版內建資料：髮色、妝容步驟、場合小提醒
// ==========================================
const LOCAL_HAIR_COLORS = {
    "白皙": [
        { name: "霧感奶茶棕", desc: "輕盈透明感，讓白皙膚色更清透。", hex: "#9C7C64" },
        { name: "櫻花粉棕", desc: "帶一點粉霧的暖調，氣色更好。", hex: "#A67C73" },
        { name: "冷調灰棕", desc: "低飽和冷調，俐落又顯白。", hex: "#6F6258" }
    ],
    "自然": [
        { name: "焦糖暖棕色", desc: "溫柔浪漫，視覺髮質更柔順。", hex: "#6B4E31" },
        { name: "榛果可可棕", desc: "不挑膚色，日常百搭。", hex: "#7A5A44" },
        { name: "冷光黑茶色", desc: "低調高級感，適合正式場合。", hex: "#3B332C" }
    ],
    "小麥": [
        { name: "深可可棕", desc: "與健康膚色同色系，質感沉穩。", hex: "#4E362A" },
        { name: "琥珀蜜棕", desc: "帶一點金色光澤，膚色更有活力。", hex: "#7B5230" },
        { name: "暖調咖啡黑", desc: "低調耐看，面試與職場都適合。", hex: "#2F2622" }
    ]
};

const LOCAL_MAKEUP_STEPS = {
    "自然清新":   [["輕透底妝", "選用保濕型粉底薄薄一層，保留肌膚自然紋理。"], ["自然眼妝", "淺棕色眼影暈染眼窩，睫毛夾翹即可。"], ["清新唇頰", "裸粉色腮紅搭配水潤唇膏，氣色自然。"]],
    "韓系溫柔":   [["水光底妝", "輕薄水光粉底，在臉頰與鼻樑打亮。"], ["柔霧眼妝", "粉棕色眼影加上臥蠶提亮，眼線畫到眼尾即可。"], ["蜜桃唇頰", "蜜桃色腮紅橫掃雙頰，搭配霧面漸層唇。"]],
    "甜美可愛":   [["粉嫩底妝", "選粉調粉底，局部遮瑕，保持柔嫩感。"], ["閃亮眼妝", "粉色系眼影加珠光，下眼瞼點綴細亮粉。"], ["元氣唇頰", "圓形粉腮紅搭配糖果色水光唇。"]],
    "清冷個性":   [["霧面底妝", "霧面粉底，修容加強臉部輪廓。"], ["冷調眼妝", "灰棕與霧紫眼影，眼尾拉長更銳利。"], ["低彩唇頰", "豆沙色唇膏，腮紅只上淡淡一層。"]],
    "成熟優雅":   [["精緻底妝", "遮瑕完整、膚質均勻，重點在質感。"], ["深邃眼妝", "暖咖啡色眼影，眼線貼近睫毛根部。"], ["玫瑰唇頰", "玫瑰豆沙色唇膏搭配淡雅腮紅。"]],
    "純慾撩人":   [["光澤底妝", "底妝輕薄帶光澤，鼻樑與顴骨提亮。"], ["迷濛眼妝", "暖棕與酒紅眼影暈染，眼尾微微上揚。"], ["漸層唇頰", "咬唇妝搭配淡淡腮紅，中心深、外緣淡。"]],
    "歐美辣妹":   [["立體底妝", "中高遮瑕，修容與打亮強化立體感。"], ["煙燻眼妝", "深棕或黑色眼影煙燻，眼線加粗。"], ["豐潤唇頰", "裸色豐唇搭配明顯的修容。"]],
    "復古港風":   [["霧面底妝", "霧面底妝，眉毛畫成微挑的細彎眉。"], ["復古眼妝", "橙棕色眼影，眼線拉長上揚。"], ["復古紅唇", "正紅或磚紅唇，腮紅斜掃顴骨。"]],
    "日系透明感": [["透明底妝", "極薄粉底，只在必要處遮瑕。"], ["淡彩眼妝", "淡粉或淡棕眼影，睫毛刷出自然捲翹。"], ["櫻花唇頰", "淡櫻花色腮紅搭配透明感唇彩。"]],
    "富家千金":   [["細緻底妝", "均勻柔焦底妝，重點是乾淨平滑。"], ["柔和眼妝", "奶茶色眼影，細眼線，睫毛自然。"], ["珊瑚唇頰", "珊瑚粉腮紅搭配同色系唇膏。"]],
    "中性少年感": [["清爽底妝", "薄透底妝，保留自然膚色。"], ["俐落眼妝", "大地色眼影，眉毛畫成平直的粗眉。"], ["低調唇頰", "裸色潤唇膏，腮紅省略或只做淡淡修容。"]]
};

const LOCAL_OCCASION_TIPS = {
    "daily": "日常通勤以好整理為優先。",
    "date": "約會可以加強捲度與氣色。",
    "interview": "面試建議髮型整齊、妝容低調。",
    "travel": "旅遊建議選耐活動、好整理的造型。",
    "concert": "音樂祭與派對可以大膽一點，用亮片或鮮明的唇色。",
    "night_out": "夜間場合可以加強眼妝與唇色的對比。",
    "wedding_guest": "婚禮宴會以優雅為主，避免蓋過新人的風采。",
    "photoshoot": "棚拍妝容要比平常稍微加深，鏡頭前才不會顯得太淡。"
};

// 依問卷條件組出推薦資料；格式與後端回傳的一致
function buildLocalRecommendation(u) {
    const optText = id => {
        const el = document.getElementById(id);
        return el && el.selectedIndex >= 0 ? el.options[el.selectedIndex].text : "";
    };
    const colors = LOCAL_HAIR_COLORS[u.skinTone] || LOCAL_HAIR_COLORS["自然"];
    const steps = LOCAL_MAKEUP_STEPS[u.style] || LOCAL_MAKEUP_STEPS["自然清新"];

    const hair = optText("hairLength");
    const face = optText("faceShape");
    const style = u.style || optText("style");
    const lenTip = hair.includes("短") ? "髮長建議以耳下到下巴之間為主，用層次增加蓬鬆感"
                 : hair.includes("中") ? "髮長建議維持在鎖骨上下，用層次增加輕盈感"
                 : "髮長建議維持在鎖骨以下，用層次增加輕盈感";
    const faceTip = face ? "針對" + face + "，瀏海與髮流可以修飾臉部線條" : "瀏海與髮流可以修飾臉部線條";
    const occasionTip = LOCAL_OCCASION_TIPS[u.occasion] || "";

    return {
        hair_colors: colors,
        makeup_steps: steps.map((s, i) => ({ title: "Step " + (i + 1) + ": " + s[0], desc: s[1] })),
        summary: lenTip + "。" + faceTip + "，整體朝「" + style + "」風格搭配，更有氛圍感。" + occasionTip,
        images: { step2_eye: "images/makeup_eye_default.png" }
    };
}

// 某個臉型沒有「不建議」髮型資料時，退回 HTML 裡原本的預設內容
function resetAvoidHairs() {
    [["avoidHairImg1", "images/hair4.png", "avoidHair1", "厚重齊瀏海"],
     ["avoidHairImg2", "images/hair5.png", "avoidHair2", "貼頭皮直髮"]].forEach(function (d) {
        const img = document.getElementById(d[0]);
        const txt = document.getElementById(d[2]);
        if (img) img.src = d[1];
        if (txt) txt.textContent = d[3];
    });
}
// ==========================================
// 🌟 第一區：大櫃子 (全域變數)
// 請放在檔案的「第一行」，不要包在任何括號或函數裡面！
// 如果你之前有貼上舊的 3 張圖版本，請把它整段刪除，換成下面這個。
// ==========================================
const hairstyleDatabase = {
    "圓臉": {
        "long": [
            { title: "長層次+八字劉海", image: "images/圓臉1.png" },
            { title: "韓系Hush Cut", image: "images/圓臉2.png" },
            { title: "大波浪長髮", image: "images/圓臉3.png" }
        ],
        "medium": [
            { title: "鎖骨層次髮", image: "images/圓臉4.png" },
            { title: "C字燙鎖骨髮", image: "images/圓臉5.png" },
            { title: "睡不醒頭", image: "images/圓臉6.png" }
        ],
        "short": [
            { title: "耳下鮑伯", image: "images/圓臉7.png" },
            { title: "層次短鮑伯", image: "images/圓臉8.png" },
            { title: "狼尾短髮", image: "images/圓臉9.png" }
        ],
        "avoid": [
            { title: "厚齊瀏海", image: "images/圓臉10.png" },
            { title: "下巴齊平短髮", image: "images/圓臉11.png" },
        ]
    },
    "方形臉": {
        "long": [
            { title: "韓系大波浪長髮", image: "images/方臉1.png" },
            { title: "長層次捲髮", image: "images/方臉2.png" },
            { title: "公主切長髮", image: "images/方臉3.png" }
        ],
        "medium": [
            { title: "鎖骨層次髮", image: "images/方臉4.png" },
            { title: "水波紋燙髮", image: "images/方臉5.png" },
            { title: "公主切中長髮", image: "images/方臉6.png" }
        ],
        "short": [
            { title: "法式短鮑伯", image: "images/方臉7.png" },
            { title: "空氣感短髮", image: "images/方臉8.png" },
            { title: "側分短鮑伯", image: "images/方臉9.png" }
        ],
        "avoid": [
            { title: "一刀切短髮", image: "images/方臉10.png" },
            { title: "質方黑長直", image: "images/方臉11.png" },
        ]
    },
    "長臉": {
        "long": [
            { title: "八字劉海長髮", image: "images/長臉1.png" },
            { title: "木馬捲長髮", image: "images/長臉2.png" },
            { title: "法式瀏海長捲髮", image: "images/長臉3.png" }
        ],
        "medium": [
            { title: "C字鎖骨髮", image: "images/長臉4.png" },
            { title: "羊毛卷中長髮", image: "images/長臉5.png" },
            { title: "睡不醒頭", image: "images/長臉6.png" }
        ],
        "short": [
            { title: "法式鮑伯", image: "images/長臉7.png" },
            { title: "齊下巴鮑伯", image: "images/長臉8.png" },
            { title: "日系空氣短髮", image: "images/長臉9.png" }
        ],
        "avoid": [
            { title: "超長直髮", image: "images/長臉10.png" },
            { title: "全露額頭馬尾", image: "images/長臉11.png" },
        ]
    },
    "鵝蛋臉": {
        "long": [
            { title: "韓系女神長髮 ", image: "images/鵝蛋臉1.png" },
            { title: "木馬捲長髮", image: "images/鵝蛋臉2.png" },
            { title: "高馬尾", image: "images/鵝蛋臉3.png" }
        ],
        "medium": [
            { title: "鎖骨髮", image: "images/鵝蛋臉4.png" },
            { title: "水母剪", image: "images/鵝蛋臉5.png" },
            { title: "法式慵懶捲", image: "images/鵝蛋臉6.png" }
        ],
        "short": [
            { title: "法式鮑伯", image: "images/鵝蛋臉7.png" },
            { title: "精靈短髮", image: "images/鵝蛋臉8.png" },
            { title: "日系少年感短髮", image: "images/鵝蛋臉9.png" }
        ],
        "avoid": [

        ]
    },
    "心型臉": {
        "long": [
            { title: "大波浪長髮 ", image: "images/心型臉1.png" },
            { title: "韓系層次長髮", image: "images/心型臉2.png" },
            { title: "側分長捲髮", image: "images/心型臉3.png" }
        ],
        "medium": [
            { title: "鎖骨髮", image: "images/心型臉4.png" },
            { title: "水波紋燙中長髮", image: "images/心型臉5.png" },
            { title: "公主切鎖骨髮", image: "images/心型臉6.png" }
        ],
        "short": [
            { title: "側分鮑伯", image: "images/心型臉7.png" },
            { title: "法式鮑伯", image: "images/心型臉8.png" },
            { title: "外翹短髮", image: "images/心型臉9.png" }
        ],
        "avoid": [
            { title: "厚重齊瀏海", image: "images/心型臉10.png" },
            { title: "全露額頭高馬尾", image: "images/心型臉11.png" },

        ]
    },
    "菱形臉": {
        "long": [
            { title: "長層次+八字瀏海 ", image: "images/菱形臉1.png" },
            { title: "韓系大波浪", image: "images/菱形臉2.png" },
            { title: "法式瀏海長捲髮", image: "images/菱形臉3.png" }
        ],
        "medium": [
            { title: "鎖骨層次髮", image: "images/菱形臉4.png" },
            { title: "公主切層次髮", image: "images/菱形臉5.png" },
            { title: "JellyFish Cut", image: "images/菱形臉6.png" }
        ],
        "short": [
            { title: "韓系短層次", image: "images/菱形臉7.png" },
            { title: "法式鮑伯", image: "images/菱形臉8.png" },
            { title: "耳掛精靈短髮", image: "images/菱形臉9.png" }
        ],
        "avoid": [
            { title: "超貼直髮", image: "images/菱形臉10.png" },
            { title: "顴骨位置上過短的層次", image: "images/菱形臉11.png" },

        ]
    },
    "六角型臉": {
        "long": [
            { title: "大波浪層次 ", image: "images/六角型臉1.png" },
            { title: "水波紋長髮", image: "images/六角型臉2.png" },
            { title: "Butterfly Cut", image: "images/六角型臉3.png" }
        ],
        "medium": [
            { title: "鎖骨髮", image: "images/六角型臉4.png" },
            { title: "法式慵懶捲髮", image: "images/六角型臉5.png" },
            { title: "法式微狼尾髮", image: "images/六角型臉6.png" }
        ],
        "short": [
            { title: "法式鮑伯", image: "images/六角型臉7.png" },
            { title: "側分鮑伯", image: "images/六角型臉8.png" },
            { title: "空氣感短髮", image: "images/六角型臉9.png" }
        ],
        "avoid": [
            { title: "幾何感一刀切", image: "images/六角型臉10.png" },
            { title: "耳上級短鮑伯", image: "images/六角型臉11.png" },

        ]
    },
    "方圓臉": {
        "long": [
            { title: "Hush Cut ", image: "images/方圓臉1.png" },
            { title: "韓系S捲", image: "images/方圓臉2.png" },
            { title: "空氣瀏海長直髮", image: "images/方圓臉3.png" }
        ],
        "medium": [
            { title: "C字燙", image: "images/方圓臉4.png" },
            { title: "鎖骨層次法", image: "images/方圓臉5.png" },
            { title: "旁分女神捲", image: "images/方圓臉6.png" }
        ],
        "short": [
            { title: "鮑伯", image: "images/方圓臉7.png" },
            { title: "側分短髮", image: "images/方圓臉8.png" },
            { title: "Hush Bob", image: "images/方圓臉9.png" }
        ],
        "avoid": [
            { title: "齊瀏海鮑伯", image: "images/方圓臉10.png" },
            { title: "下巴齊一刀切", image: "images/方圓臉11.png" },

        ]
    },

    "default": {
        // ... (預設百搭款)
    }
};


// ==========================================
// 🌟 第二區：你原本的其他變數
// ==========================================
let lastProcessedFileName = "";
let lastProcessedResult = null;


// ==========================================
// 🌟 第三區：發送請求與處理結果的按鈕功能
// ==========================================
// (這裡面應該有你剛剛寫的 fetch 那些程式碼)

themeToggleBtn.addEventListener("click", () => {
    if (htmlElement.getAttribute("data-bs-theme") === "dark") {
        htmlElement.setAttribute("data-bs-theme", "light");
        themeIcon.classList.replace("bi-sun-fill", "bi-moon-fill");
        themeToggleBtn.classList.replace("btn-outline-light", "btn-outline-secondary");
    } else {
        htmlElement.setAttribute("data-bs-theme", "dark");
        themeIcon.classList.replace("bi-moon-fill", "bi-sun-fill");
        themeToggleBtn.classList.replace("btn-outline-secondary", "btn-outline-light");
    }
});

// --- 抓取表單與照片元素 ---
const form = document.getElementById("beautyForm");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");

// 上傳照片預覽
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

// === 功能 1：分析照片與連動表單 ===
function analyzePhoto() {
    if (!photoInput.files[0]) {
        alert("請先上傳照片！");
        return;
    }
    const imageFile = photoInput.files[0];

    // 離線版（API_BASE 為空）沒有 AI 照片分析，請使用者自己選
    if (!USE_API) {
        alert("目前是離線版，沒有啟用 AI 照片分析。\n請直接用下方選單選擇你的臉型、眼型等條件。");
        return;
    }

    // 防呆：如果照片沒換，直接用口袋裡的資料
    if (imageFile.name === lastProcessedFileName && lastProcessedResult !== null) {
        applyAnalysisResult(lastProcessedResult);
        return; 
    }

    const analyzeBtn = document.querySelector('button[onclick="analyzePhoto()"]') || document.querySelector('.bi-search-heart').parentElement;
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>分析中...';
    analyzeBtn.disabled = true;

    const formData = new FormData();
    formData.append("file", imageFile);

    fetch(API_BASE + "/api/analyze-photo", {
    method: "POST",
    body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error("伺服器回傳錯誤代碼：" + response.status);
        return response.json();
    })
    .then(data => {
        console.log("📦 收到後端包裹：", data); // 讓 F12 Console 印出結果，不再死無對證！

    // 1. 拆開 Python 幫我們包裝的那層外殼
        let realData = data;
        if (data.status === "success") {
            realData = data.data; 
        } else if (data.status === "error") {
            throw new Error(data.message); // 如果 Python 報錯，直接丟給下面的 catch 處理
        }

    // 2. 把拆好的正確資料餵給你的函數
        lastProcessedFileName = imageFile.name;
        lastProcessedResult = realData;
        applyAnalysisResult(realData);
    
        if (realData.hair_image) {
            const hairImg = document.getElementById("hairImage") || document.getElementById("hairOverlay");
            if (hairImg) {
                hairImg.src = "data:image/png;base64," + realData.hair_image;
                hairImg.classList.remove("d-none");
            } 
        }
    })
    .catch(error => {
    // 3. 任何錯誤都會掉進這裡！
        console.error("❌ 抓到了！出錯原因：", error);
        alert("照片分析發生錯誤！請按 F12 查看主控台(Console)的紅字說明。");
    })
    .finally(() => {
    // 4. 最關鍵的一步：不管成功還是失敗，最後一定會執行這裡，解除無限轉圈圈！
    // ⚠️ 這裡要請你把「按鈕變數」換成你程式碼裡抓按鈕的名字！
    // 假設你的按鈕原本叫 analyzeBtn，就像下面這樣：
    
        const analyzeBtn = document.querySelector("#analyze-submit-btn"); // 請依照你的 HTML 調整抓取方式
        if (analyzeBtn) {
            analyzeBtn.innerHTML = "分析照片"; // 把字改回來
            analyzeBtn.disabled = false;     // 解除按鈕鎖定
        }
    });
}

function applyAnalysisResult(data) {
    console.log("🧠 正在精準解析 AI 回傳結果：", data);

    let faceStr = "圓臉", eyeStr = "杏仁眼", eyelidStr = "雙眼皮", noseStr = "小巧鼻", lipStr = "自然唇形";

    // 1. 解析包裹
    for (const key in data) {
        const cleanKey = key.replace(/\*/g, "").trim();
        const cleanValue = data[key].replace(/\*/g, "").trim();

        if (cleanKey.includes("臉型")) faceStr = cleanValue;
        if (cleanKey.includes("眼型")) eyeStr = cleanValue;
        if (cleanKey.includes("眼皮")) eyelidStr = cleanValue;
        if (cleanKey.includes("鼻型")) noseStr = cleanValue;
        if (cleanKey.includes("唇形")) lipStr = cleanValue;
    }

    // 2. 更新紫色標籤
    if(document.getElementById("detectedFace")) document.getElementById("detectedFace").textContent = faceStr;
    if(document.getElementById("detectedEye")) document.getElementById("detectedEye").textContent = eyeStr;
    if(document.getElementById("detectedEyelid")) document.getElementById("detectedEyelid").textContent = eyelidStr;
    if(document.getElementById("detectedNose")) document.getElementById("detectedNose").textContent = noseStr;
    if(document.getElementById("detectedLip")) document.getElementById("detectedLip").textContent = lipStr;
    if(document.getElementById("photoAnalysis")) document.getElementById("photoAnalysis").classList.remove("d-none");

    // 🌟 3. 終極強制連動機制 (無視 HTML 的 value，直接比對中文！)
    function setSelectByText(selectId, textToMatch) {
        const selectEl = document.getElementById(selectId);
        if (!selectEl) return;
        for (let i = 0; i < selectEl.options.length; i++) {
            // 只要選項的中文包含我們要找的字，就強制選中它！
            if (selectEl.options[i].text.includes(textToMatch)) {
                selectEl.selectedIndex = i;
                break;
            }
        }
    }

    // 執行強制連動，保證 5 個下拉選單都會乖乖跳到正確位置
    setSelectByText("faceShape", faceStr);
    setSelectByText("eyeShape", eyeStr);
    setSelectByText("eyelidType", eyelidStr);
    setSelectByText("noseShape", noseStr);
    setSelectByText("lipShape", lipStr);
}

// === 功能 2：送出表單，產生專屬報告與非同步算圖 ===
form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    // 1. 打包要送給 AI 的資料 (這裡加入了 eyelidType)
    const userData = {
        faceShape: document.getElementById("faceShape") ? document.getElementById("faceShape").value : "",
        eyeShape: document.getElementById("eyeShape") ? document.getElementById("eyeShape").value : "",
        eyelidType: document.getElementById("eyelidType") ? document.getElementById("eyelidType").value : "",
        noseShape: document.getElementById("noseShape") ? document.getElementById("noseShape").value : "",
        lipShape: document.getElementById("lipShape") ? document.getElementById("lipShape").value : "",
        skinTone: document.getElementById("skinTone") ? document.getElementById("skinTone").value : "",
        hairLength: document.getElementById("hairLength") ? document.getElementById("hairLength").value : "",
        style: document.getElementById("style") ? document.getElementById("style").value : "",
        occasion: document.getElementById("occasion") ? document.getElementById("occasion").value : ""
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "AI 正在為您撰寫專屬報告...";
    submitBtn.disabled = true;

    // 2. 精準打擊標籤更新 (這裡加入了 selEyelid)
    const selFace = document.getElementById("faceShape");
    const selSkin = document.getElementById("skinTone");
    const selHair = document.getElementById("hairLength");
    const selStyle = document.getElementById("style");
    const selOccasion = document.getElementById("occasion");
    const selEyelid = document.getElementById("eyelidType"); 

    if (document.getElementById("finalFace") && selFace) {
        document.getElementById("finalFace").textContent = "臉型：" + selFace.options[selFace.selectedIndex].text;
    }
    if (document.getElementById("finalSkin") && selSkin) {
        document.getElementById("finalSkin").textContent = "膚色：" + selSkin.options[selSkin.selectedIndex].text;
    }
    if (document.getElementById("finalHair") && selHair) {
        document.getElementById("finalHair").textContent = "髮長：" + selHair.options[selHair.selectedIndex].text;
    }
    if (document.getElementById("finalStyle") && selStyle) {
        document.getElementById("finalStyle").textContent = "風格：" + selStyle.options[selStyle.selectedIndex].text;
    }
    if (document.getElementById("finalOccasion") && selOccasion) {
        document.getElementById("finalOccasion").textContent = "場合：" + selOccasion.options[selOccasion.selectedIndex].text;
    }
    if (document.getElementById("finalEyelid") && selEyelid) {
        document.getElementById("finalEyelid").textContent = "眼皮：" + selEyelid.options[selEyelid.selectedIndex].text;
    }

    // --- 下面接著就是原本的 fetch("http://127.0.0.1:8000/api/recommend"... ---
    // (這行以下的 fetch 程式碼不要動它喔！)
    // === 標籤精準更新程式碼結束 ===

    console.log("準備發送請求給後端！"); // 👈 加上這行
    callApi("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    })
    .then(remote => {
        // 內建資料當底，後端有給的欄位會蓋過去；後端回傳 error 時當作沒連上
        const localData = buildLocalRecommendation(userData);
        const okRemote = (remote && remote.status !== "error") ? remote : {};
        const data = Object.assign({}, localData, okRemote);
        data.images = Object.assign({}, localData.images, okRemote.images || {});
        if(scanLine) scanLine.classList.remove("scanning");
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;

        if (data.status === "error") {
            alert(data.message);
            return;
        }

        console.log("準備檢查圖片包裹：", data);

        console.log("⚡ 啟動本地圖庫精準配對系統...");

        // 1. 抓取使用者的「臉型」與「髮長」
        const selFace = document.getElementById("faceShape");
        const currentFaceShape = selFace.options[selFace.selectedIndex].text;

        const selHair = document.getElementById("hairLength");
        const currentHairLength = selHair.options[selHair.selectedIndex].text;

        // 2. 判斷要拉開哪一個長度的抽屜
        let lengthKey = "long"; // 預設長髮
        if (currentHairLength.includes("短")) {
            lengthKey = "short";
        } else if (currentHairLength.includes("中") || currentHairLength.includes("鎖骨")) {
            lengthKey = "medium";
        } else {
            lengthKey = "long";
        }

        // 3. 去大櫃子拿該臉型的整套資料
        const faceKey = currentFaceShape.replace("心形臉", "心型臉").replace("六角形臉", "六角型臉");
        const finalHairs = hairstyleDatabase[faceKey] || hairstyleDatabase["default"];

        if (finalHairs) {
            // --- 🎯 處理 3 張推薦髮型 (根據髮長) ---
            const bestHairs = finalHairs[lengthKey];
            if (bestHairs) {
                if (document.getElementById("bestHairImg1")) document.getElementById("bestHairImg1").src = bestHairs[0].image;
                if (document.getElementById("bestHairImg2")) document.getElementById("bestHairImg2").src = bestHairs[1].image;
                if (document.getElementById("bestHairImg3")) document.getElementById("bestHairImg3").src = bestHairs[2].image;

                // 同步替換圖片下方的標題文字！
                if (document.getElementById("bestHair1")) document.getElementById("bestHair1").textContent = bestHairs[0].title;
                if (document.getElementById("bestHair2")) document.getElementById("bestHair2").textContent = bestHairs[1].title;
                if (document.getElementById("bestHair3")) document.getElementById("bestHair3").textContent = bestHairs[2].title;
            }

            // --- 🎯 處理 2 張避雷髮型 ---
            const avoidHairs = finalHairs["avoid"];
            if (!avoidHairs || avoidHairs.length < 2) {
                resetAvoidHairs();
            } else {
                if (document.getElementById("avoidHairImg1")) document.getElementById("avoidHairImg1").src = avoidHairs[0].image;
                if (document.getElementById("avoidHairImg2")) document.getElementById("avoidHairImg2").src = avoidHairs[1].image;

                // 同步替換標題
                if (document.getElementById("avoidHair1")) document.getElementById("avoidHair1").textContent = avoidHairs[0].title;
                if (document.getElementById("avoidHair2")) document.getElementById("avoidHair2").textContent = avoidHairs[1].title;
            }
        }

        // --- 1. 填入純文字 ---

        
        // 髮色文字與圈圈動態變色
        if(data.hair_colors) {
            data.hair_colors.forEach((color, index) => {
                let i = index + 1;
                if(document.getElementById(`colorName${i}`)) document.getElementById(`colorName${i}`).textContent = color.name;
                if(document.getElementById(`colorDesc${i}`)) document.getElementById(`colorDesc${i}`).textContent = color.desc;
                
                let circle = document.getElementById(`colorCircle${i}`);
                if (circle) {
                    circle.style.transition = "opacity 0.3s";
                    circle.style.opacity = "0.3";
                    setTimeout(() => {
                        // 防呆：無論有沒有偷加 # 號都清乾淨
                        let cleanHex = color.hex ? color.hex.replace("#", "") : "CCCCCC";
                        
                        if (circle.tagName.toLowerCase() === "img") {
                            circle.src = `https://via.placeholder.com/150/${cleanHex}/${cleanHex}`;
                        } else {
                            // 終極殺手鐧：加上 !important 強制洗掉預設 CSS
                            circle.style.setProperty("background-color", "#" + cleanHex, "important");
                            circle.style.setProperty("background", "#" + cleanHex, "important");
                        }
                        circle.style.opacity = "1";
                    }, 2000); 
                }
            });
        }
        
        // 妝容文字
        if(data.makeup_steps) {
            data.makeup_steps.forEach((step, index) => {
                let i = index + 1;
                if(document.getElementById(`makeupTitle${i}`)) document.getElementById(`makeupTitle${i}`).textContent = step.title;
                if(document.getElementById(`makeupDesc${i}`)) document.getElementById(`makeupDesc${i}`).textContent = step.desc;
            });
        }
        if(document.getElementById("aiSuggestionText") && data.summary) document.getElementById("aiSuggestionText").textContent = data.summary;

        // ✨ ✨ ✨✨✨ 🌟 新增邏輯： 手動更新表單選擇的紫色標籤 🌟 ✨ ✨ ✨✨✨
        // 抓取表單中的選項文字 (而非選單 ID)
        const skinToneText = document.getElementById("skinTone").options[document.getElementById("skinTone").selectedIndex].text;
        const skinKey = document.getElementById("skinTone").value;  // 白皙／自然／小麥
        const hairLengthText = document.getElementById("hairLength").options[document.getElementById("hairLength").selectedIndex].text;
        const styleText = document.getElementById("style").options[document.getElementById("style").selectedIndex].text;
        const occasionText = document.getElementById("occasion").options[document.getElementById("occasion").selectedIndex].text;

        // 更新截圖報告區塊中的紫色標籤
        if(document.getElementById("reportedSkinTone")) document.getElementById("reportedSkinTone").textContent = "膚色：" + skinToneText;
        if(document.getElementById("reportedHairLength")) document.getElementById("reportedHairLength").textContent = "髮長：" + hairLengthText;
        if(document.getElementById("reportedStyle")) document.getElementById("reportedStyle").textContent = "風格：" + styleText;
        if(document.getElementById("reportedOccasion")) document.getElementById("reportedOccasion").textContent = "場合：" + occasionText;
        // ✨✨✨✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨✨✨✨ ✨ ✨ ✨✨✨✨✨✨
        // =======================================================
        // 💄 啟動「混合式」妝容圖庫組裝系統 (前端)
        // =======================================================
        console.log("⚡ 啟動混合式妝容組裝系統...");

        // 📦 兩層大櫃子：Step 1 底妝 (先分膚色，再分風格)
        const baseMakeupDatabase = {
            "白皙": {
                "自然清新": "images/beauty/妝容1白.png",
                "韓系溫柔": "images/beauty/妝容2白.png",
                "成熟優雅": "images/beauty/妝容3白.png",
                "純慾撩人": "images/beauty/妝容4白.png",
                "歐美辣妹": "images/beauty/妝容5白.png",
                "清冷個性": "images/beauty/妝容6白.png",
                "復古港風": "images/beauty/妝容7白.png",
                "中性少年感": "images/beauty/妝容8白.png",
                "日系透明感": "images/beauty/妝容1白.png",
                "甜美可愛": "images/beauty/妝容2白.png",
                "富家千金": "images/beauty/妝容3白.png"
            },
            "自然": {
                "自然清新": "images/beauty/妝容1自然.png",
                "韓系溫柔": "images/beauty/妝容2自然.png",
                "成熟優雅": "images/beauty/妝容3自然.png",
                "純慾撩人": "images/beauty/妝容4自然.png",
                "歐美辣妹": "images/beauty/妝容5自然.png",
                "清冷個性": "images/beauty/妝容6自然.png",
                "復古港風": "images/beauty/妝容7自然.png",
                "中性少年感": "images/beauty/妝容8自然.png",
                "日系透明感": "images/beauty/妝容1自然.png",
                "甜美可愛": "images/beauty/妝容2自然.png",
                "富家千金": "images/beauty/妝容3自然.png"
            },
            "小麥": {
                "自然清新": "images/beauty/妝容1小麥.png",
                "韓系溫柔": "images/beauty/妝容2小麥.png",
                "成熟優雅": "images/beauty/妝容3小麥.png",
                "純慾撩人": "images/beauty/妝容4小麥.png",
                "歐美辣妹": "images/beauty/妝容5小麥.png",
                "清冷個性": "images/beauty/妝容6小麥.png",
                "復古港風": "images/beauty/妝容7小麥.png",
                "中性少年感": "images/beauty/妝容8小麥.png",
                "日系透明感": "images/beauty/妝容1小麥.png",
                "甜美可愛": "images/beauty/妝容2小麥.png",
                "富家千金": "images/beauty/妝容3小麥.png"
            }
        };

        const defaultBaseImage = "images/beauty/base_default.png"; // 預設底妝圖
        let finalStep1 = defaultBaseImage;

        // 去櫃子找圖 (skinToneText 和 styleText 是你上面抓好的變數)
        if (baseMakeupDatabase[skinKey] && baseMakeupDatabase[skinKey][styleText]) {
            finalStep1 = baseMakeupDatabase[skinKey][styleText];
        }

        // 貼上 Step 1 圖片
        if (document.getElementById("makeupImg1")) document.getElementById("makeupImg1").src = finalStep1;


        // --------------------------------------------------
        // 🎯 Step 2: 眼妝 (拿後端 OpenAI 即時算出來的特寫圖)
        // --------------------------------------------------
        if (document.getElementById("makeupImg2") && data.images && data.images.step2_eye) {
            document.getElementById("makeupImg2").src = data.images.step2_eye;
        }


        // --------------------------------------------------
        // 🎯 Step 3: 唇頰與完妝照 (風格大櫃子：11 種風格)
        // --------------------------------------------------
        const finalLookCabinet = {
            "白皙": {
                "自然清新": "images/final/完妝1白.png",
                "日系透明感": "images/final/完妝1白.png", // 共用
                "韓系溫柔": "images/final/完妝2白.png",
                "甜美可愛": "images/final/完妝2白.png", // 共用
                "成熟優雅": "images/final/完妝3白.png",
                "富家千金": "images/final/完妝3白.png", // 共用
                "純慾撩人": "images/final/完妝4白.png",
                "歐美辣妹": "images/final/完妝5白.png",
                "清冷個性": "images/final/完妝6白.png",
                "復古港風": "images/final/完妝7白.png",
                "中性少年感": "images/final/完妝8白.png"
            },
            "自然": {
                "自然清新": "images/final/完妝1自然.png",
                "日系透明感": "images/final/完妝1自然.png",
                "韓系溫柔": "images/final/完妝2自然.png",
                "甜美可愛": "images/final/完妝2自然.png",
                "成熟優雅": "images/final/完妝3自然.png",
                "富家千金": "images/final/完妝3自然.png",
                "純慾撩人": "images/final/完妝4自然.png",
                "歐美辣妹": "images/final/完妝5自然.png",
                "清冷個性": "images/final/完妝6自然.png",
                "復古港風": "images/final/完妝7自然.png",
                "中性少年感": "images/final/完妝8自然.png"
            },
            "小麥": {
                "自然清新": "images/final/完妝1小麥.png",
                "日系透明感": "images/final/完妝1小麥.png",
                "韓系溫柔": "images/final/完妝2小麥.png",
                "甜美可愛": "images/final/完妝2小麥.png",
                "成熟優雅": "images/final/完妝3小麥.png",
                "富家千金": "images/final/完妝3小麥.png",
                "純慾撩人": "images/final/完妝4小麥.png",
                "歐美辣妹": "images/final/完妝5小麥.png",
                "清冷個性": "images/final/完妝6小麥.png",
                "復古港風": "images/final/完妝7小麥.png",
                "中性少年感": "images/final/完妝8小麥.png"
            }
        };

        const makeupImg3 = document.getElementById("makeupImg3");
        if (makeupImg3) {
            // 安全機制：找不到對應圖片就給 default
            let step3ImgPath = "images/final/final_default.png";

            // 去兩層大櫃子找對應的膚色與風格
            if (finalLookCabinet[skinKey] && finalLookCabinet[skinKey][styleText]) {
                step3ImgPath = finalLookCabinet[skinKey][styleText];
            }

            // 貼上 Step 3 圖片
            makeupImg3.src = step3ImgPath;
            console.log(`✅ Step 3 完妝圖已升級更新為: ${step3ImgPath}`);
        }
        // =======================================================
        // 💄 妝容組裝結束
        // =======================================================

        // --- 2. 啟動圖片非同步生成 (髮型 + 妝容) ---
        const imageFile = document.getElementById("photoInput").files[0] || new File([""], "dummy.jpg");
        
        function fetchDynamicImage(promptText, imgElementId) {
            const imgEl = document.getElementById(imgElementId);
            if(!imgEl) return; 
            
            // ✨ 🌟 新增逻辑： 這裡修復佔位圖變形問題 ✨🌟
            // 強制設定長寬比，防止圖片被右側超長文字垂直撐開
            imgEl.style.aspectRatio = "3 / 4";
            imgEl.style.objectFit = "contain"; // 使用 contain 確保文字完整顯示，不會被拉伸或切掉
            imgEl.style.objectPosition = "center";
            imgEl.style.width = "100%"; // 寬度填滿格子
            imgEl.style.height = "auto"; // 高度自動

            imgEl.style.transition = "opacity 0.3s";
            imgEl.style.opacity = "0.3"; 
            
            const imgFormData = new FormData();
            imgFormData.append("hairstyle", promptText); 
            imgFormData.append("file", imageFile);

            
           
        }

        // 呼叫換圖
        

        // --- 3. 顯示結果與捲動 ---
        const emptyDiv = document.getElementById("emptyResult");
        const contentDiv = document.getElementById("resultContent");
        if(emptyDiv) emptyDiv.classList.add("d-none");
        if(contentDiv) contentDiv.classList.remove("d-none");

        const resultPortrait = document.getElementById("resultPortrait");
        if (photoPreview && resultPortrait && photoPreview.src) resultPortrait.src = photoPreview.src;

        const resultSection = document.getElementById("result");
        if(resultSection) resultSection.scrollIntoView({ behavior: "smooth" });
    })
    .catch(error => {
        if(scanLine) scanLine.classList.remove("scanning");
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        console.error("產生結果時發生錯誤：", error);
        alert("產生結果時發生錯誤，請重新整理頁面再試一次。");
    });
});

// === 功能 3：防變形截圖下載功能 (截圖時維持 3:4) ===
// 防擠壓截圖功能 (終極防圖片變形版)
function saveFavorite() {
    const saveBtn = document.querySelector('button[onclick="saveFavorite()"]');
    const saveMsg = document.getElementById("saveMessage");
    const reportArea = document.getElementById("resultContent");
    if (!reportArea) return;

    const originalBtnText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>生成中...';
    saveBtn.disabled = true;
    saveMsg.textContent = "正在排版並生成高畫質報告，請稍候...";
    
    // 強制把寬度撐開，防止截圖被 Bootstrap 網格擠扁
    const originalWidth = reportArea.style.width;
    reportArea.style.width = "1200px";

    const isDarkMode = document.documentElement.getAttribute("data-bs-theme") === "dark";
    const bgColor = isDarkMode ? "#2a2432" : "#fdfbfd"; 

    html2canvas(reportArea, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: bgColor, 
        logging: false,
        onclone: function (clonedDoc) {
            // 🌟 終極魔法：解決 html2canvas 無法辨識 object-fit 的 Bug 🌟
            // 在截圖的瞬間，偷偷把會變形的 img 換成絕對不會變形的 div 背景圖
            const clonedPortrait = clonedDoc.getElementById("resultPortrait");
            if (clonedPortrait) {
                const div = clonedDoc.createElement('div');
                // 給定一個固定且完美的 3:4 尺寸
                div.style.width = "180px";
                div.style.height = "240px";
                div.style.margin = "0 auto";
                div.style.borderRadius = "10px";
                div.style.backgroundImage = `url(${clonedPortrait.src})`;
                div.style.backgroundSize = "cover";
                div.style.backgroundPosition = "center";
                
                // 偷天換日
                clonedPortrait.parentNode.replaceChild(div, clonedPortrait);
            }
        }
    }).then(canvas => {
        // 截圖完成，把網頁寬度恢復原狀
        reportArea.style.width = originalWidth;

        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "My_AI_Beauty_Report.png";
        link.href = imgData;
        link.click();

        saveBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>已儲存';
        saveBtn.classList.replace("btn-beauty", "btn-success");
        saveMsg.textContent = "報告已成功下載！";

        setTimeout(() => {
            saveBtn.innerHTML = originalBtnText;
            saveBtn.classList.replace("btn-success", "btn-beauty");
            saveBtn.disabled = false;
            saveMsg.textContent = "";
        }, 3000);
    }).catch(err => {
        reportArea.style.width = originalWidth;
        saveBtn.innerHTML = originalBtnText;
        saveBtn.disabled = false;
        saveMsg.textContent = "下載失敗，請重試。";
    });
}

// ==========================================
// 🖼️ 圖片載入失敗時，退回 HTML 裡原本寫的預設圖，避免出現破圖
// ==========================================
(function () {
    ["bestHairImg1", "bestHairImg2", "bestHairImg3", "avoidHairImg1", "avoidHairImg2",
     "makeupImg1", "makeupImg2", "makeupImg3"].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.dataset.defaultSrc = el.getAttribute("src");
    });
    document.addEventListener("error", function (e) {
        const t = e.target;
        if (t && t.tagName === "IMG" && t.dataset && t.dataset.defaultSrc &&
            t.getAttribute("src") !== t.dataset.defaultSrc) {
            t.src = t.dataset.defaultSrc;
        }
    }, true);
})();

// ==========================================
// ⏰ 公開網站：頁面一打開就先叫醒後端
// （雲端免費方案閒置會休眠，第一次回應要 30～60 秒，先叫醒就不會卡在使用者按下按鈕之後）
// ==========================================
if (USE_API && !IS_LOCAL) {
    fetch(API_BASE + "/api/health").catch(function () {});
}