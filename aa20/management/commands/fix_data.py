#
# This file is part of ALICE Anniversary 2013 website
# Author: George Lestaris (george.lestaris@cern.ch)
#
import sys
import re
import math
import Image
import HTMLParser
from types import *
from optparse import make_option
from django.core.management.base import BaseCommand, CommandError
from aa20 import settings
from aa20.models import Box, Year
# Debug
import pprint

####################################################################################################
# TODO List
# 
#	* If a box becomes bigger while on a resized image, this script will not fix the issue
####################################################################################################

####################################################################################################
# Constants
####################################################################################################

ALLOWED_HTML_TAGS = ["a", "abbr", "address", "blockquote", "b", "br",
	"caption", "cite", "code", "dd", "dt", "dl", "div", 
	"em", "embed", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6",
	"hr", "i", "img", "li", "ol", "p", "span", "strong", "sub",
	"sup", "table", "tr", "td", "tbody", "thead", "tfoot", "u", "ul", "iframe", "big", "small" ] 
	# "pre", 
ALLOWED_HTML_TAGS_STRICT = ALLOWED_HTML_TAGS
TRANSFORM_TAGS = {
	"i": "em",
	"b": "strong",
	"big": "span",
	"small": "span"
}
TAG_ATTRIBUTES = {
	"a": ["href", "title", "target"],
	"img": ["src", "alt", "width", "style", "height", "align", "border", "halign", "hspace", "vspace"],
	"embed": "*",
	"object": "*",
	"iframe": "*"
}
BACKGROUND_WIDTH = 1920

####################################################################################################
# Interface
####################################################################################################
VERBO_IMP = 0
VERBO_NORM = 1
VERBO_LOW = 2
VERBO_DEBUG = 3

class Command(BaseCommand):
	option_list = BaseCommand.option_list \
		+ ( make_option("-b", "--boxes", action="append", dest="boxId", type="int",
        		help="Box id to process"),
        	make_option("-y", "--years", action="append", dest="yearId", type="int",
        		help="Year to process") )
	help = "Cleans HTML in boxes, resizes box images to optimize their size and resizes background images"

	def __init__(self, *args, **kwargs):
		BaseCommand.__init__(self, *args, **kwargs)
		
		# Create cleaners
		self.readMoreCleaner = HTMLCleaner()
		self.contentCleaner = HTMLCleaner()
		
		for tag in ALLOWED_HTML_TAGS:
			attributes = []
			if tag in TAG_ATTRIBUTES:
				attributes = TAG_ATTRIBUTES[tag]
			self.readMoreCleaner.addAllowedTag(tag, attributes)

		for tag in ALLOWED_HTML_TAGS_STRICT:
			attributes = []
			if tag in TAG_ATTRIBUTES:
				attributes = TAG_ATTRIBUTES[tag]
			self.contentCleaner.addAllowedTag(tag, attributes)

		for key, value in TRANSFORM_TAGS.items():
			self.contentCleaner.addTransformationRule(key, value)
			self.readMoreCleaner.addTransformationRule(key, value)

	def handle(self, *args, **options):
		# Parse command line
		if "verbosity" in options: self.maxVerbosity = int(options["verbosity"])
		else: self.maxVerbosity = VERBO_NORM		
		
		# Get boxes and years
		boxes = self._getBoxes(options["boxId"])
		years = self._getYears(options["yearId"])
		
		# Iterate through boxes	
		for b in boxes:
			self.logMsg("===============================================================================================")
			if b.contentType == Box.CT_HTML:
				self.logMsg("HTML based box", box=b)
				self.handleHTMLBox(b)
			else:
				self.logMsg("Image based box", box=b)
				self.handleImageBox(b)
			if b.readMoreHTML is not None:
				self.handleHTMLReadMore(b)
			self.logMsg("===============================================================================================")
			self.logMsg("")

		# Iterate through years	
		for y in years:
			self.logMsg("===============================================================================================")
			self.logMsg("Processing year " + str(y.year))
			self.handleYear(y)
			self.logMsg("===============================================================================================")
			self.logMsg("")			

	### Handlers

	def handleYear(self, year):
		newImgName = self.resizeImage(year.backgroundImage.path, BACKGROUND_WIDTH)
		if newImgName is not None:			
			self.logMsg("Background for year " + str(year.year) + " was resized: " + newImgName, verbo=VERBO_NORM)
			year.backgroundImage.name = newImgName
			year.save()

	def handleHTMLReadMore(self, box):		
		self.readMoreCleaner.reset()
		self.readMoreCleaner.feed(box.readMoreHTML)
		newHTML = self.readMoreCleaner.getCleanHTML()
		if box.readMoreHTML != newHTML:
			self.logMsg("Read more HTML changed", verbo=VERBO_NORM, box=box)
			box.readMoreHTML = newHTML
			box.save()
	
	def handleHTMLBox(self, box):
		self.contentCleaner.reset()
		self.contentCleaner.feed(box.contentHTML)
		newHTML = self.contentCleaner.getCleanHTML()
		if box.readMoreHTML != newHTML:
			self.logMsg("Content HTML changed", verbo=VERBO_NORM, box=box)
			box.contentHTML = newHTML
			box.save()

	def handleImageBox(self, box):		
		newImgName = self.resizeImage(box.contentImage.path, box.width)		
		if newImgName is not None:			
			self.logMsg("Image was resized: " + newImgName, verbo=VERBO_NORM, box=box)
			box.contentImage.name = newImgName
			box.save()

	### Library

	def resizeImage(self, imgPath, maxWidth):
		try:
			im = Image.open(imgPath)
		
			# check width
			imgWidth, imgHeight = im.size
			if imgWidth <= maxWidth:
				return None

			# get ratio
			ratio = float(imgWidth)/float(imgHeight)
			newWidth = maxWidth
			newHeight = int(math.ceil(float(newWidth)/ratio))

			# create new, resized, image
			newImage = im.resize((newWidth, newHeight), Image.ANTIALIAS)
		except Exception as ex:
			raise CommandError("Failed to resize image " + imgPath + ":" + str(ex))

		# get old image path and filename
		m = re.match(r"(.*)/([^/]*)\.(jpg|jpeg|png|gif|bmp)$", imgPath)
		if m is None:
			raise CommandError("Path " + imgPath + " does not seem to be right...")
		dirPath = m.group(1)
		imgFilename = m.group(2)
		imgType = m.group(3)
		
		# get the new image filename
		m = re.match("^(.*)_resized_([0-9]+)x([0-9]+)", imgFilename)
		if m is not None:
			newFileName = m.group(1) + "_resized_" + str(newWidth) + "x" + str(newHeight)
		else:
			newFileName = imgFilename + "_resized_" + str(newWidth) + "x" + str(newHeight)
		newFileName += "." + imgType

		# save image
		try:
			newImage.save(dirPath + "/" + newFileName)			
		except Exception as ex:
			raise CommandError("Failed to store image: " + dirPath + "/" + newFileName + ": " + str(ex))

		# set the new path to the database
		newImgName = dirPath.replace(settings.MEDIA_ROOT, "") + "/" + newFileName		
		return newImgName

	### Logger

	def logMsg(self, msg, verbo=VERBO_DEBUG, box=None):
		if box is not None:
			msg = "[BOX " + str(box.id) + "] " + msg
		if self.maxVerbosity >= verbo:
			sys.stdout.write(msg + "\n")

	### Private methods

	def _getBoxes(self, argBoxIds=[]):
		if(argBoxIds is not None and len(argBoxIds) > 0):
			boxes = []
			for boxId in argBoxIds:
				try:
					box = Box.objects.get(id=boxId)
				except:
					raise CommandError("Failed to find requested box " + str(boxId))
				boxes.append(box)
		else:
			boxes = Box.objects.all()
			self.logMsg("Found " + str(len(boxes)) + " boxes!", verbo=VERBO_NORM)
		return boxes

	def _getYears(self, argYearIds=[]):
		if(argYearIds is not None and len(argYearIds) > 0):
			years = []
			for yearId in argYearIds:
				try:
					year = Year.objects.get(year=yearId)
				except:
					raise CommandError("Failed to find requested year " + str(yearId))
				boxes.append(year)
		else:
			years = Year.objects.all()
			self.logMsg("Found " + str(len(years)) + " years!", verbo=VERBO_NORM)
		return years

