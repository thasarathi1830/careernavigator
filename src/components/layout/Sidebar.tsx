
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  User, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    title: "Course Tracker",
    href: "/course-tracker",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Job Portal",
    href: "/job-portal",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Exams & Assignments",
    href: "/exams",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Discussion Forum",
    href: "/forum",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[250px]",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-bold text-lg text-education-primary">
            AcadPath
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
        >
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </button>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center py-3 px-3 rounded-lg transition-colors",
                {
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium":
                    isActive,
                  "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground":
                    !isActive,
                }
              )
            }
          >
            {item.icon}
            {!collapsed && <span className="ml-3">{item.title}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
