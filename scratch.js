class Hijinx {
    // ... (Your existing constructor and other methods)

    setup() {
        $("when").each((i, el) => {
            const $when = $(el);
            const event = $when.attr("event");

            switch (event) {
                case "ready":
                    // Execute actions immediately
                    break;
                case "done":
                    // Queue for later execution
                    this.doneEventQueue.push($when);
                    break;
                default:
                    // For all other events
                    $(window).on(event, () => {
                        // Execute actions
                    });
                    break;
            }

            $when.children("set").each((i, el) => {
                this.processSet(el);
            });

            $when.children("get").each((i, el) => {
                this.processGet(el);
            });
        });

        // Log a message to the console once all sets and gets have completed
        $.when.apply($, this.processedSetsAndGets).done(() => {
            console.log("All sets and gets have been processed!");

            // Process all queued `done` events
            this.doneEventQueue.forEach(($when) => {
                $when.children("set").each((i, el) => {
                    this.processSet(el);
                });

                $when.children("get").each((i, el) => {
                    this.processGet(el);
                });
            });
        });
    }

    refreshHijinx() {
        // Clear and reset your instance variables
        this.sets = {};
        this.index = 0;
        this.processedSetsAndGets = [];
        this.doneEventQueue = [];

        // Call setup again to re-process all tags
        this.setup();
    }

    init() {
        $(document).ready(() => {
            this.setup();
        });
    }
}

const hijinx = new Hijinx();

hijinx.init();

// Later in your code, you can call the refresh method to refresh Hijinx's functionality
// hijinx.refreshHijinx();