####################################################################################################
# HTML Parser
####################################################################################################

class HTMLCleaner(HTMLParser.HTMLParser):
	def __init__(self):
		HTMLParser.HTMLParser.__init__(self)
		self.cleanHTML = ""
		self.allowedTags = {}
		self.transformationRules = {}
		self.levelsOfNotRecording = 0

	### Configuration

	def addAllowedTag(self, tag, allowedAttributes="*"):
		self.allowedTags[tag] = allowedAttributes # * or [...]

	def addTransformationRule(self, fromTag, toTag):
		self.transformationRules[fromTag] = toTag

	### Results

	def reset(self):
		HTMLParser.HTMLParser.reset(self)
		self.cleanHTML = ""

	def getCleanHTML(self):
		return self.cleanHTML

	### Handlers

	def handle_starttag(self, tag, attrs):
		if tag not in self.allowedTags:
			self.levelsOfNotRecording += 1
		elif self.levelsOfNotRecording == 0:
			self.cleanHTML += "<" + self._getRealTagName(tag)
			# Add atributes
			realAttrs = self._getRealAttrs(tag, attrs)
			for key, value in realAttrs.items():
				self.cleanHTML += " " + key + "=\"" + str(value) + "\""
			self.cleanHTML += ">"

	def handle_data(self, data):
		if self.levelsOfNotRecording == 0:
			self.cleanHTML += data

	def handle_entityref(self, name):
		if self.levelsOfNotRecording == 0:
			self.cleanHTML += "&" + name + ";"

	def handle_charref(self, name):
		if self.levelsOfNotRecording == 0:
			self.cleanHTML += "&#" + str(name) + ";"

	def handle_endtag(self, tag):
		if self.levelsOfNotRecording == 0:			
			self.cleanHTML += "</" + self._getRealTagName(tag) + ">"
		elif tag not in self.allowedTags:
			self.levelsOfNotRecording -= 1

	### Helpers

	def _getRealTagName(self, tag):		
		realTag = tag
		if tag in self.transformationRules:
			realTag = self.transformationRules[tag]
		return realTag

	def _getRealAttrs(self, tag, attrs):
		if tag not in self.allowedTags:
			return None
		realAttrs = {}
		for key, value in attrs:
			if (type(self.allowedTags[tag]) is StringType and self.allowedTags[tag] == "*") \
				or (type(self.allowedTags[tag]) is ListType and key in self.allowedTags[tag]):
				realAttrs[key] = value
		return realAttrs
