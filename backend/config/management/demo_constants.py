"""Shared constants for UNNATI demo data seeding and cleanup."""

DEMO_EMAIL_DOMAIN = "@unnati.demo"
DEMO_PASSWORD = "Demo@1234"

# Featured login accounts (documented in DEMO_USERS.md)
FEATURED_FARMER_EMAIL = "farmer1@unnati.demo"
FEATURED_BUYER_EMAIL = "buyer1@unnati.demo"
GOVERNMENT_EMAIL = "gov@unnati.demo"
BANK_EMAIL = "bank@unnati.demo"
ADMIN_EMAIL = "admin@unnati.demo"

FARMER_COUNT = 50
BUYER_COUNT = 20
LAND_COUNT = 100
CROP_COUNT = 100
LISTING_COUNT = 50
TRANSACTION_COUNT = 40
SCHEME_COUNT = 15
SCHEME_APPLICATION_COUNT = 40
COMPLAINT_COUNT = 20
LOAN_PREDICTION_COUNT = 30
NOTIFICATION_COUNT = 100

FARMER_NAMES = [
    ("Rajesh", "Kumar"),
    ("Priya", "Sharma"),
    ("Suresh", "Patil"),
    ("Lakshmi", "Reddy"),
    ("Ramesh", "Yadav"),
    ("Anita", "Devi"),
    ("Vikram", "Singh"),
    ("Meena", "Kumari"),
    ("Arun", "Jadhav"),
    ("Kavita", "Pawar"),
    ("Sanjay", "Gupta"),
    ("Pooja", "Verma"),
    ("Manoj", "Tiwari"),
    ("Sunita", "Rathore"),
    ("Deepak", "Choudhary"),
    ("Rekha", "Nair"),
    ("Ganesh", "Kulkarni"),
    ("Savitri", "Bai"),
    ("Harish", "Meena"),
    ("Geeta", "Soni"),
    ("Ravi", "Chauhan"),
    ("Nirmala", "Devi"),
    ("Ashok", "Desai"),
    ("Radha", "Iyer"),
    ("Prakash", "Bose"),
    ("Kamala", "Menon"),
    ("Balaji", "Rao"),
    ("Usha", "Pillai"),
    ("Mohan", "Naik"),
    ("Lata", "Joshi"),
    ("Vinod", "Thakur"),
    ("Saroj", "Mishra"),
    ("Dinesh", "Saxena"),
    ("Pushpa", "Devi"),
    ("Rakesh", "Dubey"),
    ("Manju", "Shukla"),
    ("Sunil", "Malhotra"),
    ("Asha", "Bhat"),
    ("Naveen", "Gowda"),
    ("Indira", "Devi"),
    ("Krishna", "Murthy"),
    ("Padma", "Lakshmi"),
    ("Subhash", "Chandra"),
    ("Vimla", "Devi"),
    ("Anil", "Kapoor"),
    ("Sushila", "Devi"),
    ("Rajendra", "Prasad"),
    ("Gita", "Devi"),
    ("Mahesh", "Bhatt"),
    ("Shanti", "Devi"),
]

VILLAGES = [
    {"name": "Rampur Khurd", "district": "Meerut", "state": "Uttar Pradesh", "pincode": "250001"},
    {"name": "Shivpuri", "district": "Shivpuri", "state": "Madhya Pradesh", "pincode": "473551"},
    {"name": "Krishnanagar", "district": "Nadia", "state": "West Bengal", "pincode": "741101"},
    {"name": "Suryapet", "district": "Suryapet", "state": "Telangana", "pincode": "508213"},
    {"name": "Kolhapur", "district": "Kolhapur", "state": "Maharashtra", "pincode": "416003"},
    {"name": "Mandya", "district": "Mandya", "state": "Karnataka", "pincode": "571401"},
    {"name": "Thanjavur", "district": "Thanjavur", "state": "Tamil Nadu", "pincode": "613001"},
    {"name": "Anand", "district": "Anand", "state": "Gujarat", "pincode": "388001"},
    {"name": "Patiala", "district": "Patiala", "state": "Punjab", "pincode": "147001"},
    {"name": "Nalgonda", "district": "Nalgonda", "state": "Telangana", "pincode": "508001"},
    {"name": "Barnala", "district": "Barnala", "state": "Punjab", "pincode": "148101"},
    {"name": "Satara", "district": "Satara", "state": "Maharashtra", "pincode": "415001"},
    {"name": "Hassan", "district": "Hassan", "state": "Karnataka", "pincode": "573201"},
    {"name": "Bharuch", "district": "Bharuch", "state": "Gujarat", "pincode": "392001"},
    {"name": "Mathura", "district": "Mathura", "state": "Uttar Pradesh", "pincode": "281001"},
]

