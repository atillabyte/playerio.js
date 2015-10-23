/* @flow */

import QuickConnect from './quick-connect';
import Message from './models/message';

/**
 * The main Player.IO object which acts as the base of method execution.
 */
export default class PlayerIO {
	// TODO: Add support for proxies
	constructor() {

	}
};

// Define every public module
PlayerIO.QuickConnect = QuickConnect;
PlayerIO.Message = Message;

// Initialize the default namespace for browsers
if (typeof window !== 'undefined') {
	window.PlayerIO = PlayerIO;
}