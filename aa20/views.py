#
# This file is part of ALICE Anniversary 2013 website
# Author: George Lestaris (george.lestaris@cern.ch)
#
import json
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.template.loader import render_to_string
from aa20.models import Box, Year, Foreground
# debug
import pprint

# PERIODS (not nice!)
PERIODS = [
	{
		"class": "period-a",
		"label": "Setting the Stage",
		"years": range(1993, 1996)
	},
	{
		"class": "period-b",
		"label": "Designing a Heavy-Ion Experiment",
		"years": range(1996, 1999)
	},
	{
		"class": "period-c",
		"label": "Building ALICE",
		"years": range(1999, 2009)
	},
	{
		"class": "period-d",
		"label": "First Results",
		"years": range(2009, 2014)
	}
]

# Maximun box width (not nice as well...)
MAX_BOX_WIDTH = 420

def home( request ):
	context = {}
	
	perId = -1

	# Get data
	years = Year.objects.all()
	context["years"] = {}
	for y in years:
		if not y.published: # Skip a hidden year 
			continue

		# Get data
		leftBoxes = Box.objects.filter( year = y, direction = Box.DIR_LEFT ).order_by( "order" )
		for box in leftBoxes:
			if box.width > MAX_BOX_WIDTH:
				box.width = MAX_BOX_WIDTH
		rightBoxes = Box.objects.filter( year = y, direction = Box.DIR_RIGHT ).order_by( "order" )
		for box in rightBoxes:
			if box.width > MAX_BOX_WIDTH:
				box.width = MAX_BOX_WIDTH		
		foregrounds = Foreground.objects.filter( year = y )
		
		# Get all required images
		images = {
			"boxes": {},
			"foregrounds": {}
		}
		if y.backgroundImage:
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
				
		# Find the perade
		perChanged = False
		if perId == -1:
			perChanged = True
			perId = 0			
		while int(y.year) not in PERIODS[perId]["years"]:
			perId += 1
			perChanged = True
		if perId < len(PERIODS):
			per = PERIODS[perId]
		else:
			per = None

		# Set context entry
		context["years"][y.year] = {
			"year": y,
			"boxes": {
				"left": leftBoxes,
				"right": rightBoxes
			},
			"foregrounds": foregrounds,
			"images": images,
			"period": per,
			"periodChanged": perChanged,
			"imagesJSON": json.dumps( images )
		}
		
	return render( request, "home.html", context )

def get_year( request, year ):
	try:
		yearOb = Year.objects.get( year=year )

		if not year.published:
			return None

		# Get data
		leftBoxes = Box.objects.filter( year = yearOb, direction = Box.DIR_LEFT ).order_by( "order" )
		rightBoxes = Box.objects.filter( year = yearOb, direction = Box.DIR_RIGHT ).order_by( "order" )
		foregrounds = Foreground.objects.filter( year = yearOb )
		
		# Get all required images
		images = {
			"boxes": {},
			"foregrounds": {}
		}
		if yearOb.backgroundImage:
			images["background"] = yearOb.backgroundImage.url
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
		context["years"][yearOb.year] = {
			"year": yearOb,
			"boxes": {
				"left": leftBoxes,
				"right": rightBoxes
			},
			"foregrounds": foregrounds,
			"images": images,
			"imagesJSON": json.dumps( images )
		}		
	except:
		response=None		

	return HttpResponse(json.dumps(response), content_type="application/json")

def box_more( request, boxId ):
	try:
		box = Box.objects.get( id=boxId )
		return HttpResponse( box.readMoreHTML )
	except:
		return HttpResponseNotFound
