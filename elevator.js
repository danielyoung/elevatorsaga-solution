{
    waiting: [],
    elevators: [],
    floors: [],

    /**
     * Initialise all the stuff.
     *
     * @param {Array} elevators
     * @param {Array} floors
     * @return {Void}
     */
    init: function (elevators, floors) {
        var self = this;

        self.elevators = elevators;
        self.floors = floors;

        // Bind elevator events
        for (var i = 0; i < self.elevators.length; i++) {
            self.bindElevatorEvents(self.elevators[i]);
        }

        // Bind floor events
        for (var i = 0; i < self.floors.length; i++) {
            self.bindFloorEvents(self.floors[i]);
        }

        /**
         * Returns the smallest number in an array of numbers.
         *
         * @param {Array} array
         * @return {Number}
         */
        Array.min = function (array) {
            return Math.min.apply(Math, array);
        };
    },

    /**
     * @param dt
     * @param elevators
     * @param floors
     * @return {Void}
     */
    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    },

    /**
     * Binds event handlers for each elevator.
     *
     * @param {Object} elevator
     * @return {Void}
     */
    bindElevatorEvents: function (elevator) {
        var self = this;

        elevator.on("idle", function () {
            if (self.waiting.length > 0) {
                // Just go to the first floor on the waiting list.
                var floorNum = self.waiting[0].floorNum;
                this.goToFloor(floorNum);
                
                // Remove floor from waiting array
                for (var i = self.waiting.length - 1; i >= 0; i--) {
                    if (self.waiting[i].floorNum === floorNum) {
                        self.waiting.splice(i, 1);
                    }
                };

            } else {
                this.goToFloor(0);
            }
        });

        elevator.on("floor_button_pressed", self.floorButtonPressed);
        elevator.on("passing_floor", function (floorNum, direction) {

            // @todo finish implementing this

            // Check if the elevator is passing a floor that someone is waiting at.
            for (var i = self.waiting.length - 1; i >= 0; i--) {
                if (self.waiting[i].floorNum === floorNum) {
                    this.goToFloor(floorNum, true);

                    // Remove floor from waiting array
                    // @todo move this into a function.
                    for (var i = self.waiting.length - 1; i >= 0; i--) {
                        if (self.waiting[i].floorNum === floorNum) {
                            self.waiting.splice(i, 1);
                        }
                    };
                }
            };
        });
        elevator.on("stopped_at_floor", function (floorNum) {
            var floors = this.getPressedFloors();
            if (floors.length > 0) {
                var nextFloor = self.calculateNextFloor(floorNum, floors);
                this.goToFloor(nextFloor, true);
            } else if (self.waiting.length > 0) {
                this.goToFloor(self.waiting[0].floorNum, true);

                // Remove floor from waiting array
                // @todo move this into a function.
                for (var i = self.waiting.length - 1; i >= 0; i--) {
                    if (self.waiting[i].floorNum === self.waiting[0].floorNum) {
                        self.waiting.splice(i, 1);
                    }
                };
            }
        });
    },

    /**
     * Binds event handlers for each floor.
     *
     * @param {Object} floor
     * @return {Void}
     */
    bindFloorEvents: function (floor) {
        var self = this;

        floor.on("up_button_pressed", function () {
            self.waiting.push({
                direction: 'up',
                floorNum: this.floorNum()
            });
        });

        floor.on("down_button_pressed", function () {
            self.waiting.push({
                direction: 'down',
                floorNum: this.floorNum()
            });
        });
    },

    /**
     * Triggered when a floor button in the elevator is pressed.
     *
     * @param {Number} floorNum
     * @return {Void}
     */
    floorButtonPressed: function (floorNum) {
        this.goToFloor(floorNum);
    },

    /**
     * Calculates the closest destination floor.
     *
     * @param {Number} floorNum
     * @param {Array} floors
     * @return {Number}
     */
    calculateNextFloor: function (floorNum, floors) {
        var diff = [],
            minimum = 0,
            nextFloor = 0;

        // If there's only 1 floor in queue just go to that one...
        if (floors.length === 1) {
            return floors[0];
        }

        // Calculate the distance to all the floors in queue.
        for (var i = 0; i < floors.length; i++) {
            diff.push(Math.abs(floorNum - floors[i]));
        }

        minimum = Array.min(diff);
        nextFloor = diff.indexOf(minimum);

        return floors[nextFloor];
    }
}
