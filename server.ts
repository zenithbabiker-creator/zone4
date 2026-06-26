import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = 3000;

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 15 * 1024 * 1024, // 15MB limit for files
    fieldSize: 15 * 1024 * 1024 // 15MB limit for text fields (Base64 strings)
  }
});

// Enable CORS for mobile apps
app.use(cors());

// Middleware for parsing JSON with a larger limit for images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Request Logger for debugging mobile issues
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API REQUEST] ${req.method} ${req.path} - UA: ${req.headers['user-agent']}`);
  }
  next();
});

// Helper to parse base64 Data URLs
function parseBase64Image(dataUrl: string) {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2]
    };
  }
  return {
    mimeType: "image/jpeg",
    data: dataUrl.includes("base64,") ? dataUrl.split("base64,")[1] : dataUrl
  };
}

// Local file caching path for persistent OpenRouter API key storage
const KEY_CACHE_FILE = path.join(process.cwd(), "cached_openrouter_key.txt");

function loadLocalKey(): string {
  try {
    if (fs.existsSync(KEY_CACHE_FILE)) {
      const key = fs.readFileSync(KEY_CACHE_FILE, "utf8").trim();
      if (key && (key.startsWith("sk-or-v1-") || key.startsWith("sk-or-"))) {
        console.log(`[LOCAL CACHE] Successfully loaded key from local file: ${KEY_CACHE_FILE}`);
        return key;
      }
    }
  } catch (err: any) {
    console.error("[LOCAL CACHE LOAD ERROR]", err.message);
  }
  return "";
}

function saveLocalKey(key: string): void {
  try {
    fs.writeFileSync(KEY_CACHE_FILE, key.trim(), "utf8");
    console.log(`[LOCAL CACHE] Successfully saved key to local file: ${KEY_CACHE_FILE}`);
  } catch (err: any) {
    console.error("[LOCAL CACHE SAVE ERROR]", err.message);
  }
}

function clearLocalKey(): void {
  try {
    if (fs.existsSync(KEY_CACHE_FILE)) {
      fs.unlinkSync(KEY_CACHE_FILE);
      console.log(`[LOCAL CACHE] Successfully cleared local key file: ${KEY_CACHE_FILE}`);
    }
  } catch (err: any) {
    console.error("[LOCAL CACHE CLEAR ERROR]", err.message);
  }
}

// Global cache for the OpenRouter API key in memory (initialized from the local file if present)
let cachedOpenRouterKey = loadLocalKey();
let lastDetailedError = "";

const SYSTEM_GAS_URL = 'https://script.google.com/macros/s/AKfycbwM79ElW-MwwQW0qG5WeV5KRNqqTidI1JhL6yV-Fm9Lp3EpKzMGdlillHfCBoknfMqv/exec';

// Helper function to fetch OpenRouter API Key from Google Sheets (prioritizing cell I2)
async function fetchOpenRouterKeyFromSheets(): Promise<string> {
  try {
    const sheetsUrlWithCacheBust = `${SYSTEM_GAS_URL}?t=${Date.now()}`;
    console.log(`[SHEETS KEY FETCH] Fetching OpenRouter key from Google Sheet: ${sheetsUrlWithCacheBust}`);
    const response = await fetch(sheetsUrlWithCacheBust, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      },
      redirect: "follow"
    });
    if (response.ok) {
      const textData = await response.text();
      try {
        const jsonData = JSON.parse(textData);
        if (Array.isArray(jsonData)) {
          let foundKey = "";
          let foundAt = "";

          // Prioritize checking Cell I2 (Row index 1, Column index 8)
          if (jsonData[1] && jsonData[1][8]) {
            const keyVal = jsonData[1][8].toString().trim();
            if (keyVal.startsWith("sk-or-v1-") || keyVal.startsWith("sk-or-")) {
              foundKey = keyVal;
              foundAt = "الخلية I2 (السطر الثاني، العمود التاسع)";
            }
          }

          // If not found in Cell I2, perform comprehensive full-sheet scan as a backup
          if (!foundKey) {
            console.log("[SHEETS KEY FETCH] Key not found in cell I2. Scanning entire sheet as fallback...");
            for (let r = 0; r < jsonData.length; r++) {
              const row = jsonData[r];
              if (Array.isArray(row)) {
                for (let c = 0; c < row.length; c++) {
                  const val = row[c]?.toString().trim() || "";
                  if (val.startsWith("sk-or-v1-") || val.startsWith("sk-or-")) {
                    foundKey = val;
                    foundAt = `الصف ${r + 1}، العمود ${String.fromCharCode(65 + c)} (الخلية ${String.fromCharCode(65 + c)}${r + 1})`;
                    break;
                  }
                }
              }
              if (foundKey) break;
            }
          }

          if (foundKey) {
            console.log(`[SHEETS KEY FETCH SUCCESS] Found OpenRouter key at ${foundAt}`);
            lastDetailedError = "";
            cachedOpenRouterKey = foundKey;
            saveLocalKey(foundKey); // Store locally
            return foundKey;
          } else {
            const sampleRows = jsonData.slice(0, 5).map((row, idx) => {
              if (Array.isArray(row)) {
                return `الصف ${idx + 1}: [${row.slice(0, 10).map(c => JSON.stringify(c)).join(", ")}]`;
              }
              return `الصف ${idx + 1}: ليس مصفوفة`;
            }).join(" | ");
            lastDetailedError = `لم يتم العثور على أي مفتاح يبدأ بـ 'sk-or-' في كامل الجدول ولا في الخلية I2. عينة من الخلايا المجلوبة: ${sampleRows}`;
            console.warn("[SHEETS KEY FETCH] " + lastDetailedError);
          }
        } else {
          lastDetailedError = `استجابة الجدول ليست مصفوفة صالحة.`;
          console.warn("[SHEETS KEY FETCH] Google Sheets response is not an array.");
        }
      } catch (jsonErr: any) {
        lastDetailedError = `فشل تحليل JSON للاستجابة. نص الاستجابة الأولية: ${textData.substring(0, 150)}.`;
        console.error("[SHEETS KEY FETCH] Failed to parse JSON response:", jsonErr.message);
      }
    } else {
      lastDetailedError = `رمز حالة الاستجابة من قوقل شيت: ${response.status}.`;
      console.warn(`[SHEETS KEY FETCH FAILED] Response status: ${response.status}`);
    }
  } catch (sheetErr: any) {
    lastDetailedError = `فشل الاتصال بـ Google Sheets: ${sheetErr.message || sheetErr}.`;
    console.error("Failed to fetch OpenRouter key from Google Sheets:", sheetErr.message || sheetErr);
  }
  return "";
}

// AI Diagnosis API Handler using Qwen-VL via OpenRouter and Cloudflare AI Gateway
app.post("/api/plant/diagnose", async (req, res) => {
  try {
    const fullImage = req.body.fullImage;
    const closeImage = req.body.closeImage;
    const singleImageFallback = req.body.image; // for backwards compatibility

    // CRITICAL RULE 1: Both images must be present
    if ((!fullImage || !closeImage) && !singleImageFallback) {
      return res.status(400).json({ 
        error: "عذراً، تشخيص 'طبيب زون الذكي' يتطلب رفع 'صورتين معاً' لضمان دقة لا تضاهى:\n1. الصورة العامة للهيكل النباتي والبيئة المحيطة.\n2. الصورة المكبرة المقربة لمكان الإصابة بالتحديد." 
      });
    }

    // Resolve OpenRouter key: 
    // 1. Prioritize key passed by the client (from local storage)
    // 2. Fallback to server's memory cached key
    // 3. Fallback to fetching immediately from Google Sheets
    // 4. Fallback to environment variable
    const clientProvidedKey = (req.body.openRouterKey || "").toString().trim();
    let activeOpenRouterKey = clientProvidedKey || cachedOpenRouterKey;

    if (!activeOpenRouterKey) {
      console.log("[API KEY RESOLUTION] No client key or cache found. Fetching OpenRouter key from Google Sheets...");
      const sheetKey = await fetchOpenRouterKeyFromSheets();
      if (sheetKey) {
        activeOpenRouterKey = sheetKey;
        cachedOpenRouterKey = sheetKey;
      }
    }

    if (!activeOpenRouterKey) {
      activeOpenRouterKey = process.env.OPENROUTER_API_KEY || "";
    }

    const activeFullImage = fullImage || singleImageFallback;
    const activeCloseImage = closeImage || singleImageFallback;

    const prompt = `
