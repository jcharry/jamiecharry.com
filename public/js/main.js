/* global $, jc */
window.addEventListener('load', function() {
'use strict';

document.getElementById('canvas').setAttribute('width', window.innerWidth);
document.getElementById('canvas').setAttribute('height', window.innerHeight);
(function(global) {

var cellWidth = 30;
var cellHeight = 60;
var Cell = function(x, y, i, j) {
    this.x = x;
    this.y = y;
    this.index = { row: i, col: j };
    this.width = cellWidth;
    this.height = cellHeight;
    this.h = 120;
    this.s = j * 5;
    //this.l = Math.random() * 10 + 90;
    this.l = 100;
    //this.a = Math.random() * 0.3 + 0.5;
    this.a = 0.5;

    this.initialFill = 'hsla(' + this.h + ',' + this.s + '%,' + this.l + '%,' + this.a + ')';
    //this.initialFill = 'hsla(120, 0%, 90%, 0.7)';
    this.fill = this.initialFill;
};

Cell.prototype.setFill = function() {
    this.fill = 'hsla(' + this.h + ',' + this.s + '%,' + this.l + '%,' + this.a + ')';
};

Cell.prototype.hover = function() {
    this.fill = '#000000';
};

Cell.prototype.noHover = function() {
    this.fill = this.initialFill;
};

Cell.prototype.findNeighbors = function(allCells) {
    var that = this;

    this.neighbors = allCells.filter(function(cell) {
        if (Math.abs(cell.index.row - that.index.row) === 1 && Math.abs(cell.index.col - that.index.col) === 1 ||
            Math.abs(cell.index.row - that.index.row) === 0 && Math.abs(cell.index.col - that.index.col) === 1 ||
            Math.abs(cell.index.row - that.index.row) === 1 && Math.abs(cell.index.col - that.index.col) === 0) {
            return true;
        }

        return false;
    });
};

var Board = function() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    var numCols = this.width / cellWidth;
    var numRows = this.width / cellHeight;

    console.log(numRows + ' rows and ' + numCols + ' cols');

    this.ctx = document.getElementById('canvas').getContext('2d');

    this.cells = (function() {
        var cells = [];

        var offset = 0;

        for (var i = -1; i < numRows + 1; i++) {
            for (var j = -1; j < numCols + 1; j++) {
                offset = j % 2 === 0 ? 0 : 30;
                cells.push(new Cell(j * cellWidth, i * cellHeight + offset, j, i));
            }
        }

        return cells;
    }.call(this));
    console.log(this.cells);

    //var that = this;

    //this.cells.forEach(function(cell) {
        //cell.findNeighbors(that.cells);
    //});

};

Board.prototype.display = function() {
    var ctx = this.ctx;

    //for (var i = 0; i < this.cells.length; i++) {
        //var cell = this.cells[i];

        //ctx.fillStyle = cell.fill;
        //ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
    //}
    this.cells.forEach(function(cell) {
        ctx.fillStyle = cell.fill;
        ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
    });
};

Board.prototype.update = function() {
    this.cells.forEach(function(cell) {
        cell.l = cell.l + Math.random() - 0.5;
        cell.setFill();
    });
};

    global.Board = Board;
}(window));

// requestAnimationFrame polyfill
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);

            lastTime = currTime + timeToCall;

            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

