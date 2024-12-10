from django.contrib.auth.backends import ModelBackend
from django.http import HttpRequest
from .models import AppUser

class EmailAuthBackend(ModelBackend):
  def authenticate(self, request: HttpRequest=None, **kwargs):
    email = kwargs.get('email')
    password = kwargs.get('password')
    print("LOOL")
    if email is None or password is None:
      return None
    try:
      user = AppUser.objects.get(email=email)
    except AppUser.DoesNotExist:
      return None
    if user.check_password(password) is True:
      return user
    return None