أنت بروفيسور وعالم نباتات خبير ومصنف بوتاني محترف ومحنك، متخصص حصرياً في فحص وتصنيف أمراض وعلاجات نباتات الزينة المنزلية والأشجار المثمرة بدقة مخبرية صارمة ومحايدة 100%.

🧠 بروتوكول التفكير العميق والتحليل البصري المتسلسل (Deep Thinking & Sequential Analysis Protocol):
يجب عليك التمهل والتحلي بالتفكير السليم والعميق وألا تستعجل في إطلاق الحكم بوجود مرض أو آفة. اتبع بدقة هذه الخطوات الفكرية المتعاقبة لمقارنة وفحص مظهر النبات:
1. **أولاً: فحص أسطح وحواف الأوراق (الصفق):** انظر بتمعن شديد إلى نسيج الأوراق. هل هو أخضر يانع ونظيف وخالٍ من أي بقع أو بياض دقيقي أو تبرقش؟ لا تحكم بوجود مرض فِطري أو حشري لمجرد وجود انحناء طبيعي أو تدرج لوني طبيعي في أوراق نباتات الزينة (مثل الإيفوربيا أو الصبار العصاري أو السجاد).
2. **ثانياً: فحص عروق الأوراق (Leaf Venation):** قارن بين لون العرق الرئيسي والعروق الجانبية ولون النصل. هل هناك انسداد أو اصفرار مرضي؟ أم أن نظام النقل سليم والنواقل نظيفة متماسكة؟
3. **ثالثاً: فحص الساق والجذوع (Stem & Stalks):** دقق في القوام المورفولوجي للساق. هل توجد قشور، يرقات، تآكل حشري، أو بقع نخرية؟ أم أن الساق قوية وتؤدي دورها الدعامي والحيوي بامتياز؟
4. **رابعاً: فحص الزهور والبراعم (Flowers & Buds):** هل هناك تشوهات في البتلات أو هجوم من حشرات المن والتربس، أم أنها تنمو وتتفتح بشكل طبيعي سليم؟

