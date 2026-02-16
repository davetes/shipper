

# Chat App – Frontend Implementation Plan

## Overview
A modern chat application built with React/Vite, matching the Figma design (green/teal accent theme with clean layout). All data will be mocked. Includes a bonus "Chat with AI" feature using Lovable AI.

---

## 1. Auth Page (Login/Signup)
- Conversion-focused design with a compelling hero section
- Google sign-in button (mocked – just navigates to the app)
- Email/password form option (mocked authentication)
- Clean, modern layout that encourages sign-up

## 2. Sidebar & Navigation
- Left sidebar with navigation icons matching the Figma: Chats, Contacts, Groups, Stories/Status, Settings
- User avatar at the bottom of the sidebar
- Active state highlighting on current section
- Green/teal accent color scheme from the Figma

## 3. Chat List & Conversation View
- **Chat List Panel**: List of recent conversations with avatars, names, last message preview, timestamps, and unread badges
- **Conversation View**: Full chat thread with message bubbles (sent/received), timestamps, typing indicators
- Message input bar with send button and attachment icon
- Mock messages with realistic content and timestamps

## 4. Contacts & Users
- List of users showing online/offline status (green dot indicator)
- User info: name, profile picture, status message
- Clicking a user opens/starts a chat session
- Search/filter contacts

## 5. Groups
- Group list with group avatars and member counts
- Group chat view similar to individual chats
- Group info panel showing members

## 6. Stories/Status & Media Gallery
- Status updates from contacts with thumbnails
- Media gallery grid showing shared images/media in conversations
- Mock images using placeholder services

## 7. Profile & Settings
- Current user profile with editable display info
- Settings options: notifications, theme, privacy, account
- Logout button (returns to auth page)

## 8. BONUS: Chat with AI
- Special "AI Assistant" contact in the chat list
- Opens a conversation view where messages are sent to Lovable AI
- Streaming AI responses rendered with markdown support
- Powered by Lovable Cloud edge function + Lovable AI gateway

---

## Design Approach
- Pixel-faithful to the Figma: green/teal accent color, clean white background, sidebar layout
- Responsive but desktop-first (matching Figma)
- All mock data with realistic names, avatars, and messages

