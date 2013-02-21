(function () {

    if (!window.webrepl)
        window.webrepl = {};

    window.keymap = {
        backspace: 8,
        tab: 9,
        enter: 13,
        escape: 27,
        c: 67,
        up: 38,
        down: 40,
        lowercase: {
            32: ' ', 48: '0', 49: '1', 50: '2',
            51: '3', 52: '4', 53: '5', 54: '6',
            55: '7', 56: '8', 57: '9', 65: 'a',
            66: 'b', 67: 'c', 68: 'd', 69: 'e',
            70: 'f', 71: 'g', 72: 'h', 73: 'i',
            74: 'j', 75: 'k', 76: 'l', 77: 'm',
            78: 'n', 79: 'o', 80: 'p', 81: 'q',
            82: 'r', 83: 's', 84: 't', 85: 'u',
            86: 'v', 87: 'w', 88: 'x', 89: 'y',
            90: 'z', 189: '-', 190: '.', 191: '/',
            220: '\\', 222: '\''
        },
        uppercase: {
            32: ' ', 48: ')', 49: '!', 50: '@',
            51: '#', 52: '$', 53: '%', 54: '^',
            55: '&', 56: '*', 57: '(', 65: 'A',
            66: 'B', 67: 'C', 68: 'D', 69: 'E',
            70: 'F', 71: 'G', 72: 'H', 73: 'I',
            74: 'J', 75: 'K', 76: 'L', 77: 'M',
            78: 'N', 79: 'O', 80: 'P', 81: 'Q',
            82: 'R', 83: 'S', 84: 'T', 85: 'U',
            86: 'V', 87: 'W', 88: 'X', 89: 'Y',
            90: 'Z', 189: '_', 191: '?', 222: '"'
        }
    };


    var blink = function (show) {
        $('#cursor').toggle(show);
        setTimeout(function () { blink(!show); }, 600);
    };

    console.log("DEBUG: defining 'terminal'");

    webrepl.terminal = function (config) {

    	var $container = config.container;
    	var prompt = config.prompt;

        var $currentConsoleLine;

        var newCommandLine = function () {
            $container.append('<div><span class="path">' + prompt + '</span><span class="console"></span><span id="cursor">_</span></div>');
            $currentConsoleLine = $('.console:last');
        };

        var cls = function () {
        	$container.empty();
        };

    	var commandHandler = config.commandHandler;
    	var state = config.state;
    	var welcome = config.welcome;

        var currentPath = '';
        var currentFolder = '';
        var commandHistory = [];
        var commandCount = 0;
        var firstname = '';
        var loggedIn = false;
        var currentId;

        var runningCommand = false;
        var term = this;

        var onKeyDown = function (e) {
            var key = e.which;
            var handled = false;
            var text = $currentConsoleLine.text();

            // ignore any keystrokes with alt, ctrl or cmd
            if (e.metaKey || e.altKey || e.ctrlKey || runningCommand) {
                // ctrl+c cancels the running command
                if ((e.ctrlKey || e.metaKey) && key == keymap.c) {
                    if (runningCommand) {
                        runningCommand = false;
                        newCommandLine();
                        $(document).scrollTop($(document).height());
                    }
                }

                return true;
            }

            // up should go back in history
            if (e.which == keymap.up) {
                if (commandCount > 0) {
                    commandCount--;

                    $currentConsoleLine.html(commandHistory[commandCount]);
                }

                return false;
            }

            // down should go forward in history
            if (e.which == keymap.down) {
                if (commandCount < commandHistory.length - 1) {
                    commandCount++;
                    $currentConsoleLine.html(commandHistory[commandCount]);
                }
                else {
                    $currentConsoleLine.html('');
                    commandCount = commandHistory.length;
                }

                return false;
            }

            // shift key presses
            if (e.shiftKey && keymap.uppercase[key]) {
                var character = keymap.uppercase[key];
                $currentConsoleLine.text(text + character);

                return false;
            }

            // supported key presses
            if (keymap.lowercase[key]) {
                var character = keymap.lowercase[key];
                $currentConsoleLine.text(text + character);

                return false;
            }

            // allow backspace
            if (e.which == keymap.backspace) {
                text = text.substr(0, text.length - 1);
                $currentConsoleLine.text(text);

                return false;
            }

            // escape clears the command line
            if (e.which == keymap.escape) {
                $currentConsoleLine.html('');

                return false;
            }

            if (e.which == keymap.tab) {
            	return false;
            }

            // enter evaluates the command
            if (e.which == keymap.enter) {
                $('#cursor').remove();
                if (text == '') {
                    newCommandLine();
                    $(document).scrollTop($(document).height());
                }
                else {
                    runningCommand = true;
                    var $output = $('<div class="output"></div>');
                    $container.append($output);
                    $output.html(commandHandler.call(this, text, state));
                    if (runningCommand) {
                         runningCommand = false;
                         newCommandLine();
                         $(document).scrollTop($(document).height());
                     }
                    $(document).scrollTop($(document).height());
                    commandHistory.push(text);
                    commandCount = commandHistory.length;
                }
                return false;
            }

            $(document).scrollTop($(document).height());
        };

        init();

        function init() {
            var welcomeText = (welcome ? welcome : "Welcome to WebREPL!") + '<br /><br />';
            $container.html(welcomeText);
            newCommandLine();
            $body.keydown(onKeyDown);
            blink(true);
        }

    };

})();

$(document).ready(function () {
    window.$document = $(document);
    window.$body = $('body');
});