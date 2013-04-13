#
# This file is part of ALICE Anniversary 2013 website
# Author: George Lestaris (george.lestaris@cern.ch)
#

from django.conf.urls import patterns, include, url
from aa20 import settings

# Administration
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns( "",    
    url( r"^$", "aa20.views.home", name = "/Home" ),
    # Administration endpoint
    url( r'^admin/', include(admin.site.urls)),
    # ckEditor
    ( r"^ckeditor/", include( "ckeditor.urls" ) )
)
