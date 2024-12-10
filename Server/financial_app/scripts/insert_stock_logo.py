import requests
import pandas as pd
import csv
import time
from stocks.models import Company

# ticker_list = ["AAPL", "GOGL", "MSFT", "INTC", "TSLA", "NVDA", "AMD", "AMZN"]
other_ticker_list = ["GOOG", "META", "ORCL", "WMT", "JPM", "NFLX", "KO", "PEP", "MCD", "IBM", "GS", "DIS", "TSM", "ASML", "CSCO", "ADBE", "QCOM", "ARM", "DELL", "UBER", "PFE", "BLK", "AMAT", "NKE", "BX", "MA", "V"]

def run():
  start = time.time()
  file_path = "s&p500_data_db.csv"
  df = pd.read_csv(file_path, header=None, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
  sp_tickers = list(df.iloc[425:473, 3])
  print(f"Tickers length is {len(sp_tickers)}")
  print(f"First ticker is {sp_tickers[0]}")
  print(f"Last ticker is {sp_tickers[len(sp_tickers) - 1]}")

  token = "ct335epr01qkff7127d0ct335epr01qkff7127dg"
  for ticker in sp_tickers:
    response = requests.get(f"https://finnhub.io/api/v1/stock/profile2?symbol={ticker}&token={token}")
    if response.status_code == requests.codes.ok:
      data = response.json()
      if 'logo' in data:
        logo_url = data['logo']
        company = Company.objects.get(ticker_symbol=ticker)
        company.logo = logo_url
        company.save()
      else:
        print(f"No image for ticker: {ticker}")
    else:
      print(f"Error: {response.status_code}")
  print(f"Done it took {time.time() - start} seconds")

  # for ticker in sp_tickers:
  #   response = requests.get(f"https://api.api-ninjas.com/v1/logo?ticker={ticker}", headers={'X-Api-Key': 'Uo9/613njIeM2vNDS2Bctg==jXydRCkVTMHubWwo'})
  #   if response.status_code == requests.codes.ok:
  #     data = response.json()
  #     if data == []:
  #       print(f"No logo found for {ticker}")
  #       continue
  #     if 'image' in data[0]:
  #       logo_url = data[0]['image']
  #       company = Company.objects.get(ticker_symbol=ticker)
  #       company.logo = logo_url
  #       company.save()
  #     else:
  #       print(f"No image for ticker: {ticker}")
  #   else:
  #     print(f"Error: {response.status_code}")