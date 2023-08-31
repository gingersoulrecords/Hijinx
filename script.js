console.clear();

function l(obj) {
  const varName = Object.keys(obj)[0];
  console.log(`${varName} is: `, obj[varName]);
}

class Hijinx {
  constructor() {
    this.sets = {};
    this.index = 0; // Add as property
  }

  getSelector(selector) {
    if (this.sets[selector]) {
      return this.sets[selector];
    }
    return $(selector);
  }

  getMethodName(el) {
    return el.tagName
      .toLowerCase()
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  getValue(el) {
    const textValue = $(el).text();
    if (textValue === "") {
      return null; // Return null if the text is empty
    }
    return textValue;
  }

  callMethod($el, method, val, currentIndex) {
    if (this.sets[val]) {
      if (this.sets[val][0] instanceof jQuery) {
        return $el[method](this.sets[val][0]);
      } else {
        return $el[method](this.sets[val]);
      }
    }

    if (val === null) {
      return $el[method]();
    }

    val = val.replace(/\[(\w+)\]/g, (match, name) => {
      if (this.sets[name][0] instanceof jQuery) {
        return this.sets[name];
      } else if (Array.isArray(this.sets[name])) {
        return this.sets[name][currentIndex];
      } else {
        return this.sets[name];
      }
    });

    return $el[method](val);
  }

  processTag($el, $tag) {
    this.index = 0; // Reset to 0 before each processTag operation

    $tag.children().each((i, el) => {
      const method = this.getMethodName(el);
      const val = this.getValue(el);
      $el = this.callMethod($el, method, val);
      this.index++; // Increment index for each child element processed
    });

    return $el;
  }

  processChildElements($el, $children, currentIndex) {
    $children.each((i, childEl) => {
      const tag = this.getMethodName(childEl);
      let val;

      switch (tag) {
        case "wrap":
          val = $(childEl).html();
          break;
        case "css":
          let cssString = "";

          $(childEl)
            .children()
            .each(function () {
              const prop = $(this).prop("tagName").toLowerCase();
              const value = $(this).text();
              cssString += `${prop}: ${value};`;
            });

          $el.attr({
            "x-data": `{ style: "${cssString}" }`,
            "x-bind:style": "style"
          });

          return;
        case "attr":
          let attrObj = {};

          $(childEl)
            .children()
            .each(function () {
              const attrName = $(this).prop("tagName").toLowerCase();
              const attrValue = $(this).text();

              attrObj[attrName] = attrValue;
            });

          $el.attr(attrObj);

          return; // Skip the rest of the loop iteration
        default:
          val = this.getValue(childEl);
      }

      if (val !== undefined) {
        $el = this.callMethod($el, tag, val, currentIndex);
      }
    });

    return $el;
  }

  processSet(setEl) {
    const name = $(setEl).attr("name");
    const $elements = $($(setEl).attr("targets"));
    const results = [];

    $elements.each((i, el) => {
      const $el = $(el);
      const result = this.processTag($el, $(setEl));
      results.push(result);
    });

    this.sets[name] = results;
  }

  processGet(getEl) {
    const targets = $(getEl).attr("targets");

    if (targets) {
      const $elements = this.getSelector(targets);
      $elements.each((i, el) => {
        let $el = $(el);
        $el = this.processChildElements($el, $(getEl).children(), i);
      });
    } else {
      const name = $(getEl).attr("name");
      if (this.sets[name][0] instanceof jQuery) {
        let $el = this.sets[name][0];
        $el = this.processChildElements($el, $(getEl).children(), 0);
      } else {
        // Log a user-friendly error
        const setErrorElement = $(`set[name="${name}"]`).prop("outerHTML");
        const getErrorElement = $(getEl).prop("outerHTML");
        console.error(`Oops! Something went wrong. \n
You are trying to do something with a <get> component that the <set> component can't handle. 
Here's the <set> that's causing the issue: \n ${setErrorElement} \n
And here's the <get> you're trying to use: \n ${getErrorElement} \n
Make sure that what you're trying to 'get' and 'set' are compatible!`);
      }
    }
  }

  init() {
    $(document).ready(() => {
      $("when").each((i, el) => {
        const $when = $(el);

        const event = $when.attr("event");

        $when.children("set").each((i, el) => {
          this.processSet(el);
        });

        $when.children("get").each((i, el) => {
          this.processGet(el);
        });

        if (event === "ready") {
          // Execute actions
        } else {
          $(window).on(event, () => {
            // Execute actions
          });
        }
      });
    });
  }
}

const hijinx = new Hijinx();

hijinx.init();