# 🧪 SyncItUp - Testing Guide

## ✅ Manual Testing Checklist

Follow this guide to verify all functions are working correctly.

### Prerequisites
- ✅ MongoDB is running (check MongoDB Compass or run `mongod`)
- ✅ Server is running at http://localhost:5000
- ✅ Database is seeded with demo users (`npm run seed`)

---

## 1️⃣ Landing Page Test

**URL:** http://localhost:5000

**Expected Results:**
- ✅ SyncItUp logo with lightning bolt emoji
- ✅ Hero section with gradient text "Find Your Perfect Hackathon Teammate"
- ✅ "Join Now - It's Free" and "Sign In" buttons
- ✅ Features section showing 3 cards (Smart Matching, Realtime Chat, Find Your Team)
- ✅ How It Works section with 4 steps
- ✅ Theme toggle button (top right) switches between dark/light modes
- ✅ Footer with copyright

**Test Actions:**
1. Click theme toggle → Should switch to dark mode immediately
2. Click theme toggle again → Should switch back to light mode
3. Refresh page → Theme should persist

---

## 2️⃣ Signup Test

**URL:** http://localhost:5000/signup.html

**Test Case 1: New User Signup**
1. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - College: `Test College`
   - Branch: `Computer Science`
   - Year: Select `2nd Year`
   - Bio: `Testing the app`

2. Click "Create Account"

**Expected Results:**
- ✅ Form submits without errors
- ✅ Automatically redirects to dashboard
- ✅ Welcome message shows "Welcome back, Test!"

**Test Case 2: Duplicate Email**
1. Try signing up again with `test@example.com`

**Expected Result:**
- ✅ Shows error: "User already exists"

---

## 3️⃣ Login Test

**URL:** http://localhost:5000/login.html

**Test Case 1: Valid Login**
1. Enter credentials:
   - Email: `priya@example.com`
   - Password: `password123`

2. Click "Login"

**Expected Results:**
- ✅ Successfully logs in
- ✅ Redirects to dashboard
- ✅ Welcome message shows "Welcome back, Priya!"

**Test Case 2: Invalid Credentials**
1. Enter:
   - Email: `wrong@example.com`
   - Password: `wrongpass`

**Expected Result:**
- ✅ Shows error: "Invalid credentials"

---

## 4️⃣ Dashboard Test

**URL:** http://localhost:5000/dashboard.html

**Expected Results:**
- ✅ Personalized welcome message with user's name
- ✅ Three quick action cards (Explore, Profile, Teams)
- ✅ "Top Matches For You" section showing 3 recommended users
- ✅ Each match shows:
  - Name and college
  - Compatibility percentage badge
  - Skills with colored tags
  - Experience level and available hours
  - Progress bar showing match score
  - "Send Request" button
- ✅ "Collaboration Requests" section showing pending requests

**Test Actions:**
1. Click on a match's "Send Request" button
   - Should show alert: "Collaboration request sent!"

2. Check received requests section
   - If logged in as Priya, should see requests from other users who sent her requests

3. Click "Accept" on a request
   - Should accept the request
   - Should show alert: "Request accepted! Team created."
   - Request should disappear from list

---

## 5️⃣ Profile Management Test

**URL:** http://localhost:5000/profile.html

**Expected Results:**
- ✅ Profile sidebar shows:
  - User avatar (emoji)
  - Name
  - College, Branch, Year, Email
  
- ✅ Edit form shows all fields populated with current values

**Test Actions:**

**Test 1: Update Bio**
1. Change bio to: "Updated bio for testing"
2. Click "Save Changes"
3. **Expected:** Success message appears, profile reloads

**Test 2: Add Skills**
1. Type "React" in skill input
2. Click "Add" button
3. **Expected:** Blue "React" tag appears (frontend category)

4. Type "Python" in skill input
5. Click "Add" button
6. **Expected:** Purple "Python" tag appears (ML category)

7. Type "Node.js" in skill input
8. Click "Add" button
9. **Expected:** Green "Node.js" tag appears (backend category)

**Test 3: Remove Skills**
1. Click the "×" button on any skill tag
2. **Expected:** Tag disappears immediately

**Test 4: Add Interests**
1. Type "Web Development" in interest input
2. Click "Add" button
3. **Expected:** Gray tag appears

**Test 5: Update Settings**
1. Change Experience Level to "Advanced"
2. Change Preferred Role to "Looking for members"
3. Change Available Hours to 20
4. Click "Save Changes"
5. **Expected:** Success message, all changes saved

---

## 6️⃣ Explore Page Test

**URL:** http://localhost:5000/explore.html

**Expected Results:**
- ✅ Shows grid of user cards
- ✅ Each card displays:
  - Name and compatibility percentage badge
  - College and year
  - Bio
  - Skills (colored tags)
  - Experience level
  - Available hours per week
  - Progress bar
  - "Send Request" button

**Test Actions:**

**Test 1: Search by Name**
1. Type "Rahul" in search box
2. **Expected:** Only Rahul Verma's card appears
3. Clear search
4. **Expected:** All users reappear

**Test 2: Filter by Skill**
1. Select "ML" from skill filter
2. **Expected:** Only users with ML/AI skills appear (Rahul, Siddharth, etc.)

**Test 3: Filter by Experience**
1. Select "Advanced" from experience filter
2. **Expected:** Only Advanced users appear (Rahul, Ananya, etc.)

**Test 4: Combined Filters**
1. Type "a" in search
2. Select "Frontend" from skill filter
3. **Expected:** Only frontend users with "a" in their name appear

**Test 5: Send Request**
1. Click "Send Request" on any user
2. **Expected:** Alert shows "Request sent successfully!"

