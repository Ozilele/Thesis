from rest_framework import permissions, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AppUser
from django.conf import settings
from .serializers import CustomTokenObtainPairSerializer, AppUserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
import jwt

class UserRegistrationView(generics.CreateAPIView):
  queryset = AppUser.objects.all()
  serializer_class = AppUserSerializer
  permission_classes = [permissions.AllowAny]

  def perform_create(self, serializer):
    if serializer.is_valid():
      serializer.save()
    else:
      return Response({ "message": "Error creating the user" }, status=status.HTTP_400_BAD_REQUEST)
  
class CustomTokenObtainPairView(TokenObtainPairView):
  serializer_class = CustomTokenObtainPairSerializer # custom serializer used for jwt tokens generation

class GoogleSignView(APIView):
  # link do google docs: https://developers.google.com/identity/sign-in/android/backend-auth?hl=pl
  permission_classes = [permissions.AllowAny]

  def post(self, request):
    token = request.data['token']
    aud = request.data['aud']
    try:
      user_info = self.validate_token(id_token=token, audience=aud)
      return Response(user_info, status=status.HTTP_200_OK)
    except Exception as e:
      print(e)
      return Response(f"{e.__str__} failed to login with Google", status=status.HTTP_401_UNAUTHORIZED)

  def validate_token(self, id_token, audience):
    # checking if id_token is properly signed by Google by using Google public key in jwk format
    # google public keys
    kid = jwt.get_unverified_header(id_token)['kid']
    jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
    optional_custom_headers = {"User-agent": "custom-user-agent"}
    jwks_client = jwt.PyJWKClient(jwks_url, headers=optional_custom_headers)
    public_key = jwks_client.get_signing_key(kid).key
    if public_key is None:
      raise Exception("Public key to verify the token was not found")
    try:
      decoded_token = jwt.decode(id_token, public_key, algorithms=["RS256"], audience=audience)
      if decoded_token['iss'] not in ["accounts.google.com", "https://accounts.google.com"]: # iss field - validates if the token is from Google
        raise Exception("Invalid token (unauthorized provider)")
      if audience not in [settings.IOS_CLIENT_ID, settings.ANDROID_CLIENT_ID, settings.WEB_CLIENT_ID]: # aud field
        raise Exception("Invalid token")
      user_info = {
        "email": decoded_token.get("email"),
        "username": decoded_token.get("name"),
        "picture": decoded_token.get("picture")
      }
      return user_info
    except jwt.ExpiredSignatureError: # exp claim field
      raise Exception("Token has expired")
    except jwt.InvalidSignatureError: # error with token's signature
      raise Exception("Invalid token(signature)")
    except jwt.InvalidAudienceError: # error with aud field
      raise Exception("Invalid token(audience)")
    