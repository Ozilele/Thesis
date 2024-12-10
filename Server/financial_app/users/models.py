from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager

class AppUser(AbstractBaseUser, PermissionsMixin):
  username = models.CharField(max_length=40, unique=True, blank=False)
  email = models.EmailField(_("email address"), unique=True, blank=False)
  created_at = models.DateTimeField(auto_now_add=True)
  is_staff = models.BooleanField(default=False)
  is_superuser = models.BooleanField(default=False)

  USERNAME_FIELD = "email" # unique indetifier for the User model
  REQUIRED_FIELDS = ["username"]
  objects = CustomUserManager() # all objects of the AppUser come from this manager

  def __str__(self) -> str:
    return f"{self.username}:{self.email}"
  