import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { HomeView } from "./components/HomeView";
import { DashboardActivityView } from "./components/DashboardActivityView";
import { MapView } from "./components/MapView";
import { SocialFeedView } from "./components/SocialFeedView";
import { ExploreView } from "./components/ExploreView";
import { AuthView } from "./components/AuthView";
import { ProfileView } from "./components/ProfileView";
import { NotificationSystem } from "./components/NotificationSystem";
import { Header } from "./components/Header";
import { io, Socket } from "socket.io-client";

// Global socket instance
export let globalSocket: Socket | null = null;

export default function App() {
  const [currentTab, setCurrentTab] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Check if user exists in localStorage on mount and verify session with backend
    const checkSession = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          // Attempt refresh
          const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
          if (refreshRes.ok) {
            const meRes = await fetch('/api/me');
            if (meRes.ok) {
              const user = await meRes.json();
              setCurrentUser(user);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (e) {
        // Assume offline but logged in if we have local user
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const socket = io();
      globalSocket = socket;
      
      socket.on("connect", () => {
        setSocketConnected(true);
        // Request initial data for this user
        socket.emit("fetch_initial_data");
        
        // Sync offline posts if any
        const offlineQueue = JSON.parse(localStorage.getItem('offline_posts_queue') || '[]');
        if (offlineQueue.length > 0) {
          offlineQueue.forEach((post: any) => {
             socket.emit("new_activity", post);
          });
          localStorage.removeItem('offline_posts_queue');
        }
      });

      socket.on("profile_updated", (updatedUser) => {
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      });

      return () => {
        socket.disconnect();
        globalSocket = null;
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsAuthenticated(false);
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
  };

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-brand-bg text-brand-text-primary overflow-hidden font-sans selection:bg-brand-accent-dim selection:text-brand-accent">
      <NotificationSystem />
      <Navigation currentTab={currentTab} setTab={setCurrentTab} onLogout={handleLogout} />
      
      <main className="flex-1 h-full relative flex flex-col">
        <Header user={currentUser} />
        <div className="flex-1 overflow-hidden h-full">
          {currentTab === "home" && <HomeView />}
          {currentTab === "dashboard_activity" && <DashboardActivityView currentUser={currentUser} />}
          {currentTab === "track" && <MapView />}
          {currentTab === "social" && <SocialFeedView currentUser={currentUser} />}
          {currentTab === "explore" && <ExploreView />}
          {currentTab === "profile" && <ProfileView currentUser={currentUser} />}
        </div>
      </main>
    </div>
  );
}
