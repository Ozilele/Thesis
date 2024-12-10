from typing import Any, Dict
from rest_framework import serializers, exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import AppUser

class AppUserSerializer(serializers.ModelSerializer):
  class Meta:
    model = AppUser
    fields = ["id", "password", "username", "email", "created_at"]
    extra_kwargs = {'password': {'write_only': True}, "created_at": { "read_only": True }}

  def create(self, validated_data): # from json to django object instance
    user = AppUser.objects.create_user(
      username=validated_data['username'],
      email=validated_data['email'],
      password=validated_data['password']
    )
    return user
    
  def to_representation(self, instance): # Conversion from django object model to JSON format(serialization)
    ret = super().to_representation(instance)
    ret.pop('password', None)
    return ret

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
  username_field = 'email' # email field should be contained in token 

  def validate(self, attrs: Dict[str, Any]): # overridden default validation method to customize authentication process(validating )
    credentials = {
      'email': attrs.get('email'),
      'password': attrs.get('password')
    }
    user = authenticate(**credentials) # attempt to authenticate user based on email and password
    if user:
      data = {}
      refresh = self.get_token(user)
      data['refresh'] = str(refresh)
      data['access'] = str(refresh.access_token)
      return data # return dictionary of tokens to client
    else:
      print("Auth failed")
      raise exceptions.AuthenticationFailed("Error authenticating the user")