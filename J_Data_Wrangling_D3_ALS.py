# -*- coding: utf-8 -*-
"""
Created on Thu Mar 12 15:02:19 2020

@author: jghuynh
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

originalALSdf = pd.read_csv("C:\\Users\\jghuynh\\Documents\\Data_Visualization_360\\midterm-persimmon\\FireDepartmentCallsSelected.csv")
print("Done!")
#%%

'''
Group by Neighborhooods - Analysis Boundaires
# maybe even change that column name

Count(# true in ALS Unit)
Count( # false in ALS Unit)

      
may be helpful
females = heartData.loc[heartData["Sex"]==1]
males = heartData.loc[heartData["Sex"]==0]

or 
hasALS = ALSpd.loc[ALSpd["ALS Unit"] == "TRUE"]
noALS = ALSpd.loc[ALSpd["ALS Unit"] == "FALSE"]

pd.DataFrame({'Neighborhoods': neighborSeries.index, "ALS": neighborSeries.values})

'''

neighborSeries = originalALSdf.groupby(["Neighborhooods - Analysis Boundaries", "ALS Unit"]).size()
#.groupby(level=0).size()#.agg({"Neighborhoods": "Count"})
## FRICK YES BABY!!!!

neighborSeriesOneLine = originalALSdf.groupby(["Neighborhooods - Analysis Boundaries", "ALS Unit"]).size().groupby(level=0).size()
ALSdf = neighborSeries.to_frame().reset_index()

ALSdf = ALSdf.rename(columns= {0: 'Frequency', "Neighborhooods - Analysis Boundaries" :"Neighborhoods"})
values, freq = np.unique(ALSdf["ALS Unit"], return_counts = True)

ALSdf.to_csv("J_ALS_D3.csv", encoding='utf-8', index=False)



#%%
plt.figure()
plt.bar(ALSdf["Neighborhoods"], ALSdf["Frequency"])