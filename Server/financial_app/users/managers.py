from django.contrib.auth.base_user import BaseUserManager

class CustomUserManager(BaseUserManager):
  """
  Custom user model manager where email is the unique identifiers
  for authentication instead of usernames.
  """
  def create_user(self, username, email, password=None, **extra_kwargs):
    if not email:
      raise ValueError('The Email must be set')
    if not username:
      raise ValueError('The Username must be set')
    email = self.normalize_email(email)
    user = self.model(username=username, email=email, **extra_kwargs)
    user.set_password(password)
    user.save(using=self._db)
    return user
  
  def create_superuser(self, username, email, password, **extra_kwargs):
    extra_kwargs.setdefault("is_staff", True)
    extra_kwargs.setdefault("is_superuser", True)
    return self.create_user(email, username, password, **extra_kwargs)