from rest_framework import serializers, exceptions
from .models import CompanyInfo, Company, Portfolio, MarketData, Transaction, Article, Report

class CompanyInfoSerializer(serializers.ModelSerializer):
  class Meta:
    model = CompanyInfo
    fields = "__all__"

class CompanySerializer(serializers.ModelSerializer):
  class Meta:
    model = Company
    fields = '__all__'

  def validate_sentiment(self, sentiment):
    if sentiment < 0 and sentiment > 1:
      raise exceptions.ValidationError('Company sentiment must be between 0 and 1.')
    return sentiment

class PortfolioSerializer(serializers.ModelSerializer):
  class Meta:
    model = Portfolio 
    fields = '__all__'

class MarketDataSerializer(serializers.ModelSerializer):
  class Meta:
    model = MarketData
    fields = '__all__'
  
  def create(self, validated_data):
    return super().create(validated_data)
  
  def to_representation(self, instance):
    return super().to_representation(instance)
  
class TransactionSerializer(serializers.ModelSerializer):
  class Meta:
    model = Transaction
    fields = '__all__'
  
class ArticleSerializer(serializers.ModelSerializer):
  class Meta:
    model = Article
    fields = '__all__'

  def create(self, validated_data):
    return super().create(validated_data)
  
  def to_representation(self, instance):
    return super().to_representation(instance)
  
class ReportSerializer(serializers.ModelSerializer):
  class Meta:
    model = Report
    fields = '__all__'

  def create(self, validated_data):
    return super().create(validated_data)

  def to_representation(self, instance):
    return super().to_representation(instance)
  