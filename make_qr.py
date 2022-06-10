import pandas as pd
import qrcode
csv = pd.read_csv('20210520기준_서울시_노선현황.csv',
                names=['ROUTE_ID','노선명'])
for i in range(1,len(csv)+1):
    id2 = csv['ROUTE_ID'][i]
    id = csv['노선명'][i]
    url = "http://localhost:3000/busno/?id=" + id
    img = qrcode.make(url)
    img.save("./qrcode/"+id2+'_'+id+".png")
    print(id+"생성")