declare module 'lucide-react' {
  import * as React from 'react';

  interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
  }

  type LucideIcon = React.ComponentType<LucideIconProps>;

  // Navigation & UI Icons
  export const ShoppingBag: LucideIcon;
  export const Heart: LucideIcon;
  export const User: LucideIcon;
  export const Search: LucideIcon;
  export const Menu: LucideIcon;

  // Action Icons
  export const Plus: LucideIcon;
  export const Edit: LucideIcon;
  export const Trash2: LucideIcon;
  export const Loader2: LucideIcon;

  // Navigation Icons
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const X: LucideIcon;
  export const Check: LucideIcon;

  // Status Icons
  export const AlertCircle: LucideIcon;
  export const Info: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;

  // Form Icons
  export const Lock: LucideIcon;
  export const Mail: LucideIcon;
  export const Phone: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;

  // Location & Social
  export const MapPin: LucideIcon;
  export const Star: LucideIcon;
  export const ShoppingCart: LucideIcon;

  // Interface Icons
  export const Settings: LucideIcon;
  export const Filter: LucideIcon;
  export const SortAsc: LucideIcon;
  export const SortDesc: LucideIcon;

  // File & Media Icons
  export const Download: LucideIcon;
  export const Upload: LucideIcon;
  export const Share: LucideIcon;
  export const Copy: LucideIcon;
  export const RefreshCw: LucideIcon;

  // Navigation Icons
  export const Home: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUp: LucideIcon;
  export const ArrowDown: LucideIcon;
}
