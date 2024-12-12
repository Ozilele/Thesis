from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from .serializers import CompanySerializer, TransactionSerializer, MarketDataSerializer, ArticleSerializer, ReportSerializer, CompanyInfoSerializer, WatchListSerializer
from .models import Company, Portfolio, MarketData, Transaction, Article, Report, WatchList
from datetime import datetime
from django.utils.timezone import make_aware
import yfinance as yf
import numpy as np
import heapq
import pytz
from rest_framework_simplejwt.authentication import JWTAuthentication

class StocksView(APIView):
  permission_classes = [IsAuthenticated]

  def get_object(self, pk, isInfoNeeded):
    try:
      if isInfoNeeded:
        return Company.objects.select_related("info").get(ticker_symbol=pk)
      else:
        return Company.objects.get(ticker_symbol=pk)
    except Company.DoesNotExist:
      return Response({"error": f"Stock {pk} was not found"}, status=status.HTTP_400_BAD_REQUEST)
  
  def get(self, request, ticker=None):
    if ticker: # return view for single stock
      company = self.get_object(ticker, isInfoNeeded=True)
      company_serializer = CompanySerializer(company)
      company_info_serializer = CompanyInfoSerializer(company.info)
      return Response({
        "company": company_serializer.data,
        "companyInfo": company_info_serializer.data
      }, status=status.HTTP_200_OK)
    else:
      stocks = Company.objects.all()
      serializer = CompanySerializer(stocks, many=True)
      return Response(serializer.data, status=status.HTTP_200_OK)   
    
  def post(self, request):
    serializer = CompanySerializer(data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
  def put(self, request, ticker=None): # update instance, for example logo, description, sector
    if ticker:
      company = self.get_object(ticker, isInfoNeeded=False)
      # logoURL = request.data['logo']
      serializer = CompanySerializer(company, data=request.data, partial=True) # self.update()
      if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StocksRandomViewList(APIView):
  authentication_classes = [JWTAuthentication]
  permission_classes = [IsAuthenticated]

  def get(self, request):
    random_count = int(request.query_params.get("count")) or 4
    all_stocks = list(Company.objects.all())
    random_ids = np.random.choice(len(all_stocks), random_count, replace=False)
    random_stocks = {}
    for id in random_ids:
      company = all_stocks[id]
      market_data = list(MarketData.objects.filter(stock=company.id).order_by("-timestamp")[:2]) # desc by timestamp and 2 record
      # get change between 2 days
      difference_data = market_data[0].get_difference(market_data[1]) # 1 day diff
      random_stocks[company.name] = {
        "ticker": company.ticker_symbol,
        "logo": company.logo,
        "currPrice": MarketDataSerializer(market_data[0]).data,
        "difference": difference_data
      }
    return Response({
      "data": random_stocks,
    }, status=status.HTTP_200_OK)

class StocksMoversView(generics.ListAPIView):
  queryset = Company.objects.all()
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    move_option = self.request.query_params.get("type") # decrease or increase
    limit = int(self.request.query_params.get("limit")) or None
    companies = list(Company.objects.all())
    movers = []
    for company in companies:
      day_yesterday_data = list(MarketData.objects.filter(stock=company.id).order_by('-timestamp')[:2])
      diff_data = day_yesterday_data[0].get_difference(day_yesterday_data[1])
      serialized_company = CompanySerializer(company).data
      serialized_company.pop("description")
      serialized_company.pop("sentiment")
      serialized_company.pop("info")
      movers.append({
        "relative_diff": float(diff_data['relative_diff']),
        "percent_change": float(diff_data['percent_diff']),
        "company": serialized_company,
        "curr_price": day_yesterday_data[0].price
      })
    if move_option == "increase":
      if limit is None: # Whole list of movers - max 20 biggest increases
        movers = heapq.nlargest(20, movers, key=lambda x: x['percent_change'])
      else:
        movers = heapq.nlargest(limit, movers, key=lambda x: x['percent_change']) # nlogk - k wysokosc kopca, kopiec minimalny
    elif move_option == "decrease":
      if limit is None:
        movers = heapq.nsmallest(20, movers, key=lambda x: x['percent_change'])
      else:
        movers = heapq.nsmallest(limit, movers, key=lambda x: x['percent_change'])
    return movers

  def list(self, request, *args, **kwargs):
    stock_movers = self.get_queryset()
    return Response({
      "movers": stock_movers
    }, status=status.HTTP_200_OK)
    
class StockPricesDataView(APIView):
  permission_classes = [IsAuthenticated]

  def get(self, request, ticker=None): # get prices for single stock from given period
    stock_price_period = request.query_params.get("from_date")
    if ticker:
      try:
        company = Company.objects.get(ticker_symbol=ticker)
        from_timestamp = datetime.strptime(stock_price_period, "%Y-%m-%d")
        from_timestamp_dt = make_aware(from_timestamp, pytz.UTC)
        stock_market_data = list(company.price_data.filter(timestamp__gte=from_timestamp_dt).order_by('timestamp'))
        stock_price_change = stock_market_data[len(stock_market_data) - 1].get_difference(stock_market_data[0]) # diff between latest and oldest given timestamp
        if len(stock_market_data) > 0:
          return Response({
            "stock_prices": MarketDataSerializer(stock_market_data, many=True).data,
            "stock_percent_diff": stock_price_change['percent_diff'],
            "stock_relative_diff": stock_price_change['relative_diff']
          }, status=status.HTTP_200_OK)
        return Response({
          "info": f"Stock prices unavailable for ticker: {ticker}"
        }, status=status.HTTP_200_OK)
      except Company.DoesNotExist:
        return Response({"error": f"Stock of this ticker: {ticker} was not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"info": "Stock ticker is required to get the price data"}, status=status.HTTP_404_NOT_FOUND)

  def post(self, request, ticker=None): # post market_data for given stock
    if ticker:
      try:
        company = Company.objects.get(ticker_symbol=ticker)
        serializer = MarketDataSerializer(data=request.data)
        if serializer.is_valid():
          serializer.save(stock=company.id)
          return Response(serializer.data, status=status.HTTP_201_CREATED)
      except Company.DoesNotExist:
        return Response({"error": "Unable to post the data for company"}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"error": "Unable to post the data for company(ticker is required)"}, status=status.HTTP_400_BAD_REQUEST)
    
class PortfolioView(generics.ListAPIView): # get portfolio assets for given user
  queryset = Portfolio.objects.all()
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    curr_user = self.request.user
    user_portfolio = Portfolio.objects.get(user=curr_user)
    portfolio_assets = curr_user.transactions.filter(type='B') # get assets bought by user
    assets_curr_value = 0
    for asset in portfolio_assets:
      assets_curr_value += asset.get_whole_price()
    portfolio_change = user_portfolio.count_diff(assets_curr_value)
    user_portfolio.total_value = assets_curr_value
    user_portfolio.save() # save total portfolio value with all assets prices updated
    return {
      "assets": portfolio_assets,
      "portfolio_total_value": assets_curr_value,
      'percent_diff': portfolio_change['percent_diff'],
      'relative_diff': portfolio_change['relative_diff']
    }

  def list(self, request, *args, **kwargs): # list all portfolio stocks
    portfolio_dict = self.get_queryset()
    return Response({
      "assets": TransactionSerializer(portfolio_dict['assets'], many=True).data,
      'total_value': portfolio_dict['portfolio_total_value'],
      'percent_diff': portfolio_dict['percent_diff'],
      'relative_diff': portfolio_dict['relative_diff']
    }, status=status.HTTP_200_OK)
  
class TransactionView(APIView):
  permission_classes = [IsAuthenticated]

  def get(self, request):
    user = self.request.user
    all_user_transactions = Transaction.objects.filter(user=user) # wszystkie transakcje 
    portfolio = Portfolio.objects.get(user=user)
    return Response(portfolio)
    # for transaction in all_user_transactions:
    #   # transaction -> single Transaction
    # return transaction

class CompanyArticleViewList(generics.ListCreateAPIView): # get all articles for given company, and create
  queryset = Article.objects.all()
  permission_classes = [IsAuthenticated]
  serializer_class = ArticleSerializer
  
  def get_queryset(self):
    company_id = self.kwargs.get('company_id')
    company_articles = Article.objects.filter(stock=company_id)
    return company_articles

  def perform_create(self, serializer):
    company = self.kwargs.get('company_id')
    if serializer.is_valid() and company is not None:
      serializer.save(stock=company)
    else:
      print(serializer.errors)
      raise ValidationError("Unable to create article for given company: (company id is required)")
    
class CompanyReportViewList(generics.ListCreateAPIView): # get all reports for given company and create report
  queryset = Report.objects.all()
  permission_classes = [IsAuthenticated]
  serializer_class = ReportSerializer

  def get_queryset(self):
    company = self.kwargs.get('company_id')
    company_reports = Report.objects.filter(company=company)
    return company_reports
  
  def perform_create(self, serializer):
    company = self.kwargs.get('company_id')  
    if serializer.is_valid() and company is not None:
      serializer.save(company=company)  
    else:
      print(serializer.errors)
      raise ValidationError("Unable to create report for given company: (company id is required)")

class WatchListView(APIView):
  authentication_classes = [JWTAuthentication]
  permission_classes = [IsAuthenticated]
  """
  List all companies watched by user, save company to watchlist, delete company from watchlist
  """
  def get(self, request): 
    user = self.request.user
    if user:
      watchlist = WatchList.objects.select_related('company').filter(user=user)
      companies_serializer = CompanySerializer(watchlist.company, many=True)
      return Response({
        "companies": companies_serializer.data,
      }, status=status.HTTP_200_OK)
    return Response({ "error": "Not able to get watchlist for given user" }, status=status.HTTP_400_BAD_REQUEST)
  
  def post(self, request):
    user = self.request.user
    serializer = WatchListSerializer(data=request.data)
    if serializer.is_valid() and user:
      serializer.save(user=user)
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  def delete(self, request):
    company_id = request.query_params.get("companyId")
    user = self.request.user
    if company_id and user:
      watched_company = WatchList.objects.filter(user=user).get(company=company_id)
      watched_company.delete()
      return Response(status=status.HTTP_204_NO_CONTENT)
    return Response({ "error": "Unable to delete company from watchlist" }, status=status.HTTP_400_BAD_REQUEST)