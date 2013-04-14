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
    url( r"^BoxMore/(?P<boxId>[0-9]+)/?$", "aa20.views.box_more", name = "/BoxMore" ),
    url( r"^AjaxAPI/Year/(?P<year>[0-9]+)/?$", "aa20.views.get_year", name = "/AjaxAPI/Year" ),
    # Administration endpoint
    url( r'^admin/', include(admin.site.urls)),
    # ckEditor
    url( r"^ckeditor/", include( "ckeditor.urls" ) )
)

# Media files on debug
if settings.DEBUG:
	urlpatterns += patterns( "", url( r"^media/(.*)", "django.views.static.serve", kwargs={ "document_root": settings.MEDIA_ROOT } ) )
