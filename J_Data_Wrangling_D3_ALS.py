# -*- coding: utf-8 -*-
"""
Created on Thu Mar 12 15:02:19 2020

@author: jghuynh
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

originalALSdf = pd.read_csv("C:\\Users\\jghuynh\\Documents\\Data_Visualization_360\\midterm-persimmon\\FireDepartmentCallsSelected.csv")
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
ALSdf2 = neighborSeries.to_frame().reset_index()
ALSdf = ALSdf.rename(columns= {0: 'Frequency', "Neighborhooods - Analysis Boundaries" :"Neighborhoods"})
ALSdf2 = ALSdf.rename(columns= {0: 'Frequency', "Neighborhooods - Analysis Boundaries" :"Neighborhoods"})

mergedDF = pd.merge(ALSdf, ALSdf2, how = "inner", on = ["Neighborhoods", "ALS Unit"])

oneLineMerged = mergedDF[mergedDF["ALS Unit"] != False]
# so now oneLineMerged is a dataframe with 1 row per neighborhood

temp = pd.merge(ALSdf, ALSdf2, how = "inner", on = ["Neighborhoods"])
tempMerged = temp[temp["ALS Unit_x"] == False]
tempMergedOneLine = tempMerged[temp["ALS Unit_y"] == True]

#temp.to_csv("temp.csv", encoding = "utf-8", index = False)
#tempMerged.to_csv("tempMerged.csv", encoding = "utf-8", index = False)


tempMergedOneLine = tempMergedOneLine.rename(columns = {"Frequency_x": "WithoutALSUnit","Frequency_y" : "WithALSUnit"})

# changing column names..
#oneLineMerged = oneLineMerged.rename(columns = {"Frequency_x": "WithALSUnit", "Frequency_y" : "WithoutALSUnit"})

# I want my columsn to be: Neighborhoods, WithALSUnit, WithoutALSUnit
tempMergedOneLine = tempMergedOneLine[["Neighborhoods", "WithALSUnit", "WithoutALSUnit"]]
tempMergedOneLine.to_csv("J_ALS_D3.csv", encoding = "utf-8", index = False)
values, freq = np.unique(ALSdf["ALS Unit"], return_counts = True)

#ALSdf.to_csv("J_ALS_D3.csv", encoding='utf-8', index=False)



#%%
plt.figure()
plt.bar(ALSdf["Neighborhoods"], ALSdf["Frequency"])