# -*- coding: utf-8 -*-
"""
Created on Sat Feb 29 11:16:05 2020

@author: jghuynh
"""

import pandas as pd

mySFFirePD = pd.read_csv("C:\\Users\\jghuynh\\Downloads\\Fire_Department_Calls_for_Service (2).csv")

#%%
#SFFireSelectedCols = mySFFirePD[mySFFirePD.Call_Date == "%d%d2019"]
SFFireSelectedCols = mySFFirePD.loc[:, ["Call Type", "Call Date","Received DtTm", 
    "Dispatch DtTm", "Response DtTm", "On Scene DtTm", "Station Area", "ALS Unit",
    "Call Type Group", "Unit Type", "Location", "Neighborhooods - Analysis Boundaries"]]
#SFFireSelectedCols = SFFireSelectedCols[(SFFireSelectedCols["Call Date"] >  "01/01/2019") & 
#    (SFFireSelectedCols["Call Date"] < "12/31/2019")]
SFFireSelectedCols.to_csv("FireDepartmentCallsSelected.csv", encoding='utf-8', index=False)