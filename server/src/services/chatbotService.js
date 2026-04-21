/**
 * Chatbot Service — FAQ-based help assistant for passengers
 */

const FAQ_RESPONSES = {
  // Complaint related
  'file complaint': 'To file a complaint, go to "Submit Complaint" from your dashboard. Fill in the title, description, category, and any relevant details like train number or vendor. You can also upload images as proof.',
  'submit complaint': 'To file a complaint, go to "Submit Complaint" from your dashboard. Fill in the title, description, category, and any relevant details like train number or vendor. You can also upload images as proof.',
  'complaint status': 'You can check your complaint status by going to "My Complaints" section. Each complaint shows its current status: Pending, In Progress, Resolved, or Rejected. Click on any complaint to see full details and status history.',
  'track complaint': 'You can check your complaint status by going to "My Complaints" section. Each complaint shows its current status: Pending, In Progress, Resolved, or Rejected. Click on any complaint to see full details and status history.',

  // PNR related
  'verify pnr': 'Go to "PNR Verify" section from your dashboard. Enter your 10-digit PNR number and click Verify. You will see your train details, journey information, and booking status.',
  'pnr verification': 'Go to "PNR Verify" section from your dashboard. Enter your 10-digit PNR number and click Verify. You will see your train details, journey information, and booking status.',
  'check pnr': 'Go to "PNR Verify" section from your dashboard. Enter your 10-digit PNR number and click Verify. You will see your train details, journey information, and booking status.',

  // Vendor rating
  'rate vendor': 'To rate a vendor, go to "Vendors" section, find the vendor you want to rate, and click on their card. Scroll down to the rating form where you can give star ratings for overall experience, food quality, cleanliness, and service. You can also write a review.',
  'vendor rating': 'To rate a vendor, go to "Vendors" section, find the vendor you want to rate, and click on their card. Scroll down to the rating form where you can give star ratings for overall experience, food quality, cleanliness, and service. You can also write a review.',
  'review vendor': 'To rate a vendor, go to "Vendors" section, find the vendor you want to rate, and click on their card. Scroll down to the rating form where you can give star ratings for overall experience, food quality, cleanliness, and service. You can also write a review.',

  // Status meanings
  'pending': 'Pending status means your complaint has been submitted and is waiting to be reviewed by an officer. You will be notified once it is assigned.',
  'in progress': 'In Progress status means an officer is actively working on your complaint and investigating the issue.',
  'resolved': 'Resolved status means your complaint has been addressed and closed. You can view the resolution details in the complaint page.',
  'rejected': 'Rejected status means your complaint could not be processed. Check the resolution notes for the reason.',

  // Contact support
  'contact support': 'For urgent issues, you can send a message to admin or officers through the Messages section. For general queries, use this chatbot or check your Alerts for important notifications.',
  'help': 'I can help you with: filing complaints, checking complaint status, verifying PNR, rating vendors, understanding status meanings, and contacting support. Just ask me anything!',
  'support': 'For urgent issues, you can send a message to admin or officers through the Messages section. For general queries, use this chatbot or check your Alerts for important notifications.',

  // Account
  'profile': 'You can update your profile by going to "Profile" section. You can edit your name, phone number, and other details there.',
  'update profile': 'You can update your profile by going to "Profile" section. You can edit your name, phone number, and other details there.',
  'change password': 'Password change feature is coming soon. For now, please contact admin if you need to reset your password.',

  // General
  'how to use': 'Welcome! You can submit complaints, rate vendors, verify PNR, send messages, and view alerts. Use the sidebar menu to navigate. If you need help with anything specific, just ask!',
  'features': 'You can: Submit complaints with images, Rate vendors, Verify PNR numbers, Send messages to officers/admin, View alerts and notifications, Track complaint status, and View vendor hygiene scores.',
};

const KEYWORDS = {
  complaint: ['complaint', 'file', 'submit', 'report', 'issue', 'problem'],
  status: ['status', 'track', 'check', 'progress', 'pending', 'resolved', 'rejected'],
  pnr: ['pnr', 'verify', 'ticket', 'booking', 'train'],
  rating: ['rate', 'rating', 'review', 'vendor', 'feedback'],
  support: ['help', 'support', 'contact', 'admin', 'officer'],
  profile: ['profile', 'account', 'update', 'change', 'password'],
  general: ['how', 'what', 'features', 'use', 'guide'],
};

/**
 * Get chatbot response based on user query
 * @param {string} query - User's question
 * @returns {string} - Bot response
 */
const getChatbotResponse = (query) => {
  if (!query || typeof query !== 'string') {
    return 'Hi! I\'m here to help. Ask me about filing complaints, checking status, verifying PNR, rating vendors, or anything else!';
  }

  const lowerQuery = query.toLowerCase().trim();

  // Direct match
  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (lowerQuery.includes(key)) return response;
  }

  // Keyword matching
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      if (category === 'complaint') return FAQ_RESPONSES['file complaint'];
      if (category === 'status') return FAQ_RESPONSES['complaint status'];
      if (category === 'pnr') return FAQ_RESPONSES['verify pnr'];
      if (category === 'rating') return FAQ_RESPONSES['rate vendor'];
      if (category === 'support') return FAQ_RESPONSES['contact support'];
      if (category === 'profile') return FAQ_RESPONSES['profile'];
      if (category === 'general') return FAQ_RESPONSES['how to use'];
    }
  }

  // Default fallback
  return 'I\'m not sure about that. Try asking about: filing complaints, checking complaint status, verifying PNR, rating vendors, or contacting support. Type "help" to see what I can do!';
};

module.exports = { getChatbotResponse };
