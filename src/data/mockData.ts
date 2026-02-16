export interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
  statusMessage?: string;
  lastSeen?: string;
  phone?: string;
  email?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "text" | "image";
  imageUrl?: string;
}

export interface Chat {
  id: string;
  userId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  members: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: string;
  viewed: boolean;
}

export const currentUser: User = {
  id: "me",
  name: "John Doe",
  avatar: "https://i.pravatar.cc/150?img=68",
  status: "online",
  statusMessage: "Available",
  phone: "+1 234 567 8900",
  email: "john@example.com",
};

export const users: User[] = [
  { id: "1", name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?img=1", status: "online", statusMessage: "Hey there! I'm using ChatApp" },
  { id: "2", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?img=3", status: "offline", lastSeen: "Today at 2:30 PM", statusMessage: "Busy" },
  { id: "3", name: "Carol Williams", avatar: "https://i.pravatar.cc/150?img=5", status: "online", statusMessage: "At work" },
  { id: "4", name: "David Brown", avatar: "https://i.pravatar.cc/150?img=7", status: "offline", lastSeen: "Yesterday at 9:15 PM" },
  { id: "5", name: "Eva Martinez", avatar: "https://i.pravatar.cc/150?img=9", status: "online", statusMessage: "Coding 🚀" },
  { id: "6", name: "Frank Lee", avatar: "https://i.pravatar.cc/150?img=11", status: "offline", lastSeen: "Today at 11:00 AM" },
  { id: "7", name: "Grace Kim", avatar: "https://i.pravatar.cc/150?img=16", status: "online", statusMessage: "Available" },
  { id: "8", name: "Henry Davis", avatar: "https://i.pravatar.cc/150?img=12", status: "offline", lastSeen: "2 days ago" },
  { id: "ai", name: "AI Assistant", avatar: "https://i.pravatar.cc/150?img=69", status: "online", statusMessage: "Always here to help ✨" },
];

export const chats: Chat[] = [
  {
    id: "c1", userId: "1", lastMessage: "Sure, let's meet at 5!", lastMessageTime: "10:30 AM", unreadCount: 2,
    messages: [
      { id: "m1", senderId: "1", text: "Hey! How are you?", timestamp: "10:00 AM", type: "text" },
      { id: "m2", senderId: "me", text: "I'm great, thanks! Want to grab coffee?", timestamp: "10:15 AM", type: "text" },
      { id: "m3", senderId: "1", text: "Sure, let's meet at 5!", timestamp: "10:30 AM", type: "text" },
    ],
  },
  {
    id: "c2", userId: "2", lastMessage: "I'll send the files tomorrow", lastMessageTime: "Yesterday", unreadCount: 0,
    messages: [
      { id: "m4", senderId: "me", text: "Did you finish the project?", timestamp: "Yesterday 3:00 PM", type: "text" },
      { id: "m5", senderId: "2", text: "Almost done. Just a few tweaks left.", timestamp: "Yesterday 3:30 PM", type: "text" },
      { id: "m6", senderId: "2", text: "I'll send the files tomorrow", timestamp: "Yesterday 4:00 PM", type: "text" },
    ],
  },
  {
    id: "c3", userId: "3", lastMessage: "That's amazing! 🎉", lastMessageTime: "9:45 AM", unreadCount: 1,
    messages: [
      { id: "m7", senderId: "3", text: "I got promoted!", timestamp: "9:30 AM", type: "text" },
      { id: "m8", senderId: "me", text: "Congratulations!! 🎊", timestamp: "9:35 AM", type: "text" },
      { id: "m9", senderId: "3", text: "That's amazing! 🎉", timestamp: "9:45 AM", type: "text" },
    ],
  },
  {
    id: "c4", userId: "5", lastMessage: "Check out this new framework", lastMessageTime: "8:20 AM", unreadCount: 3,
    messages: [
      { id: "m10", senderId: "5", text: "Have you tried the new React update?", timestamp: "8:00 AM", type: "text" },
      { id: "m11", senderId: "me", text: "Not yet! Is it good?", timestamp: "8:10 AM", type: "text" },
      { id: "m12", senderId: "5", text: "Check out this new framework", timestamp: "8:20 AM", type: "text" },
    ],
  },
  {
    id: "c5", userId: "7", lastMessage: "See you at the meetup!", lastMessageTime: "7:00 AM", unreadCount: 0,
    messages: [
      { id: "m13", senderId: "7", text: "Are you going to the tech meetup?", timestamp: "6:30 AM", type: "text" },
      { id: "m14", senderId: "me", text: "Yes, I'll be there!", timestamp: "6:45 AM", type: "text" },
      { id: "m15", senderId: "7", text: "See you at the meetup!", timestamp: "7:00 AM", type: "text" },
    ],
  },
  {
    id: "c-ai", userId: "ai", lastMessage: "How can I help you today?", lastMessageTime: "Now", unreadCount: 0,
    messages: [
      { id: "mai1", senderId: "ai", text: "Hello! I'm your AI assistant. How can I help you today?", timestamp: "Now", type: "text" },
    ],
  },
];

export const groups: Group[] = [
  {
    id: "g1", name: "Team Alpha", avatar: "https://i.pravatar.cc/150?img=20", members: ["1", "2", "3", "me"],
    lastMessage: "Meeting at 3 PM", lastMessageTime: "11:00 AM", unreadCount: 5,
    messages: [
      { id: "gm1", senderId: "1", text: "Let's sync up today", timestamp: "10:30 AM", type: "text" },
      { id: "gm2", senderId: "2", text: "Sure, what time?", timestamp: "10:45 AM", type: "text" },
      { id: "gm3", senderId: "3", text: "Meeting at 3 PM", timestamp: "11:00 AM", type: "text" },
    ],
  },
  {
    id: "g2", name: "Design Crew", avatar: "https://i.pravatar.cc/150?img=21", members: ["3", "5", "7", "me"],
    lastMessage: "New mockups are ready!", lastMessageTime: "Yesterday", unreadCount: 0,
    messages: [
      { id: "gm4", senderId: "5", text: "Working on the new UI", timestamp: "Yesterday 2:00 PM", type: "text" },
      { id: "gm5", senderId: "7", text: "New mockups are ready!", timestamp: "Yesterday 3:00 PM", type: "text" },
    ],
  },
  {
    id: "g3", name: "Weekend Plans", avatar: "https://i.pravatar.cc/150?img=22", members: ["1", "4", "6", "me"],
    lastMessage: "Let's go hiking! 🏔️", lastMessageTime: "Monday", unreadCount: 2,
    messages: [
      { id: "gm6", senderId: "4", text: "Anyone free this weekend?", timestamp: "Monday 5:00 PM", type: "text" },
      { id: "gm7", senderId: "6", text: "Let's go hiking! 🏔️", timestamp: "Monday 5:30 PM", type: "text" },
    ],
  },
];

export const stories: Story[] = [
  { id: "s1", userId: "1", imageUrl: "https://picsum.photos/seed/story1/400/600", timestamp: "2 hours ago", viewed: false },
  { id: "s2", userId: "3", imageUrl: "https://picsum.photos/seed/story2/400/600", timestamp: "4 hours ago", viewed: true },
  { id: "s3", userId: "5", imageUrl: "https://picsum.photos/seed/story3/400/600", timestamp: "6 hours ago", viewed: false },
  { id: "s4", userId: "7", imageUrl: "https://picsum.photos/seed/story4/400/600", timestamp: "8 hours ago", viewed: true },
];

export const mediaGallery = [
  "https://picsum.photos/seed/media1/300/300",
  "https://picsum.photos/seed/media2/300/300",
  "https://picsum.photos/seed/media3/300/300",
  "https://picsum.photos/seed/media4/300/300",
  "https://picsum.photos/seed/media5/300/300",
  "https://picsum.photos/seed/media6/300/300",
  "https://picsum.photos/seed/media7/300/300",
  "https://picsum.photos/seed/media8/300/300",
  "https://picsum.photos/seed/media9/300/300",
];

export function getUserById(id: string): User | undefined {
  if (id === "me") return currentUser;
  return users.find((u) => u.id === id);
}
