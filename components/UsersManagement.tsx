"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from '@/components/ThemeProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Users,
  Building2,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Star,
  Globe,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  UserPlus,
  Activity,
  FileText,
  CreditCard,
  Settings,
  Shield,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Zap,
  Trash2,
  Upload,
  Edit,
  Plus,
  Save,
  ExternalLink,
  Database,
  HardDrive,
  UserCheck,
  Mail,
  Target,
  CheckSquare,
  User,
  UserPlus as UserPlusIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  EyeIcon,
  Pencil,
  Copy,
  Share,
  Archive,
  ArchiveRestore,
  Ban,
  Check,
  X,
  Flag,
  Award,
  Package,
  Key,
  Lock,
  Unlock,
  Verified,
  ShieldX,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Info,
  HelpCircle,
  UserRound,
  Building,
  Briefcase,
  Handshake,
  ChartNoAxesColumn,
  GanttChart,
  Workflow,
  CircleDashed,
  CircleCheckBig,
  CircleAlert,
  CircleX,
  Archive as ArchiveIcon,
  Tag,
  Hash,
  AtSign,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  RotateCw,
  RefreshCw as RefreshCwIcon,
  Play,
  Pause,
  Square as SquareIcon,
  SkipBack,
  SkipForward,
  VolumeX as VolumeXIcon,
  Volume1 as Volume1Icon,
  Volume2 as Volume2Icon,
  Mic,
  MicOff,
  Webcam,
  CameraOff,
  Battery,
  BatteryCharging,
  Wifi,
  Bluetooth,
  Signal,
  Cpu,
  MemoryStick,
  Disc,
  Server as ServerIcon,
  Database as DatabaseIcon,
  Network,
  Router,
  Smartphone,
  Tablet,
  Laptop,
  Monitor as MonitorIcon,
  Printer,
  Scan,
  Camera,
  Video as VideoIcon,
  Radio,
  Tv,
  Speaker,
  Headphones,
  Gamepad2,
  Watch,
  Clock as ClockIcon,
  Timer,
  AlarmClock,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  CalendarHeart,
  CalendarPlus,
  CalendarMinus,
  CalendarX,
  CalendarCheck as CalendarCheckIcon,
  CalendarArrowUp,
  CalendarArrowDown,
  Map,
  Navigation,
  Compass,
  Locate,
  LocateFixed,
  LocateOff,
  Route,
  Mountain,
  TreePalm,
  Castle,
  History,
  Landmark,
  Library,
  Hospital,
  Store,
  Factory,
  Home as HomeIcon,
  House,
  Building as BuildingIcon,
  School,
  University,
  Church,
  Landmark as LandmarkIcon,
  Banknote,
  PiggyBank,
  Wallet,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  Coins,
  Gem,
  Scale,
  Package as PackageIcon,
  Truck,
  Ship,
  Plane,
  Train,
  Bus,
  Car,
  Bike,
  Fuel,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryWarning,
  Power,
  Zap as ZapIcon,
  ZapOff,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudSun,
  CloudMoon,
  Cloudy,
  SunDim,
  SunMedium,
  Sun,
  MoonStar,
  Stars,
  Sparkles,
  Wind,
  Tornado,
  Snowflake,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  Droplets,
  Umbrella,
  Rainbow,
  Flower,
  Leaf,
  Sprout,
  TreeDeciduous,
  TreePine,
  Waves as WavesIcon,
  Anchor as AnchorIcon,
  Sailboat,
  Compass as CompassIcon,
  Navigation as NavigationIcon,
  Pin,
  PinOff,
  Crosshair,
  Crosshair as CrosshairIcon,
  Target as TargetIcon,
  Phone,
  Crosshair as Crosshair2Icon,
  Crosshair as Crosshair3Icon,
  Crosshair as Crosshair4Icon,
  Crosshair as Crosshair5Icon,
  Crosshair as Crosshair6Icon,
  Crosshair as Crosshair7Icon,
  Crosshair as Crosshair8Icon,
  Crosshair as Crosshair9Icon,
  Crosshair as Crosshair10Icon,
  Crosshair as Crosshair11Icon,
  Crosshair as Crosshair12Icon,
  Crosshair as Crosshair13Icon,
  Crosshair as Crosshair14Icon,
  Crosshair as Crosshair15Icon,
  Crosshair as Crosshair16Icon,
  Crosshair as Crosshair17Icon,
  Crosshair as Crosshair18Icon,
  Crosshair as Crosshair19Icon,
  Crosshair as Crosshair20Icon,
  Crosshair as Crosshair21Icon,
  Crosshair as Crosshair22Icon,
  Crosshair as Crosshair23Icon,
  Crosshair as Crosshair24Icon,
  Crosshair as Crosshair25Icon,
  Crosshair as Crosshair26Icon,
  Crosshair as Crosshair27Icon,
  Crosshair as Crosshair28Icon,
  Crosshair as Crosshair29Icon,
  Crosshair as Crosshair30Icon,
  Crosshair as Crosshair31Icon,
  Crosshair as Crosshair32Icon,
  Crosshair as Crosshair33Icon,
  Crosshair as Crosshair34Icon,
  Crosshair as Crosshair35Icon,
  Crosshair as Crosshair36Icon,
  Crosshair as Crosshair37Icon,
  Crosshair as Crosshair38Icon,
  Crosshair as Crosshair39Icon,
  Crosshair as Crosshair40Icon,
  Crosshair as Crosshair41Icon,
  Crosshair as Crosshair42Icon,
  Crosshair as Crosshair43Icon,
  Crosshair as Crosshair44Icon,
  Crosshair as Crosshair45Icon,
  Crosshair as Crosshair46Icon,
  Crosshair as Crosshair47Icon,
  Crosshair as Crosshair48Icon,
  Crosshair as Crosshair49Icon,
  Crosshair as Crosshair50Icon } from 'lucide-react';

