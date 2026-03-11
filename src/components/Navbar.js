"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (path) => pathname === path;

  return (
    <>
      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 48px;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          transition: all 0.3s;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .nav-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .nav-logo-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--gray-900);
          letter-spacing: -0.02em;
        }
        .nav-logo-text span { color: var(--primary); }

        .nav-center {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-item {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--gray-500);
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-item:hover {
          color: var(--primary);
          background: var(--primary-pale);
        }
        .nav-item.active {
          color: var(--primary);
          font-weight: 600;
          background: var(--primary-pale);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 10px;
        }
        .nav-avatar {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #2563EB, #10B981);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
        }
        .nav-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--gray-700);
        }
        .nav-role {
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .nav-cta {
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 10px 22px;
          border-radius: 10px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.3);
          border: none;
          cursor: pointer;
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
        }
        .nav-logout {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--gray-400);
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-logout:hover {
          color: #EF4444;
          background: #FEE2E2;
        }

        @media (max-width: 768px) {
          .navbar { padding: 12px 16px; }
          .nav-center { display: none; }
          .nav-user { display: none; }
        }
      `}</style>

      <nav className="navbar">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">🛡️</div>
          <div className="nav-logo-text">Shield<span>Cart</span></div>
        </Link>

        <div className="nav-center">
          <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link href="/marketplace" className={`nav-item ${isActive('/marketplace') ? 'active' : ''}`}>
            Marketplace
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                My Orders
              </Link>
              {profile?.role === "admin" && (
                <Link href="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
                  Admin Panel
                </Link>
              )}
              {profile?.role === "inspector" && (
                <Link href="/inspector" className={`nav-item ${isActive('/inspector') ? 'active' : ''}`}>
                  Inspections
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <div className="nav-user">
                <div className="nav-avatar">
                  {profile?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="nav-name">{profile?.full_name || "User"}</div>
                  <div className="nav-role">{profile?.role || "customer"}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="nav-logout">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-item">Log In</Link>
              <Link href="/marketplace" className="nav-cta">
                🛒 Shop Securely
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
