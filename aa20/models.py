#
# This file is part of ALICE Anniversary 2013 website
# Author: George Lestaris (george.lestaris@cern.ch)
#
from django.db import models
from aa20 import settings
from ckeditor.fields import RichTextField

class Year( models.Model ):
	year = models.IntegerField( primary_key = True )	
	published = models.BooleanField( default = 1, verbose_name = "Year is published" )
	backgroundImage = models.ImageField( upload_to = "year_backgrounds", null = True, blank = True, verbose_name = "Background image"  )
	additionalCSS = models.TextField( null = True, blank = True, verbose_name = "Additional CSS" )

	def __str__( self ):
		return "Year " + str( self.year )

class Box( models.Model ):
	class Meta:
		verbose_name_plural = "Boxes"

	# Location
	year = models.ForeignKey( Year )
	width = models.IntegerField()
	order = models.IntegerField()
	DIR_LEFT = "left"
	DIR_RIGHT = "right"
	DIRECTIONS = ( 
		( DIR_LEFT, "Left" ),
		( DIR_RIGHT, "Right" )
	)
	direction = models.CharField( max_length = 5, choices = DIRECTIONS, default = DIR_LEFT )
	
	# Shown content
	CT_HTML = "html"
	CT_IMAGE = "img"
	CONTENT_TYPES = (
		( CT_IMAGE, "Image" ),
		( CT_HTML, "HTML" )
	)
	contentType = models.CharField( max_length = 5, choices = CONTENT_TYPES, default = CT_IMAGE, verbose_name = "Content type"  )
	contentHTML = RichTextField( null = True, blank = True, verbose_name = "HTML content" )	
	contentImage = models.ImageField( upload_to = "box_photos", null = True, blank = True, verbose_name = "Image"  )
	contentImageLabel = models.CharField( max_length = 200, null = True, blank = True, verbose_name = "Image label" )

	# Read more
	RM_LINK = "link"
	RM_HTML = "html"
	READ_MORE_TYPES = (
		( RM_LINK, "Link" ),
		( RM_HTML, "HTML" )
	)
	readMoreType = models.CharField( max_length = 5, choices = READ_MORE_TYPES, default = RM_HTML )
	readMoreLink = models.CharField( max_length = 200, null = True, blank = True, verbose_name = "Read more link"  )
	readMoreHTML = RichTextField( null = True, blank = True, verbose_name = "Read more content" )
	
	# Additional box CSS
	additionalCSS = models.TextField( null = True, blank = True, verbose_name = "Additional CSS" )

	def __str__( self ):
		return "Box " + str( self.order ) + " for year " + str( self.year.year )

class Foreground( models.Model ):
	year = models.ForeignKey( Year )
	image = models.ImageField( upload_to = "foreground_photos" )
	width = models.IntegerField()
	startOffset = models.IntegerField( null = True, blank = True, verbose_name = "Start offset (from top)" )
	endOffset = models.IntegerField( null = True, blank = True, verbose_name = "End offset (from bottom)" )
	positionLeft = models.IntegerField( null = True, blank = True, verbose_name = "Offset from left" )
	positionRight = models.IntegerField( null = True, blank = True, verbose_name = "Offset from right" )	
	additionalCSS = models.TextField( null = True, blank = True, verbose_name = "Additional CSS" )