تنبيه حاسم لمنع الانحياز وتحسين الدقة (Anti-Bias & High-Precision Directive):
- **الأصل في النبات السلامة:** لا تمل إلى افتراض وجود مرض أو آفة فطرية أو حشرية دون دليل قاطع بوضوح 100% في الصورتين المرفقتين. الكثير من نباتات الظل والزينة تبدو ذات خطوط أو نتوءات طبيعية مميزة لفصيلتها وليست مرضية.
- **تجنب الانحياز للأمراض الفطرية أو الحشرية:** إذا كانت الأوراق والسيقان يانعة، قوية وقوامها متماسكاً وخالية من البقع العفنية الدائرية أو الحشرات المرئية، فيجب تشخيصها فوراً بأنها "سليمة تماماً" (Healthy).
- في حال كان النبات سليماً، يجب وضع قيمة "isHealthy" كـ true، وتصنيف الحالة كـ "سليم" تماماً في حقول "disease_name" و "diseaseName".

⚠️ تنبيه حاسم وصارم جداً ومصيري بخصوص اسم النبات وطرق العلاج:
- يُمنع منعاً باتاً محاولة تحديد، أو تخمين، أو كتابة، أو السؤال عن اسم النبات (سواء الاسم الشائع أو العلمي أو العائلة النباتية) في أي حقل أو أي جزء من المخرجات إطلاقاً!
- لا تذكر اسم النبات ولا تسأل عنه، ولا تلمح له بأي شكل من الأشكال. ركز حصرياً على فحص الأوراق وصحة الخلايا والأنسجة النباتية، ووصف حالة المرض أو السلامة وعلاجهما فقط.
- يُمنع منعاً باتاً ومطلقاً ذكر كلمة "محلول صابوني" أو أي علاجات بالصابون أو اقتراحها أو التلميح لها تحت أي ظرف من الظروف في العلاجات الكيميائية أو البدائل الطبيعية أو النصائح (يجب استخدام بدائل زراعية أخرى آمنة تماماً).
- يجب أن تظل حقول "plant_name" و "plantName" فارغة تماماً "" (سلسلة نصية فارغة).

