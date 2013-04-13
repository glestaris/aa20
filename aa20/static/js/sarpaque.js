/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

var Sarpaque = {
	/* In debug flag */
	inDebug: true,

	init: function()
	{		
		/* Setup load config flags */
		var qd = Sarpaque._getQueryDict();
		if( qd["load_backgrounds"] != undefined )
			SarpaqueConfig["loadBackgrounds"] = ( qd["load_backgrounds"] == "true" );
		if( qd["load_foregrounds"] != undefined )
			SarpaqueConfig["loadForegrounds"] = ( qd["load_foregrounds"] == "true" );

		/* Setup resize events */
		jQuery( window ).resize( Sarpaque.pageResized );
		jQuery( "body" ).resize( Sarpaque.pageResized );
		Sarpaque.pageResized();

		/* Load first 3 years */
		for( var i = 0; i < 3; i++ ) {
			Sarpaque.TimeLine.loadYear( SarpaqueConfig.timelineData.years[i] );	
		}		
		
		/* Setup scroll spy */
		Sarpaque.ScrollSpy.init();

		/* Setup modals */
		Sarpaque.Modal.init();
		jQuery( "div.box a.show-modal" ).click( 
			function( e ) 
			{
				e.preventDefault();
				var mc = jQuery( this ).siblings( "div.modal-content" );
				var c = jQuery( this ).siblings( "div.modal-content" ).html();
				if( c != undefined && c != "" ) Sarpaque.Modal.show( c );
			} 
		);		

		/* Setup years tape */
		Sarpaque.YearsTape.init();
	},

	pageResized: function()
	{
		var windowWidth = jQuery( window ).width();
		var windowHeight = jQuery( window ).height();

		/* Set the middle line */
		var mainOuterHeight = jQuery( "#main" ).outerHeight();
		jQuery( "div#line" ).height( mainOuterHeight - 2 );		
		var lineWidth = jQuery( "div#line" ).outerWidth( true );
		jQuery( "div#line" ).css( "left", ( windowWidth - lineWidth ) / 2 );

		/* Set position of modal window */
		Sarpaque.Modal.pageResized( windowHeight, windowWidth );

		/* Set years tape in the middle */
		Sarpaque.YearsTape.pageResized( windowHeight, windowWidth );		
	},

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
