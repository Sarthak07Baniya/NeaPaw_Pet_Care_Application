import requests
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_api():
    print("Testing API...")
    
    # 1. Register
    email = "testuser@example.com"
    password = "testpassword123"
    register_data = {
        "email": email,
        "password": password,
        "full_name": "Test User",
        "contact_number": "9741729705"
    }
    
    # Try login first to see if user exists
    login_response = requests.post(f"{BASE_URL}/auth/login/", data={"email": email, "password": password})
    
    if login_response.status_code == 200:
        print("User already exists, logging in...")
        token = login_response.json()['tokens']['access']
    else:
        print("Registering new user...")
        response = requests.post(f"{BASE_URL}/auth/register/", json=register_data)
        if response.status_code != 201:
            print(f"Registration failed: {response.text}")
            return
        token = response.json()['tokens']['access']

    headers = {"Authorization": f"Bearer {token}"}
    print("Authentication successful")

    # 2. Get Profile
    response = requests.get(f"{BASE_URL}/auth/profile/", headers=headers)
    if response.status_code == 200:
        print("Profile retrieval successful")
    else:
        print(f"Profile retrieval failed: {response.text}")

    # 3 . Create Pets Note: We use json = because serializers handles the data
    # --- 3. PETS TESTING SECTION 
    print("\n--- Testing Pets Endpoints ---")

    pet_data = {
        "name": "Buddy",
        "pet_type": "Dog",
        "breed": "Golden Retriever",
        "birthday": "2022-01-01",
        "gender": "Male",
        "weight": 25.5,
        "description": "A very friendly dog"
    }
    
    pet_create_res = requests.post(f"{BASE_URL}/pets/", json=pet_data, headers=headers)
    
    if pet_create_res.status_code == 201:
        print(f"Pet Creation Successful: {pet_create_res.json()['name']} added.")
    else:
        print(f"Pet Creation Failed: {pet_create_res.text}")

    # B. List Pets
    pets_list_res = requests.get(f"{BASE_URL}/pets/", headers=headers)
    
    if pets_list_res.status_code == 200:
        data = pets_list_res.json()
        
        # Check if the response is paginated (look for 'results' key)
        if isinstance(data, dict) and 'results' in data:
            pets = data['results']
        else:
            pets = data
            
        print(f"Retrieve Pets List: Success! Found {len(pets)} pets.")
        for pet in pets:
            # We use .get() as a safety measure to prevent further crashes
            name = pet.get('name', 'Unknown')
            p_type = pet.get('pet_type', 'Unknown')
            age = pet.get('age_years', 'N/A')
            print(f"- {name} ({p_type}), Age: {age} years")
    else:
        print(f"Failed to retrieve pets: {pets_list_res.text}")

    # --- 4. PROFILES TESTING SECTION ---
    print("\n--- Testing Profile Endpoints ---")
    
    # Test Address Creation
    address_data = {
        "full_name": "Office Address",
        "phone": "9800000000",
        "address_line1": "Kathmandu Tower",
        "city": "Kathmandu",
        "state": "Bagmati",
        "postal_code": "44600",
        "is_default": True
    }
    addr_res = requests.post(f"{BASE_URL}/profiles/addresses/", json=address_data, headers=headers)
    if addr_res.status_code == 201:
        print(f"Address Created: {addr_res.json()['full_name']} at {addr_res.json()['city']}")
    
    # Test Card Creation
    card_data = {
        "card_type": "Mastercard",
        "last_four_digits": "5555",
        "expiry_month": 10,
        "expiry_year": 2027,
        "cardholder_name": "Test User",
        "is_default": True
    }
    card_res = requests.post(f"{BASE_URL}/profiles/cards/", json=card_data, headers=headers)
    if card_res.status_code == 201:
        print(f"Card Created: {card_res.json()['card_type']} ending in {card_res.json()['last_four_digits']}")
    

   

    # --- 5. TREATMENT BOOKINGS TESTING ---
    print("\n--- Testing Treatment Bookings ---")
    
    # Extract the actual list of pets from the response
    data = pets_list_res.json()
    if isinstance(data, dict) and 'results' in data:
        actual_pets = data['results']
    else:
        actual_pets = data

    if not actual_pets:
        print("Skipping booking test: No pets found.")
    else:
        # Use the first pet from the list
        first_pet_id = actual_pets[0]['id']
        
        booking_data = {
            "pet": first_pet_id,
            "treatment_type": 1, # Make sure this ID exists in your DB!
            "service_type": "store_visit",
            "appointment_date": "2025-12-25",
            "appointment_time": "10:00:00"
        }
        
        book_res = requests.post(f"{BASE_URL}/treatment/bookings/", json=booking_data, headers=headers)
        if book_res.status_code == 201:
            print(f"Booking Success! Price: {book_res.json().get('price')}")
        else:
            print(f"Booking Failed: {book_res.text}")





if __name__ == "__main__":
        test_api()

          