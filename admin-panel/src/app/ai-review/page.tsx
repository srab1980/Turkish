'use client';

import Layout from '@/components/layout/Layout';
import ContentReviewDashboard from '@/components/ai-review/ContentReviewDashboard';

export default function AIReviewPage() {
  return (
    <Layout>
      <div className="p-6">
        <ContentReviewDashboard />
      </div>
    </Layout>
  );
}
