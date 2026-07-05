"""
Hardcoded bilingual Q&A when Gemini AI is unavailable.
Keyword matching supports English and Hindi (Devanagari).
"""

from dataclasses import dataclass
import re


@dataclass(frozen=True)
class FallbackEntry:
    keywords: tuple[str, ...]
    answer_en: str
    answer_hi: str


FALLBACK_ENTRIES: dict[str, list[FallbackEntry]] = {
    "farming": [
        FallbackEntry(
            keywords=(
                "kharif", "खरीफ", "monsoon", "rainy", "june", "july",
                "कौन सी फसल", "फसल", "मौसम",
            ),
            answer_en=(
                "Kharif season (June–October) suits crops like paddy, maize, cotton, soybean, "
                "groundnut, and millets (bajra, jowar). Choose based on your soil and local rainfall. "
                "Prepare land before monsoon, use certified seeds, and maintain proper drainage. "
                "Record your crops on the UNNATI Crops page for better scheme and loan support."
            ),
            answer_hi=(
                "खरीफ़ मौसम (जून–अक्टूबर) में धान, मक्का, कपास, सोयाबीन, मूंगफली और बाजरा/ज्वार "
                "जैसी फसलें उपयुक्त हैं। मिट्टी और स्थानीय वर्षा के अनुसार फसल चुनें। "
                "मानसून से पहले खेत की तैयारी करें, प्रमाणित बीज का उपयोग करें और जल निकासी ठीक रखें। "
                "बेहतर योजना और ऋण सहायता के लिए UNNATI की फसलें पेज पर अपनी फसल दर्ज करें।"
            ),
        ),
        FallbackEntry(
            keywords=("rabi", "रबी", "winter", "wheat", "mustard", "gram", "chana", "गेहूं", "सरसों"),
            answer_en=(
                "Rabi season (October–March) is ideal for wheat, mustard, gram, barley, and peas. "
                "Sow after monsoon when soil moisture is good. Apply balanced fertilizers based on soil tests. "
                "Store harvest records in UNNATI to strengthen your farm profile."
            ),
            answer_hi=(
                "रबी मौसम (अक्टूबर–मार्च) में गेहूं, सरसों, चना, जौ और मटर की खेती अच्छी रहती है। "
                "मानसून के बाद नमी वाली मिट्टी में बुवाई करें। मिट्टी परीक्षण के आधार पर संतुलित खाद दें। "
                "कटाई का विवरण UNNATI में सहेजें — इससे आपकी किसान प्रोफ़ाइल मजबूत होती है।"
            ),
        ),
        FallbackEntry(
            keywords=(
                "irrigation", "सिंचाई", "water", "paani", "पानी", "drip", "sprinkler", "well", "canal", "कुआं",
            ),
            answer_en=(
                "Match irrigation to crop stage: germination, flowering, and grain filling need water most. "
                "Drip and sprinkler systems save water. For rainfed areas, use drought-tolerant varieties and mulching. "
                "Add irrigation details on the UNNATI Lands page."
            ),
            answer_hi=(
                "फसल के चरण के अनुसार सिंचाई दें — अंकुरण, फूल आना और दाना भरना सबसे ज़रूरी समय हैं। "
                "ड्रिप और स्प्रिंकलर से पानी बचता है। वर्षा आधारित क्षेत्र में सूखा सहनशील बीज और मलचिंग उपयोगी हैं। "
                "UNNATI की भूमि पेज पर सिंचाई का प्रकार दर्ज करें।"
            ),
        ),
        FallbackEntry(
            keywords=("pest", "कीट", "disease", "रोग", "fungus", "insect", "spray", "कीटनाशक"),
            answer_en=(
                "Check fields regularly to spot pests early. Use integrated pest management (IPM): "
                "crop rotation, resistant seeds, and spray only when needed. "
                "Follow pesticide label doses. Contact your local Krishi Vigyan Kendra (KVK) for help."
            ),
            answer_hi=(
                "खेत की नियमित जाँच से कीट-रोग जल्दी पकड़ में आते हैं। एकीकृत कीट प्रबंधन (IPM) अपनाएँ — "
                "फसल चक्र, resistant बीज, और ज़रूरत पर ही छिड़काव। "
                "कीटनाशक की सही मात्रा का पालन करें। स्थानीय KVK से फसल-विशेष सलाह लें।"
            ),
        ),
        FallbackEntry(
            keywords=("fertilizer", "उर्वरक", "खाद", "npk", "organic", "compost", "manure", "गोबर"),
            answer_en=(
                "Use fertilizer based on soil health and crop need. Mix organic manure with balanced NPK where advised. "
                "Split nitrogen for cereals. Avoid over-use to protect soil and save money. "
                "Keep crop records in UNNATI for better guidance."
            ),
            answer_hi=(
                "मिट्टी और फसल की ज़रूरत के अनुसार खाद दें। जहाँ सलाह हो, गोबर/compost के साथ NPK मिलाएँ। "
                "अनाज की फसल में नाइट्रोजन विभाजित करके दें। अधिक खाद से बचें — मिट्टी और खर्च दोनों बचेंगे। "
                "UNNATI में फसल रिकॉर्ड रखें।"
            ),
        ),
    ],
    "loan": [
        FallbackEntry(
            keywords=(
                "eligible", "eligibility", "पात्र", "qualify", "how much", "amount",
                "ऋण", "loan", "कितना", "मिलेगा",
            ),
            answer_en=(
                "Loan eligibility on UNNATI depends on trust score, verified land, crop history, and marketplace sales. "
                "Open Loan Eligibility and run a calculation. Complete your profile and add land/crop data first."
            ),
            answer_hi=(
                "UNNATI पर ऋण पात्रता विश्वास स्कोर, सत्यापित भूमि, फसल इतिहास और बाज़ार बिक्री पर निर्भर करती है। "
                "ऋण पात्रता पेज पर गणना चलाएँ। पहले प्रोफ़ाइल पूरी करें और भूमि/फसल जोड़ें।"
            ),
        ),
        FallbackEntry(
            keywords=("document", "दस्तावेज", "कागज", "paper", "aadhaar", "आधार", "kyc", "proof"),
            answer_en=(
                "Common documents: Aadhaar, land records (survey/khasra), bank passbook, crop details, and income proof. "
                "Keep land verification updated on UNNATI. Visit your bank with your Health Card PDF."
            ),
            answer_hi=(
                "आम दस्तावेज: आधार, भूमि रिकॉर्ड (सर्वे/खसरा), बैंक पासबुक, फसल विवरण और आय प्रमाण। "
                "UNNATI पर भूमि सत्यापन अपडेट रखें। हेल्थ कार्ड PDF के साथ नज़दीकी बैंक/shakari bank जाएँ।"
            ),
        ),
        FallbackEntry(
            keywords=("kcc", "kisan credit", "credit card", "किसान क्रेडिट"),
            answer_en=(
                "Kisan Credit Card (KCC) gives flexible credit for crops and farm needs. "
                "You usually need land proof and basic credit check. "
                "A strong UNNATI trust score and verified records help your application."
            ),
            answer_hi=(
                "किसान क्रेडिट कार्ड (KCC) से फसल और खेती खर्च के लिए लचीला ऋण मिलता है। "
                "आमतौर पर भूमि प्रमाण और बुनियादी क्रेडिट जाँच ज़रूरी होती है। "
                "UNNATI में अच्छा विश्वास स्कोर और सत्यापित रिकॉर्ड आवेदन में मदद करते हैं।"
            ),
        ),
        FallbackEntry(
            keywords=("trust score", "विश्वास", "स्कोर", "improve loan", "risk", "जोखिम"),
            answer_en=(
                "Higher trust scores often mean better loan terms. Improve by: verifying profile, "
                "adding land/crop records, completing marketplace sales, applying to schemes, "
                "and resolving complaints. See the Trust Score page for details."
            ),
            answer_hi=(
                "ऊँचा विश्वास स्कोर अक्सर बेहतर ऋण शर्तें दिलाता है। सुधार के लिए: प्रोफ़ाइल सत्यापित करें, "
                "भूमि/फसल जोड़ें, बाज़ार में बिक्री पूरी करें, योजनाओं में आवेदन करें, "
                "और शिकायतें जल्दी सुलझाएँ। विवरण के लिए विश्वास स्कोर पेज देखें।"
            ),
        ),
        FallbackEntry(
            keywords=("interest", "ब्याज", "rate", "repay", "emi", "किस्त"),
            answer_en=(
                "Interest rates vary by bank and loan type. Agricultural priority loans often have lower rates. "
                "Compare KCC, crop loans, and term loans. "
                "Keep transaction history on UNNATI to show repayment ability."
            ),
            answer_hi=(
                "ब्याज दर बैंक और ऋण प्रकार पर अलग होती है। कृषि प्राथमिकता ऋण में अक्सर कम ब्याज मिलता है। "
                "KCC, फसल ऋण और अवधि ऋण की तुलना करें। "
                "चुकौती क्षमता दिखाने के लिए UNNATI में लेनदेन इतिहास रखें।"
            ),
        ),
    ],
    "scheme": [
        FallbackEntry(
            keywords=("pm-kisan", "pm kisan", "kisan samman", "6000", "installment", "पीएम किसान"),
            answer_en=(
                "PM-KISAN gives income support to eligible farmer families. "
                "Link land records and bank account with Aadhaar correctly. "
                "Apply and track from the UNNATI Schemes page or official PM-KISAN portal."
            ),
            answer_hi=(
                "पीएम-किसान योग्य किसान परिवारों को आय सहायता देता है। "
                "भूमि रिकॉर्ड और बैंक खाता आधार से सही जोड़ें। "
                "UNNATI योजनाएँ पेज या आधिकारिक पोर्टल से आवेदन और स्थिति देखें।"
            ),
        ),
        FallbackEntry(
            keywords=(
                "eligible", "पात्र", "qualify", "who can", "apply", "आवेदन",
                "कौन", "योजना", "scheme",
            ),
            answer_en=(
                "Eligibility depends on land size, crop, farmer category, and state rules. "
                "Browse schemes on UNNATI, read criteria, and apply online. Keep Aadhaar and land papers ready."
            ),
            answer_hi=(
                "पात्रता भूमि आकार, फसल, किसान श्रेणी और राज्य नियमों पर निर्भर करती है। "
                "UNNATI पर योजनाएँ देखें, मानदंड पढ़ें और ऑनलाइन आवेदन करें। आधार और भूमि कागज़ तैयार रखें।"
            ),
        ),
        FallbackEntry(
            keywords=("crop insurance", "fasal bima", "फसल बीमा", "बीमा", "insurance", "pmfby"),
            answer_en=(
                "PM Fasal Bima Yojana (PMFBY) protects against crop loss from natural events. "
                "Enroll during the notified window. Premium is subsidized for farmers. "
                "Check UNNATI Schemes and your state agriculture office for dates."
            ),
            answer_hi=(
                "प्रधानमंत्री फसल बीमा योजना (PMFBY) प्राकृतिक नुकसान से फसल की रक्षा करती है। "
                "निर्धारित अवधि में नामांकन करें। किसानों के लिए प्रीमियम में सब्सिडी मिलती है। "
                "तारीखों के लिए UNNATI योजनाएँ और राज्य कृषि कार्यालय देखें।"
            ),
        ),
        FallbackEntry(
            keywords=("apply", "application", "आवेदन", "how to", "कैसे", "steps", "submit", "कैसे करें"),
            answer_en=(
                "On UNNATI: Schemes → pick a scheme → read eligibility → Apply Now. "
                "Track under My Applications. You may need Aadhaar, land records, and bank details. Apply before deadlines."
            ),
            answer_hi=(
                "UNNATI पर: योजनाएँ → योजना चुनें → पात्रता पढ़ें → अभी आवेदन करें। "
                "मेरे आवेदन में स्थिति देखें। आधार, भूमि रिकॉर्ड और बैंक विवरण चाहिए हो सकते हैं। "
                "अंतिम तारीख से पहले आवेदन करें।"
            ),
        ),
        FallbackEntry(
            keywords=("subsidy", "सब्सिडी", "अनुदान", "seed", "equipment", "drip", "solar", "सब्जी"),
            answer_en=(
                "Many schemes subsidize seeds, drip irrigation, farm tools, and solar pumps. "
                "Small and marginal farmers are often targeted. "
                "Check UNNATI Schemes and your block agriculture officer for local programs."
            ),
            answer_hi=(
                "कई योजनाएँ बीज, ड्रिप सिंचाई, कृषि उपकरण और सोलर पंप पर सब्सिडी देती हैं। "
                "छोटे और सीमांत किसान अक्सर लक्षित होते हैं। "
                "स्थानीय योजनाओं के लिए UNNATI और ब्लॉक कृषि अधिकारी से संपर्क करें।"
            ),
        ),
    ],
    "trust_score": [
        FallbackEntry(
            keywords=(
                "improve", "सुधार", "बढ़ाए", "increase", "raise", "boost", "better score",
                "स्कोर कैसे", "कैसे सुधार",
            ),
            answer_en=(
                "To improve your UNNATI trust score: (1) Verify your profile, "
                "(2) Add land records with documents, (3) Record crops and yields, "
                "(4) Complete marketplace sales, (5) Apply to schemes, "
                "(6) Resolve complaints quickly. Try the Trust Simulator to preview changes."
            ),
            answer_hi=(
                "UNNATI विश्वास स्कोर सुधारने के लिए: (1) प्रोफ़ाइल सत्यापित करें, "
                "(2) दस्तावेज़ के साथ भूमि जोड़ें, (3) फसल और उपज दर्ज करें, "
                "(4) बाज़ार में बिक्री पूरी करें, (5) योजनाओं में आवेदन करें, "
                "(6) शिकायतें जल्दी सुलझाएँ। बदलाव देखने के लिए स्कोर सिम्युलेटर आज़माएँ।"
            ),
        ),
        FallbackEntry(
            keywords=("what is", "क्या है", "meaning", "explain", "how works", "समझाए", "क्या होता"),
            answer_en=(
                "Your UNNATI trust score (0–100) reflects verification, transactions, "
                "buyer ratings, scheme use, and complaint resolution. "
                "Higher scores build trust for loans, schemes, and marketplace. See the Trust Score page."
            ),
            answer_hi=(
                "UNNATI विश्वास स्कोर (0–100) सत्यापन, लेनदेन, खरीदार रेटिंग, "
                "योजना भागीदारी और शिकायत समाधान दर्शाता है। "
                "ऊँचा स्कोर ऋण, योजना और बाज़ार में विश्वास बढ़ाता है। विश्वास स्कोर पेज देखें।"
            ),
        ),
        FallbackEntry(
            keywords=("verification", "सत्यापन", "verify", "aadhaar", "आधार", "document", "दस्तावेज"),
            answer_en=(
                "Verification adds up to 30 points. Upload land ownership papers, complete Aadhaar, "
                "and keep profile accurate. Verified farmers get faster scheme approvals "
                "and better marketplace visibility."
            ),
            answer_hi=(
                "सत्यापन से अधिकतम 30 अंक मिल सकते हैं। भूमि स्वामित्व कागज़ अपलोड करें, आधार पूरा करें, "
                "और प्रोफ़ाइल सही रखें। सत्यापित किसानों को योजना स्वीकृति में और बाज़ार में फायदा मिलता है।"
            ),
        ),
        FallbackEntry(
            keywords=("transaction", "लेनदेन", "marketplace", "sell", "buy", "sale", "बिक्री", "बाज़ार"),
            answer_en=(
                "Marketplace transactions build your transaction score. List produce honestly, "
                "deliver on time, and complete sales through UNNATI. "
                "Regular sales show banks and buyers you are reliable."
            ),
            answer_hi=(
                "बाज़ार लेनदेन से लेनदेन स्कोर बनता है। ईमानदारी से सूची बनाएँ, "
                "समय पर डिलीवरी करें, UNNATI के ज़रिए बिक्री पूरी करें। "
                "नियमित बिक्री से बैंक और खरीदार आप पर भरोसा करते हैं।"
            ),
        ),
        FallbackEntry(
            keywords=("complaint", "शिकायत", "dispute", "विवाद", "negative", "decrease", "drop", "कम"),
            answer_en=(
                "Unresolved complaints can lower your score. Respond quickly, share evidence, "
                "and work toward resolution. A clean record helps with buyers, banks, and government."
            ),
            answer_hi=(
                "अनसुलझी शिकायतें स्कोर घटा सकती हैं। जल्दी जवाब दें, साक्ष्य दें, "
                "और समाधान की दिशा में काम करें। साफ रिकॉर्ड खरीदार, बैंक और सरकार के लिए अच्छा है।"
            ),
        ),
    ],
}

