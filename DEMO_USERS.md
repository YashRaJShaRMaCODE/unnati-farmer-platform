# UNNATI Demo User Credentials

Use these accounts for college demonstrations and dashboard walkthroughs.

**Default password for all demo accounts:** `Demo@1234`

---

## Farmer Login

| Field | Value |
|-------|-------|
| **Email** | `farmer1@unnati.demo` |
| **Password** | `Demo@1234` |
| **Name** | Rajesh Kumar |
| **Village** | Rampur Khurd, Uttar Pradesh |

Additional farmers: `farmer2@unnati.demo` through `farmer50@unnati.demo` (same password).

Each farmer has land records, crop records, and a trust score.

---

## Buyer Login

| Field | Value |
|-------|-------|
| **Email** | `buyer1@unnati.demo` |
| **Password** | `Demo@1234` |
| **Company** | Maharashtra Agro Traders Pvt Ltd |

Additional buyers: `buyer2@unnati.demo` through `buyer20@unnati.demo` (same password).

---

## Government Login

| Field | Value |
|-------|-------|
| **Email** | `gov@unnati.demo` |
| **Password** | `Demo@1234` |
| **Name** | Anjali Verma |
| **Role** | Government Official |

Use for scheme management, complaint review, and village analytics.

---

## Bank Login

| Field | Value |
|-------|-------|
| **Email** | `bank@unnati.demo` |
| **Password** | `Demo@1234` |
| **Name** | Rohit Malhotra |
| **Role** | Bank Officer |

Use for loan eligibility review and farmer trust score access.

---

## Admin Login

| Field | Value |
|-------|-------|
| **Email** | `admin@unnati.demo` |
| **Password** | `Demo@1234` |
| **Name** | Admin UNNATI |
| **Role** | Platform Admin |

Full access to all modules and Django admin panel.

---

## Demo Data Summary

| Entity | Count |
|--------|-------|
| Farmers | 50 |
| Buyers | 20 |
| Land Records | 100 |
| Crop Records | 100 |
| Marketplace Listings | 50 |
| Transactions | 40 |
| Government Schemes | 15 |
| Scheme Applications | 40 |
| Complaints | 20 |
| Trust Scores | 50 |
| Loan Predictions | 30 |
| Notifications | 100 |

---

## Commands

```bash
# Seed demo data
python manage.py seed_demo_data

# Remove all demo data safely
python manage.py clear_demo_data
```
