// Seed catalogue. Dates are generated relative to "today" so the sample
// events are always upcoming, no matter when the app is first opened.
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

export const CATEGORIES = [
  "Technology",
  "Music",
  "Business",
  "Sports",
  "Art",
  "Food",
  "Education",
  "Gaming",
  "Wellness",
];

export const CATEGORY_META = {
  Technology: { emoji: "💻", from: "#4f46e5", to: "#06b6d4" },
  Music: { emoji: "🎵", from: "#db2777", to: "#f97316" },
  Business: { emoji: "💼", from: "#0f766e", to: "#22c55e" },
  Sports: { emoji: "🏃", from: "#ea580c", to: "#facc15" },
  Art: { emoji: "🎨", from: "#7c3aed", to: "#ec4899" },
  Food: { emoji: "🍜", from: "#dc2626", to: "#f59e0b" },
  Education: { emoji: "🎓", from: "#2563eb", to: "#8b5cf6" },
  Gaming: { emoji: "🎮", from: "#9333ea", to: "#3b82f6" },
  Wellness: { emoji: "🧘", from: "#059669", to: "#84cc16" },
};

const events = [
  { id: "EVT001", title: "Tech Innovators Summit", category: "Technology", image: img("photo-1540575467063-178a50c2df87"), offset: 21, time: "09:00", venue: "HITEX Exhibition Centre", city: "Hyderabad", price: 799, capacity: 250, organizer: "Tech Events India", duration: "8 Hours", featured: true,
    description: "Explore the future of technology, artificial intelligence, cloud computing and software innovation. Meet industry professionals and learn about emerging technologies." },
  { id: "EVT002", title: "Sunset Music Festival", category: "Music", image: img("photo-1459749411175-04bf5292ceea"), offset: 28, time: "17:00", venue: "Gachibowli Stadium", city: "Hyderabad", price: 499, capacity: 500, organizer: "Melody Entertainment", duration: "5 Hours", featured: true,
    description: "Enjoy an unforgettable evening with live music, talented artists, exciting performances and an amazing festival atmosphere." },
  { id: "EVT003", title: "Startup Founders Meetup", category: "Business", image: img("photo-1517245386807-bb43f82c33c4"), offset: 9, time: "10:00", venue: "T-Hub", city: "Hyderabad", price: 299, capacity: 150, organizer: "Startup Community", duration: "4 Hours", featured: true,
    description: "Connect with startup founders, investors and entrepreneurs. Discover new business opportunities and exchange ideas." },
  { id: "EVT004", title: "City Marathon", category: "Sports", image: img("photo-1452626038306-9aae5e071dd3"), offset: 45, time: "06:00", venue: "Necklace Road", city: "Hyderabad", price: 399, capacity: 1000, organizer: "Run Hyderabad", duration: "3 Hours", featured: true,
    description: "Challenge yourself with a professionally organized running event. Choose your distance and experience the energy of the running community." },
  { id: "EVT005", title: "Creative Photography Workshop", category: "Art", image: img("photo-1452587925148-ce544e77e70d"), offset: 14, time: "11:00", venue: "Jubilee Hills Studio", city: "Hyderabad", price: 599, capacity: 60, organizer: "Creative Lens", duration: "4 Hours", featured: false,
    description: "Learn professional photography techniques, composition, lighting and editing from experienced photographers." },
  { id: "EVT006", title: "Food and Culture Festival", category: "Food", image: img("photo-1555939594-58d7cb561ad1"), offset: 35, time: "12:00", venue: "People's Plaza", city: "Hyderabad", price: 199, capacity: 400, organizer: "Taste of India", duration: "6 Hours", featured: false,
    description: "Experience delicious cuisines, local food traditions, cooking demonstrations and cultural performances." },
  { id: "EVT007", title: "AI and Machine Learning Conference", category: "Technology", image: img("photo-1485827404703-89b55fcc595e"), offset: 52, time: "09:30", venue: "Novotel Hyderabad", city: "Hyderabad", price: 999, capacity: 200, organizer: "AI Professionals Network", duration: "7 Hours", featured: true,
    description: "Understand practical AI applications, machine learning developments, automation and the future of intelligent systems." },
  { id: "EVT008", title: "Digital Marketing Masterclass", category: "Education", image: img("photo-1552664730-d307ca884978"), offset: 18, time: "10:00", venue: "Madhapur Business Centre", city: "Hyderabad", price: 349, capacity: 100, organizer: "Digital Growth Academy", duration: "5 Hours", featured: false,
    description: "Improve your marketing knowledge with practical sessions on SEO, social media marketing, branding and digital advertising." },
  { id: "EVT009", title: "Corporate Networking Night", category: "Business", image: img("photo-1511795409834-ef04bbd61622"), offset: 60, time: "18:00", venue: "The Westin Hyderabad", city: "Hyderabad", price: 699, capacity: 120, organizer: "Business Connect", duration: "3 Hours", featured: false,
    description: "Meet professionals from different industries, build meaningful connections and explore career opportunities." },
  { id: "EVT010", title: "Gaming and Esports Championship", category: "Gaming", image: img("photo-1542751371-adc38448a05e"), offset: 40, time: "11:00", venue: "HITEX Exhibition Centre", city: "Hyderabad", price: 249, capacity: 350, organizer: "Gaming Arena India", duration: "8 Hours", featured: false,
    description: "Watch exciting gaming competitions, meet gaming communities and participate in interactive esports activities." },
  { id: "EVT011", title: "Entrepreneurship Development Workshop", category: "Education", image: img("photo-1556761175-b413da4baf72"), offset: 67, time: "09:30", venue: "IIIT Hyderabad", city: "Hyderabad", price: 449, capacity: 90, organizer: "Future Entrepreneurs", duration: "5 Hours", featured: false,
    description: "Learn how to develop business ideas, validate products, create business plans and build successful startups." },
  { id: "EVT012", title: "International Dance Festival", category: "Music", image: img("photo-1504609813442-a8924e83f76e"), offset: 74, time: "16:00", venue: "Shilpakala Vedika", city: "Hyderabad", price: 549, capacity: 300, organizer: "Dance Culture India", duration: "4 Hours", featured: true,
    description: "Celebrate dance, music and cultural diversity with performances from talented artists and dance groups." },
  { id: "EVT013", title: "Sunrise Yoga in the Park", category: "Wellness", image: img("photo-1544367567-0f2fcb009e0b"), offset: 6, time: "06:30", venue: "KBR National Park", city: "Hyderabad", price: 0, capacity: 80, organizer: "Mindful Living", duration: "2 Hours", featured: false,
    description: "Start your weekend with a guided open-air yoga and breathing session suitable for beginners and regulars alike. Bring your own mat." },
  { id: "EVT014", title: "Indie Art & Craft Fair", category: "Art", image: img("photo-1513364776144-60967b0f800f"), offset: 31, time: "11:00", venue: "Shilparamam", city: "Hyderabad", price: 0, capacity: 600, organizer: "Makers Collective", duration: "7 Hours", featured: false,
    description: "Browse hand-made art, prints, ceramics and jewellery from more than 80 independent makers, with live demos and workshops all day." },
].map(({ offset, ...e }) => ({ ...e, date: day(offset) }));

export default events;