BUYER_COMPANIES = [
    "Maharashtra Agro Traders Pvt Ltd",
    "Punjab Grain Mandi Corporation",
    "Telangana Farmers Produce Co.",
    "Gujarat Cotton Exporters",
    "UP Wheat Procurement Agency",
    "Karnataka Organic Foods Ltd",
    "Tamil Nadu Rice Millers Association",
    "West Bengal Agri Commodities",
    "MP Pulses Trading House",
    "Rajasthan Oilseeds Merchants",
    "Andhra Spice Exporters",
    "Delhi NCR Fresh Produce Hub",
    "Bihar Agri Marketing Federation",
    "Odisha Tribal Produce Collective",
    "Haryana Basmati Traders",
    "Kerala Coconut Processors",
    "Assam Tea & Spice Traders",
    "Chhattisgarh Rice Traders Union",
    "Jharkhand Forest Produce Co-op",
    "Himachal Apple Growers Association",
]

CROP_PROFILES = {
    "Wheat": {
        "seasons": ["rabi"],
        "yield_per_acre": (14, 22),
        "price_per_quintal": (2100, 2450),
        "area_fraction": (0.4, 0.9),
    },
    "Rice": {
        "seasons": ["kharif"],
        "yield_per_acre": (18, 28),
        "price_per_quintal": (1900, 2300),
        "area_fraction": (0.5, 1.0),
    },
    "Cotton": {
        "seasons": ["kharif"],
        "yield_per_acre": (8, 14),
        "price_per_quintal": (6200, 7800),
        "area_fraction": (0.3, 0.8),
    },
    "Sugarcane": {
        "seasons": ["kharif", "rabi"],
        "yield_per_acre": (280, 400),
        "price_per_quintal": (320, 380),
        "area_fraction": (0.5, 1.0),
    },
    "Maize": {
        "seasons": ["kharif", "rabi"],
        "yield_per_acre": (16, 24),
        "price_per_quintal": (1750, 2100),
        "area_fraction": (0.3, 0.7),
    },
    "Tur (Pigeon Pea)": {
        "seasons": ["kharif"],
        "yield_per_acre": (6, 10),
        "price_per_quintal": (5500, 6800),
        "area_fraction": (0.2, 0.6),
    },
    "Soybean": {
        "seasons": ["kharif"],
        "yield_per_acre": (8, 14),
        "price_per_quintal": (3800, 4600),
        "area_fraction": (0.3, 0.7),
    },
    "Groundnut": {
        "seasons": ["kharif", "rabi"],
        "yield_per_acre": (10, 16),
        "price_per_quintal": (5200, 6200),
        "area_fraction": (0.2, 0.5),
    },
    "Mustard": {
        "seasons": ["rabi"],
        "yield_per_acre": (8, 12),
        "price_per_quintal": (4800, 5600),
        "area_fraction": (0.2, 0.5),
    },
    "Onion": {
        "seasons": ["rabi", "kharif"],
        "yield_per_acre": (80, 120),
        "price_per_quintal": (1200, 2200),
        "area_fraction": (0.1, 0.3),
    },
}

SOIL_TYPES = ["alluvial", "black", "red", "laterite", "sandy", "clay"]
IRRIGATION_TYPES = ["canal", "well", "drip", "sprinkler", "rainfed"]

