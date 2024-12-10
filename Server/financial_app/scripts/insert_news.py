import requests
import yfinance as yf

def run():
  # symbol = "AAPL"
  # response = requests.get(f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from=2024-10-10&token={token}")
  # token = "ct335epr01qkff7127d0ct335epr01qkff7127dg"
  # response = requests.get(f"https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={token}")
  # print(response.status_code)
  # if response.status_code == requests.codes.ok:
  #   data = response.json()
  #   print(data['logo'])
  symbol = "AMTM"
  ticker = yf.Ticker(ticker=symbol)
  print(ticker.info)
  historical_data = ticker.history(period="1mo", interval='1d')
  # 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BRK.B.png'
  print(historical_data)
  # info = yf.Ticker(ticker=symbol).info
  # exch = info.get('exchange')
  # market = info.get('market')
  # print(exch)
  # print(market)