from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import UserRegistrationView, CustomTokenObtainPairView, GoogleSignView

urlpatterns = [
  path("register/", UserRegistrationView.as_view(), name="register"), # registration view
  path("token/", CustomTokenObtainPairView.as_view(), name="get-token"), # login view
  path("google/", GoogleSignView.as_view(), name="google-verify"),
  path("token/refresh/", TokenRefreshView.as_view(), name="refresh-token"), # get new access token based on refresh token
]
