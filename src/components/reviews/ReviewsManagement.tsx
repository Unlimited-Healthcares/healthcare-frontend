
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewsList } from './ReviewsList';
import { ReviewsSummary } from './ReviewsSummary';
import { CreateReviewForm } from './CreateReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewsManagementProps {
  centerId: string;
  userRole?: 'patient' | 'center_staff' | 'admin';
  showCreateForm?: boolean;
}

export const ReviewsManagement: React.FC<ReviewsManagementProps> = ({
  centerId,
  userRole = 'patient',
  showCreateForm = false
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [showCreateReview, setShowCreateReview] = useState(showCreateForm);

  const handleReviewCreated = () => {
    setShowCreateReview(false);
    setActiveTab('reviews');
    // Refresh the reviews list
    window.location.reload();
  };

  if (showCreateReview) {
    return (
      <CreateReviewForm
        centerId={centerId}
        onSuccess={handleReviewCreated}
        onCancel={() => setShowCreateReview(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Reviews Summary</TabsTrigger>
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <ReviewsSummary centerId={centerId} />

          {/* Recent Reviews Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewsList
                centerId={centerId}
                showCreateButton={userRole === 'patient'}
                onCreateReview={() => setShowCreateReview(true)}
                userRole={userRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsList
            centerId={centerId}
            showCreateButton={userRole === 'patient'}
            onCreateReview={() => setShowCreateReview(true)}
            userRole={userRole}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
