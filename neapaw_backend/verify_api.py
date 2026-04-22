"""
Legacy integration-test helper.

This project now uses Django/DRF test files inside each app:

- authentication/tests.py
- pets/tests.py
- treatment/tests.py
- adoption/tests.py
- hostel/tests.py
- shopping/tests.py
- orders/tests.py

Run them with:
    python manage.py test

This module is intentionally kept as a short pointer so it no longer looks
like the project's unit-test entrypoint.
"""
import requests
import sys

BASE_URL = "http://localhost:8000/api/v1"


def test_adoption_api(headers=None):
    print("\n--- Testing Adoption Endpoints ---")


    pets_url = f"{BASE_URL}/adoption/pets/"
    apps_url = f"{BASE_URL}/adoption/applications/"

    # 1) List available adoption pets (Public)
    pets_res = requests.get(pets_url)
    if pets_res.status_code != 200:
        print(f"Adoption Pets List Failed ({pets_res.status_code}): {pets_res.text}")
        return

    pets_data = pets_res.json()
    pets = pets_data.get("results", pets_data) if isinstance(pets_data, dict) else pets_data
    print(f"Adoption Pets List: Success! Found {len(pets)} pets.")

    # Show a sample pet
    if pets:
        first = pets[0]
        print(f"Sample pet -> id={first.get('id')} name={first.get('name')} type={first.get('pet_type')}")

    # 2) Filter pets by pet_type (Public)
    filter_type = "Dog"
    filter_res = requests.get(pets_url, params={"pet_type": filter_type})
    if filter_res.status_code == 200:
        f_data = filter_res.json()
        filtered = f_data.get("results", f_data) if isinstance(f_data, dict) else f_data
        print(f"Filter pets by pet_type='{filter_type}': Found {len(filtered)} pets.")
    else:
        print(f"Filter Failed ({filter_res.status_code}): {filter_res.text}")

    # Stop here if no auth provided
    if not headers:
        print("Skipping adoption application tests: No auth headers provided.")
        return

    # 3) Create an adoption application (Authenticated)
    if not pets:
        print("Skipping application creation: No adoption pets available (create via Admin first).")
        return

    first_pet_id = pets[0].get("id")
    if not first_pet_id:
        print("Skipping application creation: Pet id missing in response.")
        return

    application_payload = {
        "pet": first_pet_id,
        "address_line1": "Kathmandu Tower",
        "city": "Kathmandu",
        "state": "Bagmati",
        "postal_code": "44600",
        "previously_owned_pets": True,
        "previous_pet_details": "Owned a dog before for 3 years.",
        "reason_for_adoption": "Looking to adopt a friendly companion."
    }

    create_app_res = requests.post(apps_url, json=application_payload, headers=headers)
    if create_app_res.status_code in (200, 201):
        created = create_app_res.json()
        print(f"Adoption Application Created: id={created.get('id')} status={created.get('status')}")
    else:
        print(f"Application Creation Failed ({create_app_res.status_code}): {create_app_res.text}")

    # 4) List my adoption applications (Authenticated)
    my_apps_res = requests.get(apps_url, headers=headers)
    if my_apps_res.status_code == 200:
        apps_data = my_apps_res.json()
        apps = apps_data.get("results", apps_data) if isinstance(apps_data, dict) else apps_data
        print(f"My Applications: Success! Found {len(apps)} applications.")
        for a in apps[:5]:
            print(f"- id={a.get('id')} pet={a.get('pet')} status={a.get('status')}")
    else:
        print(f"My Applications Failed ({my_apps_res.status_code}): {my_apps_res.text}")