GOVERNMENT_SCHEMES = [
    {
        "name": "PM-KISAN",
        "description": (
            "Pradhan Mantri Kisan Samman Nidhi provides direct income support "
            "of ₹6,000 per year in three equal instalments to eligible farmer families."
        ),
        "eligibility": "Small and marginal farmers with cultivable land up to 2 hectares.",
        "benefit": 6000,
    },
    {
        "name": "PM Fasal Bima Yojana",
        "description": (
            "Comprehensive crop insurance scheme covering yield losses due to "
            "natural calamities, pests, and diseases at low premium rates."
        ),
        "eligibility": "All farmers growing notified crops in notified areas.",
        "benefit": 250000,
    },
    {
        "name": "Soil Health Card Scheme",
        "description": (
            "Free soil testing and nutrient management recommendations to "
            "improve soil fertility and reduce input costs."
        ),
        "eligibility": "All farmers with registered land records.",
        "benefit": 5000,
    },
    {
        "name": "Kisan Credit Card (KCC)",
        "description": (
            "Flexible credit facility for crop cultivation, post-harvest expenses, "
            "and farm maintenance at subsidized interest rates."
        ),
        "eligibility": "Farmers with land records and satisfactory credit history.",
        "benefit": 300000,
    },
    {
        "name": "PMKSY — Per Drop More Crop",
        "description": (
            "Micro-irrigation subsidy for drip and sprinkler systems to "
            "improve water-use efficiency on farms."
        ),
        "eligibility": "Farmers adopting drip/sprinkler on minimum 0.5 acre.",
        "benefit": 50000,
    },
    {
        "name": "Rashtriya Krishi Vikas Yojana",
        "description": (
            "State-level grants to increase public investment in agriculture "
            "and allied sectors."
        ),
        "eligibility": "State-approved agricultural development projects.",
        "benefit": 75000,
    },
    {
        "name": "Paramparagat Krishi Vikas Yojana",
        "description": (
            "Promotes cluster-based organic farming with certification "
            "and market linkage support."
        ),
        "eligibility": "Farmer groups willing to convert to organic practices.",
        "benefit": 15000,
    },
    {
        "name": "National Horticulture Mission",
        "description": (
            "Integrated development of horticulture through area expansion, "
            "post-harvest infrastructure, and training."
        ),
        "eligibility": "Horticulture farmers growing fruits, vegetables, or flowers.",
        "benefit": 40000,
    },
    {
        "name": "e-NAM Digital Mandi",
        "description": (
            "Online trading platform connecting farmers to APMC mandis "
            "across states for transparent price discovery."
        ),
        "eligibility": "Registered farmers and FPOs with valid produce.",
        "benefit": 10000,
    },
    {
        "name": "Agri-Infra Fund",
        "description": (
            "Medium-to-long term debt financing for post-harvest infrastructure "
            "including cold storage, warehouses, and processing units."
        ),
        "eligibility": "Farmers, FPOs, and agri-entrepreneurs with viable projects.",
        "benefit": 200000,
    },
    {
        "name": "Kisan Drone Scheme",
        "description": (
            "Subsidized agricultural drones for crop monitoring, spraying, "
            "and precision farming applications."
        ),
        "eligibility": "Progressive farmers and custom hiring centres.",
        "benefit": 80000,
    },
    {
        "name": "Animal Husbandry Infrastructure Development",
        "description": (
            "Capital subsidy for dairy, poultry, and livestock infrastructure "
            "to boost rural incomes."
        ),
        "eligibility": "Farmers diversifying into livestock and dairy.",
        "benefit": 60000,
    },
    {
        "name": "Mission for Integrated Development of Horticulture",
        "description": (
            "Holistic support for horticulture including planting material, "
            "protected cultivation, and market access."
        ),
        "eligibility": "Horticulture farmers in mission-notified districts.",
        "benefit": 35000,
    },
    {
        "name": "Sub-Mission on Agricultural Mechanization",
        "description": (
            "Financial assistance for purchase of farm machinery and "
            "establishment of custom hiring centres."
        ),
        "eligibility": "Individual farmers, FPOs, and cooperative societies.",
        "benefit": 45000,
    },
    {
        "name": "National Mission for Sustainable Agriculture",
        "description": (
            "Promotes climate-resilient farming practices, efficient water use, "
            "and integrated nutrient management."
        ),
        "eligibility": "Farmers adopting sustainable and climate-smart practices.",
        "benefit": 20000,
    },
]

DEMO_SCHEME_NAMES = [scheme["name"] for scheme in GOVERNMENT_SCHEMES]

