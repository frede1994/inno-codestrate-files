//Get RXJS library used for Subject and Observable and more...
await wpm.requireExternal("https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.1.0/rxjs.umd.js");

/**
 * LiveElement can take a selector and dom root element, and then do different functions on
 * all elements that match the given selector from the root. Both current elements and elements
 * that appear in the future.
 */
class LiveElement {
    /**
     * Construct a new LiveElement
     * 
     * @param {string} selector - The CSS selector used to find elements
     * @param {root=document} root - The dom element used as root for the selector query
     */
    constructor(selector, root = document) {
        let self = this;

        this.selector = selector;
        this.root = root;

        this.subject = new rxjs.Subject();

        //Find new elements and run aswell
        this.observer = new MutationObserver((mutations)=>{
            mutations.forEach((mutation)=>{
                function doCheck(nodes, checkChildren=true) {
                    nodes.forEach((node)=>{
                        if(node.matches != null && node.matches(self.selector)) {
                            self.subject.next(node);
                        }

                        if(checkChildren && node.querySelectorAll != null) {
                            doCheck(Array.from(node.querySelectorAll("*")), false);
                        }
                    });
                }

                doCheck(Array.from(mutation.addedNodes));
            });
        });

        this.observer.observe(this.root, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Stop this LiveElement, any new element matching this LiveElement will not be handled.
     */
    stop() {
        this.observer.disconnect();
    }

    /**
     * @private
     */
    kickstart(callback) {
        //Kickstart with current elements
        const elements = this.root.querySelectorAll(this.selector);

        elements.forEach((element)=>{
            callback(element);
        });
    }

    /**
     * Runs the given callback for each element matched by this LiveElement, now and in the future.
     * 
     * @param {function} callback - The callback to run for each element
     */
    forEach(callback) {
        function work(element) {
            callback(element);
        }

        this.subject.asObservable().subscribe((element)=>{
            work(element);
        });

        this.kickstart(work);
    }

    /**
     * Calls the given callback method when the given event is triggered on any of the elements
     * matched by this LiveElement
     * 
     * @param {string} event - The event to listen for
     * @param {function} callback - The callback to run when the event is triggered.
     */
    on(event, callback) {
        function work(element) {
            element.addEventListener(event, (evt)=>{
                callback(element, evt);
            });
        }

        this.subject.asObservable().subscribe((element)=>{
            work(element);
        });

        this.kickstart(work);
    }
}

exports.LiveElement = LiveElement;