import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppSidebar, { Section } from "@/components/chat/AppSidebar";
import ChatList from "@/components/chat/ChatList";
import ConversationView from "@/components/chat/ConversationView";
import ContactsList from "@/components/chat/ContactsList";
import GroupsList from "@/components/chat/GroupsList";
import GroupConversation from "@/components/chat/GroupConversation";
import StoriesView from "@/components/chat/StoriesView";
import SettingsView from "@/components/chat/SettingsView";
import EmptyChat from "@/components/chat/EmptyChat";
import { chats as initialChats, groups as initialGroups, Chat, Group, Message } from "@/data/mockData";

const ChatPage = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("chats");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<Chat[]>(initialChats);
  const [groupData, setGroupData] = useState<Group[]>(initialGroups);

  const handleLogout = () => navigate("/");

  const handleSendMessage = useCallback((chatId: string, text: string) => {
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: "me",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setChatData((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastMessageTime: "Now", unreadCount: 0 }
          : c
      )
    );
  }, []);

  const handleSendGroupMessage = useCallback((groupId: string, text: string) => {
    const newMsg: Message = {
      id: `gm-${Date.now()}`,
      senderId: "me",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setGroupData((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, messages: [...g.messages, newMsg], lastMessage: text, lastMessageTime: "Now", unreadCount: 0 }
          : g
      )
    );
  }, []);

  const handleContactClick = (userId: string) => {
    const existingChat = chatData.find((c) => c.userId === userId);
    if (existingChat) {
      setSection("chats");
      setActiveChatId(existingChat.id);
    } else {
      const newChat: Chat = {
        id: `c-${Date.now()}`,
        userId,
        lastMessage: "",
        lastMessageTime: "Now",
        unreadCount: 0,
        messages: [],
      };
      setChatData((prev) => [newChat, ...prev]);
      setSection("chats");
      setActiveChatId(newChat.id);
    }
  };

  const activeChat = chatData.find((c) => c.id === activeChatId);
  const activeGroup = groupData.find((g) => g.id === activeGroupId);

  const renderContent = () => {
    switch (section) {
      case "chats":
        return (
          <>
            <ChatList activeChatId={activeChatId} onChatSelect={setActiveChatId} />
            {activeChat ? (
              <ConversationView chat={activeChat} onSendMessage={handleSendMessage} />
            ) : (
              <EmptyChat />
            )}
          </>
        );
      case "contacts":
        return (
          <>
            <ContactsList onContactClick={handleContactClick} />
            <EmptyChat />
          </>
        );
      case "groups":
        return (
          <>
            <GroupsList activeGroupId={activeGroupId} onGroupSelect={setActiveGroupId} />
            {activeGroup ? (
              <GroupConversation group={activeGroup} onSendMessage={handleSendGroupMessage} />
            ) : (
              <EmptyChat />
            )}
          </>
        );
      case "stories":
        return <StoriesView />;
      case "settings":
        return <SettingsView onLogout={handleLogout} />;
      default:
        return <EmptyChat />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar activeSection={section} onSectionChange={setSection} onLogout={handleLogout} />
      {renderContent()}
    </div>
  );
};

export default ChatPage;
