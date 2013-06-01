/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

Sarpaque.Loader = {
	/* Flags */
	_shown: false,
	_locked: false,
	
	/*** Initializer ***/

	init: function()
	{
		this._el = jQuery( "#loader" );
		this._shadowEl = jQuery( "#global_shadow" );
	},
	
	/*** Sarpaque events ***/
	
	pageResized: function( windowHeight, windowWidth )
	{
		var loaderWidth = jQuery( this._el ).outerWidth();
		var loaderHeight = jQuery( this._el ).outerHeight();
		jQuery( this._el ).css( "left", ( windowWidth - loaderWidth ) / 2 );
		jQuery( this._el ).css( "top", ( windowHeight - loaderHeight ) / 2 );
	},
	
	/*** Public methods ***/	

	show: function()
	{
		if( this._locked || this._shown ) return;
		this._locked = true;
		jQuery( this._el ).show();
		jQuery( this._shadowEl ).show();
		this._locked = false;
		this._shown = true;
	},

	hide: function()
	{
		if( this._locked || !this._shown ) return;
		this._locked = true;
		jQuery( this._el ).hide();
		jQuery( this._shadowEl ).hide();
		this._locked = false;
		this._shown = false;
	}	
};

Sarpaque.Modal = {
	/* Flags */
	_shown: false,
	_locked: false,
	
	/*** Initializer ***/
	
	init: function()
	{
		this._el = jQuery( "#modal_window" );
		this._shadowEl = jQuery( "#global_shadow" );
		/* Close modal event */
		jQuery( "div.close", this._el ).click( function() { Sarpaque.Modal.hide(); } );
		jQuery( this._shadowEl ).click( function() { Sarpaque.Modal.hide(); } );
		jQuery( window ).keyup( function( e ) { if( e.keyCode == 27 ) Sarpaque.Modal.hide(); } ); // esc key		
		
		/* Set data-width and data-height attribues */
		var modalWidth = jQuery( this._el ).outerWidth();
		jQuery( this._el ).data("width", modalWidth);
		var modalHeight = jQuery( this._el ).outerHeight();
		jQuery( this._el ).data("height", modalHeight);		
		var modalContentHeight = jQuery( "div.content", this._el ).height();
		jQuery( this._el ).data( "content-height", modalContentHeight );
		jQuery( this._el ).data( "height-offset", modalHeight - modalContentHeight );
	},
	
	/*** Sarpaque events ***/

	pageResized: function( windowHeight, windowWidth )
	{
		/* Set position of modal window */
		var modalWidth = Number( jQuery( this._el ).data( "width" ) );
		if( modalWidth > windowWidth ) {
			jQuery( this._el ).width( windowWidth * 0.8 );
			jQuery( this._el ).css( "left", ( windowWidth * 0.2 ) / 2 );
		} else {
			jQuery( this._el ).width( modalWidth );
			jQuery( this._el ).css( "left", ( windowWidth - modalWidth ) / 2 );
		}

		var modalHeight = Number( jQuery( this._el ).data( "height" ) );
		if( modalHeight > windowHeight ) {
			jQuery( this._el ).height( windowHeight * 0.8 );
			/* Fix content height */
			jQuery( "div.content", this._el ).height( windowHeight * 0.8 - Number( jQuery( this._el ).data( "height-offset" ) ) );
			jQuery( this._el ).css( "top", ( windowHeight * 0.2 ) / 2 );
		} else {
			jQuery( this._el ).height( modalHeight );
			jQuery( "div.content", this._el ).height( Number( jQuery( this._el ).data( "content-height" ) ) );
			jQuery( this._el ).css( "top", ( windowHeight - modalHeight ) / 2 );	
		}

		/* Set the dimensions of the global shadow */
		jQuery( this._shadowEl ).width( windowWidth );
		jQuery( this._shadowEl ).height( windowHeight );
	},
	
	/*** Public methods ***/

	show: function( content )
	{
		if( this._locked || this._shown ) return;			
		this._locked = true;
		jQuery( "div.content", this._el ).html( content );
		jQuery( this._el ).show();
		jQuery( this._shadowEl ).show();
		this._locked = false;
		this._shown = true;
	},

	showURL: function( url )
	{
		Sarpaque.Modal.show( "<div class=\"loader\">Loading content...</div>" );
		jQuery.ajax(
			{
				"url": url,
				"success": function( data, textStatus, jqXHR )
				{
					jQuery( ".content", Sarpaque.Modal._el ).html( data );
				},
				"error": function( jqXHR, textStatus, errorThrown )
				{
					jQuery( ".content", Sarpaque.Modal._el ).html( "<div class=\"error\">Failed to fetch data.</div>" );
				}
			}
		);
	},

	hide: function()
	{
		if( this._locked || !this._shown ) return;			
		this._locked = true;
		jQuery( "div.content", this._el ).html( "" );
		jQuery( this._el ).hide();
		jQuery( this._shadowEl ).hide();
		this._locked = false;
		this._shown = false;
	}
};