// Colors for charts
const COLORS = [
  "#E03A3A",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#E03A3A",
  "#CC2E2E",
  "#E03A3A",
  "#E03A3A",
  "#F97316",
  "#14B8A6",
];

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_MEMBER' | 'USER';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BANNED';
  tenantId?: string;
  tenantName?: string;
  lastLogin: string;
  registrationDate: string;
  loginCount: number;
  permissions: string[];
  profileComplete: number;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  riskScore: number;
  sessionCount: number;
  lastActivity: string;
  timezone: string;
  language: string;
}

interface UsersManagementProps {
  adminId: string;
  permissions: string[];
}

export default function UsersManagement({
  adminId,
  permissions,
}: UsersManagementProps) {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for users
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "user-001",
        name: "Alex Johnson",
        email: "alex@standzon.com",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        lastLogin: "2024-01-07 14:30:00",
        registrationDate: "2023-01-15",
        loginCount: 124,
        permissions: ["users.manage", "content.manage", "payments.manage", "analytics.view"],
        profileComplete: 95,
        twoFactorEnabled: true,
        emailVerified: true,
        phoneVerified: true,
        riskScore: 0.1,
        sessionCount: 1,
        lastActivity: "2024-01-07 14:30:00",
        timezone: "UTC",
        language: "en",
      },
      {
        id: "user-002",
        name: "Maria Garcia",
        email: "maria@tenant1.com",
        role: "TENANT_ADMIN",
        status: "ACTIVE",
        tenantId: "tenant-001",
        tenantName: "ExpoBuild Solutions",
        lastLogin: "2024-01-07 12:15:00",
        registrationDate: "2023-02-20",
        loginCount: 89,
        permissions: ["users.manage", "content.manage"],
        profileComplete: 85,
        twoFactorEnabled: true,
        emailVerified: true,
        phoneVerified: false,
        riskScore: 0.2,
        sessionCount: 2,
        lastActivity: "2024-01-07 12:15:00",
        timezone: "EST",
        language: "en",
      },
      {
        id: "user-003",
        name: "David Chen",
        email: "david@tenant2.com",
        role: "TENANT_MEMBER",
        status: "ACTIVE",
        tenantId: "tenant-002",
        tenantName: "TradeShow Experts",
        lastLogin: "2024-01-06 09:45:00",
        registrationDate: "2023-03-10",
        loginCount: 67,
        permissions: ["content.view"],
        profileComplete: 70,
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false,
        riskScore: 0.3,
        sessionCount: 1,
        lastActivity: "2024-01-06 09:45:00",
        timezone: "PST",
        language: "en",
      },
      {
        id: "user-004",
        name: "Sarah Williams",
        email: "sarah@standzon.com",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        lastLogin: "2024-01-07 16:20:00",
        registrationDate: "2023-01-20",
        loginCount: 98,
        permissions: ["users.manage", "content.manage", "payments.manage", "analytics.view", "settings.manage"],
        profileComplete: 100,
        twoFactorEnabled: true,
        emailVerified: true,
        phoneVerified: true,
        riskScore: 0.05,
        sessionCount: 1,
        lastActivity: "2024-01-07 16:20:00",
        timezone: "UTC",
        language: "en",
      },
      {
        id: "user-005",
        name: "James Wilson",
        email: "james@tenant3.com",
        role: "TENANT_ADMIN",
        status: "PENDING",
        tenantId: "tenant-003",
        tenantName: "Global Exhibitions",
        lastLogin: "2024-01-05 11:30:00",
        registrationDate: "2023-04-15",
        loginCount: 34,
        permissions: ["users.manage", "content.manage"],
        profileComplete: 60,
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false,
        riskScore: 0.4,
        sessionCount: 1,
        lastActivity: "2024-01-05 11:30:00",
        timezone: "GMT",
        language: "en",
      },
      {
        id: "user-006",
        name: "Emma Thompson",
        email: "emma@tenant4.com",
        role: "USER",
        status: "SUSPENDED",
        tenantId: "tenant-004",
        tenantName: "Exhibition Masters",
        lastLogin: "2023-12-15 10:15:00",
        registrationDate: "2023-05-20",
        loginCount: 12,
        permissions: ["content.view"],
        profileComplete: 45,
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false,
        riskScore: 0.7,
        sessionCount: 0,
        lastActivity: "2023-12-15 10:15:00",
        timezone: "CET",
        language: "en",
      },
      {
        id: "user-007",
        name: "Michael Brown",
        email: "michael@tenant5.com",
        role: "TENANT_MEMBER",
        status: "ACTIVE",
        tenantId: "tenant-005",
        tenantName: "ShowStands Pro",
        lastLogin: "2024-01-07 08:45:00",
        registrationDate: "2023-06-05",
        loginCount: 78,
        permissions: ["content.view"],
        profileComplete: 75,
        twoFactorEnabled: true,
        emailVerified: true,
        phoneVerified: true,
        riskScore: 0.15,
        sessionCount: 1,
        lastActivity: "2024-01-07 08:45:00",
        timezone: "IST",
        language: "en",
      },
      {
        id: "user-008",
        name: "Olivia Davis",
        email: "olivia@tenant6.com",
        role: "TENANT_ADMIN",
        status: "ACTIVE",
        tenantId: "tenant-006",
        tenantName: "Design & Build Expo",
        lastLogin: "2024-01-06 15:20:00",
        registrationDate: "2023-07-12",
        loginCount: 56,
        permissions: ["users.manage", "content.manage", "payments.manage"],
        profileComplete: 80,
        twoFactorEnabled: true,
        emailVerified: true,
        phoneVerified: false,
        riskScore: 0.25,
        sessionCount: 1,
        lastActivity: "2024-01-06 15:20:00",
        timezone: "AEST",
        language: "en",
      },
    ];

    // Simulate API call delay
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'SUSPENDED':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
      case 'BANNED':
        return <Badge variant="secondary" className="bg-red-700/20 text-red-500 border-red-700/30">Banned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Role badge component
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">Super Admin</Badge>;
      case 'TENANT_ADMIN':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Tenant Admin</Badge>;
      case 'TENANT_MEMBER':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Tenant Member</Badge>;
      case 'USER':
        return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-[-0.02em] text-[#252525]">Users Management</h1>
          <p className="text-[13px] text-[#5B5C5D]">Manage platform users and their permissions — modern light layout, fully visible</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-none border-[#E4E6E8] bg-white text-[#252525] hover:bg-[#F5F6F7]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="rounded-none bg-[#E03A3A] text-white hover:bg-[#252525]">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-none border border-[#E4E6E8] bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-none border-[#E4E6E8] bg-white text-[#252525]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] rounded-none border-[#E4E6E8] bg-white text-[#252525]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#E4E6E8] bg-white text-[#252525]">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] rounded-none border-[#E4E6E8] bg-white text-[#252525]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#E4E6E8] bg-white text-[#252525]">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="TENANT_ADMIN">Tenant Admin</SelectItem>
                  <SelectItem value="TENANT_MEMBER">Tenant Member</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: users.length, icon: <Users className="w-5 h-5" />, color: 'from-blue-500/30 via-indigo-500/30 to-violet-500/30' },
          { title: 'Active Users', value: users.filter(u => u.status === 'ACTIVE').length, icon: <Activity className="w-5 h-5" />, color: 'from-green-500/30 via-emerald-500/30 to-teal-500/30' },
          { title: 'Super Admins', value: users.filter(u => u.role === 'SUPER_ADMIN').length, icon: <Shield className="w-5 h-5" />, color: 'from-purple-500/30 via-fuchsia-500/30 to-pink-500/30' },
          { title: 'Avg. Profile Completion', value: `${Math.round(users.reduce((sum, u) => sum + u.profileComplete, 0) / users.length)}%`, icon: <UserCheck className="w-5 h-5" />, color: 'from-amber-500/30 via-orange-500/30 to-red-500/30' },
        ].map((stat, index) => (
          <Card 
            key={index} 
            className="rounded-none border border-[#E4E6E8] bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B5C5D]">{stat.title}</p>
                  <p className="text-2xl font-light tracking-[-0.02em] text-[#252525] mt-1">{stat.value}</p>
                </div>
                <div className="p-3 rounded-none border border-[#E4E6E8] bg-[#F5F6F7] text-[#CC2E2E]">
                  {stat.icon}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="rounded-none border border-[#E4E6E8] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#252525]">User Directory</CardTitle>
          <CardDescription className="text-[#5B5C5D]">
            {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E4E6E8] bg-[#F5F6F7] hover:bg-[#F5F6F7]">
                  <TableHead className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">User</TableHead>
                  <TableHead className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">Email</TableHead>
                  <TableHead className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">Tenant</TableHead>
                  <TableHead className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">Role</TableHead>
                  <TableHead className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">Status</TableHead>
                  <TableHead className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">Last Login</TableHead>
                  <TableHead className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">Profile</TableHead>
                  <TableHead className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="border-[#E4E6E8] hover:bg-[#F5F6F7]/70">
                    <TableCell className="font-medium text-[#252525]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-gray-400 text-sm">{user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">{user.email}</TableCell>
                    <TableCell className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">{user.tenantName || 'N/A'}</TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell className="font-semibold uppercase tracking-[0.08em] text-[11px] text-[#5B5C5D]">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={user.profileComplete} className="h-2 w-20" />
                        <span className="text-sm text-gray-400">{user.profileComplete}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-none border-[#E4E6E8] bg-white text-[#252525]">
                          <DropdownMenuItem 
                            onClick={() => setSelectedUser(user)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem className="cursor-pointer text-red-400">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#9A9B9C]">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-none border-[#E4E6E8] bg-white text-[#252525] hover:bg-[#F5F6F7]"
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`${
                        currentPage === pageNum 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-none border-[#E4E6E8] bg-white text-[#252525] hover:bg-[#F5F6F7]"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-none border border-[#E4E6E8] bg-white text-[#252525]">
            <DialogHeader>
              <DialogTitle className="text-[#252525]">User Details</DialogTitle>
              <DialogDescription className="text-[#5B5C5D]">
                Comprehensive view of {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-7 rounded-none bg-[#F5F6F7] border border-[#E4E6E8]">
                  <TabsTrigger value="overview" className="text-[#5B5C5D] data-[state=active]:bg-[#E03A3A] data-[state=active]:text-white">Overview</TabsTrigger>
                  <TabsTrigger value="profile" className="text-[#5B5C5D] data-[state=active]:bg-[#E03A3A] data-[state=active]:text-white">Profile</TabsTrigger>
                  <TabsTrigger value="permissions" className="text-[#5B5C5D] data-[state=active]:bg-[#E03A3A] data-[state=active]:text-white">Permissions</TabsTrigger>
                  <TabsTrigger value="sessions" className="text-[#5B5C5D] data-[state=active]:bg-[#E03A3A] data-[state=active]:text-white">Sessions</TabsTrigger>
                  <TabsTrigger value="security" className="text-[#5B5C5D] data-[state=active]:bg-[#E03A3A] data-[state=active]:text-white">Security</TabsTrigger>
                  <TabsTrigger value="activity" className="text-[#5B5C5D] data-[state=active]:bg-[#E03A3A] data-[state=active]:text-white">Activity</TabsTrigger>
                  <TabsTrigger value="logs" className="text-[#5B5C5D] data-[state=active]:bg-[#E03A3A] data-[state=active]:text-white">Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-none border border-[#E4E6E8] bg-white">
                      <CardHeader>
                        <CardTitle className="text-[#252525]">User Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Name</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Email</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">User ID</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Tenant</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.tenantName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Role</span>
                          <span className="text-[14px] font-medium text-[#252525]">{getRoleBadge(selectedUser.role)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Status</span>
                          <span className="text-[14px] font-medium text-[#252525]">{getStatusBadge(selectedUser.status)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="rounded-none border border-[#E4E6E8] bg-white">
                      <CardHeader>
                        <CardTitle className="text-[#252525]">Account Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Registration Date</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.registrationDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Last Login</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.lastLogin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Login Count</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.loginCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Session Count</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.sessionCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Risk Score</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.riskScore.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9B9C]">Profile Completion</span>
                          <span className="text-[14px] font-medium text-[#252525]">{selectedUser.profileComplete}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="rounded-none border border-[#E4E6E8] bg-white">
                    <CardHeader>
                      <CardTitle className="text-[#252525]">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${selectedUser.emailVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Email Verified</div>
                            <div className="text-sm text-gray-400">{selectedUser.emailVerified ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${selectedUser.phoneVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Phone Verified</div>
                            <div className="text-sm text-gray-400">{selectedUser.phoneVerified ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${selectedUser.twoFactorEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-white font-medium">2FA Enabled</div>
                            <div className="text-sm text-gray-400">{selectedUser.twoFactorEnabled ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="profile" className="mt-4">
                  <Card className="rounded-none border border-[#E4E6E8] bg-white">
                    <CardHeader>
                      <CardTitle className="text-[#252525]">User Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">Profile information for this user would be displayed here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="permissions" className="mt-4">
                  <Card className="rounded-none border border-[#E4E6E8] bg-white">
                    <CardHeader>
                      <CardTitle className="text-[#252525]">User Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium text-white">Permissions</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.permissions.map((permission, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sessions" className="mt-4">
                  <Card className="rounded-none border border-[#E4E6E8] bg-white">
                    <CardHeader>
                      <CardTitle className="text-[#252525]">Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">Active sessions for this user would be displayed here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security" className="mt-4">
                  <Card className="rounded-none border border-[#E4E6E8] bg-white">
                    <CardHeader>
                      <CardTitle className="text-[#252525]">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">Security settings for this user would be displayed here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-4">
                  <Card className="rounded-none border border-[#E4E6E8] bg-white">
                    <CardHeader>
                      <CardTitle className="text-[#252525]">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">Recent activity for this user would be displayed here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="logs" className="mt-4">
                  <Card className="rounded-none border border-[#E4E6E8] bg-white">
                    <CardHeader>
                      <CardTitle className="text-[#252525]">User Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">User logs would be displayed here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}