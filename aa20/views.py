#
# This file is part of ALICE Anniversary 2013 website
# Author: George Lestaris (george.lestaris@cern.ch)
#
from django.http import HttpResponse
from django.shortcuts import render
from aa20.models import Box, Year, Foreground
import json
# debug
import pprint

def home( request ):
	context = {}

	# Get data
	years = Year.objects.all()
	context["years"] = {}
	for y in years:
		if not y.published: # Skip a hidden year 
			continue

		# Get data
		leftBoxes = Box.objects.filter( year = y, direction = Box.DIR_LEFT ).order_by( "order" )
		rightBoxes = Box.objects.filter( year = y, direction = Box.DIR_RIGHT ).order_by( "order" )
		foregrounds = Foreground.objects.filter( year = y )
		
		# Get all required images
		images = {
			"boxes": {},
			"foregrounds": {}
		}
		if y.backgroundImage:
			pprint.pprint( y.backgroundImage.url )
			images["background"] = y.backgroundImage.url
		for box in leftBoxes:
			if box.contentType == Box.CT_IMAGE \
				and box.contentImage:
				images["boxes"][box.id] = box.contentImage.url
		for box in rightBoxes:
			if box.contentType == Box.CT_IMAGE \
				and box.contentImage:
				images["boxes"][box.id] = box.contentImage.url
		for fg in foregrounds:
			if fg.image:
				images["foregrounds"][fg.id] = fg.image.url

		# Set context entry
		context["years"][y.year] = {
			"year": y,
			"boxes": {
				"left": leftBoxes,
				"right": rightBoxes
			},
			"foregrounds": foregrounds,
			"images": images,
			"imagesJSON": json.dumps( images )
		}

	return render( request, "home.html", context )
