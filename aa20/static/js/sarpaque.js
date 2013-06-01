/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

var Sarpaque = {
	/*** Initializer ***/

	init: function()
	{		
		/* Setup load config flags */
		var qd = Sarpaque._getQueryDict();
		if( qd["load_backgrounds"] != undefined )
			SarpaqueConfig["loadBackgrounds"] = ( qd["load_backgrounds"] == "true" );
		if( qd["load_foregrounds"] != undefined )
			SarpaqueConfig["loadForegrounds"] = ( qd["load_foregrounds"] == "true" );
		
		/* Sarpaque modules */
		Sarpaque.Loader.init();
		Sarpaque.Modal.init();
		Sarpaque.YearsTape.init();
		Sarpaque.Foregrounds.init();
		
		/* Setup resize event */
		jQuery( window ).resize( Sarpaque.pageResized );
		jQuery( "body" ).resize( Sarpaque.pageResized );
		Sarpaque.pageResized();		
		/* Setup scroll event */
		jQuery( window ).scroll( Sarpaque.scroll );
		Sarpaque.scroll();
		
		/* Setup modal handler */
		jQuery( "a.show-modal" ).click( 
			function( e ) 
			{
				e.preventDefault();
				Sarpaque.Modal.showURL( jQuery( this ).attr( "href" ) );
			} 
		);
		
		/* Load first 3 years */
		for( var i = 0; i < 3; i++ ) {
			Sarpaque.TimeLine.loadYear( SarpaqueConfig.timelineData.years[i] );	
		}		
	},
	
	/*** Sarpaque events ***/

	pageResized: function()
	{
		/* Get params */
		var windowWidth = jQuery( window ).width();
		var windowHeight = jQuery( window ).height();

		/* Set the middle line */
		var mainOuterHeight = jQuery( "#main" ).outerHeight();
		jQuery( "div#line" ).height( mainOuterHeight - 2 );		
		var lineWidth = jQuery( "div#line" ).outerWidth( true );
		var ycWidth = jQuery("div#years_content").outerWidth( true );
		if(windowWidth > ycWidth)
			jQuery( "div#line" ).css( "left", ( windowWidth - lineWidth ) / 2 );
		else
			jQuery( "div#line" ).css( "left", ( ycWidth - lineWidth ) / 2 );

		/* Sarpaque modules */
		Sarpaque.Modal.pageResized( windowHeight, windowWidth );
		Sarpaque.Loader.pageResized( windowHeight, windowWidth );
		Sarpaque.YearsTape.pageResized( windowHeight, windowWidth );		
		Sarpaque.Foregrounds.pageResized( windowHeight, windowWidth );		
	},
	
	scroll: function()
	{
		/* Get params */
		var scrollTop = jQuery( window ).scrollTop();

		/* Sarpaque modules */		
		Sarpaque.YearsTape.scroll( scrollTop );
		Sarpaque.Foregrounds.scroll( scrollTop );
	},
	
	yearLoaded: function( year )
	{
		/* Sarpaque modules */
		Sarpaque.YearsTape.yearLoaded( year );
		Sarpaque.Foregrounds.yearLoaded( year );		
	},
	
	/*** Private event handlers ***/	

	_getQueryDict: function()
	{
		var query = window.location.search;		

		/* Clear query */
		var m = query.match( /^\?(.*)$/ );
		if( m == undefined ) return {};
		query = m[1];		

		/* Get query dict */
		var queryDict = {};
		var queryParts = query.split( "&" );		
		for( var i = 0; i < queryParts.length; i++ ) {
			m = queryParts[i].match( /^([^=]*)=(.*)$/ );
			if( m == undefined ) continue;
			queryDict[m[1]] = m[2];
		}

		return queryDict;
	}	
};
jQuery( Sarpaque.init );
