import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    dynamic?: (params: Readonly<Record<string, string | undefined>>) => string;
  };
}

// Configuration for route-based breadcrumbs
const breadcrumbConfig: BreadcrumbConfig = {
  '/': {
    label: 'Dashboard'
  },
  '/tickets': {
    label: 'My Tickets'
  },
  '/tickets/:id': {
    label: 'Ticket Detail',
    dynamic: (params) => `#${params.id || ''}`
  },
};

export function useBreadcrumbs(): { breadcrumbs: BreadcrumbItem[]; title: string } {
  const location = useLocation();
  const params = useParams();

  return useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';
    let title = 'Dashboard'; // Default title

    // Handle root path specifically
    if (location.pathname === '/') {
      return { 
        breadcrumbs: [{ label: 'Dashboard' }], 
        title: 'Dashboard' 
      };
    }

    // Build breadcrumbs from path segments
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Check for exact match first
      let config = breadcrumbConfig[currentPath];
      
      // If no exact match, try to find dynamic route match
      if (!config) {
        const dynamicRoutes = Object.keys(breadcrumbConfig).filter(route => 
          route.includes(':')
        );
        
        for (const route of dynamicRoutes) {
          const routeSegments = route.split('/').filter(Boolean);
          if (routeSegments.length === pathSegments.length) {
            const matches = routeSegments.every((routeSegment, i) => {
              return routeSegment.startsWith(':') || routeSegment === pathSegments[i];
            });
            
            if (matches) {
              config = breadcrumbConfig[route];
              break;
            }
          }
        }
      }

      if (config) {
        const isLast = index === pathSegments.length - 1;
        let label = config.label;
        
        // Use dynamic label if available
        if (config.dynamic) {
          label = config.dynamic(params);
        }

        // Set title to the last breadcrumb
        if (isLast) {
          title = label;
        }

        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath
        });
      }
    });

    // Always ensure "My Tickets" is the first breadcrumb for ticket-related pages
    if (location.pathname.startsWith('/tickets') && breadcrumbs.length > 0) {
      if (breadcrumbs[0].label !== 'My Tickets') {
        breadcrumbs.unshift({
          label: 'My Tickets',
          href: '/tickets'
        });
      }
      // For ticket pages, default title should be "My Tickets" if not overridden
      if (title === 'Dashboard') {
        title = 'My Tickets';
      }
    }

    return { breadcrumbs, title };
  }, [location.pathname, params]);
}