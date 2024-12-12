from __future__ import annotations
from django.db import models
from django.conf import settings

class CompanyInfo(models.Model):
  website = models.URLField(null=True)
  country_from = models.CharField(max_length=100, null=True)
  city_from = models.CharField(max_length=100, null=True)
  fiftyDayAveragePrice = models.IntegerField(null=True)
  fiftyTwoWeekHighPrice = models.DecimalField(max_digits=15, decimal_places=3, null=True)
  fiftyTwoWeekLowPrice = models.DecimalField(max_digits=15, decimal_places=3, null=True)
  dividendRate = models.DecimalField(max_digits=15, decimal_places=3, null=True)

  def __str__(self):
    return f"{self.website}:{self.country_from}, {self.city_from}"

class Company(models.Model):
  name = models.CharField(max_length=100, blank=False)
  description = models.TextField(blank=True, null=True)
  sector = models.CharField(max_length=50, blank=True, null=True) # industry sector of the company
  ticker_symbol = models.CharField(max_length=20, blank=False, unique=True)
  logo = models.URLField(blank=True, null=True) # logo of the company
  market = models.CharField(max_length=50) # where the stock is listed
  sentiment = models.DecimalField(null=True, decimal_places=3, max_digits=4) # 0.982, 0.123 itd.
  info = models.ForeignKey(CompanyInfo, on_delete=models.CASCADE, related_name="belongs_to")

  def __str__(self) -> str:
    return f"{self.name}({self.ticker_symbol})"

class WatchList(models.Model):
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="watch_list") # User.watch_list.all()
  company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="watched_by") # Company.watched_by
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"User: {self.user} -> company: {self.company}"

class Portfolio(models.Model):
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="portfolio") # user.portfolio.all()
  total_value = models.DecimalField(max_digits=16, decimal_places=2) # current total value of portfolio (deposit money + assets value)
  created_at = models.DateTimeField(auto_now_add=True) # date of portfolio creation
  total_profit = models.DecimalField(max_digits=16, decimal_places=3, null=True)

  def __str__(self):
    return f"{self.total_value}:{self.total_profit}"

  def count_diff(self, curr_total_value): # curr_total_val is the current value of portfolio assets
    percent_diff = None
    relative_diff = None
    if curr_total_value < self.total_value:
      relative_diff = self.total_value - curr_total_value
      percent_diff = round(relative_diff / self.total_value, 2) * 100
      return {
        "percent_diff": f"-{percent_diff}",
        "relative_diff": f"-{relative_diff}"
      }
    else:
      relative_diff = curr_total_value - self.total_value
      percent_diff = round(relative_diff / self.total_value, 2) * 100
      return {
        "percent_diff": f"{percent_diff}",
        "relative_diff": f"{relative_diff}"
      }

class MarketData(models.Model):
  stock = models.ForeignKey(Company, on_delete=models.DO_NOTHING, related_name="price_data", blank=False) # TSLA.price_data.all()
  price = models.DecimalField(max_digits=15, decimal_places=3, blank=False) # current price per 1 quantity of stock
  volume = models.IntegerField(null=True, blank=True) # trading volume of the stock
  timestamp = models.DateTimeField(blank=False, auto_now_add=False, auto_now=False) # date of given stock price

  def __str__(self):
    return f"{self.timestamp}:{self.price}"

  def get_difference(self, market_data: MarketData): # marketData is the marketData from some period
    percent_diff = None
    relative_diff = None
    if self.price < market_data.price:
      relative_diff = market_data.price - self.price
      if self.timestamp < market_data.timestamp:
        percent_diff = f"{round((relative_diff / self.price) * 100, 2)}"
      else:
        percent_diff = f"-{round((relative_diff / market_data.price) * 100, 2)}"
    else:
      relative_diff = self.price - market_data.price
      if self.timestamp < market_data.timestamp:
        percent_diff = f"-{round((relative_diff / self.price) * 100, 2)}"
      else: # todays price is bigger than ago
        percent_diff = f"{round((relative_diff / market_data.price) * 100, 2)}"
    return {
      "percent_diff": percent_diff,
      "relative_diff": str(relative_diff)
    }

class Transaction(models.Model): # po kupnie/sprzedazy akcji
  TRANSACTION_CHOICES = [ # get_type_display()
    ('B', 'Buy'),
    ('S', 'Sell')
  ]
  stock = models.ForeignKey(Company, on_delete=models.CASCADE, blank=False) # stock id
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions", blank=False) # User.transactions.all(type='B')
  type = models.CharField(max_length=1, choices=TRANSACTION_CHOICES, null=False) # type of transaction
  quantity = models.DecimalField(blank=False, max_digits=150, decimal_places=10) # number of shares involved in transaction
  price = models.DecimalField(max_digits=18, decimal_places=3, blank=False) # price per share at the time of transaction
  timestamp = models.DateTimeField(auto_now_add=True) # date and time of transaction

  def get_whole_price(self):
    return self.price * self.quantity

  def count_diff(self, curr_price): # get difference between the data
    percent_diff = None
    relative_diff = None
    if curr_price < self.price:
      relative_diff = self.get_whole_price() - curr_price * self.quantity
      percent_diff = round((self.price - curr_price) / self.price, 2) * 100
      return {
        "percent_diff": f"-{percent_diff}",
        "relative_diff": f"-{relative_diff}"
      }
    else:
      relative_diff = curr_price * self.quantity - self.get_whole_price()
      percent_diff = round((curr_price - self.price) / self.price, 2) * 100
      return {
        "percent_diff": f"{percent_diff}",
        "relative_diff": f"{relative_diff}"
      }

class Article(models.Model):
  source_name = models.TextField(max_length=100, blank=False)
  source_id = models.CharField(null=True, blank=True, max_length=100)
  author = models.CharField(max_length=150, null=True)
  title = models.CharField(blank=False, max_length=250)
  description = models.TextField()
  url = models.URLField(blank=False)
  url_to_image = models.URLField(null=True, blank=True)
  published_at = models.DateTimeField(auto_now=False, auto_now_add=False, null=False)
  content = models.TextField()
  stock = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="articles", null=True) # TSLA.articles.all()

  def __str__(self):
    return f"{self.title}:{self.author}"

class Report(models.Model):
  company = models.ForeignKey(Company, on_delete=models.SET_NULL, related_name="reports", null=True) # TSLA.reports.all()
  timestamp = models.DateTimeField(max_length=100, null=False, auto_now_add=False, auto_now=False) # timestamp of report
  net_income = models.BigIntegerField(default=None, null=True)
  total_revenue = models.BigIntegerField(default=None, null=True)
  operating_income = models.BigIntegerField(default=None, null=True)

  def __str__(self) -> str:
    return f"{self.timestamp}: {self.net_income}"

  