def test_shopping_api(headers):
    print("\n--- Testing Shopping Endpoints ---")

    products_url = f"{BASE_URL}/shopping/products/"
    offers_url = f"{BASE_URL}/shopping/offers/"
    cart_url = f"{BASE_URL}/shopping/cart/"
    cart_add_url = f"{BASE_URL}/shopping/cart/items/"
    cart_update_url = f"{BASE_URL}/shopping/cart/update/"
    cart_remove_url = f"{BASE_URL}/shopping/cart/remove/"
    coupon_apply_url = f"{BASE_URL}/shopping/cart/apply-coupon/"

    # 1) List products (Public)
    prod_res = requests.get(products_url)
    if prod_res.status_code != 200:
        print(f"Products List Failed ({prod_res.status_code}): {prod_res.text}")
        return

    prod_data = prod_res.json()
    products = prod_data.get("results", prod_data) if isinstance(prod_data, dict) else prod_data
    print(f"Products List: Success! Found {len(products)} products.")

    if products:
        p0 = products[0]
        print(f"Sample product -> id={p0.get('id')} name={p0.get('name')} price={p0.get('price')}")

    # 2) List offers (Public)
    offers_res = requests.get(offers_url)
    if offers_res.status_code == 200:
        offers_data = offers_res.json()
        offers = offers_data.get("results", offers_data) if isinstance(offers_data, dict) else offers_data
        print(f"Offers List: Success! Found {len(offers)} offers.")
        if offers:
            o0 = offers[0]
            print(f"Sample offer -> id={o0.get('id')} title={o0.get('title')} valid_until={o0.get('valid_until')}")
    else:
        print(f"Offers List Failed ({offers_res.status_code}): {offers_res.text}")

    # 3) Get my cart (Auth)
    cart_res = requests.get(cart_url, headers=headers)
    if cart_res.status_code != 200:
        print(f"Cart Fetch Failed ({cart_res.status_code}): {cart_res.text}")
        return

    cart = cart_res.json()
    items = cart.get("items", [])
    print(f"My Cart: Success! Found {len(items)} items. Total={cart.get('total')}")

    # 4) Add first product to cart (Auth) ✅ IMPORTANT: product_id
    if not products:
        print("Skipping cart add: No products found.")
        return

    first_product_id = products[0].get("id")
    if not first_product_id:
        print("Skipping cart add: Product id missing.")
        return

    add_payload = {"product_id": first_product_id, "quantity": 1}
    add_res = requests.post(cart_add_url, json=add_payload, headers=headers)
    if add_res.status_code == 200:
        cart_after_add = add_res.json()
        print(f"Add To Cart: Success! Total={cart_after_add.get('total')}, items={len(cart_after_add.get('items', []))}")
    else:
        print(f"Add To Cart Failed ({add_res.status_code}): {add_res.text}")
        return

    # 5) Update first cart item quantity (Auth)
    cart_items = cart_after_add.get("items", [])
    if not cart_items:
        print("Skipping update/remove: Cart is empty after add (unexpected).")
        return

    first_item_id = cart_items[0].get("id")
    if first_item_id:
        update_payload = {"item_id": first_item_id, "quantity": 2}
        upd_res = requests.post(cart_update_url, json=update_payload, headers=headers)
        if upd_res.status_code == 200:
            updated_cart = upd_res.json()
            print(f"Update Cart Item: Success! items={len(updated_cart.get('items', []))} Total={updated_cart.get('total')}")
        else:
            print(f"Update Cart Failed ({upd_res.status_code}): {upd_res.text}")
    else:
        print("Skipping cart update: item_id missing in cart response.")

    # 6) Apply coupon (Auth) (only if you know a valid code)
    # If you have a coupon code, put it here. Otherwise it will safely skip.
    coupon_code = "NEWYEAR50"  # change to a real one from your DB/admin
    if coupon_code:
        coupon_res = requests.post(coupon_apply_url, json={"code": coupon_code}, headers=headers)
        if coupon_res.status_code == 200:
            c = coupon_res.json()
            print(f"Apply Coupon: Success! code={c.get('code')} type={c.get('discount_type')} discount={c.get('discount')}")
        else:
            print(f"Apply Coupon Failed ({coupon_res.status_code}): {coupon_res.text}")

    # 7) Remove first item (Auth)
    if first_item_id:
        rem_res = requests.post(cart_remove_url, json={"item_id": first_item_id}, headers=headers)
        if rem_res.status_code == 200:
            removed_cart = rem_res.json()
            print(f"Remove Cart Item: Success! items={len(removed_cart.get('items', []))} Total={removed_cart.get('total')}")
        else:
            print(f"Remove Cart Item Failed ({rem_res.status_code}): {rem_res.text}")