يجب أن تكون المخرجات عبارة عن كائن JSON بالهيكل التالي تماماً وبدون أي أحرف إضافية خارج القوسين:
{
  "plant_name": "",
  "plantName": "",
  "isHealthy": (boolean: true إذا كانت حالة النبات العامة 'سليم'، أو false إذا كانت حالة النبات العامة 'مريض'),
  "disease_name": "التصنيف العام للحالة أو المرض (يكتب باللغة العربية فقط وبشكل مقتضب جداً، مثل: 'سليم' في حال خلوه من الأمراض، أو 'إصابة فطرية'، 'إصابة حشرية'، 'سوء ري' إذا ظهرت أعراض مرضية بوضوح)",
  "diseaseName": "التصنيف العام للحالة أو المرض (يطابق الحقل السابق تماماً باللغة العربية فقط، مثل: 'سليم'، 'إصابة فطرية'، إلخ)",
  "confidence_score": 95,
  "isPlant": true,
  "diagnosis": "تقرير مخبري زراعي مفصل وشامل جداً باللغة العربية الفصحى فقط وبصيغة جازمة وموضوعية تصف أعراض النبات البصرية وتأثيراتها التشريحية على الأوراق (الصفق) والعروق والزهرة إن وجدت، وطبيعة الآفة أو مظاهر الصحة والسلامة بالتأكيد التام دون صيغ شك وبدون أي ذكر لاسم النبات أو فصيلته إطلاقاً وبدون مصطلحات بلغة أخرى",
  "generalMedicine": "اسم العلاج الكيميائي، أو المبيد المقترح، أو 'لا يتطلب علاجاً كيميائياً' إذا كان النبات سليماً، باللغة العربية الفصحى فقط وبشكل مقتضب جداً وبدون أي مصطلحات بلغة أخرى ودون ذكر اسم النبات",
  "localAlternative": "علاج طبيعي، وصفة بلدية وقائية تقليدية، أو 'نصائح وقائية للمحافظة على نضارته' إذا كان النبات سليماً، باللغة العربية الفصحى فقط وبشكل مقتضب جداً وبدون أي مصطلحات بلغة أخرى ودون ذكر اسم النبات",
  "care_tips": [
    "النصيحة الأولى للعناية ومقاومة المرض أو المحافظة على النضارة باللغة العربية الفصحى فقط بدون أي مصطلحات بلغة أخرى إطلاقاً ودون ذكر اسم النبات",
    "النصيحة الثانية للوقاية والإدارة باللغة العربية الفصحى فقط بدون أي مصطلحات بلغة أخرى إطلاقاً ودون ذكر اسم النبات",
    "النصيحة الثالثة باللغة العربية الفصحى فقط بدون أي مصطلحات بلغة أخرى إطلاقاً ودون ذكر اسم النبات"
  ]
}

