from aa20.models import Box

def run():
	boxes = Box.objects.all()
	for b in boxes:
		fixBox( b )

def fixBox( box ):
	if box.contentType == "img":
		box.contentImage = resizeImage( box.contentImage, box.width )
	if box.contentHTML is not None
		and box.contentHTML != "":
		box.contentHTML = fixHTML( box.contentHTML )
	if box.readMoreHTML is not None
		and box.readMoreHTML != "":
		box.readMoreHTML = fixHTML( box.readMoreHTML )
	box.save()

def resizeImage( image, width ):
	return image

def fixHTML( content ):
	# Remove font tags
	# Remove unclosed and unopened tags
	# Remove style attributes


	# Create Tree
	inTag = False
	inTagContent = False
	currentTag = None
	rawBuffer = ""
	tagBuffer = ""
	tagContentBuffer = ""
	for i in range( 0, len( content ) ):		
		ch = content[i]
		if ( ch == "<" and inTag ) 
			or ( ch == ">" and not inTag ):
			raise Exception( "Syntax error: found < or > in invalid position " + str( i ) )
		elif ch == "<" and not inTag:
			inTag = True
			tagBuffer = ""
		elif ch == ">" and inTag:
			inTag = False
			inTagContent = True

			if tagBuffer[0] == "/":
				# Closing tag
				if tagBuffer[1:] != currentTag.name:
					raise Exception( "Tag " + currentTag.name + " not closed!" )

			try:
				tag = HTMLTag( tagBuffer )
			except Exception as ex:
				raise Exception( "Syntax error: " + str( ex ) )

			currentTag = tag
		elif inTag:
			tagBuffer += ch
		elif not inTag and currentTag == None:
			rawBuffer += ch
		elif not inTag and currentTag != None:
			tagContentBuffer += ch



	return content

class HTMLElement:
	def __init__( self, name ):
		self.name = name
		self.content = ""
		self.attributes = {}

	def addAttribute( self, name, value ):
		self.attributes[name] = value

	def setContent( self, content ):
		self.content = content

import re

"""
	Parses HTML structure: 
		<Tag attr1="value1" attr2="value2" attr3>
			... content ...
		</Tag>
	where content does not contain any tags.
"""
def parseSingleElement( content ):
	m = re.search( "^\s*<([^>]*)>([^<]*)</([^>]*)>\s*$", content )
	if m is None:
		return None
	tagRaw = m.group( 1 )
	tagContents = m.group( 2 )
	
	# check tag
	m2 = re.search( "^([^\s]*)\s*(.*)\s*$", tagRaw )
	tagName = m2.group( 1 )
	if tagName != m.group( 3 ):
		return None

	# get attributes
	attrsRaw = m2.group( 2 ).strip()
	attrsRaw = re.sub( "\s*=\s*", "=", attrsRaw )
	attrsParts = attrsRaw.split()
	attrs = {}
	for p in attrsParts:
		m3 = re.search( "([^=]*)=[\"'](.*)[\"']", p )
		if m3 is None:
			attrs[p] = True
		else:
			attrs[m3.group( 1 )] = m3.group( 2 )

	# create element
	el = HTMLElement( tagName )
	for k in attrs:
		el.addAttribute( k, attrs[k] )	
	el.setContent( tagContents )
	
	return el

content = "<tag hello = \"world\" of=\'php\' attr \t>My con\tteng</tag>"
el = parseSingleElement( content )
import pprint
pprint.pprint( el.__dict__ )


# class HTMLElement:
# 	def __init__( self, buffer ):
# 		parts = string.split( buffer )
# 		self.name = parts[0]
# 		for p in parts:
# 			if p.

# class HTMLRaw:
# 	def __init__( self, content ):
# 		self.content = content