DEFAULT_ANSWERS: dict[str, dict[str, str]] = {
    "farming": {
        "en": (
            "For farming help: pick crops for your season (Kharif/Rabi/Zaid), care for soil, "
            "and irrigate on time. Record lands and crops in UNNATI. "
            "Try asking about Kharif crops, irrigation, or pests."
        ),
        "hi": (
            "खेती सलाह: अपने मौसम (खरीफ/रबी/ज़aid) की फसल चुनें, मिट्टी की देखभाल करें "
            "और समय पर सिंचाई दें। UNNATI में भूमि और फसल दर्ज करें। "
            "खरीफ फसल, सिंचाई या कीट-रोग के बारे में पूछें।"
        ),
    },
    "loan": {
        "en": (
            "For loan help: complete profile, add land and crops, then use Loan Eligibility. "
            "Keep Aadhaar, land proof, and bank details ready. "
            "Try asking about eligibility, documents, or KCC."
        ),
        "hi": (
            "ऋण सहायता: प्रोफ़ाइल पूरी करें, भूमि/फसल जोड़ें, फिर ऋण पात्रता गणना चलाएँ। "
            "आधार, भूमि प्रमाण और बैंक विवरण तैयार रखें। "
            "पात्रता, दस्तावेज़ या KCC के बारे में पूछें।"
        ),
    },
    "scheme": {
        "en": (
            "Browse schemes on UNNATI. Check eligibility, benefits, and deadlines before applying. "
            "Keep Aadhaar and land records updated. "
            "Try asking about PM-KISAN, crop insurance, or how to apply."
        ),
        "hi": (
            "UNNATI पर योजनाएँ देखें। आवेदन से पहले पात्रता, लाभ और अंतिम तारीख जाँचें। "
            "आधार और भूमि रिकॉर्ड अपडेट रखें। "
            "पीएम-किसान, फसल बीमा या आवेदन कैसे करें — इस पर पूछें।"
        ),
    },
    "trust_score": {
        "en": (
            "Build trust score through verification, land/crop records, marketplace sales, "
            "schemes, and quick complaint resolution. "
            "Try asking how to improve your score or what verification means."
        ),
        "hi": (
            "स्कोर बनाने के लिए: सत्यापन, भूमि/फसल, बाज़ार बिक्री, योजनाएँ "
            "और शिकायत समाधान ज़रूरी हैं। "
            "स्कोर कैसे बढ़ाएँ या सत्यापन क्या है — इस पर पूछें।"
        ),
    },
}

