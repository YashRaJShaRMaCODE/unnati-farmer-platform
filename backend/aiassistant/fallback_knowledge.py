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
                "UNNATI's Loan Eligibility page gives a demo estimate from profile and farm data. It is not a bank's "
                "credit assessment, approval, or offer. A lender independently checks eligibility and terms. "
                "Use the page to inspect the estimate inputs, then ask your lender for current requirements."
            ),
            answer_hi=(
                "UNNATI का ऋण पात्रता पेज प्रोफ़ाइल और खेती के डेटा से डेमो अनुमान देता है। यह बैंक का क्रेडिट "
                "मूल्यांकन, मंज़ूरी या ऑफ़र नहीं है। पात्रता और शर्तें बैंक/ऋणदाता स्वतंत्र रूप से जाँचते हैं। "
                "अनुमान के इनपुट देखें और अपने ऋणदाता से मौजूदा ज़रूरतें पूछें।"
            ),
        ),
        FallbackEntry(
            keywords=("document", "दस्तावेज", "कागज", "paper", "aadhaar", "आधार", "kyc", "proof"),
            answer_en=(
                "Document requirements vary by lender and product. Ask the lender for its current checklist and "
                "share documents only through its official channel. UNNATI's Health Card is a profile summary, "
                "not proof of loan approval."
            ),
            answer_hi=(
                "दस्तावेज़ों की ज़रूरत बैंक और ऋण योजना के अनुसार बदलती है। बैंक से मौजूदा सूची पूछें और "
                "दस्तावेज़ केवल उसके आधिकारिक माध्यम से साझा करें। UNNATI हेल्थ कार्ड प्रोफ़ाइल सारांश है, "
                "ऋण मंज़ूरी का प्रमाण नहीं।"
            ),
        ),
        FallbackEntry(
            keywords=("kcc", "kisan credit", "credit card", "किसान क्रेडिट"),
            answer_en=(
                "KCC eligibility, limits, and terms depend on current RBI directions and the issuing lender's "
                "assessment. Check the RBI directions at https://rbi.org.in/scripts/BS_ViewMasterDirections.aspx?did=343 "
                "and confirm the current checklist with your bank. UNNATI's demo score does not affect eligibility."
            ),
            answer_hi=(
                "KCC की पात्रता, सीमा और शर्तें मौजूदा RBI निर्देशों तथा जारीकर्ता बैंक के मूल्यांकन पर निर्भर करती हैं। "
                "RBI निर्देश यहाँ देखें: https://rbi.org.in/scripts/BS_ViewMasterDirections.aspx?did=343 "
                "और मौजूदा दस्तावेज़ सूची बैंक से पूछें। UNNATI का डेमो स्कोर पात्रता तय नहीं करता।"
            ),
        ),
        FallbackEntry(
            keywords=("trust score", "विश्वास", "स्कोर", "improve loan", "risk", "जोखिम"),
            answer_en=(
                "The UNNATI trust score is a demo indicator and does not predict loan terms or approval. "
                "Its inputs include profile verification, land/crop records, completed sales, scheme applications, "
                "and complaint outcomes. See the Trust Score page for the breakdown."
            ),
            answer_hi=(
                "UNNATI का विश्वास स्कोर डेमो संकेतक है; यह ऋण की शर्तों या मंज़ूरी का अनुमान नहीं देता। "
                "इसमें प्रोफ़ाइल सत्यापन, भूमि/फसल रिकॉर्ड, पूरी हुई बिक्री, योजना आवेदन और शिकायत के नतीजे "
                "शामिल हैं। विवरण के लिए विश्वास स्कोर पेज देखें।"
            ),
        ),
        FallbackEntry(
            keywords=("interest", "ब्याज", "rate", "repay", "emi", "किस्त"),
            answer_en=(
                "Rates, fees, and repayment terms vary by lender and product. Ask lenders for current terms and "
                "a written repayment schedule, then compare the total cost. UNNATI does not predict an offered rate."
            ),
            answer_hi=(
                "ब्याज, शुल्क और भुगतान की शर्तें बैंक तथा ऋण उत्पाद के अनुसार अलग होती हैं। बैंकों से मौजूदा "
                "शर्तें और लिखित भुगतान-तालिका माँगें, फिर कुल लागत की तुलना करें। UNNATI ब्याज दर का अनुमान नहीं देता।"
            ),
        ),
    ],
    "scheme": [
        FallbackEntry(
            keywords=("pm-kisan", "pm kisan", "kisan samman", "6000", "installment", "पीएम किसान"),
            answer_en=(
                "PM-KISAN gives income support to eligible farmer families. "
                "Check current eligibility and status on the official portal: https://pmkisan.gov.in/. "
                "UNNATI does not determine government eligibility."
            ),
            answer_hi=(
                "पीएम-किसान पात्र किसान परिवारों को सहायता देता है। मौजूदा पात्रता और स्थिति आधिकारिक पोर्टल "
                "https://pmkisan.gov.in/ पर जाँचें। UNNATI सरकारी पात्रता तय नहीं करता।"
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
                "Your UNNATI demo trust score (0–100) reflects profile verification, completed sales "
                "count and value, scheme applications, and complaint resolution. It does not measure "
                "buyer satisfaction or decide loan approval or scheme eligibility; lenders and agencies "
                "make independent decisions. See the Trust Score page for the score breakdown."
            ),
            answer_hi=(
                "UNNATI का डेमो विश्वास स्कोर (0–100) प्रोफ़ाइल सत्यापन, पूरी हुई बिक्री की संख्या और "
                "राशि, योजना आवेदन और शिकायत समाधान दिखाता है। यह खरीदार की संतुष्टि नहीं मापता और "
                "ऋण या योजना की पात्रता तय नहीं करता; बैंक और संबंधित संस्थाएँ अपने निर्णय खुद लेती हैं। "
                "विवरण के लिए विश्वास स्कोर पेज देखें।"
            ),
        ),
        FallbackEntry(
            keywords=("verification", "सत्यापन", "verify", "aadhaar", "आधार", "document", "दस्तावेज"),
            answer_en=(
                "Profile and land record checks can add up to 20 points in this demo score. Keep "
                "records accurate and share documents only when needed. A verified profile does not "
                "guarantee scheme approval, a loan, or marketplace visibility."
            ),
            answer_hi=(
                "इस डेमो स्कोर में प्रोफ़ाइल और भूमि रिकॉर्ड सत्यापन से अधिकतम 20 अंक मिल सकते हैं। रिकॉर्ड "
                "सही रखें और दस्तावेज़ ज़रूरत पर ही साझा करें। सत्यापन से योजना, ऋण या बाज़ार में जगह की "
                "मंज़ूरी की गारंटी नहीं मिलती।"
            ),
        ),
        FallbackEntry(
            keywords=("transaction", "लेनदेन", "marketplace", "sell", "buy", "sale", "बिक्री", "बाज़ार"),
            answer_en=(
                "Completed marketplace transactions affect this demo score. Keep transaction details accurate; "
                "the score does not measure buyer satisfaction or establish creditworthiness."
            ),
            answer_hi=(
                "पूरे हुए बाज़ार लेनदेन इस डेमो स्कोर को प्रभावित करते हैं। लेनदेन का विवरण सही रखें; "
                "यह स्कोर खरीदार की संतुष्टि या ऋण-योग्यता नहीं मापता।"
            ),
        ),
        FallbackEntry(
            keywords=("complaint", "शिकायत", "dispute", "विवाद", "negative", "decrease", "drop", "कम"),
            answer_en=(
                "Complaint outcomes affect this demo score. Share accurate information and use the "
                "platform's review process if a record is incorrect. This score does not guarantee a lender "
                "or government decision."
            ),
            answer_hi=(
                "शिकायत के नतीजे इस डेमो स्कोर को प्रभावित करते हैं। सही जानकारी दें और रिकॉर्ड गलत हो तो "
                "प्लेटफ़ॉर्म की समीक्षा प्रक्रिया अपनाएँ। यह स्कोर बैंक या सरकारी निर्णय की गारंटी नहीं देता।"
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
            "For a demo estimate, add profile, land, and crop records, then open Loan Eligibility. "
            "For an actual loan, ask your lender for its current checklist, assessment, and written terms. "
            "Try asking about documents or KCC."
        ),
        "hi": (
            "डेमो अनुमान के लिए प्रोफ़ाइल, भूमि और फसल रिकॉर्ड जोड़कर ऋण अनुमान पेज खोलें। "
            "वास्तविक ऋण के लिए बैंक से मौजूदा सूची, मूल्यांकन और लिखित शर्तें पूछें। "
            "दस्तावेज़ या KCC के बारे में पूछें।"
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
        "Complete your farmer profile to keep the demo score inputs accurate.",
        "Record land and crop data for a clearer demo estimate; lender rules vary.",
        "Apply to active government schemes from the Schemes page.",
        "Complete marketplace transactions to build transaction history.",
    ],
    "hi": [
        "डेमो स्कोर के इनपुट सही रखने के लिए किसान प्रोफ़ाइल पूरी करें।",
        "डेमो अनुमान के लिए भूमि और फसल का डेटा दर्ज करें; बैंक के नियम अलग हो सकते हैं।",
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
