from django.urls import path
from .views import StocksView, PortfolioView, CompanyArticleViewList, CompanyReportViewList, StockPricesDataView, StocksRandomViewList, StocksMoversView, WatchListView

urlpatterns = [
  path("", StocksView.as_view(), name="stocks-list"), # list all stocks
  path("top-changes/", StocksMoversView.as_view(), name="stocks-top-changes"), # ok
  path("random/", StocksRandomViewList.as_view(), name="random-market"), # ok
  path("<str:ticker>/", StocksView.as_view(), name="stock-detail"), # ok
  path("prices/<str:ticker>/", StockPricesDataView.as_view(), name="single-stock-prices"), # ok
  path("watchlist/", WatchListView.as_view(), name="watch-list"), # test
  path("portfolio/", PortfolioView.as_view(), name="portfolio"),
  path("articles/<int:company_id>", CompanyArticleViewList.as_view(), name="company-articles"),
  path("reports/<int:company_id>", CompanyReportViewList.as_view(), name="company-reports"), # ok 
]
