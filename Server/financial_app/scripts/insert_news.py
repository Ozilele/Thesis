import requests
import yfinance as yf

def run():
  # Finhub API Company News - https://finnhub.io/docs/api/company-news
  # List latest company news by symbol. This endpoint is only available for North American companies.
  # 1 year of historical news and new updates

  symbol = "AAPL"
  token = "ct335epr01qkff7127d0ct335epr01qkff7127dg"
  from_date = "2024-11-10"
  to_date = "2024-11-20"
  response = requests.get(f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={from_date}&to={to_date}&token={token}")
  # response = requests.get(f"https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={token}")
  print(response.status_code)
  if response.status_code == requests.codes.ok:
    data = response.json()
    print(data)
  # symbol = "AMTM"
  # ticker = yf.Ticker(ticker=symbol)
  # print(ticker.info)
  # historical_data = ticker.history(period="1mo", interval='1d')
  # 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BRK.B.png'
  # print(historical_data)
  # info = yf.Ticker(ticker=symbol).info
  # exch = info.get('exchange')
  # market = info.get('market')
  # print(exch)
  # print(market)