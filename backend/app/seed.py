from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import Patient


SEED_PATIENT_COUNT = 400_000
SEED_BATCH_SIZE = 5_000

FIRST_NAMES = [
    "Amelia",
    "Marcus",
    "Sofia",
    "Ethan",
    "Olivia",
    "Noah",
    "Mia",
    "Liam",
    "Isabella",
    "James",
    "Ava",
    "Benjamin",
    "Charlotte",
    "Lucas",
    "Harper",
    "Henry",
    "Evelyn",
    "Alexander",
    "Abigail",
    "Daniel",
    "Nora",
    "Mateo",
    "Grace",
    "Elijah",
    "Zoe",
    "Samuel",
    "Chloe",
    "Julian",
    "Layla",
    "Owen",
]

LAST_NAMES = [
    "Nguyen",
    "Johnson",
    "Martinez",
    "Patel",
    "Chen",
    "Williams",
    "Garcia",
    "Brown",
    "Davis",
    "Wilson",
    "Thompson",
    "Lee",
    "Anderson",
    "Taylor",
    "Moore",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Robinson",
    "Clark",
    "Lewis",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "King",
    "Wright",
    "Scott",
    "Torres",
]

CITY_DATA = [
    ("San Francisco", "CA", "94115", "Pine Street"),
    ("Chicago", "IL", "60607", "West Monroe Street"),
    ("Phoenix", "AZ", "85014", "East Camelback Road"),
    ("Boston", "MA", "02108", "Beacon Street"),
    ("Seattle", "WA", "98109", "Queen Anne Avenue N"),
    ("Atlanta", "GA", "30303", "Peachtree Street NE"),
    ("San Antonio", "TX", "78205", "East Commerce Street"),
    ("Denver", "CO", "80202", "Wynkoop Street"),
    ("Miami", "FL", "33137", "Biscayne Boulevard"),
    ("Philadelphia", "PA", "19107", "Walnut Street"),
]

BLOOD_TYPES = ["O+", "A-", "B+", "AB+", "O-", "A+", "B-", "AB-"]
CONDITIONS = [
    "Hypertension",
    "Type 2 diabetes",
    "Asthma",
    "Coronary artery disease",
    "Migraine",
    "Chronic kidney disease",
    "Hypothyroidism",
    "Atrial fibrillation",
    "Anxiety",
    "COPD",
    "Rheumatoid arthritis",
    "Eczema",
    "Osteoporosis",
    "GERD",
    "Iron deficiency anemia",
    "Heart failure",
    "Depression",
    "Seasonal allergies",
    "High cholesterol",
    "Sleep apnea",
]
ALLERGY_OPTIONS = [
    ["No known allergies"],
    ["Penicillin"],
    ["Sulfa drugs"],
    ["Latex"],
    ["Peanuts"],
    ["Iodine contrast"],
    ["Shellfish"],
    ["Aspirin"],
    ["Codeine"],
    ["Tree nuts"],
    ["Morphine"],
]
STATUS_SEQUENCE = [
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "pending",
    "inactive",
    "discharged",
    "pending",
]


def build_patient_data(index: int) -> dict:
    first_name = FIRST_NAMES[index % len(FIRST_NAMES)]
    last_name = LAST_NAMES[(index // len(FIRST_NAMES)) % len(LAST_NAMES)]
    city, state, zip_code, street = CITY_DATA[index % len(CITY_DATA)]
    birth_year = 1945 + (index % 61)
    birth_month = (index % 12) + 1
    birth_day = (index % 27) + 1
    area_code = 200 + (index % 700)
    phone_suffix = 10_000 + (index % 90_000)
    last_visit = date(2026, 6, 1) - timedelta(days=index % 420)

    return {
        "first_name": first_name,
        "last_name": last_name,
        "date_of_birth": date(birth_year, birth_month, birth_day),
        "phone": f"{area_code}-555-{phone_suffix:04d}",
        "email": f"{first_name.lower()}.{last_name.lower()}.{index + 1}@example.com",
        "address": f"{100 + (index % 9900)} {street}, {city}, {state} {zip_code}",
        "blood_type": BLOOD_TYPES[index % len(BLOOD_TYPES)],
        "allergies": ALLERGY_OPTIONS[index % len(ALLERGY_OPTIONS)],
        "conditions": CONDITIONS[index % len(CONDITIONS)],
        "status": STATUS_SEQUENCE[index % len(STATUS_SEQUENCE)],
        "last_visit": last_visit,
    }


def seed_patients(db: Session) -> None:
    existing_patient = db.query(Patient.id).first()
    if existing_patient is not None:
        return

    for start in range(0, SEED_PATIENT_COUNT, SEED_BATCH_SIZE):
        batch_size = min(SEED_BATCH_SIZE, SEED_PATIENT_COUNT - start)
        patient_batch = [build_patient_data(start + offset) for offset in range(batch_size)]
        db.bulk_insert_mappings(Patient, patient_batch)
        db.commit()