def test_orders_api(headers):
    print("\n--- Testing Orders Endpoints ---")

    orders_url = f"{BASE_URL}/orders/list/"
    notifications_url = f"{BASE_URL}/orders/notifications/"

    # 1) List my orders
    list_res = requests.get(orders_url, headers=headers)
    if list_res.status_code != 200:
        print(f"Orders List Failed ({list_res.status_code}): {list_res.text}")
        return

    list_data = list_res.json()
    orders = list_data.get("results", list_data) if isinstance(list_data, dict) else list_data
    print(f"My Orders: Success! Found {len(orders)} orders.")

    # 2) Create a test order (Shopping order)
    # NOTE: Your OrderSerializer auto creates order_number + total in create()
    create_payload = {
        "order_type": "shopping",
        "subtotal": "100.00",
        "discount": "0.00",
        "tax": "0.00",
        "shipping_fee": "0.00",
        "payment_method": "cash_on_delivery",
        "shipping_address": {
            "full_name": "Test User",
            "phone": "9800000000",
            "address_line1": "Kathmandu Tower",
            "city": "Kathmandu",
            "state": "Bagmati",
            "postal_code": "44600",
            "is_default": True
        }
    }

    create_res = requests.post(orders_url, json=create_payload, headers=headers)
    if create_res.status_code in (200, 201):
        created = create_res.json()
        print(f"Order Created: id={created.get('id')} order_number={created.get('order_number')} status={created.get('status')}")
        created_order_id = created.get("id")
    else:
        print(f"Order Create Failed ({create_res.status_code}): {create_res.text}")
        created_order_id = None

    # 3) Track the created order
    if created_order_id:
        track_url = f"{BASE_URL}/orders/list/{created_order_id}/track/"
        track_res = requests.get(track_url, headers=headers)
        if track_res.status_code == 200:
            t = track_res.json()
            print(f"Track Order: Success! order_number={t.get('order_number')} status={t.get('current_status')}")
        else:
            print(f"Track Failed ({track_res.status_code}): {track_res.text}")

        # 4) Chat: post a message
        chat_url = f"{BASE_URL}/orders/list/{created_order_id}/chat/"
        chat_post = requests.post(chat_url, json={"message": "Hello, I have a question about my order."}, headers=headers)
        if chat_post.status_code in (200, 201):
            msg = chat_post.json()
            print(f"Chat Message Sent: id={msg.get('id')} is_admin_reply={msg.get('is_admin_reply')}")
        else:
            print(f"Chat Send Failed ({chat_post.status_code}): {chat_post.text}")

        # 5) Chat: list messages
        chat_list = requests.get(chat_url, headers=headers)
        if chat_list.status_code == 200:
            msgs = chat_list.json()
            print(f"Chat Messages: Success! Found {len(msgs)} messages.")
        else:
            print(f"Chat List Failed ({chat_list.status_code}): {chat_list.text}")

    # 6) List notifications
    notif_res = requests.get(notifications_url, headers=headers)
    if notif_res.status_code == 200:
        notif_data = notif_res.json()
        notifs = notif_data.get("results", notif_data) if isinstance(notif_data, dict) else notif_data
        print(f"Notifications: Success! Found {len(notifs)} notifications.")
    else:
        print(f"Notifications Failed ({notif_res.status_code}): {notif_res.text}")



def test_hostel_api(headers):
    print("\n--- Testing Hostel Endpoints ---")

    rooms_url = f"{BASE_URL}/hostel/rooms/"
    bookings_url = f"{BASE_URL}/hostel/bookings/"

    # 1. List available hostel rooms (Public)
    rooms_res = requests.get(rooms_url)
    if rooms_res.status_code != 200:
        print(f"Hostel Rooms List Failed ({rooms_res.status_code}): {rooms_res.text}")
        return

    rooms_data = rooms_res.json()
    rooms = rooms_data.get("results", rooms_data) if isinstance(rooms_data, dict) else rooms_data
    print(f"Hostel Rooms List: Success! Found {len(rooms)} rooms.")

    if not rooms:
        print("No rooms available. Create hostel rooms from Admin.")
        return

    room_id = rooms[0]["id"]

    # 2. Get user's pets (required for booking)
    pets_res = requests.get(f"{BASE_URL}/pets/", headers=headers)
    if pets_res.status_code != 200:
        print("Cannot fetch pets for hostel booking")
        return

    pets_data = pets_res.json()
    pets = pets_data.get("results", pets_data) if isinstance(pets_data, dict) else pets_data

    if not pets:
        print("No pets found. Create a pet first.")
        return

    pet_id = pets[0]["id"]

    # 3. Create hostel booking
    booking_payload = {
        "pet": pet_id,
        "room": room_id,
        "check_in_date": "2026-01-10",
        "check_out_date": "2026-01-12",
        "service_type": "store_visit",
        "diet_type": "carnivore",
        "pet_nature": "Friendly",
        "vaccination_status": "up_to_date",
        "communicable_disease": False,
        "allergies": "",
        "health_conditions": "",
        "additional_treatments": []
    }

    booking_res = requests.post(bookings_url, json=booking_payload, headers=headers)

    if booking_res.status_code in (200, 201):
        booking = booking_res.json()
        print(
            f"Hostel Booking Created: id={booking.get('id')} "
            f"status={booking.get('status')} "
            f"price={booking.get('total_price')}"
        )
    else:
        print(f"Hostel Booking Failed ({booking_res.status_code}): {booking_res.text}")

    # 4. List my hostel bookings
    list_res = requests.get(bookings_url, headers=headers)
    if list_res.status_code == 200:
        bookings = list_res.json().get("results", list_res.json())
        print(f"My Hostel Bookings: Found {len(bookings)} bookings.")
    else:
        print(f"Failed to list hostel bookings: {list_res.text}")



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


        

          # --- 6. ADOPTION TESTING ENDPOINTS ---
    test_adoption_api(headers=headers)
      # --- 7. HOSTEL BOOKING TESTING ENDPOINTS ---
    test_hostel_api(headers=headers)
        # --- 8. SHOPPING TESTING ENDPOINTS ---
    test_shopping_api(headers=headers)
        # --- 9. ORDERS TESTING ENDPOINTS ---
    test_orders_api(headers=headers)





if __name__ == "__main__":
        test_api()

          