FALLBACK_TIPS: dict[str, list[str]] = {
    "en": [
        "Complete your farmer profile to improve trust score.",
        "Record land and crop data for better loan eligibility.",
        "Apply to active government schemes from the Schemes page.",
        "Complete marketplace transactions to build transaction history.",
    ],
    "hi": [
        "विश्वास स्कोर बढ़ाने के लिए किसान प्रोफ़ाइल पूरी करें।",
        "बेहतर ऋण पात्रता के लिए भूमि और फसल का डेटा दर्ज करें।",
        "योजनाएँ पेज से सक्रिय सरकारी योजनाओं में आवेदन करें।",
        "लेनदेन इतिहास बनाने के लिए बाज़ार में लेनदेन पूरे करें।",
    ],
}

_DEVANAGARI = re.compile(r"[\u0900-\u097F]")


def resolve_language(locale: str | None, message: str) -> str:
    """Pick hi or en from UI locale, or auto-detect Hindi in the question."""
    if locale in ("hi", "en"):
        lang = locale
    else:
        lang = "en"
    if _DEVANAGARI.search(message):
        return "hi"
    return lang


def get_fallback_reply(message: str, context_type: str = "farming", locale: str | None = "en") -> str:
    """Return the best matching hardcoded answer in the user's language."""
    context = context_type if context_type in FALLBACK_ENTRIES else "farming"
    lang = resolve_language(locale, message)
    normalized = message.lower().strip()

    best_score = 0
    best_answer = ""

    for entry in FALLBACK_ENTRIES[context]:
        score = sum(1 for kw in entry.keywords if kw.lower() in normalized)
        if score > best_score:
            best_score = score
            best_answer = entry.answer_hi if lang == "hi" else entry.answer_en

    if best_score > 0:
        return best_answer

    return DEFAULT_ANSWERS[context][lang]


def get_fallback_tips(locale: str | None = "en") -> list[str]:
    lang = "hi" if locale == "hi" else "en"
    return FALLBACK_TIPS[lang]
