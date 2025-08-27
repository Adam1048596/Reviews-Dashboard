#Reviews Dashboard

A review management dashboard built with **React (frontend)** and **Node.js/Express (backend)**.  
It allows managers to fetch, filter, and manage guest reviews from Hostaway (or mock API) and control which reviews are displayed publicly.

---

## ✨ Features
- Fetches reviews from `http://localhost:5000/api/reviews/hostaway`
- Filter reviews by:
  - Property
  - Category (e.g., Cleanliness, Communication, etc.)
  - Channel (e.g., Airbnb, Booking, Hostaway)
  - Rating range (High, Medium, Low)
  - Date range (All, Last Week, Last Month, Last Quarter)
- Bulk actions: Select multiple reviews and toggle public display.
- Toggle sidebar filters on/off for a wider view.
- Public display flag to mark reviews that should be shown on the website.
- Ready for integration with **Flex Living property details layout**.

---

## 📦 Installation

Clone and set up both backend and frontend:

```bash
# Clone repository
git clone https://github.com/your-username/reviews-dashboard.git
cd reviews-dashboard

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

## ▶️ Running the Project

1. Start the backend (server) runs at: http://localhost:5000
cd server
npm run dev
