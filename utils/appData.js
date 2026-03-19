export const servicesSections = [
  {
    id: 1,
    title: 'Shopping',
    description: 'Pet food and supplies',
    icon: 'shopping-bag',
    iconType: 'Feather',
    colors: ['#FFE0EC', '#FFF0F5'],
    route: 'Shopping',
  },
  {
    id: 2,
    title: 'Treatment',
    description: 'Medical care',
    icon: 'activity',
    iconType: 'Feather',
    colors: ['#E0F2FE', '#F0F9FF'],
    route: 'Treatment',
  },
  {
    id: 3,
    title: 'Pet Hostel',
    description: 'Safe boarding',
    icon: 'home',
    iconType: 'Feather',
    colors: ['#F0FDFA', '#F0FDF4'],
    route: 'Pet Hostel',
  },
  {
    id: 4,
    title: 'Adoption',
    description: 'Find a friend',
    icon: 'heart',
    iconType: 'Feather',
    colors: ['#FFF7ED', '#FFFBEB'],
    route: 'Adoption',
  },
];

export const hostelServiceTypes = [
  {
    id: 'pickup',
    name: 'Pick Up & Drop',
    description: 'We pick up and drop your pet',
    icon: 'truck',
    additionalFee: 500,
  },
  {
    id: 'self',
    name: 'Self Drop',
    description: 'You drop and pick up your pet',
    icon: 'user',
    additionalFee: 0,
  },
];

export const treatmentServiceTypes = [
  {
    id: 'pickup',
    name: 'Pick Up',
    description: 'We will pick up your pet from your location',
    icon: 'truck',
    additionalFee: 200,
  },
  {
    id: 'store',
    name: 'Store Visit',
    description: 'Bring your pet to our location',
    icon: 'home',
    additionalFee: 0,
  },
];

export const availableTimeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
];

export const dietOptions = ['Carnivore', 'Half Carnivore', 'Vegetarian'];
export const petNatureOptions = ['Aggressive', 'Friendly', 'Quiet', 'Playful'];

export const additionalHostelTreatments = [
  { id: 1, name: 'Premium Bath', price: 500 },
  { id: 2, name: 'Tick Treatment', price: 800 },
  { id: 3, name: 'Nail Clipping', price: 200 },
];

export const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', icon: 'dollar-sign' },
  { id: 'khalti', name: 'Khalti', icon: 'credit-card' },
  { id: 'esewa', name: 'eSewa', icon: 'credit-card' },
];

export const availableCoupons = [
  { id: 1, code: 'PAWPAW10', discount: 10, description: '10% off on all products' },
  { id: 2, code: 'WELCOME20', discount: 20, description: 'Flat 20% off for new users' },
];

export const orderStatuses = {
  shopping: ['Pending', 'Processing', 'Shipped', 'Delivered'],
  treatment: ['Confirmed', 'Scheduled', 'In Progress', 'Completed'],
  hostel: ['Confirmed', 'Check-in', 'In Stay', 'Check-out'],
};