(function(global) {
    var obj = {
        cnv: document.getElementById('canvas'),
        ctx: document.getElementById('canvas').getContext('2d'),
        fps: 8,
        board: new window.Board(),
        detectMobile: function() {
            if (window.innerWidth < 450 || window.innerHeight < 700) {
                this.isMobile = true;
            }

        },
        detectSmall: function() {
            if (window.innerWidth < 400 || window.innerHeight < 700) {
                this.isSmall = true;
            }
        },
        isSmall: false,
        isMobile: false,
        initNavBar: function() {
            $('#navButton').on('click', function(event) {
                // Show popup
                $('#menupopup').css('display', 'flex');
            });
            $('#closeMenu').on('click', function(event) {
                $('#menupopup').css('display', 'none');
            });
            $('#navTitle').hover(function() {
                $(this).fadeOut(100, function() {
                    $(this).text('jamiecharry.');
                    $(this).fadeIn(100);
                });
            }, function() {
                $(this).fadeOut(100, function() {
                    $(this).text('jc.');
                    $(this).fadeIn(100);
                });
            });
        },
        initFilters: function() {
            $('.filterItem').on('click', function() {
                var $self = $(this);

                // Remove selected style from filter items
                // and apply it to one that was clicked
                $('.filterItem').removeClass('selected');
                $(this).addClass('selected');

                // Remove 'visible' class from all projects
                $('.project').removeClass('visible');

                // fade out all projects
                var projects = $('.project');

                for (var p = 0; p < projects.length; p++) {
                    $(projects[p]).fadeOut(200);
                }

                // Wait til fade outs are done
                // then fade in
                setTimeout(function() {
                    // Get items that match filter
                    var matches = $('li[data-category~=' + $self.data('filter') + ']');

                    if ($self.data('filter') === 'all') {
                        matches = $('.project');
                    }

                    //matches.addClass('visible')
                        //.height($(this).width())
                        //.fadeIn()
                    // fade the matches in
                    for (var q = 0; q < matches.length; q++) {
                        //$(matches[q])
                            //.addClass('visible')
                            //.fadeIn();
                        matches.addClass('visible')
                            .fadeIn();
                    }
                }, 200);
            });
        },
        // Setup project items
        initProjects: function() {
            // Set height
            var w = $('.project').width();

            console.log(w);

            $('.project').css('height', w);
            //height($('.project').width());

            // Hover functionality
            // Only add this stuff if not on mobile
            if (!this.isMobile) {
                $('.project').hover(function() {
                    var id = $(this).data('id');

                    $('li[data-id=\'' + id + '\'] .overlay')
                        .css('display', 'flex')
                        .hide()
                        .fadeIn(200);
                }, function() {
                    var id = $(this).data('id');

                    $('li[data-id=\'' + id + '\'] .overlay').fadeOut(200);
                });
            }
        },
        sizeiFrames: function() {
            var ww = window.innerWidth;

            if (ww > 1000) {
                ww = 1000;
            }
            $('iframe').attr('width', ww - 30);
            $('iframe').attr('height', (ww - 30) * 9 / 16);
        },
        windowResized: function() {
            var w = $('.visible').width();

            $('.project').height(w);
        },
        animateCanvas: function() {
            var balls = [];
            var width = window.innerWidth;
            var height = window.innerHeight;

            //var board = new Board();
            var that = this;

            var render = function() {
                var numOfCells = that.board.cells.length;

                //that.board.cells[Math.floor(Math.random() * numOfCells)].fill = 'rgba(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.random() + ')';
                that.board.update();
                that.board.display();
            };
            var animate = function() {
                setTimeout(function() {
                    window.requestAnimationFrame(animate);
                    render();
                }, 1000 / that.fps);
            };

            window.requestAnimationFrame(animate);
            //animate();
        },
        initMouseMove: function() {
            var that = this;

            window.addEventListener('mousemove', function(e) {
                that.board.cells.forEach(function(cell) {
                    cell.noHover();
                    //cell.neighbors.forEach(function(neighbor) {
                        //neighbor.noHover();
                    //});
                    if (e.clientX > cell.x &&
                        e.clientX < cell.x + cell.width &&
                        e.clientY > cell.y &&
                        e.clientY < cell.y + cell.height) {
                            cell.neighbors.forEach(function(neighbor) {
                                neighbor.hover();
                            });
                        }
                });
            });
        }
    };

    global.jc = obj;

}(window));

// Fallback for browser peculiarities
//window.requestAnimFrame = (function() {
    //return window.requestAnimationFrame ||
        //window.webkitRequestAnimationFrame ||
        //window.mozRequestAnimationFrame ||
        //function(callback) {
            //window.setTimeout(callback, 1000 / 60);
        //};
//}());

jc.detectSmall();
jc.detectMobile();
console.log(jc.isMobile);
jc.initNavBar();
jc.initFilters();
jc.initProjects();
jc.sizeiFrames();
jc.animateCanvas();
//jc.initMouseMove();


window.addEventListener('resize', jc.sizeiFrames);
window.addEventListener('resize', jc.windowResized);

});
