# NeawPaw - Pet Care Application

> A comprehensive React Native pet care application for shopping, treatment booking, hostel accommodation, and pet adoption.

[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2049-black.svg)](https://expo.dev/)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-purple.svg)](https://redux-toolkit.js.org/)

## 🎯 Features

### ✅ Core Modules (8/8 Complete)

- **🔐 Authentication** - Secure login/registration with AsyncStorage
- **🏠 Home** - Service cards, offers, and best-selling items
- **🛒 Shopping** - Complete e-commerce with cart, checkout, and coupons
- **💆 Treatment** - Book grooming, veterinary, and training services
- **🏨 Pet Hostel** - Reserve accommodation with health tracking
- **🐕 Adoption** - Search and adopt pets with application form
- **👤 Profile** - User settings, dark mode, and logout
- **📦 Track Order** - Order tracking with real-time chat support

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/Sarthak07Baniya/NeaPaw_Pet_Care_Application.git
cd neawpaw-main

# Install dependencies
pnpm install

# Start the development server
pnpm run start
```

### Running the App

```bash
# iOS
pnpm run ios

# Android
pnpm run android

# Web
pnpm run web
```

## 📱 Screenshots

*Coming soon - Add screenshots of key screens*

## 🏗️ Architecture

### Tech Stack

- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Storage**: AsyncStorage
- **Icons**: React Native Vector Icons (Feather)
- **Calendar**: React Native Calendars

### Project Structure

```
neawpaw/
├── components/          # Reusable UI components
│   ├── ui/             # UI components (SearchBar, FilterChip, etc.)
│   └── Home/           # Home-specific components
├── navigations/        # Navigation configuration
│   ├── AuthNavigation.jsx
│   ├── ShoppingNavigation.jsx
│   ├── TreatmentNavigation.jsx
│   ├── PetHostelNavigation.jsx
│   ├── AdoptionNavigation.jsx
│   ├── OrdersNavigation.jsx
│   └── BottomTabBarNavigations.jsx
├── redux/              # Redux store and slices
│   ├── store.jsx
│   └── slice/
│       ├── cartSlice.js
│       ├── shoppingSlice.js
│       ├── treatmentSlice.js
│       ├── hostelSlice.js
│       └── ordersSlice.js
├── screens/            # Screen components
│   ├── Auth/
│   ├── Home/
│   ├── Shopping/
│   ├── Treatment/
│   ├── PetHostel/
│   ├── Adoption/
│   ├── Orders/
│   └── Profile/
├── services/           # API services
│   └── authService.js
├── utils/              # Utilities and mock data
│   ├── mockData.js
│   ├── treatmentMockData.js
│   ├── hostelMockData.js
│   ├── adoptionMockData.js
│   └── ordersMockData.js
└── App.js              # Root component
```

## 🎨 Design System

### Colors

- **Primary**: `#FF6B9D` (Pink)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FFA500` (Orange)
- **Text**: `#2C2C2C` (Dark Gray)
- **Background**: `#F8F8F8` (Light Gray)

### Typography

- **Headers**: 18-28px, Bold (700)
- **Body**: 14-16px, Regular (400)
- **Labels**: 12-14px, Medium (600)

## 📦 Key Features

### Shopping Module
- Search, filter, and sort products
- Add to cart with quantity selection
- Apply coupons (50% off available)
- Multiple payment methods
- Order confirmation

### Treatment Module
- Select pet from dropdown
- Choose service type (Grooming, Vet, Training)
- Book appointments with calendar
- Select time slots
- Service type (Pickup/Store Visit)

### Pet Hostel Module
- Choose room type (Standard/Deluxe/VIP)
- Select check-in/out dates
- Add health information
- Optional additional treatments
- Terms & conditions

### Adoption Module
- Search pets by name or breed
- Filter by type (Dog, Cat, Rabbit)
- View pet details and ratings
- Submit adoption application

### Track Order Module
- View all orders in one place
- Filter by type (Shopping, Treatment, Hostel)
- Visual status timeline
- Chat with support

## 🔧 Configuration

### Environment Variables

Currently using mock data. To integrate with backend:

1. Create `.env` file
2. Add API endpoints:
```env
API_BASE_URL=https://your-api.com
API_KEY=your-api-key
```

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Run linter
pnpm lint
```



## 🚀 Deployment

### Build for Production

```bash
# iOS
expo build:ios

# Android
expo build:android
```

### App Store Submission

1. Update `app.json` with correct bundle identifiers
2. Add app icons and splash screens
3. Build production version
4. Submit to App Store/Play Store

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Developer** - Initial work

## 🙏 Acknowledgments

- React Native community
- Expo team
- Redux Toolkit maintainers
- All open-source contributors

## 📞 Support

For support, email support@neawpaw.com or open an issue in the repository.

---

**Made with ❤️ for pet lovers**
