/**
 * Line Transform Stream
 *
 * A transform stream class to conveniently modify streamable data line by line.
 * Written in ES2015.
 *
 * Nick Schwarzenberg
 * nick@bitfasching.de
 * v0.1.0, 04/2017
 *
 * License: MIT
 */

'use strict'


// built-in module dependency
const Transform = require( 'stream' ).Transform


// extend Transform stream class
class LineTransformStream extends Transform
{
    constructor( transformCallback, { stringEncoding='utf8', automaticNewline=true } = {} )
    {
        // fail if callback is not a function
        if ( typeof transformCallback != 'function' )
        {
            // throw type error
            throw new TypeError( "Callback must be a function." )
        }

        // initialize parent
        super()

        // set callback for transforming lines
        this.transformCallback = transformCallback

        // set string encoding
        this.stringEncoding = stringEncoding

        // set automatic newline
        this.automaticNewline = automaticNewline

        // initialize internal line buffer
        this.lineBuffer = ''
    }

    // implement transform method (input encoding is ignored)
    _transform( data, encoding, callback )
    {
        // convert data to string
        data = data.toString( this.stringEncoding )

        // split data at line breaks
        const lines = data.split( '\n' )

        // prepend buffered data to first line
        lines[0] = this.lineBuffer + lines[0]

        // last "line" is actually not a complete line,
        // remove it and store it for next time
        this.lineBuffer = lines.pop()

        // collect output
        let output = ''

        // process line by line
        lines.forEach( ( line ) =>
        {
            try
            {
                // pass line to callback, transform it and add line-break in need
                output += this.transformCallback( line )
                if (this.automaticNewline) output += '\n'
            }
            catch ( error )
            {
                // catch processing errors and emit as stream error
                callback( error )
            }
        })

        // push output
        callback( null, output )
    }
}


// export custom stream class
module.exports = LineTransformStream
