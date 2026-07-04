from django.urls import path

from .insights_views import (
    FarmerAchievementsView,
    FarmerActivityTimelineView,
    FarmerBadgesView,
    FarmerHealthCardView,
    FarmerInsightsView,
    FarmerProfileStatusView,
    SchemeRecommendationsView,
    TrustScoreSimulatorView,
)

urlpatterns = [
    path("farmers/me/profile-status/", FarmerProfileStatusView.as_view()),
    path("farmers/me/badges/", FarmerBadgesView.as_view()),
    path("farmers/me/achievements/", FarmerAchievementsView.as_view()),
    path("farmers/me/timeline/", FarmerActivityTimelineView.as_view()),
    path("farmers/me/health-card/", FarmerHealthCardView.as_view()),
    path("farmers/me/insights/", FarmerInsightsView.as_view()),
    path("trust-scores/simulate/", TrustScoreSimulatorView.as_view()),
    path("schemes/recommended/", SchemeRecommendationsView.as_view()),
]