COMPLAINT_TEMPLATES = [
    (
        "Delay in PM-KISAN instalment credit",
        "PM-KISAN 17th instalment has not been credited to my bank account "
        "despite Aadhaar-bank seeding being completed two months ago.",
    ),
    (
        "Canal water not released for Rabi season",
        "The local irrigation department has not released canal water for wheat "
        "sowing. Multiple farmers in our village are affected.",
    ),
    (
        "Crop insurance claim rejected",
        "My cotton crop was damaged by unseasonal hailstorm in October. "
        "The insurance claim was rejected citing incomplete documentation.",
    ),
    (
        "MSP procurement centre closed early",
        "The paddy procurement centre at the block level closed before "
        "many small farmers could sell their produce at MSP.",
    ),
    (
        "Faulty soil health card readings",
        "Soil test results recommend excessive urea application which does "
        "not match our traditional farming knowledge for this soil type.",
    ),
    (
        "Drip irrigation subsidy pending",
        "Applied for PMKSY drip irrigation subsidy 8 months ago. "
        "Installation completed but subsidy disbursement is still pending.",
    ),
    (
        "Electricity supply irregular for borewell",
        "Agricultural power supply is limited to 4 hours daily, making "
        "it impossible to irrigate standing sugarcane crop adequately.",
    ),
    (
        "Warehouse receipt not issued for stored wheat",
        "Deposited 120 quintals of wheat at the FCI warehouse but "
        "electronic warehouse receipt has not been generated.",
    ),
    (
        "Marketplace buyer payment delay",
        "Sold 50 quintals of soybean through the platform. Buyer marked "
        "transaction complete but payment is pending for over 15 days.",
    ),
    (
        "Land record survey number mismatch",
        "Revenue department records show a different survey number than "
        "what is registered on my UNNATI land record profile.",
    ),
    (
        "Fertilizer subsidy not applied at cooperative",
        "Purchased DAP and urea from PACS but subsidized rates were not "
        "applied despite valid Kisan Credit Card.",
    ),
    (
        "Organic certification inspection overdue",
        "Applied under Paramparagat Krishi Vikas Yojana. Organic "
        "certification inspection was scheduled but never conducted.",
    ),
    (
        "Pesticide quality complaint",
        "Purchased recommended pesticide from licensed dealer but crop "
        "showed phytotoxicity symptoms after application.",
    ),
    (
        "Loan restructuring request ignored",
        "Submitted KCC loan restructuring request after crop failure. "
        "Bank branch has not responded for 45 days.",
    ),
    (
        "MGNREGA wage payment pending",
        "Farm pond construction under MGNREGA completed but labour "
        "wage payments for last 2 months are pending.",
    ),
    (
        "Seed subsidy not received",
        "Purchased certified wheat seeds under state subsidy scheme. "
        "Dealer collected full price but subsidy refund not processed.",
    ),
    (
        "Cold storage overcharging",
        "Local cold storage charging ₹80/quintal/month against notified "
        "rate of ₹50/quintal for potato storage.",
    ),
    (
        "Agricultural extension officer visit needed",
        "Tur crop showing signs of pod borer infestation. Request "
        "urgent visit from Krishi Vigyan Kendra expert.",
    ),
    (
        "Duplicate Aadhaar linkage at bank",
        "Bank shows Aadhaar linked to another account preventing "
        "PM-KISAN and crop insurance premium debit.",
    ),
    (
        "Road damage blocking market access",
        "Village connecting road damaged during monsoon. Unable to "
        "transport harvested onion to the nearest mandi.",
    ),
]

NOTIFICATION_TEMPLATES = [
    ("Welcome to UNNATI", "Your farmer profile is set up. Complete land and crop records to improve your trust score.", "info", "/profile"),
    ("Land Record Verified", "Your land record for survey number {survey} has been verified by the revenue department.", "success", "/lands"),
    ("New Marketplace Listing", "Your {crop} listing is now live on the marketplace at ₹{price}/quintal.", "success", "/marketplace"),
    ("Transaction Completed", "Buyer {buyer} purchased {qty} quintals of {crop}. Amount: ₹{amount}.", "transaction", "/marketplace"),
    ("Scheme Application Submitted", "Your application for {scheme} has been submitted successfully.", "scheme", "/schemes"),
    ("Scheme Approved", "Congratulations! Your application for {scheme} has been approved.", "scheme", "/schemes"),
    ("Scheme Under Review", "Your application for {scheme} is currently under review by the district office.", "scheme", "/schemes"),
    ("Trust Score Updated", "Your trust score is now {score} ({category}). Keep up the good work!", "trust_score", "/trust-score"),
    ("Loan Eligibility Ready", "Your eligible loan amount is ₹{amount} with {risk} risk category.", "loan", "/loan-eligibility"),
    ("Complaint Registered", "Your grievance '{title}' has been registered. Reference tracking is available.", "complaint", "/complaints"),
    ("Complaint Resolved", "Your complaint '{title}' has been resolved. View resolution notes for details.", "complaint", "/complaints"),
    ("Kharif Sowing Reminder", "Kharif sowing season is approaching. Update your crop records for accurate recommendations.", "info", "/crops"),
    ("Rabi Harvest Alert", "Wheat and mustard harvest season begins soon. List your produce on the marketplace.", "warning", "/marketplace"),
    ("Weather Advisory", "IMD forecasts heavy rainfall in your district. Take precautions for standing crops.", "warning", "/dashboard"),
    ("New Scheme Available", "{scheme} is now open for applications in your state.", "scheme", "/schemes"),
    ("Buyer Inquiry Received", "A buyer has shown interest in your {crop} listing. Check marketplace messages.", "transaction", "/marketplace"),
    ("Profile Verification Pending", "Upload ownership documents to verify your land records and boost trust score.", "warning", "/lands"),
    ("Monthly Trust Report", "Your trust score breakdown is ready. Verification: {ver}/20, Transactions: {txn}/30.", "trust_score", "/trust-score"),
    ("Payment Received", "₹{amount} credited for {crop} sale through UNNATI marketplace.", "transaction", "/marketplace"),
    ("Document Expiry Reminder", "Your soil health card expires next month. Apply for renewal at the block office.", "info", "/profile"),
]
