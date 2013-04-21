/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

Sarpaque.Foregrounds = {
	_activeForegrounds: {},
	_yearTops: {},
	_windowHeight: 0,
	
	/*** Initializer ***/
	
	init: function() {},
	
	/*** Sarpaque events ***/

	pageResized: function( windowHeight, windowWidth )
	{
		this._windowHeight = windowHeight;
	},
	
	scroll: function( scrollTop ) 
	{
		var cy = Sarpaque.YearsTape.getCurrentYear();
		var that = Sarpaque.Foregrounds;
				
		/* Check */
		if( that._activeForegrounds[cy] == undefined ) return;
		if( that._activeForegrounds[cy].length == 0 ) return;
		
		/* Iterate through foregrounds */
		var fEn;
		var relOffset;
		for( var i = 0; i < that._activeForegrounds[cy].length; i++ ) {
			fEn = that._activeForegrounds[cy][i];
			relOffset = Number( scrollTop + ( that._windowHeight / 2 ) - that._yearTops[cy] );
			if( fEn["startOffset"] > relOffset || fEn["endOffset"] < relOffset ) continue;
			jQuery( fEn["element"] ).css( "top", ( fEn["startOffset"] + fEn["endOffset"] - relOffset ) + "px" );
		}
	},
	
	yearLoaded: function( year ) 
	{
		var yEl = jQuery( "#year_" + year );
		var yHeight = Number( jQuery( yEl ).height() );
				
		/* Set year top */
		Sarpaque.Foregrounds._yearTops[year] = Number( jQuery( yEl ).offset().top );
		for( var y in Sarpaque.Foregrounds._yearTops ) {
			if( y <= year ) continue;
			Sarpaque.Foregrounds._yearTops[y] = Number( jQuery( "#year_" + y ).offset().top );
		}
	
		/* Set foregrounds */
		Sarpaque.Foregrounds._activeForegrounds[year] = [];
		jQuery( ".foreground", yEl ).each(
			function()
			{
				/* Create the foreground struct entry */
				var d = jQuery( this ).data();
				var fEl = {};
				if( d["startOffset"] > yHeight ) d["startOffset"] = 0;
				fEl["startOffset"] = Number( d["startOffset"] );
				if( yHeight < d["endOffset"] ) d["endOffset"] = 0;
				fEl["endOffset"] = yHeight - Number( d["endOffset"] );
				fEl["element"] = jQuery( this );
				Sarpaque.Foregrounds._activeForegrounds[year].push( fEl );
				
				/* Set initial position of the foreground */
				var initPosition = fEl["startOffset"];
				if( year > Sarpaque.YearsTape.getCurrentYear() ) initPosition = fEl["endOffset"];
				jQuery( this ).css( "top", fEl["endOffset"] + "px" );
			}
		);
	}
};
