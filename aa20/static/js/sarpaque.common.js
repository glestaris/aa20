/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

Sarpaque.Loader = {
	/* Flags */
	_shown: false,
	_locked: false,

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
	},

	pageResized: function( windowHeight, windowWidth )
	{
		var loaderWidth = jQuery( this._el ).outerWidth();
		var loaderHeight = jQuery( this._el ).outerHeight();
		jQuery( this._el ).css( "left", ( windowWidth - loaderWidth ) / 2 );
		jQuery( this._el ).css( "top", ( windowHeight - loaderHeight ) / 2 );
	},

	init: function()
	{
		this._el = jQuery( "#loader" );
		this._shadowEl = jQuery( "#global_shadow" );
	}
};

Sarpaque.Modal = {
	/* Flags */
	_shown: false,
	_locked: false,

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
		jQuery( this._el ).hide();
		jQuery( this._shadowEl ).hide();
		this._locked = false;
		this._shown = false;
	},

	pageResized: function( windowHeight, windowWidth )
	{
		/* Set position of modal window */
		var modalWidth = jQuery( this._el ).outerWidth();
		var modalHeight = jQuery( this._el ).outerHeight();
		jQuery( this._el ).css( "left", ( windowWidth - modalWidth ) / 2 );
		jQuery( this._el ).css( "top", ( windowHeight - modalHeight ) / 2 );

		/* Set the dimensions of the global shadow */
		jQuery( this._shadowEl ).width( windowWidth );
		jQuery( this._shadowEl ).height( windowHeight );
	},

	init: function()
	{
		this._el = jQuery( "#modal_window" );
		this._shadowEl = jQuery( "#global_shadow" );
		/* Close modal event */
		jQuery( "div.close", this._el ).click( function() { Sarpaque.Modal.hide(); } );			
	}
};