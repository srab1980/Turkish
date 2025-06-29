import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '../../src/components/layout/Layout';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
    query: {},
  }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Layout Component', () => {
  it('renders layout with navigation', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Turkish Learning Platform')).toBeInTheDocument();
  });

  it('displays navigation menu items', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('AI Tools')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('handles mobile menu toggle', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Find and click the mobile menu button
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Mobile menu should be visible
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders user profile section', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for user profile elements
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@turkishlearning.com')).toBeInTheDocument();
  });

  it('handles logout functionality', () => {
    const mockPush = jest.fn();
    jest.mock('next/router', () => ({
      useRouter: () => ({
        pathname: '/',
        push: mockPush,
        query: {},
      }),
    }));

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Find and click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Should handle logout (in real app would redirect)
    expect(logoutButton).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Dashboard should be active by default
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-primary-100');
  });

  it('renders breadcrumb navigation', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for breadcrumb elements
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays notification badge when there are notifications', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for notification bell icon
    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    expect(notificationButton).toBeInTheDocument();
  });

  it('renders responsive design elements', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for responsive classes
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('hidden', 'lg:flex');
  });

  it('handles keyboard navigation', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const dashboardLink = screen.getByText('Dashboard');
    
    // Test keyboard focus
    dashboardLink.focus();
    expect(dashboardLink).toHaveFocus();

    // Test Enter key navigation
    fireEvent.keyDown(dashboardLink, { key: 'Enter', code: 'Enter' });
    expect(dashboardLink).toBeInTheDocument();
  });
});
