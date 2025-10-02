// Extend expect with jest-dom matchers under Vitest
import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

// Mock fetch globally with minimal type
global.fetch = vi.fn(async () => new Response()) as unknown as typeof fetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as unknown as Storage;

// Mock window.location (avoid delete which can error in some jsdom versions)
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: 'http://localhost/', origin: 'http://localhost', assign: vi.fn(), reload: vi.fn() },
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

// matchMedia polyfill (used by some components or libraries expecting browser env)
if (!window.matchMedia) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.matchMedia = function(query: string): any {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  } as unknown as typeof window.matchMedia;
}

// NOTE: Previously mocked '../store/hooks' here. Removed to allow tests to
// leverage the real Redux store so state-driven UI (loading/error) can be asserted.

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'test-id' }),
    useLocation: () => ({ pathname: '/test' }),
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => '<svg data-testid="search-icon" />',
  Plus: () => '<svg data-testid="plus-icon" />',
  Filter: () => '<svg data-testid="filter-icon" />',
  X: () => '<svg data-testid="x-icon" />',
  Calendar: () => '<svg data-testid="calendar-icon" />',
  User: () => '<svg data-testid="user-icon" />',
  Clock: () => '<svg data-testid="clock-icon" />',
  AlertTriangle: () => '<svg data-testid="alert-triangle-icon" />',
  CheckCircle: () => '<svg data-testid="check-circle-icon" />',
  XCircle: () => '<svg data-testid="x-circle-icon" />',
  Edit: () => '<svg data-testid="edit-icon" />',
  Trash2: () => '<svg data-testid="trash2-icon" />',
  MoreHorizontal: () => '<svg data-testid="more-horizontal-icon" />',
  Eye: () => '<svg data-testid="eye-icon" />',
  EyeOff: () => '<svg data-testid="eye-off-icon" />',
  LogOut: () => '<svg data-testid="logout-icon" />',
  Settings: () => '<svg data-testid="settings-icon" />',
  HelpCircle: () => '<svg data-testid="help-circle-icon" />',
  Activity: () => '<svg data-testid="activity-icon" />',
  TrendingUp: () => '<svg data-testid="trending-up-icon" />',
  Users: () => '<svg data-testid="users-icon" />',
  BarChart: () => '<svg data-testid="bar-chart-icon" />',
  Ticket: () => '<svg data-testid="ticket-icon" />',
  Mail: () => '<svg data-testid="mail-icon" />',
  Phone: () => '<svg data-testid="phone-icon" />',
  MapPin: () => '<svg data-testid="map-pin-icon" />',
  Building: () => '<svg data-testid="building-icon" />',
  Globe: () => '<svg data-testid="globe-icon" />',
  Tag: () => '<svg data-testid="tag-icon" />',
  Star: () => '<svg data-testid="star-icon" />',
  Heart: () => '<svg data-testid="heart-icon" />',
  ThumbsUp: () => '<svg data-testid="thumbs-up-icon" />',
  ThumbsDown: () => '<svg data-testid="thumbs-down-icon" />',
  MessageSquare: () => '<svg data-testid="message-square-icon" />',
  Send: () => '<svg data-testid="send-icon" />',
  Download: () => '<svg data-testid="download-icon" />',
  Upload: () => '<svg data-testid="upload-icon" />',
  Link: () => '<svg data-testid="link-icon" />',
  ExternalLink: () => '<svg data-testid="external-link-icon" />',
  Copy: () => '<svg data-testid="copy-icon" />',
  Clipboard: () => '<svg data-testid="clipboard-icon" />',
  Save: () => '<svg data-testid="save-icon" />',
  FileText: () => '<svg data-testid="file-text-icon" />',
  Folder: () => '<svg data-testid="folder-icon" />',
  Home: () => '<svg data-testid="home-icon" />',
  Menu: () => '<svg data-testid="menu-icon" />',
  ArrowLeft: () => '<svg data-testid="arrow-left-icon" />',
  ArrowRight: () => '<svg data-testid="arrow-right-icon" />',
  ArrowUp: () => '<svg data-testid="arrow-up-icon" />',
  ArrowDown: () => '<svg data-testid="arrow-down-icon" />',
  ChevronLeft: () => '<svg data-testid="chevron-left-icon" />',
  ChevronRight: () => '<svg data-testid="chevron-right-icon" />',
  ChevronUp: () => '<svg data-testid="chevron-up-icon" />',
  ChevronDown: () => '<svg data-testid="chevron-down-icon" />',
  MoreVertical: () => '<svg data-testid="more-vertical-icon" />',
  Refresh: () => '<svg data-testid="refresh-icon" />',
  RotateCcw: () => '<svg data-testid="rotate-ccw-icon" />',
  Loader: () => '<svg data-testid="loader-icon" />',
  Spinner: () => '<svg data-testid="spinner-icon" />',
  Zap: () => '<svg data-testid="zap-icon" />',
  Shield: () => '<svg data-testid="shield-icon" />',
  Lock: () => '<svg data-testid="lock-icon" />',
  Unlock: () => '<svg data-testid="unlock-icon" />',
  Key: () => '<svg data-testid="key-icon" />',
  Database: () => '<svg data-testid="database-icon" />',
  Server: () => '<svg data-testid="server-icon" />',
  Cloud: () => '<svg data-testid="cloud-icon" />',
  Wifi: () => '<svg data-testid="wifi-icon" />',
  Signal: () => '<svg data-testid="signal-icon" />',
  Battery: () => '<svg data-testid="battery-icon" />',
  Power: () => '<svg data-testid="power-icon" />',
  Volume2: () => '<svg data-testid="volume2-icon" />',
  VolumeX: () => '<svg data-testid="volume-x-icon" />',
  Camera: () => '<svg data-testid="camera-icon" />',
  Image: () => '<svg data-testid="image-icon" />',
  Video: () => '<svg data-testid="video-icon" />',
  Music: () => '<svg data-testid="music-icon" />',
  Headphones: () => '<svg data-testid="headphones-icon" />',
  Mic: () => '<svg data-testid="mic-icon" />',
  MicOff: () => '<svg data-testid="mic-off-icon" />',
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});