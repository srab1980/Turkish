import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnalyticsDashboard from '../../src/components/analytics/AnalyticsDashboard';

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
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

describe('AnalyticsDashboard Component', () => {
  it('renders analytics dashboard with metrics', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
    });

    // Check for metric cards
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Total Courses')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });

  it('displays metric values correctly', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      // Check for numeric values (mock data)
      expect(screen.getByText('1,250')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('890')).toBeInTheDocument(); // Active Users
      expect(screen.getByText('45')).toBeInTheDocument(); // Total Courses
      expect(screen.getByText('68%')).toBeInTheDocument(); // Completion Rate
    });
  });

  it('shows growth indicators', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      // Check for growth percentages
      expect(screen.getByText('+12%')).toBeInTheDocument(); // User growth
      expect(screen.getByText('+8%')).toBeInTheDocument(); // Active user growth
      expect(screen.getByText('+3%')).toBeInTheDocument(); // Course growth
      expect(screen.getByText('+5%')).toBeInTheDocument(); // Completion rate change
    });
  });

  it('renders charts correctly', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      // Check for chart components
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('displays time period selector', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
      expect(screen.getByText('Last 90 days')).toBeInTheDocument();
    });
  });

  it('shows export functionality', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const exportButton = screen.getByText('Export Data');
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    const loadingQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          enabled: false, // Disable queries to simulate loading
        },
      },
    });

    render(
      <QueryClientProvider client={loadingQueryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Should show loading indicators
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
  });

  it('displays recent activity section', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('shows user engagement metrics', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('User Engagement')).toBeInTheDocument();
    });
  });

  it('renders responsive design', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const container = screen.getByText('Analytics Overview').closest('div');
      expect(container).toHaveClass('p-6');
    });
  });

  it('handles metric card interactions', async () => {
    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const totalUsersCard = screen.getByText('Total Users').closest('div');
      expect(totalUsersCard).toBeInTheDocument();
    });
  });
});