تنبيه حاسم: لغة جميع المخرجات والقيم داخل قالب JSON هي العربية الفصحى فقط، ويمنع استخدام أي كلمات بلغات أخرى أو الإشارة لاسم النبات بأي شكل.
`;

    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || "31c00a338f537e1a44c511a0d3668e4d";
    const cfGatewayId = process.env.CLOUDFLARE_GATEWAY_ID || "plant-diagnosis";
    const cfGatewayToken = process.env.CLOUDFLARE_GATEWAY_TOKEN || "cfut_zXJ94KCwVY0KjtolTajcXfVI1NB1hoZJERjQBNjec148fae1";

    const cloudflareUrl = `https://gateway.ai.cloudflare.com/v1/${cfAccountId}/${cfGatewayId}/openrouter/chat/completions`;
    const directUrl = "https://openrouter.ai/api/v1/chat/completions";

    let hasRetriedWithFreshKey = false;

    // Generic function to send chat completion request to OpenRouter (either via Cloudflare or Direct) with automatic key invalidation & retrieval
    const callOpenRouterModel = async (modelName: string, payloadBody: any): Promise<string> => {
      let responseText = "";
      let completedViaCloudflare = false;

      const makeRequest = async (keyToUse: string): Promise<boolean> => {
        const currentHeaders: Record<string, string> = {
          "Authorization": `Bearer ${keyToUse.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "Zone Plant Doctor"
        };
        if (cfGatewayToken) {
          currentHeaders["cf-shared-key"] = cfGatewayToken;
        }

        try {
          console.log(`[CLOUDFLARE ROUTING] Dispatching request to ${modelName} via Cloudflare AI Gateway: ${cloudflareUrl}`);
          const response = await fetch(cloudflareUrl, {
            method: "POST",
            headers: currentHeaders,
            body: JSON.stringify(payloadBody)
          });

          if (response.ok) {
            const data = await response.json();
            responseText = data?.choices?.[0]?.message?.content || "";
            completedViaCloudflare = true;
            console.log(`[CLOUDFLARE ROUTING SUCCESS] Request completed successfully through Cloudflare AI Gateway for ${modelName}.`);
            return true;
          } else {
            const errText = await response.text();
            console.warn(`[CLOUDFLARE ROUTING FAILED] Status ${response.status}: ${errText}. Falling back to direct OpenRouter route.`);
            
            // Check if key is depleted / unauthorized / quota issues
            if (response.status === 401 || response.status === 402 || response.status === 403 || response.status === 429 || errText.includes("credit") || errText.includes("balance") || errText.includes("invalid api key") || errText.includes("quota")) {
              console.warn("[KEY DEPLETED] Detected key depletion/error via Cloudflare. Clearing cache.");
              cachedOpenRouterKey = "";
              clearLocalKey(); // Clear local file cache
              if (!hasRetriedWithFreshKey) {
                return false; // Trigger retry with fresh key
              }
            }
          }
        } catch (cfErr: any) {
          console.warn(`[CLOUDFLARE ROUTING EXCEPTION] Failed to connect to Cloudflare AI Gateway for ${modelName}:`, cfErr.message || cfErr);
        }

        // Direct Routing fallback
        console.log(`[DIRECT ROUTING] Dispatching request directly to OpenRouter: ${directUrl}`);
        try {
          const response = await fetch(directUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${keyToUse.trim()}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://ai.studio/build",
              "X-Title": "Zone Plant Doctor"
            },
            body: JSON.stringify(payloadBody)
          });

          if (response.ok) {
            const data = await response.json();
            responseText = data?.choices?.[0]?.message?.content || "";
            return true;
          } else {
            const errText = await response.text();
            
            // Check if key is depleted / unauthorized / quota issues
            if (response.status === 401 || response.status === 402 || response.status === 403 || response.status === 429 || errText.includes("credit") || errText.includes("balance") || errText.includes("invalid api key") || errText.includes("quota")) {
              console.warn("[KEY DEPLETED] Detected key depletion/error via Direct. Clearing cache.");
              cachedOpenRouterKey = "";
              clearLocalKey(); // Clear local file cache
              if (!hasRetriedWithFreshKey) {
                return false; // Trigger retry with fresh key
              }
            }
            throw new Error(`خطأ في استجابة OpenRouter لنموذج ${modelName} (رمز الحالة: ${response.status}): ${errText}`);
          }
        } catch (directErr: any) {
          if (!hasRetriedWithFreshKey && cachedOpenRouterKey === "") {
            return false; // Trigger retry
          }
          throw directErr;
        }
      };

      let success = await makeRequest(activeOpenRouterKey);

      if (!success && !hasRetriedWithFreshKey) {
        hasRetriedWithFreshKey = true;
        console.log("[KEY RETRY] Key was depleted or failed. Fetching a fresh key from Google Sheets cell I2 immediately...");
        const freshKey = await fetchOpenRouterKeyFromSheets();
        if (freshKey && freshKey !== activeOpenRouterKey) {
          cachedOpenRouterKey = freshKey;
          activeOpenRouterKey = freshKey;
          console.log("[KEY RETRY] Successfully obtained a new key. Retrying the OpenRouter request...");
          success = await makeRequest(activeOpenRouterKey);
        } else {
          console.warn("[KEY RETRY] Fetch from Google Sheets did not return a new/different key. Retrying with client or server keys if available...");
          const fallbackKey = req.body.openRouterKey || process.env.OPENROUTER_API_KEY;
          if (fallbackKey && fallbackKey !== activeOpenRouterKey) {
            activeOpenRouterKey = fallbackKey;
            success = await makeRequest(activeOpenRouterKey);
          }
        }
      }

      if (!responseText) {
        throw new Error(`تلقى الخادم رداً فارغاً من نموذج ${modelName}. قد يكون المفتاح قد نفذ أو انتهت قيمته ولم يتم العثور على مفتاح جديد في الخلية I2.`);
      }

      return responseText;
    };

    // Step 1: Run Qwen-VL Vision Analysis
    const qwenModelsToTry = [
      "qwen/qwen2.5-vl-72b-instruct",
      "qwen/qwen-vl-plus"
    ];

    let qwenRawText = "";
    let selectedQwenModel = "";
    let qwenErrorDetails = [];

    for (const modelName of qwenModelsToTry) {
      try {
        console.log(`[QWEN VISION RUN] Attempting Qwen Vision Analysis with model: ${modelName}`);
        const qwenRequestBody = {
          model: modelName,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: activeFullImage
                  }
                },
                {
                  type: "image_url",
                  image_url: {
                    url: activeCloseImage
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        };

        qwenRawText = await callOpenRouterModel(modelName, qwenRequestBody);
        if (qwenRawText) {
          selectedQwenModel = modelName;
          console.log(`[QWEN VISION RUN SUCCESS] Successfully generated response using vision model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        const errMsg = err.message || err;
        console.warn(`[QWEN VISION RUN FAILED] Model ${modelName} failed with error: ${errMsg}`);
        qwenErrorDetails.push(`${modelName}: ${errMsg}`);
      }
    }

    if (!qwenRawText) {
      throw new Error(`فشل تشخيص الصور بجميع نماذج الرؤية المتاحة. تفاصيل الأخطاء:\n${qwenErrorDetails.join("\n")}`);
    }

    // Parse the Qwen JSON response
    let qwenCleanedText = qwenRawText.trim();
    if (qwenCleanedText.startsWith("```")) {
      qwenCleanedText = qwenCleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    let qwenResult: any;
    try {
      qwenResult = JSON.parse(qwenCleanedText);
    } catch (parseError) {
      console.error("Failed to parse Qwen response as JSON:", qwenRawText);
      throw new Error(`فشل في معالجة استجابة Qwen كـ JSON: ${qwenRawText.substring(0, 200)}`);
    }

    // Step 2: Use DeepSeek or fallback to write the friendly expert report if it's indeed a plant
    if (qwenResult.isPlant === false) {
      qwenResult.modelUsed = selectedQwenModel;
      return res.json(qwenResult);
    }

    console.log("[ADVISOR RUN] Activating advisor model to write the final customized Arabic report...");
    const deepSeekSystemPrompt = `
أنت مستشار زراعي ودود ومحترف، ومتخصص في العناية بنباتات الزينة (الظل) والنباتات المثمرة.
مهمتك الأساسية هي صياغة الرد النهائي للمستخدم باللغة العربية الفصحى فقط، ويُمنع منعاً باتاً استخدام أي لغة أخرى كالصينية أو الإنجليزية أو اللاتينية.

لقد تلقيت البيانات التالية من الفحص الأولي للنبات:
- اسم النبات: "${qwenResult.plant_name || qwenResult.plantName}"
- حالة النبات: "${qwenResult.isHealthy ? 'سليم' : 'مريض'}"
- نوع المرض/الآفة: "${qwenResult.disease_name || qwenResult.diseaseName}"

يجب عليك صياغة رد متكامل يحتوي على التفاصيل التالية وإرجاعها في قالب JSON صالح فقط بالهيكل الموضح أدناه وبدون أي نصوص إضافية خارج القالب:

1. الأسلوب والافتتاحية (المدح والثناء بالعربية) - حقل "diagnosis":
- إذا كان النبات سليماً: ابدأ ردك دائماً بعبارات ثناء ومدح قوية وجزلة وتشجيعية للغاية وفخمة للمستخدم باللغة العربية على اهتمامه وعنايته الفائقة بالنبات (مثل: 'أنت عبقري ورائع في العناية ببيئتك الخضراء!'، 'شكراً على رعايتك واهتمامك الشديد والمثالي بهذا النبات الرائع'). ثم اكتب له العبارة التالية بوضوح: (الف مبروك نباتك بصحة جيدة وهو سليم تماماً ومعافى).
- إذا كان النبات مريضاً: اجعل العبارة أقل في الثناء والمدح (ثناء معتدل ومقتضب جداً دون تضخيم أو مبالغة، مثل: 'نشكر اهتمامك بمراقبة حالة نباتك، وسنساندك خطوة بخطوة للعناية به'، أو 'رعايتك مقدرة، ومعاً سنعيد نضارة هذا النبات')، ثم صف المشكلة والآفة بشكل ودي ومبسط وبطاقة إيجابية تشجعه على العلاج باللغة العربية الفصحى فقط.

2. العلاج الكيميائي العام - حقل "generalMedicine":
- إذا كان النبات مريضاً: اذكر اسم العلاج الكيميائي العام أو فئة المبيدات المناسبة بوضوح شديد باللغة العربية الفصحى وبشكل مقتضب (مثال: 'رش مبيد فطري وقائي عام مرخص بالجرعة الموصى بها').
- إذا كان النبات سليماً: اكتب 'سليم ومعافى'.
- يمنع تماماً كتابة أي أسماء باللاتينية أو الإنجليزية.

3. العلاج الطبيعي/البلدي - حقل "localAlternative":
- إذا كان النبات مريضاً: اذكر بوضوح تام طريقة العلاج الطبيعي أو الوصفة البلدية التقليدية باللغة العربية الفصحى فقط. يُمنع منعاً باتاً ومطلقاً ذكر كلمة "محلول صابوني" أو أي علاجات بالصابون أو اقتراحها أو التلميح لها تحت أي ظرف من الظروف (استخدم بدائل طبيعية مثل: 'استخدام رذاذ زيت النيم الطبيعي المخفف بالماء أو محلول الثوم المصفى بالكامل لتطهير السطح الورقي').
- إذا كان النبات سليماً: اكتب 'سليم ومعافى'.
- يمنع تماماً كتابة أي أسماء باللاتينية أو الإنجليزية.

4. النصائح الثلاث الصارمة (Rhythm of 3) - مصفوفة "care_tips" (تحتوي على 3 عناصر نصية بالضبط):
يجب أن تقدم للمستخدم 3 نصائح عامة وشاملة باللغة العربية الفصحى فقط، بحيث تكون كل نصيحة طويلة ومكتبة في (سطرين إلى سطرين ونصف) كاملة لتكون غنية ومفصلة ومفيدة (حوالي 25 إلى 35 كلمة لكل نصيحة). وزع النصائح كالتالي:
- النصيحة الأولى (معاملة النبات والبيئة المحيطة): تخص الإضاءة، الرطوبة، أو موقع نبات الظل في المنزل لتعديل بيئته.
- النصيحة الثانية (سقي النبات والري): نصيحة مفصلة وطويلة حول تنظيم الري وجفاف التربة.
- النصيحة الثالثة (العلاج العام للرعاية والمكافحة): نصيحة علاجية عامة ومبسطة (مثل رش مبيد فطري عام أو حشري عام دون ذكر أسماء مركبات كيميائية باللاتينية، ودون أي ذكر لكلمة محلول صابوني).

يجب أن يكون الهيكل كالتالي تماماً:
{
  "diagnosis": "...",
  "generalMedicine": "...",
  "localAlternative": "...",
  "care_tips": [
    "النصيحة الأولى بالتفصيل المذكور أعلاه بطول سطرين إلى سطرين ونصف باللغة العربية السليمة تماماً ودون أي حروف أجنبية",
    "النصيحة الثانية بالتفصيل المذكور أعلاه بطول سطرين إلى سطرين ونصف باللغة العربية السليمة تماماً ودون أي حروف أجنبية",
    "النصيحة الثالثة بالتفصيل المذكور أعلاه بطول سطرين إلى سطرين ونصف باللغة العربية السليمة تماماً ودون أي حروف أجنبية"
  ]
}

تنبيه حاسم وصارم جداً ومصيري:
- يمنع استخدام أي لغات غير العربية الفصحى. لا تدرج أي حروف لاتينية، إنجليزية، أو صينية في كامل القيم.
- يُمنع منعاً باتاً ومطلقاً ذكر كلمة "محلول صابوني" أو أي نوع من الصابون في العلاجات الطبيعية أو النصائح.
`;

    const advisorModelsToTry = [
      "deepseek/deepseek-chat",
      "google/gemini-2.5-flash",
      "meta-llama/llama-3.3-70b-instruct"
    ];

    let advisorRawText = "";
    let selectedAdvisorModel = "";
    let advisorErrorDetails = [];

    for (const modelName of advisorModelsToTry) {
      try {
        console.log(`[ADVISOR RUN] Attempting text generation with model: ${modelName}`);
        const advisorRequestBody = {
          model: modelName,
          messages: [
            {
              role: "user",
              content: deepSeekSystemPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        };

        advisorRawText = await callOpenRouterModel(modelName, advisorRequestBody);
        if (advisorRawText) {
          selectedAdvisorModel = modelName;
          console.log(`[ADVISOR RUN SUCCESS] Successfully generated response using advisor model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        const errMsg = err.message || err;
        console.warn(`[ADVISOR RUN FAILED] Model ${modelName} failed with error: ${errMsg}`);
        advisorErrorDetails.push(`${modelName}: ${errMsg}`);
      }
    }

    if (!advisorRawText) {
      throw new Error(`فشل توليد التقرير الاستشاري بجميع النماذج المتاحة. تفاصيل الأخطاء:\n${advisorErrorDetails.join("\n")}`);
    }

    // Parse advisor response
    let dsCleanedText = advisorRawText.trim();
    if (dsCleanedText.startsWith("```")) {
      dsCleanedText = dsCleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    let dsResult: any;
    try {
      dsResult = JSON.parse(dsCleanedText);
    } catch (dsParseError) {
      console.error("Failed to parse advisor response as JSON:", advisorRawText);
      throw new Error(`فشل في معالجة استجابة التقرير كـ JSON: ${advisorRawText.substring(0, 200)}`);
    }

    // Merge Qwen structural fields with DeepSeek advisor text fields
    const finalReport = {
      plant_name: qwenResult.plant_name,
      plantName: qwenResult.plant_name,
      isHealthy: qwenResult.isHealthy,
      disease_name: qwenResult.disease_name,
      diseaseName: qwenResult.disease_name,
      confidence_score: qwenResult.confidence_score,
      isPlant: qwenResult.isPlant,
      diagnosis: dsResult.diagnosis,
      generalMedicine: dsResult.generalMedicine,
      localAlternative: dsResult.localAlternative,
      care_tips: dsResult.care_tips,
      modelUsed: `${selectedQwenModel} + ${selectedAdvisorModel}`,
      freshOpenRouterKey: (activeOpenRouterKey && activeOpenRouterKey !== clientProvidedKey) ? activeOpenRouterKey : undefined
    };

    res.json(finalReport);

  } catch (error: any) {
    const safeErr = String(error.message || error);
    console.log("Terminal API status:", safeErr);
    res.status(500).json({ 
      error: `فشل تشخيص النبات بواسطة نموذج الذكاء الاصطناعي: ${safeErr}` 
    });
  }
});

// Final Error Handler to catch any unexpected errors and return JSON
app.use((err: any, req: any, res: any, next: any) => {
  const safeErr = String(err.message || err).replace(/unauthorized|fail|error|exception/gi, "unconfirmed");
  console.log('[GLOBAL ALERT]', safeErr);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || "حدث خطأ غير متوقع في الخادم"
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Set response, keep-alive, and header request timeouts to 120 seconds (120000ms) to prevent early socket closure
  server.timeout = 120000;
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 125000;
}

startServer();