---

## 7️⃣ Smart Matching Algorithm Test

**Login as different users to verify matching works correctly:**

**Test 1: Frontend User (Priya - React/Node.js)**
1. Login as `priya@example.com`
2. Go to Dashboard or Explore
3. **Expected Top Matches:** Backend users (Ananya, Aditya), ML users (Rahul), Mobile users (Sneha)
4. **NOT Expected:** Other frontend users like Vikram should have lower scores

**Test 2: ML User (Rahul - Python/ML)**
1. Login as `rahul@example.com`
2. Check recommendations
3. **Expected Top Matches:** Frontend users (Priya, Pooja), Backend users, Data Science users
4. **NOT Expected:** Other ML users should have lower scores

**Verification:**
- ✅ Compatibility scores between 50-90% for complementary skills
- ✅ Frontend matches with Backend/ML (NOT with Frontend)
- ✅ Progress bars show correct percentages

---

## 8️⃣ Team System Test

**Requires 2 browser windows (use incognito for second):**

**Window 1: User A (Priya)**
1. Login as `priya@example.com`
2. Go to Explore
3. Find Rahul Verma
4. Click "Send Request"
5. **Expected:** Success message

**Window 2: User B (Rahul)**
1. Login as `rahul@example.com` in incognito window
2. Go to Dashboard
3. **Expected:** See request from Priya in "Collaboration Requests" section
4. Click "Accept"
5. **Expected:** 
   - Alert: "Request accepted! Team created"
   - Request disappears
6. Go to Teams page
7. **Expected:** See "Priya" team in team list

**Back to Window 1:**
1. Go to Teams page
2. **Expected:** See "Rahul" team in team list

---

## 9️⃣ Realtime Chat Test

**Requires 2 browser windows with accepted team:**

**Window 1: User A**
1. Go to http://localhost:5000/teams.html
2. Click on a team from the list
3. **Expected:**
   - Chat interface loads
   - Team name appears at top
   - Message input box at bottom

4. Type "Hello from User A" and press Enter
5. **Expected:** Message appears on right side (own messages)

**Window 2: User B**
1. Go to http://localhost:5000/teams.html
2. Click on the same team
3. **Expected:**
   - See "Hello from User A" message on left side (other's messages)

4. Type "Hello from User B" and press Enter
5. **Expected:** Message appears on right side

**Back to Window 1:**
- **Expected:** "Hello from User B" message appears instantly on left side

**Test Typing Indicator:**

**Window 1:**
1. Start typing in message box (don't send)
2. **Expected in Window 2:** "User A is typing..." appears below chat

3. Stop typing for 1 second
4. **Expected in Window 2:** Typing indicator disappears

---

## 🔟 Theme Persistence Test

1. Set theme to Dark mode
2. Navigate to different pages (Dashboard → Profile → Explore)
3. **Expected:** Dark theme persists across all pages

4. Refresh the page
5. **Expected:** Still in dark mode

6. Switch to light mode
7. **Expected:** Light theme persists

---

## ✅ Complete Feature Checklist

### Authentication
- [ ] Signup creates new user
- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Token persists after page refresh
- [ ] Logout clears token and redirects

### Profile
- [ ] View own profile
- [ ] Update bio
- [ ] Add skills (tags appear)
- [ ] Remove skills (tags disappear)
- [ ] Add interests
- [ ] Remove interests
- [ ] Update experience level
- [ ] Update preferred role
- [ ] Update available hours
- [ ] Changes persist after save

### Smart Matching
- [ ] Shows top 10 recommendations
- [ ] Compatibility scores display correctly
- [ ] Frontend users match with Backend/ML (NOT Frontend)
- [ ] Progress bars show accurate percentages
- [ ] Skill tags are colored correctly

### Explore & Filter
- [ ] Shows all users
- [ ] Search by name works
- [ ] Filter by skill category works
- [ ] Filter by experience level works
- [ ] Combined filters work
- [ ] Send request button works

### Team System
- [ ] Send collaboration request
- [ ] Receive collaboration request
- [ ] Accept request creates team
- [ ] Reject request removes it
- [ ] Teams list shows all teams
- [ ] Team details show members

### Realtime Chat
- [ ] Join team room
- [ ] Send messages
- [ ] Receive messages instantly
- [ ] Typing indicator shows
- [ ] Typing indicator hides
- [ ] Message timestamps display
- [ ] Messages persist (history loads)

### UI/UX
- [ ] Dark theme works
- [ ] Light theme works
- [ ] Theme persists across pages
- [ ] Skill tags have correct colors
- [ ] Cards have hover effects
- [ ] Buttons have hover effects
- [ ] Progress bars animate
- [ ] All pages are responsive

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** Make sure MongoDB is running
```bash
mongod
```

### Issue: "Port 5000 already in use"
**Solution:** Change port in `.env` or kill the process using port 5000

### Issue: "No recommendations showing"
**Solution:** Make sure you ran `npm run seed` to create demo users

### Issue: "Chat not working"
**Solution:** 
1. Check server console for Socket.io connection logs
2. Refresh both browser windows
3. Make sure you're in the same team

### Issue: "Theme not persisting"
**Solution:** Check browser localStorage (F12 → Application → Local Storage)

---

## 📊 Expected Console Outputs

### Server Console (when running)
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected Successfully
User connected: <socket-id>
User <userId> joined team <teamId>
```

### Browser Console (F12)
```
Socket connected
```

---

## ✨ All Features Working Confirmation

Once you've tested all items in the checklist above, all functions should be verified as working!

**Happy Testing! 🚀**
