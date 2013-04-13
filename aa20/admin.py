#
# This file is part of ALICE Anniversary 2013 website
# Author: George Lestaris (george.lestaris@cern.ch)
#

from django.contrib import admin
from aa20.models import Year, Box, Foreground

class YearsAdmin( admin.ModelAdmin ):
    list_filter = [ "published" ]
    list_display = [ "year", "published" ]
admin.site.register( Year, YearsAdmin )

class BoxesAdmin( admin.ModelAdmin ):
    list_filter = [ "year", "contentType", "direction" ]
    list_display = [ "year", "contentType", "direction", "order" ]
admin.site.register( Box, BoxesAdmin )

class ForegroundsAdmin( admin.ModelAdmin ):
	list_filter = [ "year" ]
	list_display = [ "year" ]
	pass
admin.site.register( Foreground, ForegroundsAdmin )
